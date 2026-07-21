import { useEffect, useState } from "react";
import { Check, UserX, UserCheck } from "lucide-react";
import Card from "../components/common/Card";
import SearchBar from "../components/common/SearchBar";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  subscribeToUsers,
  adminApproveUser,
  hostApproveUser,
  changeUserRole,
  toggleUserDisabled,
} from "../services/userService";
import { ROLES, ROLE_LABELS } from "../utils/constants";
import { formatTimestamp } from "../utils/formatters";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const ROLE_DISPLAY_ORDER = {
  admin: 0,
  admin_readonly: 1,
  host: 2,
  user: 3,
};

function sortUsersByRoleAndName(a, b) {
  const roleA = ROLE_DISPLAY_ORDER[a.role] ?? 99;
  const roleB = ROLE_DISPLAY_ORDER[b.role] ?? 99;
  if (roleA !== roleB) return roleA - roleB;
  return a.name.localeCompare(b.name);
}

function UserActions({
  user,
  currentUser,
  actionLoading,
  onApprove,
  onToggleDisabled,
}) {
  const canManage =
    currentUser?.role === "admin" ||
    (currentUser?.role === "host" && user.role === "user");
  if (!canManage) return null;

  const needsAdminApproval = !user.adminApproved;
  const needsHostApproval = !user.hostApproved;
  const showApproveButton =
    (currentUser?.role === "admin" && needsAdminApproval) ||
    (currentUser?.role === "host" && needsHostApproval);
  const approveLabel =
    currentUser?.role === "admin" ? "Admin Approve" : "Host Approve";

  return (
    <div className="flex flex-wrap gap-2">
      {showApproveButton && (
        <Button
          size="sm"
          onClick={() => onApprove(user)}
          loading={actionLoading === user.id}
        >
          <Check size={14} />
          {approveLabel}
        </Button>
      )}
      {user.id !== currentUser?.id && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onToggleDisabled(user)}
          loading={actionLoading === user.id}
        >
          {user.disabled ? <UserCheck size={14} /> : <UserX size={14} />}
        </Button>
      )}
    </div>
  );
}

function UserRoleCell({ user, currentUser, actionLoading, onRoleChange }) {
  if (currentUser?.role === "admin" && user.id !== currentUser.id) {
    return (
      <select
        value={user.role}
        onChange={(e) => onRoleChange(user.id, e.target.value)}
        disabled={actionLoading === user.id}
        className="w-full max-w-[8rem] rounded border border-gray-300 bg-white px-2 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-800"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
    );
  }

  return <Badge variant="info">{ROLE_LABELS[user.role]}</Badge>;
}

function UserStatusBadge({ user }) {
  if (user.disabled) return <Badge variant="danger">Disabled</Badge>;
  if (user.approved) return <Badge variant="success">Approved</Badge>;
  if (user.adminApproved && !user.hostApproved)
    return <Badge variant="warning">Pending host approval</Badge>;
  if (user.hostApproved && !user.adminApproved)
    return <Badge variant="warning">Pending admin approval</Badge>;
  return <Badge variant="warning">Pending</Badge>;
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToUsers((data) => {
      setUsers(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredUsers = users
    .filter((u) => {
      if (!search) return true;
      return (
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort(sortUsersByRoleAndName);

  const handleApprove = async (user) => {
    setActionLoading(user.id);
    try {
      if (currentUser?.role === "admin") {
        await adminApproveUser(user.id, user.name);
      } else if (currentUser?.role === "host") {
        await hostApproveUser(user.id, user.name, currentUser);
      } else {
        throw new Error("You do not have permission to approve users");
      }
      toast.success(`${user.name} approved — notification sent`);
    } catch (error) {
      console.error("Approve error:", error);
      toast.error(error?.message || "Failed to approve user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId, role) => {
    setActionLoading(userId);
    try {
      await changeUserRole(userId, role);
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleDisabled = async (user) => {
    setActionLoading(user.id);
    try {
      await toggleUserDisabled(user.id, !user.disabled);
      toast.success(user.disabled ? "User enabled" : "User disabled");
    } catch {
      toast.error("Failed to update user status");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="page-stack">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-100">
          User Management
        </h2>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search users..."
          className="w-full sm:max-w-xs"
        />
      </div>

      <div className="space-y-3 md:hidden">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {user.name}
                </p>
                <p className="mt-0.5 break-all text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <UserRoleCell
                  user={user}
                  currentUser={currentUser}
                  actionLoading={actionLoading}
                  onRoleChange={handleRoleChange}
                />
                <UserStatusBadge user={user} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Joined {formatTimestamp(user.createdAt)}
              </p>
              <UserActions
                user={user}
                currentUser={currentUser}
                actionLoading={actionLoading}
                onApprove={handleApprove}
                onToggleDisabled={handleToggleDisabled}
              />
            </div>
          </Card>
        ))}
        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            No users found
          </div>
        )}
      </div>

      <Card className="hidden overflow-hidden p-0 md:block">
        <div className="table-responsive">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600 lg:px-6 dark:text-gray-400">
                  Name
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 lg:px-6 dark:text-gray-400">
                  Email
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 lg:px-6 dark:text-gray-400">
                  Role
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 lg:px-6 dark:text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 lg:px-6 dark:text-gray-400">
                  Joined
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 lg:px-6 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-4 py-4 font-medium text-gray-900 lg:px-6 dark:text-gray-100">
                    {user.name}
                  </td>
                  <td className="px-4 py-4 text-gray-600 lg:px-6 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-4 py-4 lg:px-6">
                    <UserRoleCell
                      user={user}
                      currentUser={currentUser}
                      actionLoading={actionLoading}
                      onRoleChange={handleRoleChange}
                    />
                  </td>
                  <td className="px-4 py-4 lg:px-6">
                    <UserStatusBadge user={user} />
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-500 lg:px-6 dark:text-gray-400">
                    {formatTimestamp(user.createdAt)}
                  </td>
                  <td className="px-4 py-4 lg:px-6">
                    <UserActions
                      user={user}
                      currentUser={currentUser}
                      actionLoading={actionLoading}
                      onApprove={handleApprove}
                      onToggleDisabled={handleToggleDisabled}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              No users found
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
