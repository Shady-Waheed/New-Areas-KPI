import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { getAuthErrorMessage } from '../utils/authErrors'
import Card from '../components/common/Card'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { registerUser } from '../services/authService'
import { useAuthStore } from '../store/authStore'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await registerUser(data)
      setUser(user)
      navigate('/waiting')
      toast.success('Registration successful! Awaiting approval.')
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(getAuthErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="auth-card-wrap">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Create account</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Register to join New Areas KPI
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input
          label="Name"
          placeholder="Your full name"
          error={errors.name?.message}
          register={register('name', { required: 'Name is required' })}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          register={register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
          })}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min. 6 characters"
          error={errors.password?.message}
          register={register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Minimum 6 characters' },
          })}
        />
        <Button type="submit" className="w-full" loading={loading}>
          Register
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
          Sign in
        </Link>
      </p>
    </Card>
  )
}
