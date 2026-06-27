import { useForm } from 'react-hook-form'
import Input from '../common/Input'
import Select from '../common/Select'
import Textarea from '../common/Textarea'
import Button from '../common/Button'
import SupervisionTypePicker from './SupervisionTypePicker'
import { getActivityCodeOptions } from '../../utils/constants'
import { getTodayString } from '../../utils/dateHelpers'
import { useAuth } from '../../hooks/useAuth'
import { inferSupervisionType, resolveSupervisionFields } from '../../utils/supervision'

/**
 * @param {{
 *   initialData?: Partial<import('../../types').Event>,
 *   onSubmit: (data: import('../../types').EventFormData) => Promise<void>,
 *   onCancel: () => void,
 *   loading?: boolean
 * }} props
 */
export default function EventForm({ initialData, onSubmit, onCancel, loading }) {
  const { user } = useAuth()
  const isEditing = Boolean(initialData?.id)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: initialData?.title || '',
      area: initialData?.area || '',
      church: initialData?.church || '',
      activityCode: initialData?.activityCode || '',
      activityName: initialData?.activityName || '',
      details: initialData?.details || '',
      startDate: initialData?.startDate || getTodayString(),
      startTime: initialData?.startTime || '09:00',
      endTime: initialData?.endTime || '10:00',
      supervisionType: initialData
        ? inferSupervisionType(initialData, user?.id || '')
        : 'none',
    },
  })

  const supervisionType = watch('supervisionType')

  const handleFormSubmit = async (data) => {
    const supervision = resolveSupervisionFields(data.supervisionType, user)

    await onSubmit({
      ...data,
      ...supervision,
      creatorId: isEditing ? initialData?.creatorId || user?.id : user?.id,
      creatorName: isEditing ? initialData?.creatorName || user?.name : user?.name,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Title"
        placeholder="Event title"
        error={errors.title?.message}
        register={register('title', { required: 'Title is required' })}
      />

      <Input
        label="Area"
        placeholder="Enter area"
        error={errors.area?.message}
        register={register('area', { required: 'Area is required' })}
      />

      <Input
        label="Church"
        placeholder="Enter church name"
        error={errors.church?.message}
        register={register('church', { required: 'Church is required' })}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="الكود"
          placeholder="Select code"
          error={errors.activityCode?.message}
          register={register('activityCode', { required: 'Activity code is required' })}
          options={getActivityCodeOptions()}
        />
        <Input
          label="النشاط"
          placeholder="Enter activity name"
          error={errors.activityName?.message}
          register={register('activityName', { required: 'Activity name is required' })}
        />
      </div>

      <SupervisionTypePicker
        value={supervisionType}
        onChange={(val) => setValue('supervisionType', val, { shouldValidate: true })}
        error={errors.supervisionType?.message}
      />

      <Textarea
        label="Details"
        placeholder="Event details..."
        rows={3}
        register={register('details')}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="Start Date"
          type="date"
          error={errors.startDate?.message}
          register={register('startDate', { required: 'Start date is required' })}
        />
        <Input
          label="Start Time"
          type="time"
          error={errors.startTime?.message}
          register={register('startTime', { required: 'Start time is required' })}
        />
        <Input
          label="End Time"
          type="time"
          error={errors.endTime?.message}
          register={register('endTime', { required: 'End time is required' })}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" loading={loading} className="w-full sm:w-auto">
          {isEditing ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  )
}
