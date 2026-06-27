import { Clock, LogOut } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { useAuth } from '../hooks/useAuth'
import { logoutUser } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function WaitingApprovalPage() {
  const { user, isApproved } = useAuth()
  const clearUser = useAuthStore((s) => s.clearUser)
  const navigate = useNavigate()

  if (isApproved) {
    return <Navigate to="/dashboard" replace />
  }

  const handleLogout = async () => {
    await logoutUser()
    clearUser()
    navigate('/login')
    toast.success('Logged out')
  }

  return (
    <Card className="auth-card-wrap text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
        <Clock size={32} className="text-yellow-600 dark:text-yellow-400" />
      </div>
      <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Waiting for Approval
      </h2>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        مرحباً {user?.name}، حسابك قيد المراجعة من قبل Host.
        سيتم تحويلك تلقائياً للوحة التحكم فور الموافقة.
      </p>
      <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-left text-sm dark:bg-gray-800">
        <p><span className="font-medium">Email:</span> {user?.email}</p>
      </div>
      <Button variant="secondary" className="mt-6" onClick={handleLogout}>
        <LogOut size={16} />
        Sign out
      </Button>
    </Card>
  )
}
