import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../utils/constants";
import { mergeAndSortEvents } from "../utils/eventAccess";
import { notifyUsers } from "./notificationService";
import { getUsersByRole } from "./userService";
import { isDateBetween } from "../utils/dateHelpers";

/**
 * @param {import('../types').Event[]} lists
 * @returns {import('../types').Event[]}
 */
function mergeEventLists(...lists) {
  return mergeAndSortEvents(lists.flat());
}

const PRIVILEGED_BROADCAST_ROLES = ["host", "admin", "admin_readonly"];

function isPrivilegedBroadcastEvent(event) {
  return (
    event.audienceType === "everyone" &&
    PRIVILEGED_BROADCAST_ROLES.includes(event.createdByRole)
  );
}

/**
 * Subscribe to events visible for regular users:
 * - what they created
 * - what was created for them by host/admin
 * - privileged broadcasts from host/admin
 * @param {import('../types').User} user
 * @param {(events: import('../types').Event[]) => void} callback
 * @returns {() => void}
 */
function subscribeToUserVisibleEvents(user, callback) {
  const responsibleHostId = user.responsibleHostId || null;

  const creatorQuery = query(
    collection(db, COLLECTIONS.EVENTS),
    where("creatorId", "==", user.id),
  );
  const createdByQuery = query(
    collection(db, COLLECTIONS.EVENTS),
    where("createdById", "==", user.id),
  );
  const adminEveryoneQuery = query(
    collection(db, COLLECTIONS.EVENTS),
    where("audienceType", "==", "everyone"),
    where("createdByRole", "in", ["admin", "admin_readonly"]),
  );
  const selectedQuery = query(
    collection(db, COLLECTIONS.EVENTS),
    where("audienceUserIds", "array-contains", user.id),
  );
  const hostEveryoneQuery = responsibleHostId
    ? query(
        collection(db, COLLECTIONS.EVENTS),
        where("audienceType", "==", "everyone"),
        where("createdById", "==", responsibleHostId),
      )
    : null;

  const buckets = {
    creator: [],
    createdBy: [],
    adminEveryone: [],
    selected: [],
    hostEveryone: [],
  };
  const ready = {
    creator: false,
    createdBy: false,
    adminEveryone: false,
    selected: false,
    hostEveryone: responsibleHostId ? false : true,
  };

  const emit = () => {
    if (
      !ready.creator ||
      !ready.createdBy ||
      !ready.adminEveryone ||
      !ready.selected ||
      !ready.hostEveryone
    )
      return;
    callback(
      mergeEventLists(
        buckets.creator,
        buckets.createdBy,
        buckets.adminEveryone,
        buckets.hostEveryone,
        buckets.selected,
      ).filter((event) => !event.deleted),
    );
  };

  const listen = (q, key, isOptional = false) =>
    onSnapshot(
      q,
      (snapshot) => {
        buckets[key] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        ready[key] = true;
        emit();
      },
      (error) => {
        if (isOptional) {
          console.warn(`${key} events listener:`, error.code);
        } else {
          console.error(`${key} events listener:`, error.code, error.message);
        }
        buckets[key] = [];
        ready[key] = true;
        emit();
      },
    );

  const unsubCreator = listen(creatorQuery, "creator");
  const unsubCreatedBy = listen(createdByQuery, "createdBy");
  const unsubAdminEveryone = listen(adminEveryoneQuery, "adminEveryone", true);
  const unsubSelected = listen(selectedQuery, "selected", true);
  const unsubHostEveryone = hostEveryoneQuery
    ? listen(hostEveryoneQuery, "hostEveryone", true)
    : () => {};

  return () => {
    unsubCreator();
    unsubCreatedBy();
    unsubAdminEveryone();
    unsubSelected();
    unsubHostEveryone();
  };
}

