import Modal from "../common/Modal";
import Badge from "../common/Badge";
import Button from "../common/Button";
import CommentList from "../comments/CommentList";
import CommentForm from "../comments/CommentForm";
import EventForm from "./EventForm";
import { formatTimestamp } from "../../utils/formatters";
import { getActivityCodeLabel } from "../../utils/constants";
import { getEventColor } from "../../utils/eventColors";
import {
  getSupervisionLabel,
  inferSupervisionType,
} from "../../utils/supervision";
import {
  canUserReadEventComments,
  isUserOwnEvent,
} from "../../utils/eventAccess";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
import { updateEvent, deleteEvent } from "../../services/eventService";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";

/**
 * @param {{
 *   event: import('../../types').Event | null,
 *   isOpen: boolean,
 *   onClose: () => void,
 * }} props
 */
export default function EventDetailsModal({ event, isOpen, onClose }) {
  const { user, isEditor, isPrivileged } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!event) return null;

  const canEdit =
    user?.role !== "admin_readonly" &&
    (isEditor || isUserOwnEvent(event, user?.id || ""));
  const canComment = user?.role !== "admin_readonly" && isEditor;
  const canReadComments = canUserReadEventComments(
    event,
    user?.id || "",
    isPrivileged,
  );

  const handleUpdate = async (data) => {
    setLoading(true);
    try {
      await updateEvent(event.id, data);
      toast.success("Event updated");
      setEditing(false);
    } catch {
      toast.error("Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setLoading(true);
    try {
      await deleteEvent(event.id);
      toast.success("Event deleted");
      onClose();
    } catch {
      toast.error("Failed to delete event");
    } finally {
      setLoading(false);
    }
  };

  const color = getEventColor(event, user?.id || "");

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setEditing(false);
        onClose();
      }}
      title={editing ? "Edit Event" : event.title}
      size="lg"
    >
      {editing ? (
        <EventForm
          initialData={event}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          loading={loading}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded"
                style={{ backgroundColor: color }}
              />
              <Badge variant="info">
                {getActivityCodeLabel(event.activityCode)}
              </Badge>
            </div>
            {canEdit && (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  <Pencil size={16} />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  loading={loading}
                >
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <Detail label="Area" value={event.area} />
            <Detail label="Church" value={event.church} />
            <Detail
              label="الكود"
              value={getActivityCodeLabel(event.activityCode)}
            />
            <Detail label="النشاط" value={event.activityName} />
            <Detail label="Creator" value={event.creatorName} />
            <Detail
              label="Created By"
              value={event.createdByName || event.creatorName}
            />
            <Detail
              label="Supervisor"
              value={getSupervisionLabel(
                inferSupervisionType(event, user?.id || ""),
              )}
            />
            <Detail label="Date" value={event.startDate} />
            <Detail
              label="Time"
              value={`${event.startTime} - ${event.endTime}`}
            />
            <Detail label="Created" value={formatTimestamp(event.createdAt)} />
          </div>

          {event.details && (
            <div>
              <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Details
              </p>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {event.details}
              </p>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              نوع الإشراف
            </p>
            <div className="mt-1 flex items-center gap-2">
              <div
                className="h-3 w-3 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {getSupervisionLabel(
                  inferSupervisionType(event, user?.id || ""),
                )}
              </span>
            </div>
          </div>

          {canReadComments && (
            <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
              <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Comments
              </h4>
              {canComment && (
                <div className="mb-4">
                  <CommentForm
                    eventId={event.id}
                    creatorId={event.creatorId}
                    eventTitle={event.title}
                  />
                </div>
              )}
              <CommentList eventId={event.id} />
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}
