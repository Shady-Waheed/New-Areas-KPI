import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import EventCalendar from '../components/calendar/EventCalendar'
import EventFilters from '../components/events/EventFilters'
import { subscribeToEvents, filterEvents } from '../services/eventService'
import { useAuth } from '../hooks/useAuth'
import { useEventStartNotifier } from '../hooks/useEventStartNotifier'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function DashboardPage() {
  const { user, isPrivileged } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const openEventId = searchParams.get('event')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    person: '',
    area: '',
    church: '',
    activityCode: '',
    date: '',
  })

  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToEvents(user, (data) => {
      setEvents(data)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  const filteredEvents = useMemo(
    () => (isPrivileged ? filterEvents(events, filters) : events),
    [events, filters, isPrivileged]
  )

  const eventToOpen = useMemo(() => {
    if (!openEventId) return null
    return events.find((event) => event.id === openEventId) || null
  }, [events, openEventId])

  useEventStartNotifier(events)

  const handleClearFilters = () => {
    setFilters({ person: '', area: '', church: '', activityCode: '', date: '' })
  }

  const handleOpenEventHandled = useCallback(() => {
    if (searchParams.has('event')) {
      const next = new URLSearchParams(searchParams)
      next.delete('event')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  if (loading) {
    return <LoadingSpinner className="py-20" />
  }

  return (
    <div className="page-stack">
      {isPrivileged && (
        <EventFilters
          filters={filters}
          onChange={setFilters}
          onClear={handleClearFilters}
        />
      )}
      <EventCalendar
        events={filteredEvents}
        eventToOpen={eventToOpen}
        missingOpenEventId={openEventId && !eventToOpen ? openEventId : null}
        onOpenEventHandled={handleOpenEventHandled}
      />
    </div>
  )
}