function isHostVisibleEvent(event, hostId, assignedUserIds) {
  if (event.createdById === hostId) return true;
  if (event.creatorId === hostId) return true;
  if (assignedUserIds.includes(event.creatorId)) return true;
  if (
    event.audienceType === "selected" &&
    Array.isArray(event.audienceUserIds) &&
    event.audienceUserIds.includes(hostId)
  )
    return true;
  if (
    event.audienceType === "everyone" &&
    ["admin", "admin_readonly"].includes(event.createdByRole)
  )
    return true;
  return false;
}

/**
 * Admin sees every event. Host sees all events for management.
 * User sees own events + host/admin events.
 * @param {import('../types').User} user
 * @param {(events: import('../types').Event[]) => void} callback
 * @returns {() => void}
 */
export function subscribeToEvents(user, callback) {
  const isAdmin = user.role === "admin";
  const isHost = user.role === "host";
  const isReadOnlyAdmin = user.role === "admin_readonly";

  if (isAdmin || isReadOnlyAdmin) {
    return onSnapshot(
      collection(db, COLLECTIONS.EVENTS),
      (snapshot) => {
        callback(
          mergeAndSortEvents(
            snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
          ),
        );
      },
      (error) => {
        console.error("All events listener:", error.code, error.message);
        callback([]);
      },
    );
  }

  if (isHost) {
    let assignedUserIds = [];
    let latestEvents = [];

    const emitHostEvents = () => {
      callback(
        mergeAndSortEvents(
          latestEvents
            .filter((event) =>
              isHostVisibleEvent(event, user.id, assignedUserIds),
            )
            .filter((event) => !event.deleted),
        ),
      );
    };

    getUsersByRole("user")
      .then((users) => {
        assignedUserIds = users
          .filter((u) => u.responsibleHostId === user.id)
          .map((u) => u.id);
        emitHostEvents();
      })
      .catch(() => {
        assignedUserIds = [];
        emitHostEvents();
      });

    return onSnapshot(
      collection(db, COLLECTIONS.EVENTS),
      (snapshot) => {
        latestEvents = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        emitHostEvents();
      },
      (error) => {
        console.error("Host events listener:", error.code, error.message);
        callback([]);
      },
    );
  }

  return subscribeToUserVisibleEvents(user, callback);
}

/**
 * @param {string} eventId
 * @returns {Promise<import('../types').Event | null>}
 */
export async function getEvent(eventId) {
  const eventDoc = await getDoc(doc(db, COLLECTIONS.EVENTS, eventId));
  if (!eventDoc.exists()) return null;
  return { id: eventDoc.id, ...eventDoc.data() };
}

/**
 * @param {import('../types').EventFormData & { creatorId: string, creatorName: string, supervisorName?: string, supervisionType?: string }} data
 * @param {import('../types').User} currentUser
 * @returns {Promise<string>}
 */
async function isAllowedAssignee(currentUser, assigneeId) {
  if (!assigneeId || assigneeId === currentUser.id) return true;
  if (!currentUser.canAssignEventsToOthers) return false;

  const assigneeDoc = await getDoc(doc(db, COLLECTIONS.USERS, assigneeId));
  if (!assigneeDoc.exists()) return false;

  const assigneeUser = { id: assigneeDoc.id, ...assigneeDoc.data() };
  const explicitAllowed = Array.isArray(currentUser.assignableUserIds)
    ? currentUser.assignableUserIds.includes(assigneeId)
    : false;
  const responsibilityMatch = assigneeUser.responsibleHostId === currentUser.id;
  return explicitAllowed || responsibilityMatch;
}

async function getEventNotificationRecipients(eventData, currentUser) {
  const recipientIds = new Set();

  const targetUserId = eventData.creatorId || currentUser.id;
  if (targetUserId && targetUserId !== currentUser.id) {
    const targetUserDoc = await getDoc(
      doc(db, COLLECTIONS.USERS, targetUserId),
    );
    if (targetUserDoc.exists()) {
      const targetUser = { id: targetUserDoc.id, ...targetUserDoc.data() };
      if (targetUser.responsibleHostId) {
        recipientIds.add(targetUser.responsibleHostId);
      }
    }
  }

  const admins = await getUsersByRole("admin");
  admins
    .filter(
      (user) => user.approved && !user.disabled && user.id !== currentUser.id,
    )
    .forEach((user) => recipientIds.add(user.id));

  return Array.from(recipientIds);
}

