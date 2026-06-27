import { useEffect, useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { subscribeToComments } from '../../services/commentService'
import { formatRelativeTime } from '../../utils/formatters'
import LoadingSpinner from '../common/LoadingSpinner'

/**
 * @param {{ eventId: string }} props
 */
export default function CommentList({ eventId }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToComments(eventId, (data) => {
      setComments(data)
      setLoading(false)
    })
    return unsubscribe
  }, [eventId])

  if (loading) return <LoadingSpinner size="sm" className="py-4" />

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center py-6 text-gray-400">
        <MessageSquare size={24} className="mb-2 opacity-50" />
        <p className="text-sm">No comments yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {comment.userName}
            </span>
            <span className="text-xs text-gray-400">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{comment.text}</p>
        </div>
      ))}
    </div>
  )
}
