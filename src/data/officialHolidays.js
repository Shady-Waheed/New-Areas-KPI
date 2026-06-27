import {
  getCalculatedOfficialHolidaysForRange,
  getCalculatedOfficialHolidaysForYear,
} from '../utils/holidayCalculator'

export { FIXED_OFFICIAL_HOLIDAYS } from '../utils/holidayCalculator'

/**
 * @param {number} year
 * @returns {{ date: string, nameAr: string }[]}
 */
export function getOfficialHolidaysForYear(year) {
  return getCalculatedOfficialHolidaysForYear(year)
}

/**
 * @param {number} startYear
 * @param {number} endYear
 * @returns {{ date: string, nameAr: string }[]}
 */
export function getOfficialHolidaysForRange(startYear, endYear) {
  return getCalculatedOfficialHolidaysForRange(startYear, endYear)
}
