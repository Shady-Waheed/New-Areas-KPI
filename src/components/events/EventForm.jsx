import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Input from "../common/Input";
import Select from "../common/Select";
import Textarea from "../common/Textarea";
import Button from "../common/Button";
import SupervisionTypePicker from "./SupervisionTypePicker";
import {
  getActivityCodeOptions,
  getActivityNumberOptions,
  validateActivityNumber,
} from "../../utils/constants";
import {
  getTodayString,
  validateEventStartDate,
} from "../../utils/dateHelpers";
import { useAuth } from "../../hooks/useAuth";
import { getAllUsers } from "../../services/userService";
import {
  inferSupervisionType,
  resolveSupervisionFields,
} from "../../utils/supervision";

/**
 * @param {{
 *   initialData?: Partial<import('../../types').Event>,
 *   onSubmit: (data: import('../../types').EventFormData) => Promise<void>,
 *   onCancel: () => void,
 *   loading?: boolean
 * }} props
 */
export default function EventForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
}) {
  const { user } = useAuth();
  const isEditing = Boolean(initialData?.id);
  const today = getTodayString();
  const originalStartDate = initialData?.startDate;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: initialData?.title || "",
      area: initialData?.area || "",
      church: initialData?.church || "",
      activityCode: initialData?.activityCode || "",
      activityName: initialData?.activityName || "",
      details: initialData?.details || "",
      startDate: initialData?.startDate || getTodayString(),
      startTime: initialData?.startTime || "09:00",
      endTime: initialData?.endTime || "10:00",
      supervisionType: initialData
        ? inferSupervisionType(initialData, user?.id || "")
        : "none",
      audienceType: initialData?.audienceType || "everyone",
      audienceUserIds: initialData?.audienceUserIds || [],
    },
  });

  const supervisionType = watch("supervisionType");
  const audienceType = watch("audienceType");
  const [audienceUsers, setAudienceUsers] = useState([]);
  const [loadingAudienceUsers, setLoadingAudienceUsers] = useState(false);
  const [assigneeUsers, setAssigneeUsers] = useState([]);
  const [loadingAssigneeUsers, setLoadingAssigneeUsers] = useState(false);
  const canAssignEvent = Boolean(user?.canAssignEventsToOthers);

  useEffect(() => {
    if (!canAssignEvent) return;
    setLoadingAudienceUsers(true);
    getAllUsers()
      .then((users) => {
        setAudienceUsers(
          users.filter((u) => u.approved && !u.disabled && u.id !== user.id),
        );
      })
      .finally(() => setLoadingAudienceUsers(false));
  }, [canAssignEvent, user?.id]);

  useEffect(() => {
    if (!canAssignEvent) return;
    setLoadingAssigneeUsers(true);
    getAllUsers()
      .then((users) => {
        setAssigneeUsers(
          users.filter((u) => {
            if (!u.approved || u.disabled || u.id === user?.id) return false;

            const explicitAllowed = Array.isArray(user?.assignableUserIds)
              ? user.assignableUserIds.includes(u.id)
              : false;
            const responsibilityMatch = u.responsibleHostId === user?.id;
            return explicitAllowed || responsibilityMatch;
          }),
        );
      })
      .finally(() => setLoadingAssigneeUsers(false));
  }, [canAssignEvent, user?.id]);

  const handleFormSubmit = async (data) => {
    if (
      data.audienceType === "selected" &&
      (!data.audienceUserIds || data.audienceUserIds.length === 0)
    ) {
      toast.error("Please select at least one user for the event audience");
      return;
    }

    const supervision = resolveSupervisionFields(data.supervisionType, user);

    const selectedAssignee = assigneeUsers.find(
      (u) => u.id === data.assignedUserId,
    );

    await onSubmit({
      ...data,
      ...supervision,
      creatorId: isEditing
        ? initialData?.creatorId || user?.id
        : selectedAssignee?.id || user?.id,
      creatorName: isEditing
        ? initialData?.creatorName || user?.name
        : selectedAssignee?.name || user?.name,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Title"
        placeholder="Event title"
        error={errors.title?.message}
        register={register("title", { required: "Title is required" })}
      />

      <Input
        label="Area"
        placeholder="Enter area"
        error={errors.area?.message}
        register={register("area", { required: "Area is required" })}
      />

      <Input
        label="Church"
        placeholder="Enter church name"
        error={errors.church?.message}
        register={register("church", { required: "Church is required" })}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="الكود"
          placeholder="لا يوجد كود"
          error={errors.activityCode?.message}
          register={register("activityCode")}
          options={getActivityCodeOptions()}
        />
        <Select
          label="النشاط"
          placeholder="لا يوجد نشاط"
          error={errors.activityName?.message}
          register={register("activityName", {
            validate: (value) => {
              if (!value || String(value).trim() === "") return true;
              return validateActivityNumber(value);
            },
          })}
          options={getActivityNumberOptions()}
        />
      </div>

      {canAssignEvent && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Assign event to
          </label>
          <select
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            defaultValue=""
            onChange={(e) => setValue("assignedUserId", e.target.value)}
          >
            <option value="">Myself</option>
            {loadingAssigneeUsers ? (
              <option disabled>Loading users...</option>
            ) : (
              assigneeUsers.map((assigneeUser) => (
                <option key={assigneeUser.id} value={assigneeUser.id}>
                  {assigneeUser.name}
                </option>
              ))
            )}
          </select>
          <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800/60 dark:bg-amber-900/20 dark:text-amber-300">
            {Array.isArray(user?.assignableUserIds) &&
            user.assignableUserIds.length > 0
              ? "You can add events only for the users selected by the admin."
              : "You can add events only for users under your responsibility."}
          </p>
        </div>
      )}

      <SupervisionTypePicker
        value={supervisionType}
        onChange={(val) =>
          setValue("supervisionType", val, { shouldValidate: true })
        }
        error={errors.supervisionType?.message}
      />

      {(user?.role === "admin" || user?.role === "host") && (
        <div className="space-y-4">
          <Select
            label="Visible To"
            placeholder="Select audience"
            error={errors.audienceType?.message}
            register={register("audienceType", {
              required: "Audience selection is required",
            })}
            options={[
              { value: "everyone", label: "Everyone" },
              { value: "selected", label: "Specific people" },
              { value: "only-me", label: "Only me" },
            ]}
          />

          {audienceType === "selected" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Users
              </label>
              <select
                multiple
                className="mt-1 block w-full min-h-[8rem] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                {...register("audienceUserIds")}
              >
                {loadingAudienceUsers && (
                  <option disabled>Loading users...</option>
                )}
                {audienceUsers.map((audienceUser) => (
                  <option key={audienceUser.id} value={audienceUser.id}>
                    {audienceUser.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <Textarea
        label="Details"
        placeholder="Event details..."
        rows={3}
        register={register("details")}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="Start Date"
          type="date"
          min={
            isEditing && originalStartDate && originalStartDate < today
              ? undefined
              : today
          }
          error={errors.startDate?.message}
          register={register("startDate", {
            required: "Start date is required",
            validate: (value) =>
              validateEventStartDate(value, {
                allowDate: isEditing ? originalStartDate : undefined,
              }),
          })}
        />
        <Input
          label="Start Time"
          type="time"
          error={errors.startTime?.message}
          register={register("startTime", {
            required: "Start time is required",
          })}
        />
        <Input
          label="End Time"
          type="time"
          error={errors.endTime?.message}
          register={register("endTime", { required: "End time is required" })}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading} className="w-full sm:w-auto">
          {isEditing ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
