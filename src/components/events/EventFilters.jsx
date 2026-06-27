import { Filter, X } from 'lucide-react'
import Select from '../common/Select'
import Input from '../common/Input'
import { getActivityCodeOptions } from '../../utils/constants'

/**
 * @param {{ filters: object, onChange: (filters: object) => void, onClear: () => void }} props
 */
export default function EventFilters({ filters, onChange, onClear }) {
  const hasFilters = Object.values(filters).some((v) => v)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Filter size={16} />
          Filters
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={14} />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Input
          label="Person"
          placeholder="Search by name..."
          value={filters.person || ''}
          onChange={(e) => onChange({ ...filters, person: e.target.value })}
        />
        <Input
          label="Area"
          placeholder="Filter by area..."
          value={filters.area || ''}
          onChange={(e) => onChange({ ...filters, area: e.target.value })}
        />
        <Input
          label="Church"
          placeholder="Filter by church..."
          value={filters.church || ''}
          onChange={(e) => onChange({ ...filters, church: e.target.value })}
        />
        <Select
          label="الكود"
          placeholder="All codes"
          value={filters.activityCode || ''}
          onChange={(e) => onChange({ ...filters, activityCode: e.target.value })}
          options={getActivityCodeOptions()}
        />
        <Input
          label="Date"
          type="date"
          value={filters.date || ''}
          onChange={(e) => onChange({ ...filters, date: e.target.value })}
        />
      </div>
    </div>
  )
}
