import { EVENT_COLOR_LEGEND } from '../../utils/eventColors'

/**
 * @param {{ className?: string, compact?: boolean }} props
 */
export default function EventColorLegend({ className = '', compact = false }) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50 ${className}`}
    >
      <p className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
        ألوان الأحداث
      </p>
      <div className={`flex ${compact ? 'flex-wrap gap-3' : 'flex-col gap-2'}`}>
        {EVENT_COLOR_LEGEND.map(({ color, labelAr }) => (
          <div key={labelAr} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div
              className="h-3.5 w-3.5 shrink-0 rounded shadow-sm"
              style={{ backgroundColor: color }}
            />
            <span>{labelAr}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
          <div className="h-3.5 w-3.5 shrink-0 rounded border border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700/50" />
          <span>مناسبة رسمية</span>
        </div>
      </div>
    </div>
  )
}
