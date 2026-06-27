/** @type {{ month: number, day: number, nameAr: string }[]} */
export const FIXED_OFFICIAL_HOLIDAYS = [
  { month: 1, day: 7, nameAr: 'عيد الميلاد المجيد' },
  { month: 1, day: 25, nameAr: 'ثورة 25 يناير' },
  { month: 4, day: 25, nameAr: 'تحرير سيناء' },
  { month: 5, day: 1, nameAr: 'عيد العمال' },
  { month: 6, day: 30, nameAr: 'ثورة 30 يونيو' },
  { month: 7, day: 23, nameAr: 'ثورة 23 يوليو' },
  { month: 10, day: 6, nameAr: 'ذكرى انتصارات أكتوبر' },
]

const EID_FITR_DAYS = 4
const EID_ADHA_DAYS = 4

/**
 * @param {number} value
 * @returns {string}
 */
function pad(value) {
  return String(value).padStart(2, '0')
}

/**
 * @param {Date} date
 * @returns {string}
 */
export function formatDateYMD(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * @param {Date} date
 * @returns {{ hy: number, hm: number, hd: number } | null}
 */
export function getIslamicDateParts(date) {
  const calendars = ['islamic-umalqura', 'islamic']

  for (const calendar of calendars) {
    try {
      const parts = new Intl.DateTimeFormat('en-u-ca-islamic', {
        calendar,
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      }).formatToParts(date)

      const read = (type) => Number(parts.find((part) => part.type === type)?.value)
      const hy = read('year')
      const hm = read('month')
      const hd = read('day')

      if (Number.isFinite(hy) && Number.isFinite(hm) && Number.isFinite(hd)) {
        return { hy, hm, hd }
      }
    } catch {
      // try next calendar system
    }
  }

  return null
}

/**
 * Coptic / Eastern Orthodox Easter Sunday on the Gregorian calendar.
 * @param {number} year
 * @returns {Date}
 */
export function getCopticEasterSunday(year) {
  const a = year % 4
  const b = year % 7
  const c = year % 19
  const d = (19 * c + 15) % 30
  const e = (2 * a + 4 * b - d + 34) % 7
  const month = Math.floor((d + e + 114) / 31)
  const day = ((d + e + 114) % 31) + 1

  const easter = new Date(year, month - 1, day)
  easter.setDate(easter.getDate() + 13)
  return easter
}

/**
 * @param {number} gregorianYear
 * @param {number} hijriMonth
 * @param {number} hijriDay
 * @returns {Date | null}
 */
function findGregorianDateInYear(gregorianYear, hijriMonth, hijriDay) {
  for (let month = 0; month < 12; month += 1) {
    const daysInMonth = new Date(gregorianYear, month + 1, 0).getDate()

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(gregorianYear, month, day)
      const hijri = getIslamicDateParts(date)

      if (hijri?.hm === hijriMonth && hijri?.hd === hijriDay) {
        return date
      }
    }
  }

  return null
}

/**
 * @param {Date} startDate
 * @param {number} gregorianYear
 * @param {number} count
 * @param {string} nameAr
 * @returns {{ date: string, nameAr: string }[]}
 */
function buildConsecutiveHolidayDates(startDate, gregorianYear, count, nameAr) {
  /** @type {{ date: string, nameAr: string }[]} */
  const holidays = []

  for (let offset = 0; offset < count; offset += 1) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + offset)

    if (date.getFullYear() !== gregorianYear) continue

    holidays.push({
      date: formatDateYMD(date),
      nameAr,
    })
  }

  return holidays
}

/**
 * @param {number} year
 * @returns {{ date: string, nameAr: string }[]}
 */
export function getFixedHolidaysForYear(year) {
  return FIXED_OFFICIAL_HOLIDAYS.map(({ month, day, nameAr }) => ({
    date: `${year}-${pad(month)}-${pad(day)}`,
    nameAr,
  }))
}

/**
 * Islamic + Coptic holidays that move every year.
 * @param {number} year
 * @returns {{ date: string, nameAr: string }[]}
 */
export function getVariableHolidaysForYear(year) {
  /** @type {{ date: string, nameAr: string }[]} */
  const holidays = []

  const easterSunday = getCopticEasterSunday(year)
  holidays.push({
    date: formatDateYMD(easterSunday),
    nameAr: 'عيد القيامة المجيد',
  })

  const shamElNessim = new Date(easterSunday)
  shamElNessim.setDate(shamElNessim.getDate() + 1)
  holidays.push({
    date: formatDateYMD(shamElNessim),
    nameAr: 'شم النسيم',
  })

  const eidFitrStart = findGregorianDateInYear(year, 10, 1)
  if (eidFitrStart) {
    holidays.push(
      ...buildConsecutiveHolidayDates(eidFitrStart, year, EID_FITR_DAYS, 'عيد الفطر')
    )
  }

  const eidAdhaStart = findGregorianDateInYear(year, 12, 10)
  if (eidAdhaStart) {
    holidays.push(
      ...buildConsecutiveHolidayDates(eidAdhaStart, year, EID_ADHA_DAYS, 'عيد الأضحى')
    )
  }

  return holidays
}

/**
 * @param {number} year
 * @returns {{ date: string, nameAr: string }[]}
 */
export function getCalculatedOfficialHolidaysForYear(year) {
  const merged = [...getFixedHolidaysForYear(year), ...getVariableHolidaysForYear(year)]
  const byDate = new Map()

  merged.forEach((holiday) => {
    const existing = byDate.get(holiday.date)

    if (!existing) {
      byDate.set(holiday.date, holiday)
      return
    }

    if (!existing.nameAr.includes(holiday.nameAr)) {
      byDate.set(holiday.date, {
        date: holiday.date,
        nameAr: `${existing.nameAr} · ${holiday.nameAr}`,
      })
    }
  })

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * @param {number} startYear
 * @param {number} endYear
 * @returns {{ date: string, nameAr: string }[]}
 */
export function getCalculatedOfficialHolidaysForRange(startYear, endYear) {
  /** @type {{ date: string, nameAr: string }[]} */
  const holidays = []

  for (let year = startYear; year <= endYear; year += 1) {
    holidays.push(...getCalculatedOfficialHolidaysForYear(year))
  }

  return holidays
}
