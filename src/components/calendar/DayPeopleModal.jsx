import Modal from '../common/Modal'
import { ChevronLeft } from 'lucide-react'
import { getActivityCodeLabel } from '../../utils/constants'

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   date: string | null,
 *   events: import('../../types').Event[],
 *   onSelectEvent: (event: import('../../types').Event) => void
 * }} props
 */
export default function DayPeopleModal({ isOpen, onClose, date, events, onSelectEvent }) {
  if (!date) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`أحداث يوم ${date}`} size="md">
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {events.length} {events.length === 1 ? 'حدث' : 'أحداث'} — اختر شخصاً لعرض تفاصيل حدثه
      </p>

      <div className="space-y-2">
        {events.map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={() => onSelectEvent(event)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-right transition-colors hover:border-primary-300 hover:bg-primary-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-600 dark:hover:bg-primary-950/30"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                {event.creatorName}
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                {event.title} · {getActivityCodeLabel(event.activityCode)} · {event.startTime}
              </p>
            </div>
            <ChevronLeft size={18} className="shrink-0 text-gray-400" />
          </button>
        ))}
      </div>
    </Modal>
  )
}
