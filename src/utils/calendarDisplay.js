import { getEventStyle } from './eventColors'

export const MAX_VISIBLE_PEOPLE_PER_DAY = 3

/**
 * @param {import('../types').Event[]} events
 * @returns {Record<string, import('../types').Event[]>}
 */
export function groupEventsByDate(events) {
  /** @type {Record<string, import('../types').Event[]>} */
  const grouped = {}

  events.forEach((event) => {
    if (!grouped[event.startDate]) {
      grouped[event.startDate] = []
    }
    grouped[event.startDate].push(event)
  })

  Object.values(grouped).forEach((dayEvents) => {
    dayEvents.sort((a, b) => `${a.startTime}`.localeCompare(`${b.startTime}`))
  })

  return grouped
}

/**
 * @param {import('../types').Event} event
 * @param {boolean} isPrivileged
 * @returns {string}
 */
export function getCalendarEventTitle(event, isPrivileged) {
  if (isPrivileged) {
    return event.creatorName || event.createdByName || '—'
  }
  return event.title
}

/**
 * @param {import('../types').Event[]} events
 * @param {import('../types').User | null} user
 * @param {string} viewType
 * @param {(date: string, time: string) => string} toISODateTime
 */
export function buildCalendarEvents(events, user, viewType, toISODateTime) {
  const userId = user?.id || ''
  const isPrivileged = user?.role === 'admin' || user?.role === 'host'
  const isMonthView = viewType === 'dayGridMonth'

  if (!isPrivileged) {
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      start: toISODateTime(event.startDate, event.startTime),
      end: toISODateTime(event.startDate, event.endTime),
      extendedProps: { eventData: event },
      ...getEventStyle(event, userId),
    }))
  }

  if (!isMonthView) {
    return events.map((event) => ({
      id: event.id,
      title: getCalendarEventTitle(event, true),
      start: toISODateTime(event.startDate, event.startTime),
      end: toISODateTime(event.startDate, event.endTime),
      extendedProps: { eventData: event },
      ...getEventStyle(event, userId),
    }))
  }

  const grouped = groupEventsByDate(events)
  /** @type {object[]} */
  const calendarEvents = []

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
        backgroundColor: '#5f6368',
        borderColor: '#5f6368',
        textColor: '#ffffff',
        classNames: ['fc-day-summary-event'],
      })
      return
    }

    dayEvents.forEach((event) => {
      calendarEvents.push({
        id: event.id,
        title: getCalendarEventTitle(event, true),
        start: toISODateTime(event.startDate, event.startTime),
        end: toISODateTime(event.startDate, event.endTime),
        extendedProps: { eventData: event },
        ...getEventStyle(event, userId),
      })
    })
  })

  return calendarEvents
}

/**
 * @param {import('../types').Event[]} events
 * @param {string} date
 * @returns {import('../types').Event[]}
 */
export function getEventsForDate(events, date) {
  return events
    .filter((event) => event.startDate === date)
    .sort((a, b) => `${a.startTime}`.localeCompare(`${b.startTime}`))
}
