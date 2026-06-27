/**
 * @param {import('react').SelectHTMLAttributes<HTMLSelectElement> & {
 *   label?: string,
 *   error?: string,
 *   options: { value: string, label: string }[],
 *   placeholder?: string,
 *   register?: object
 * }} props
 */
export default function Select({
  label,
  error,
  options,
  placeholder,
  register,
  className = '',
  id,
  ...props
}) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark] ${error ? 'border-red-500 dark:border-red-500' : ''} ${className}`}
        {...register}
        {...props}
      >
        {placeholder && (
          <option value="" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
          >
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )
}
