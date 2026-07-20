import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Plus } from "lucide-react";
import Button from "../common/Button";
import Modal from "../common/Modal";
import EventForm from "../events/EventForm";
import EventDetailsModal from "../events/EventDetailsModal";
import DayPeopleModal from "./DayPeopleModal";
import { createEvent } from "../../services/eventService";
import EventColorLegend from "../events/EventColorLegend";
import { toISODateTime } from "../../utils/formatters";
import { getTodayString, isDateBeforeToday } from "../../utils/dateHelpers";
import {
  buildCalendarEvents,
  getEventsForDate,
  MAX_VISIBLE_PEOPLE_PER_DAY,
} from "../../utils/calendarDisplay";
import {
  buildOfficialHolidayCalendarEventsForRange,
  getOfficialHolidayLabelMapForRange,
  toLocalDateString,
} from "../../utils/officialHolidays";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

function getEventErrorMessage(error) {
  const code = error?.code || "";
  if (code === "permission-denied")
    return "Permission denied — check Firestore rules";
  if (code === "failed-precondition")
    return "Firestore index required — check Firebase Console";
  return "Failed to create event";
}

/**
 * @param {{
 *   events: import('../../types').Event[],
 *   eventToOpen?: import('../../types').Event | null,
 *   missingOpenEventId?: string | null,
 *   onOpenEventHandled?: () => void
 * }} props
 */
