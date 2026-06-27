/**
 * Deterministic avatar color from a name string.
 * @param {string} name
 * @returns {string}
 */
function getAvatarHue(name) {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 360
}

/**
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name?.trim()) return '?'
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * @param {{ name: string, size?: 'sm' | 'md' | 'lg' | 'xl', className?: string }} props
 */
export default function UserAvatar({ name, size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-2xl',
  }

  const hue = getAvatarHue(name || 'User')
  const initials = getInitials(name)

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-sm ring-2 ring-white/20 dark:ring-gray-700/50 ${sizes[size]} ${className}`}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 70% 52%), hsl(${(hue + 40) % 360} 75% 42%))`,
      }}
      aria-hidden="true"
      title={name}
    >
      {initials}
    </div>
  )
}
