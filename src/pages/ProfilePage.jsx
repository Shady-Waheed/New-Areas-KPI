import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import UserAvatar from "../components/common/UserAvatar";
import Badge from "../components/common/Badge";
import { useAuth } from "../hooks/useAuth";
import { updateUserProfile } from "../services/userService";
import { useAuthStore } from "../store/authStore";
import { ROLE_LABELS } from "../utils/constants";
import { formatTimestamp } from "../utils/formatters";

export default function ProfilePage() {
  const { user } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { name: user?.name || "" },
  });

  useEffect(() => {
    if (user) {
      reset({ name: user.name });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    if (!user) return;
    setLoading(true);
    try {
      await updateUserProfile(user.id, { name: data.name });
      setUser({ ...user, name: data.name });
      toast.success("تم تحديث الملف الشخصي");
    } catch {
      toast.error("فشل تحديث الملف الشخصي");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Profile
      </h2>

      <Card>
        <div className="flex flex-col items-center sm:flex-row sm:items-start sm:gap-6">
          <UserAvatar name={user.name} size="xl" />

          <div className="mt-4 text-center sm:mt-0 sm:text-left">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {user.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge variant="info">{ROLE_LABELS[user.role]}</Badge>
              <Badge variant={user.approved ? "success" : "warning"}>
                {user.approved ? "Approved" : "Pending"}
              </Badge>
              {!user.approved && (
                <>
                  <Badge variant={user.adminApproved ? "success" : "warning"}>
                    {user.adminApproved ? "Admin Approved" : "Admin Pending"}
                  </Badge>
                  <Badge variant={user.hostApproved ? "success" : "warning"}>
                    {user.hostApproved ? "Host Approved" : "Host Pending"}
                  </Badge>
                </>
              )}
            </div>
            {user.responsibleHostName && (
              <div className="mt-3 rounded-lg bg-gray-50 px-4 py-3 text-sm dark:bg-gray-800">
                <p className="font-medium">Responsible Host</p>
                <p>{user.responsibleHostName}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card title="Edit Profile">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" register={register("name", { required: true })} />
          <Input label="Email" value={user.email} disabled />
          <Input
            label="Member since"
            value={formatTimestamp(user.createdAt)}
            disabled
          />
          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
