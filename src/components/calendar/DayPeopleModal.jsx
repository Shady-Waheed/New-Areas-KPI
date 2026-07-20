import { useEffect, useMemo, useState } from "react";
import Modal from "../common/Modal";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { getActivityCodeLabel } from "../../utils/constants";

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   date: string | null,
 *   events: import('../../types').Event[],
 *   onSelectEvent: (event: import('../../types').Event) => void
 * }} props
 */
export default function DayPeopleModal({
  isOpen,
  onClose,
  date,
  events,
  onSelectEvent,
}) {
  const [selectedPersonKey, setSelectedPersonKey] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedPersonKey(null);
    }
  }, [isOpen]);

  const groupedPeople = useMemo(() => {
    const map = new Map();

    events.forEach((event) => {
      const personKey =
        event.creatorId ||
        event.createdById ||
        event.creatorName ||
        event.createdByName ||
        "unknown";
      const displayName =
        event.creatorName || event.createdByName || "غير معروف";

      if (!map.has(personKey)) {
        map.set(personKey, {
          key: personKey,
          displayName,
          events: [],
        });
      }

      map.get(personKey).events.push(event);
    });

    return Array.from(map.values()).sort((a, b) =>
      a.displayName.localeCompare(b.displayName),
    );
  }, [events]);

  const selectedPerson =
    groupedPeople.find((person) => person.key === selectedPersonKey) || null;
  const selectedEvents = selectedPerson?.events || [];

  if (!date) return null;

  const closeModal = () => {
    setSelectedPersonKey(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={
        selectedPerson
          ? `أحداث ${selectedPerson.displayName}`
          : `أحداث يوم ${date}`
      }
      size="md"
    >
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {selectedPerson
          ? `${selectedEvents.length} ${selectedEvents.length === 1 ? "حدث" : "أحداث"} — اختر حدثًا لعرض التفاصيل`
          : `${events.length} ${events.length === 1 ? "حدث" : "أحداث"} — اختر شخصًا لعرض أحداثه في هذا اليوم`}
      </p>

      {selectedPerson && (
        <button
          type="button"
          onClick={() => setSelectedPersonKey(null)}
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          <ArrowLeft size={16} />
          العودة للقائمة
        </button>
      )}

      <div className="space-y-2">
        {selectedPerson
          ? selectedEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelectEvent(event)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-right transition-colors hover:border-primary-300 hover:bg-primary-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-600 dark:hover:bg-primary-950/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                    {event.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                    {getActivityCodeLabel(event.activityCode)} ·{" "}
                    {event.startTime}
                  </p>
                </div>
                <ChevronLeft size={18} className="shrink-0 text-gray-400" />
              </button>
            ))
          : groupedPeople.map((person) => (
              <button
                key={person.key}
                type="button"
                onClick={() => setSelectedPersonKey(person.key)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-right transition-colors hover:border-primary-300 hover:bg-primary-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-600 dark:hover:bg-primary-950/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                    {person.displayName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                    {person.events.length}{" "}
                    {person.events.length === 1 ? "حدث" : "أحداث"}
                  </p>
                </div>
                <ChevronLeft size={18} className="shrink-0 text-gray-400" />
              </button>
            ))}
      </div>
    </Modal>
  );
}
