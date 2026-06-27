import { useState } from 'react'
import { Send } from 'lucide-react'
import Button from '../common/Button'
import { addComment } from '../../services/commentService'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

/**
 * @param {{ eventId: string, creatorId: string, eventTitle: string }} props
 */
export default function CommentForm({ eventId, creatorId, eventTitle }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim() || !user) return

    setLoading(true)
    try {
      await addComment({
        eventId,
        userId: user.id,
        userName: user.name,
        text: text.trim(),
        creatorId,
        eventTitle,
      })
      setText('')
      toast.success('Comment added')
    } catch {
      toast.error('Failed to add comment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
        className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      />
      <Button type="submit" size="sm" loading={loading} disabled={!text.trim()}>
        <Send size={16} />
      </Button>
    </form>
  )
}
