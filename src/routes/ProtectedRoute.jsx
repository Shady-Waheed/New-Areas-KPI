import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/common/LoadingSpinner'

/**
 * @param {{ children: import('react').ReactNode, requireApproval?: boolean, requirePrivileged?: boolean }} props
 */
export default function ProtectedRoute({ children, requireApproval = true, requirePrivileged = false }) {
  const { user, loading, initialized, isApproved, isPrivileged } = useAuth()

  if (!initialized || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireApproval && !isApproved) {
    return <Navigate to="/waiting" replace />
  }

  if (requirePrivileged && !isPrivileged) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
