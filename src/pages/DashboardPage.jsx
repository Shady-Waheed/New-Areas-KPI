import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EventCalendar from "../components/calendar/EventCalendar";
import EventFilters from "../components/events/EventFilters";
import { subscribeToEvents, filterEvents } from "../services/eventService";
import { getUsersByRole } from "../services/userService";
import { useAuth } from "../hooks/useAuth";
import { useEventStartNotifier } from "../hooks/useEventStartNotifier";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function DashboardPage() {
  const { user, isPrivileged } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const openEventId = searchParams.get("event");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    person: "",
    area: "",
    church: "",
    activityCode: "",
    date: "",
  });

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToEvents(user, (data) => {
      setEvents(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const [hostPersonOptions, setHostPersonOptions] = useState([]);

  useEffect(() => {
    if (user?.role !== "host") {
      setHostPersonOptions([]);
      return;
    }

    let cancelled = false;

    getUsersByRole("user")
      .then((users) => {
        if (cancelled) return;
        const names = users
          .filter((u) => u.responsibleHostId === user.id)
          .map((u) => u.name)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));
        setHostPersonOptions(names);
      })
      .catch(() => {
        if (cancelled) return;
        setHostPersonOptions([]);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const filteredEvents = useMemo(
    () => (isPrivileged ? filterEvents(events, filters) : events),
    [events, filters, isPrivileged],
  );

  const personOptions = useMemo(
    () =>
      [
        ...new Set(
          events.map((event) => event.creatorName || "").filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [events],
  );

  const eventToOpen = useMemo(() => {
    if (!openEventId) return null;
    return events.find((event) => event.id === openEventId) || null;
  }, [events, openEventId]);

  useEventStartNotifier(events);

  const handleClearFilters = () => {
    setFilters({
      person: "",
      area: "",
      church: "",
      activityCode: "",
      date: "",
    });
  };

  const handleOpenEventHandled = useCallback(() => {
    if (searchParams.has("event")) {
      const next = new URLSearchParams(searchParams);
      next.delete("event");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  if (loading) {
    return <LoadingSpinner className="py-20" />;
  }

  return (
    <div className="page-stack">
      {isPrivileged && (
        <EventFilters
          filters={filters}
          onChange={setFilters}
          onClear={handleClearFilters}
          personOptions={
            user?.role === "host" ? hostPersonOptions : personOptions
          }
        />
      )}
      <EventCalendar
        events={filteredEvents}
        eventToOpen={eventToOpen}
        missingOpenEventId={openEventId && !eventToOpen ? openEventId : null}
        onOpenEventHandled={handleOpenEventHandled}
      />
    </div>
  );
}
