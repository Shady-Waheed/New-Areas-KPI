import { getOfficialHolidaysForRange } from '../data/officialHolidays'

/**
 * @param {number} startYear
 * @param {number} endYear
 * @returns {Map<string, string>}
 */
export function getOfficialHolidayLabelMap(startYear, endYear) {
  const map = new Map()
  getOfficialHolidaysForRange(startYear, endYear).forEach((holiday) => {
    map.set(holiday.date, holiday.nameAr)
  })
  return map
}

/**
 * Subtle background-only events (do not count toward dayMaxEvents).
 * @param {number} startYear
 * @param {number} endYear
 * @returns {object[]}
 */
export function buildOfficialHolidayCalendarEvents(startYear, endYear) {
  return getOfficialHolidaysForRange(startYear, endYear).map((holiday) => ({
    id: `holiday-bg-${holiday.date}`,
    start: holiday.date,
    allDay: true,
    display: 'background',
    classNames: ['fc-official-holiday-bg'],
    extendedProps: { isOfficialHoliday: true, holidayName: holiday.nameAr },
  }))
}

/**
 * @param {Date} rangeStart
 * @param {Date} rangeEnd
 * @returns {object[]}
 */
export function buildOfficialHolidayCalendarEventsForRange(rangeStart, rangeEnd) {
  const startYear = rangeStart.getFullYear() - 1
  const endYear = rangeEnd.getFullYear() + 1
  return buildOfficialHolidayCalendarEvents(startYear, endYear)
}

/**
 * @param {Date} rangeStart
 * @param {Date} rangeEnd
 * @returns {Map<string, string>}
 */
export function getOfficialHolidayLabelMapForRange(rangeStart, rangeEnd) {
  const startYear = rangeStart.getFullYear() - 1
  const endYear = rangeEnd.getFullYear() + 1
  return getOfficialHolidayLabelMap(startYear, endYear)
}

/**
 * @param {Date} date
 * @returns {string}
 */
export function toLocalDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
