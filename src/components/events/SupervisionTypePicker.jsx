import { SUPERVISION_TYPES } from '../../utils/supervision'

/**
 * @param {{
 *   value: string,
 *   onChange: (value: string) => void,
 *   error?: string
 * }} props
 */
export default function SupervisionTypePicker({ value, onChange, error }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        نوع الإشراف <span className="text-red-500">*</span>
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {SUPERVISION_TYPES.map((option) => {
          const selected = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex items-center gap-3 rounded-xl border-2 px-3 py-3 text-right transition-all ${
                selected
                  ? 'border-primary-500 bg-primary-50 shadow-sm dark:border-primary-400 dark:bg-primary-900/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500'
              }`}
            >
              <div
                className="h-5 w-5 shrink-0 rounded-full shadow-sm"
                style={{ backgroundColor: option.color }}
              />
              <span className="text-xs font-medium leading-snug text-gray-800 dark:text-gray-100">
                {option.labelAr}
              </span>
            </button>
          )
        })}
      </div>
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )
}