export default function EventCalendar({
  events,
  eventToOpen,
  missingOpenEventId,
  onOpenEventHandled,
}) {
  const { user, isPrivileged } = useAuth();
  const calendarRef = useRef(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prefillDate, setPrefillDate] = useState(null);
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [dayPeopleOpen, setDayPeopleOpen] = useState(false);
  const [dayPeopleDate, setDayPeopleDate] = useState(null);
  const [dayPeopleEvents, setDayPeopleEvents] = useState([]);
  const longPressTimerRef = useRef(null);
  const suppressDateClickRef = useRef(false);
  const longPressTriggeredRef = useRef(false);
  const [visibleRange, setVisibleRange] = useState(() => {
    const now = new Date();
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    };
  });

  const calendarEvents = useMemo(() => {
    const workEvents = buildCalendarEvents(
      events,
      user,
      currentView,
      toISODateTime,
    );
    const holidayEvents = buildOfficialHolidayCalendarEventsForRange(
      visibleRange.start,
      visibleRange.end,
    );
    return [...holidayEvents, ...workEvents];
  }, [events, user, currentView, visibleRange]);

  const holidayLabelMap = useMemo(
    () =>
      getOfficialHolidayLabelMapForRange(visibleRange.start, visibleRange.end),
    [visibleRange],
  );

  useEffect(() => {
    if (!detailsOpen || !selectedEvent) return;

    const liveEvent = events.find((event) => event.id === selectedEvent.id);
    if (liveEvent) {
      setSelectedEvent(liveEvent);
      return;
    }

    setDetailsOpen(false);
    setSelectedEvent(null);
  }, [events, detailsOpen, selectedEvent?.id]);

  useEffect(() => {
    if (!dayPeopleOpen || !dayPeopleDate) return;
    setDayPeopleEvents(getEventsForDate(events, dayPeopleDate));
  }, [events, dayPeopleOpen, dayPeopleDate]);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, [clearLongPressTimer]);

  useEffect(() => {
    if (eventToOpen) {
      setSelectedEvent(eventToOpen);
      setDetailsOpen(true);
      onOpenEventHandled?.();
      return;
    }

    if (missingOpenEventId) {
      toast.error("الحدث غير متاح أو لا يمكنك عرضه");
      onOpenEventHandled?.();
    }
  }, [eventToOpen, missingOpenEventId, onOpenEventHandled]);

  const handleDayCellDidMount = useCallback(
    (info) => {
      if (currentView !== "dayGridMonth") return;

      const dateStr = toLocalDateString(info.date);
      const holidayName = holidayLabelMap.get(dateStr);
      const frame = info.el.querySelector(".fc-daygrid-day-frame");
      if (!frame) return;

      const existing = frame.querySelector(".fc-day-holiday-label");
      if (existing) existing.remove();

      if (!holidayName) return;

      const label = document.createElement("div");
      label.className = "fc-day-holiday-label";
      label.textContent = holidayName;
      label.title = holidayName;
      frame.appendChild(label);

      const handleLongPressStart = (event) => {
        if (!isPrivileged || currentView !== "dayGridMonth") return;

        const dayEvents = getEventsForDate(events, dateStr);
        if (!dayEvents.length) return;

        event.preventDefault();
        event.stopPropagation();
        clearLongPressTimer();
        longPressTriggeredRef.current = false;
        info.el.classList.add(
          "ring-2",
          "ring-primary-500",
          "ring-offset-2",
          "ring-offset-white",
          "dark:ring-offset-gray-900",
        );
        longPressTimerRef.current = setTimeout(() => {
          longPressTriggeredRef.current = true;
          suppressDateClickRef.current = true;
          info.el.classList.remove(
            "ring-2",
            "ring-primary-500",
            "ring-offset-2",
            "ring-offset-white",
            "dark:ring-offset-gray-900",
          );
          openDayPeopleModal(dateStr, dayEvents);
        }, 450);
      };

      const handleLongPressEnd = () => {
        clearLongPressTimer();
        info.el.classList.remove(
          "ring-2",
          "ring-primary-500",
          "ring-offset-2",
          "ring-offset-white",
          "dark:ring-offset-gray-900",
        );
      };

      info.el.addEventListener("pointerdown", handleLongPressStart);
      info.el.addEventListener("pointerup", handleLongPressEnd);
      info.el.addEventListener("pointerleave", handleLongPressEnd);
      info.el.addEventListener("pointercancel", handleLongPressEnd);
      info.el.addEventListener("mousedown", handleLongPressStart);
      info.el.addEventListener("mouseup", handleLongPressEnd);
      info.el.addEventListener("mouseleave", handleLongPressEnd);
      info.el.addEventListener("touchstart", handleLongPressStart, {
        passive: false,
      });
      info.el.addEventListener("touchend", handleLongPressEnd);
      info.el.addEventListener("touchcancel", handleLongPressEnd);
    },
    [clearLongPressTimer, currentView, holidayLabelMap, events, isPrivileged],
  );

  const openDayPeopleModal = (date, dayEvents) => {
    setDayPeopleDate(date);
    setDayPeopleEvents(dayEvents);
    setDayPeopleOpen(true);
  };

  const openEventDetails = (eventData) => {
    setSelectedEvent(eventData);
    setDetailsOpen(true);
  };

  const handleDateClick = (info) => {
    if (suppressDateClickRef.current) {
      suppressDateClickRef.current = false;
      clearLongPressTimer();
      return;
    }

    const dayEvents = getEventsForDate(events, info.dateStr);
    if (isPrivileged && currentView === "dayGridMonth" && dayEvents.length) {
      openDayPeopleModal(info.dateStr, dayEvents);
      return;
    }
  };

  const handleEventClick = (info) => {
    if (info.event.extendedProps?.isOfficialHoliday) {
      return;
    }

    const { eventData, isDaySummary, dayEvents, date } =
      info.event.extendedProps;

    if (isDaySummary && dayEvents?.length) {
      openDayPeopleModal(date, dayEvents);
      return;
    }

    if (eventData) {
      openEventDetails(eventData);
    }
  };

  const handleDayPersonSelect = (eventData) => {
    setDayPeopleOpen(false);
    openEventDetails(eventData);
  };

  const handleCreate = async (data) => {
    if (!user) return;

    if (isDateBeforeToday(data.startDate)) {
      toast.error("لا يمكن إضافة حدث قبل اليوم الحالي");
      return;
    }

    setLoading(true);
    try {
      await createEvent(data, user);
      toast.success("Event created");
      setCreateOpen(false);
      setPrefillDate(null);
    } catch (error) {
      console.error("Create event error:", error);
      toast.error(getEventErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Calendar
        </h2>
        <Button
          size="sm"
          onClick={() => {
            setPrefillDate(null);
            setCreateOpen(true);
          }}
          className="w-full sm:w-auto"
        >
          <Plus size={16} />
          New Event
        </Button>
      </div>

      <EventColorLegend className="mb-4" compact />

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={calendarEvents}
        datesSet={(info) => {
          setCurrentView(info.view.type);
          setVisibleRange({ start: info.start, end: info.end });
        }}
        dayCellDidMount={handleDayCellDidMount}
        dateClick={handleDateClick}
        selectAllow={(selectInfo) =>
          !isDateBeforeToday(toLocalDateString(selectInfo.start))
        }
        eventDisplay="block"
        eventClick={handleEventClick}
        eventContent={(arg) => {
          const props = arg.event.extendedProps || {};
          if (props.type === "color-count") {
            const color = props.color;
            const count = props.count;
            return (
              <div
                className="flex items-center justify-center gap-2 rounded-full px-2 py-1 text-[11px] font-semibold shadow-sm dark:shadow-none"
                style={{ backgroundColor: color, color: "#fff" }}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
                <span>{count}</span>
              </div>
            );
          }
          return null;
        }}
        displayEventTime={false}
        height="auto"
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        nowIndicator
        editable={false}
        selectable
        dayMaxEvents={
          isPrivileged && currentView === "dayGridMonth" ? false : 3
        }
        moreLinkClick="popover"
      />

      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        المناسبات الرسمية تُحسب تلقائياً لأي سنة وتظهر بشكل خفيف ولا تؤثر على
        أحداث العمل.
      </p>

      <DayPeopleModal
        isOpen={dayPeopleOpen}
        onClose={() => setDayPeopleOpen(false)}
        date={dayPeopleDate}
        events={dayPeopleEvents}
        onSelectEvent={handleDayPersonSelect}
      />

      <Modal
        isOpen={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setPrefillDate(null);
        }}
        title="Create Event"
        size="lg"
      >
        <EventForm
          initialData={prefillDate ? { startDate: prefillDate } : undefined}
          onSubmit={handleCreate}
          onCancel={() => {
            setCreateOpen(false);
            setPrefillDate(null);
          }}
          loading={loading}
        />
      </Modal>

      <EventDetailsModal
        event={selectedEvent}
        isOpen={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedEvent(null);
        }}
      />
    </div>
  );
}
