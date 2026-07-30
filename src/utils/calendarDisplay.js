import { getEventStyle, getEventColor } from "./eventColors";
import { eachDateBetween, isDateBetween } from "./dateHelpers";

export const MAX_VISIBLE_PEOPLE_PER_DAY = 3;

/**
 * @param {import('../types').Event[]} events
 * @returns {Record<string, import('../types').Event[]>}
 */
export function groupEventsByDate(events) {
  /** @type {Record<string, import('../types').Event[]>} */
  const grouped = {};

  events.forEach((event) => {
    const startDate = event.startDate;
    const endDate = event.endDate || event.startDate;
    eachDateBetween(startDate, endDate).forEach((date) => {
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });
  });

  Object.values(grouped).forEach((dayEvents) => {
    dayEvents.sort((a, b) => `${a.startTime}`.localeCompare(`${b.startTime}`));
  });

  return grouped;
}

/**
 * @param {import('../types').Event} event
 * @param {boolean} isPrivileged
 * @returns {string}
 */
export function getCalendarEventTitle(event, isPrivileged) {
  const baseTitle = isPrivileged
    ? event.creatorName || event.createdByName || "—"
    : event.title;

  if (event.deleted) {
    return `Deleted: ${baseTitle}`;
  }

  return baseTitle;
}

/**
 * @param {import('../types').Event[]} events
 * @param {import('../types').User | null} user
 * @param {string} viewType
 * @param {(date: string, time: string) => string} toISODateTime
 */
export function buildCalendarEvents(events, user, viewType, toISODateTime) {
  const userId = user?.id || "";
  const isPrivileged =
    user?.role === "admin" ||
    user?.role === "host" ||
    user?.role === "admin_readonly";
  const isMonthView = viewType === "dayGridMonth";

  if (!isPrivileged) {
    return events
      .filter((event) => !event.deleted)
      .map((event) => ({
        id: event.id,
        title: event.title,
        start: toISODateTime(event.startDate, event.startTime),
        end: toISODateTime(event.endDate || event.startDate, event.endTime),
        extendedProps: { eventData: event },
        ...getEventStyle(event, userId),
      }));
  }

  if (!isMonthView) {
    return events.map((event) => ({
      id: event.id,
      title: getCalendarEventTitle(event, true),
      start: toISODateTime(event.startDate, event.startTime),
      end: toISODateTime(event.endDate || event.startDate, event.endTime),
      extendedProps: { eventData: event },
      ...getEventStyle(event, userId),
    }));
  }

  const grouped = groupEventsByDate(events);
  /** @type {object[]} */
  const calendarEvents = [];

  Object.entries(grouped).forEach(([date, dayEvents]) => {
    if (dayEvents.length > MAX_VISIBLE_PEOPLE_PER_DAY) {
      calendarEvents.push({
        id: `day-summary-${date}`,
        title: `${dayEvents.length} أحداث`,
        start: date,
        allDay: true,
        extendedProps: {
          isDaySummary: true,
          date,
          dayEvents,
        },
        backgroundColor: "#5f6368",
        borderColor: "#5f6368",
        textColor: "#ffffff",
        classNames: ["fc-day-summary-event"],
      });
      return;
    }

    // Aggregate counts by event color for the month view so we render compact badges
    const countsByColor = {};
    dayEvents.forEach((event) => {
      const color = getEventColor(event, userId) || "unknown";
      countsByColor[color] = (countsByColor[color] || 0) + 1;
    });

    Object.entries(countsByColor).forEach(([color, count], idx) => {
      calendarEvents.push({
        id: `day-color-${date}-${idx}`,
        title: String(count),
        start: date,
        allDay: true,
        extendedProps: {
          type: "color-count",
          color,
          count,
          date,
          dayEvents,
        },
        backgroundColor: "transparent",
        borderColor: "transparent",
        textColor: "#ffffff",
        classNames: ["fc-day-color-count-event"],
      });
    });
  });

  return calendarEvents;
}

/**
 * @param {import('../types').Event[]} events
 * @param {string} date
 * @returns {import('../types').Event[]}
 */
export function getEventsForDate(events, date) {
  return events
    .filter((event) =>
      isDateBetween(date, event.startDate, event.endDate || event.startDate),
    )
    .sort((a, b) => `${a.startTime}`.localeCompare(`${b.startTime}`));
}