export async function createEvent(data, currentUser) {
  if (currentUser.role === "admin_readonly") {
    throw new Error("Read-only admins cannot create events");
  }

  if (data.assignedUserId && data.assignedUserId !== currentUser.id) {
    const allowed = await isAllowedAssignee(currentUser, data.assignedUserId);
    if (!allowed) {
      throw new Error(
        "You can only assign events to people under your responsibility.",
      );
    }
  }

  const eventData = {
    title: data.title,
    area: data.area,
    church: data.church,
    activityCode: data.activityCode,
    activityName: data.activityName,
    details: data.details,
    startDate: data.startDate,
    startTime: data.startTime,
    endDate: data.endDate || data.startDate,
    audienceType: data.audienceType || "everyone",
    audienceUserIds: data.audienceUserIds || [],
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), eventData);

  try {
    if (eventData.creatorId !== currentUser.id) {
      await notifyUsers([eventData.creatorId], {
        title: "New Event Created",
        message: `${currentUser.name} created an event "${eventData.title}" for you.`,
        type: "event",
        eventId: docRef.id,
      });
    }

    const notificationRecipients = await getEventNotificationRecipients(
      eventData,
      currentUser,
    );

    if (notificationRecipients.length) {
      const validRecipients = notificationRecipients.filter((recipientId) => {
        if (!recipientId || recipientId === currentUser.id) return false;
        return true;
      });

      if (validRecipients.length) {
        await notifyUsers(validRecipients, {
          title: "New Event",
          message: `${currentUser.name} created a new event: "${eventData.title}"`,
          type: "event",
          eventId: docRef.id,
        });
      }
    }

    if (
      currentUser.role !== "user" &&
      eventData.audienceType === "selected" &&
      eventData.audienceUserIds.length > 0
    ) {
      const audienceRecipients = eventData.audienceUserIds.filter(
        (id) => id && id !== currentUser.id,
      );

      if (audienceRecipients.length) {
        await notifyUsers(audienceRecipients, {
          title: "New Event",
          message: `${currentUser.name} shared an event with you: "${eventData.title}"`,
          type: "event",
          eventId: docRef.id,
        });
      }
    }
  } catch (notifyError) {
    console.error(
      "Notification failed after event create:",
      notifyError?.code || notifyError,
    );
  }

  return docRef.id;
}

/**
 * @param {string} eventId
 * @param {Partial<import('../types').Event>} data
 */
export async function updateEvent(eventId, data) {
  const {
    createdById,
    createdByName,
    createdByRole,
    createdAt,
    id,
    ...safeData
  } = data;
  await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), safeData);
}

/**
 * @param {string} eventId
 * @param {string} cancellationReason
 */
export async function deleteEvent(eventId, cancellationReason) {
  await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
    deleted: true,
    deletedAt: serverTimestamp(),
    cancellationReason: cancellationReason || "",
  });
}

/**
 * @param {import('../types').Event[]} events
 * @param {{ person?: string, area?: string, church?: string, activityCode?: string, date?: string }} filters
 * @returns {import('../types').Event[]}
 */
export function filterEvents(events, filters) {
  return events.filter((event) => {
    if (
      filters.person &&
      !event.creatorName.toLowerCase().includes(filters.person.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.area &&
      !event.area.toLowerCase().includes(filters.area.toLowerCase())
    )
      return false;
    if (
      filters.church &&
      !event.church.toLowerCase().includes(filters.church.toLowerCase())
    )
      return false;
    if (filters.activityCode && event.activityCode !== filters.activityCode)
      return false;
    if (
      filters.date &&
      !isDateBetween(
        filters.date,
        event.startDate,
        event.endDate || event.startDate,
      )
    )
      return false;
    return true;
  });
}
