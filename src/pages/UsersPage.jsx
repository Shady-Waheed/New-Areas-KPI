import { useEffect, useState } from "react";
import {
  Check,
  UserX,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";
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
  toggleCanAssignEventsToOthers,
  updateAssignableUsers,
  updateUserProfile,
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
  onToggleAssignPermission,
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
      {currentUser?.role === "admin" && user.id !== currentUser?.id && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onToggleAssignPermission(user)}
          loading={actionLoading === `${user.id}-assign`}
        >
          {user.canAssignEventsToOthers ? "Disable Assign" : "Enable Assign"}
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
        className="w-full min-w-0 rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
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

function ResponsibleHostCell({
  user,
  currentUser,
  hostUsers,
  actionLoading,
  onHostChange,
}) {
  if (currentUser?.role === "admin" && user.role === "user") {
    return (
      <select
        value={user.responsibleHostId || ""}
        onChange={(e) => {
          const hostId = e.target.value;
          const host = hostUsers.find((h) => h.id === hostId);
          onHostChange(user.id, hostId || null, host?.name || "");
        }}
        disabled={actionLoading === `${user.id}-host`}
        className="w-full min-w-0 rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
      >
        <option value="">No host</option>
        {hostUsers.map((host) => (
          <option key={host.id} value={host.id}>
            {host.name}
          </option>
        ))}
      </select>
    );
  }

  return <div>{user.responsibleHostName || "-"}</div>;
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

function AssignableUsersEditor({
  targetUser,
  users,
  currentUser,
  actionLoading,
  expanded,
  onToggleExpanded,
  onUpdateAssignableUsers,
}) {
  if (
    currentUser?.role !== "admin" ||
    !targetUser?.canAssignEventsToOthers ||
    targetUser.id === currentUser?.id
  ) {
    return null;
  }

  const options = users.filter(
    (candidate) =>
      candidate.id !== targetUser.id &&
      candidate.id !== currentUser.id &&
      candidate.approved &&
      !candidate.disabled,
  );

  const selectedIds = targetUser.assignableUserIds || [];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
      <button
        type="button"
        onClick={() => onToggleExpanded(targetUser.id)}
        disabled={actionLoading === `${targetUser.id}-assign`}
        className="flex w-full items-center justify-between rounded-lg border border-transparent px-1 py-1 text-left transition hover:border-slate-300 hover:bg-white/70 dark:hover:border-slate-600 dark:hover:bg-slate-700/40"
      >
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-primary-100 p-1.5 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            <Users size={14} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Assignable users
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {selectedIds.length > 0
                ? `${selectedIds.length} selected`
                : "No users selected"}
            </p>
          </div>
        </div>
        <div className="rounded-full p-1 text-gray-500 dark:text-gray-400">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Choose which users this person can create events for.
          </p>

          {options.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 px-3 py-3 text-sm text-gray-500 dark:border-slate-600 dark:text-gray-400">
              No eligible users available right now.
            </div>
          ) : (
            <div className="max-h-48 space-y-2 overflow-auto rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900/50">
              {options.map((option) => {
                const checked = selectedIds.includes(option.id);
                return (
                  <label
                    key={option.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-700 transition hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-slate-800"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const nextIds = checked
                          ? selectedIds.filter((id) => id !== option.id)
                          : [...selectedIds, option.id];
                        onUpdateAssignableUsers(targetUser.id, nextIds);
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span>{option.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedAssignEditor, setExpandedAssignEditor] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToUsers((data) => {
      setUsers(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const normalizedSearch = search.trim().toLowerCase();

  const hostUsers = users
    .filter((u) => u.role === "host" && !u.disabled)
    .sort((a, b) => a.name.localeCompare(b.name));

  const visibleUsers = users.filter((u) => {
    if (currentUser?.role !== "host") return true;
    if (u.role !== "user") return false;
    return !u.hostApproved || u.responsibleHostId === currentUser.id;
  });

  const filteredUsers = visibleUsers
    .filter((u) => {
      if (!normalizedSearch) return true;
      const haystack = `${u.name || ""} ${u.email || ""}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    })
    .sort(sortUsersByRoleAndName);

  const handleApprove = async (user) => {
    setActionLoading(user.id);
    try {
      if (currentUser?.role === "admin") {
        await adminApproveUser(user.id, user.name, currentUser);
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

  const handleToggleAssignPermission = async (user) => {
    setActionLoading(`${user.id}-assign`);
    try {
      await toggleCanAssignEventsToOthers(
        user.id,
        !user.canAssignEventsToOthers,
      );
      toast.success(
        user.canAssignEventsToOthers
          ? "Assign permission removed"
          : "Assign permission enabled",
      );
    } catch {
      toast.error("Failed to update assign permission");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateAssignableUsers = async (userId, assignableUserIds) => {
    setActionLoading(`${userId}-assign`);
    try {
      await updateAssignableUsers(userId, assignableUserIds);
      toast.success("Assignable users updated");
    } catch {
      toast.error("Failed to update assignable users");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResponsibleHostChange = async (userId, hostId, hostName) => {
    setActionLoading(`${userId}-host`);
    try {
      await updateUserProfile(userId, {
        responsibleHostId: hostId || null,
        responsibleHostName: hostName || null,
      });
      toast.success("Responsible host updated");
    } catch {
      toast.error("Failed to update responsible host");
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
        <div className="relative w-full sm:max-w-sm">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search users by name or email..."
            className="w-full"
          />
          {normalizedSearch && (
            <div className="mt-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-900/40 dark:bg-blue-900/20">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                {filteredUsers.length === 0 ? (
                  <>No results found for "{normalizedSearch}"</>
                ) : (
                  <>
                    Found {filteredUsers.length} user
                    {filteredUsers.length === 1 ? "" : "s"}
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 break-words text-base">
                    {user.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 break-all">
                    {user.email}
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Role
                    </span>
                    <UserRoleCell
                      user={user}
                      currentUser={currentUser}
                      actionLoading={actionLoading}
                      onRoleChange={handleRoleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Status
                    </span>
                    <UserStatusBadge user={user} />
                  </div>
                </div>
              </div>

              <div className="grid gap-2 text-sm text-gray-500 dark:text-gray-400 sm:grid-cols-2">
                <div>Joined {formatTimestamp(user.createdAt)}</div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Responsible host
                  </span>
                  <ResponsibleHostCell
                    user={user}
                    currentUser={currentUser}
                    hostUsers={hostUsers}
                    actionLoading={actionLoading}
                    onHostChange={handleResponsibleHostChange}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <UserActions
                  user={user}
                  currentUser={currentUser}
                  actionLoading={actionLoading}
                  onApprove={handleApprove}
                  onToggleDisabled={handleToggleDisabled}
                  onToggleAssignPermission={handleToggleAssignPermission}
                />
              </div>

              <AssignableUsersEditor
                targetUser={user}
                users={users}
                currentUser={currentUser}
                actionLoading={actionLoading}
                expanded={expandedAssignEditor === user.id}
                onToggleExpanded={(userId) =>
                  setExpandedAssignEditor((current) =>
                    current === userId ? null : userId,
                  )
                }
                onUpdateAssignableUsers={handleUpdateAssignableUsers}
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
          <table className="w-full min-w-[720px] text-left text-sm users-table">
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
                  Host
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
                    <div className="min-w-0 break-words text-sm">
                      {user.name}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600 lg:px-6 dark:text-gray-400">
                    <div className="min-w-0 break-words text-sm">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-4 py-4 lg:px-6">
                    <div className="min-w-[10rem] max-w-[16rem] text-sm">
                      <UserRoleCell
                        user={user}
                        currentUser={currentUser}
                        actionLoading={actionLoading}
                        onRoleChange={handleRoleChange}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4 lg:px-6 text-gray-600 dark:text-gray-400">
                    <div className="min-w-[10rem] text-sm break-words">
                      <ResponsibleHostCell
                        user={user}
                        currentUser={currentUser}
                        hostUsers={hostUsers}
                        actionLoading={actionLoading}
                        onHostChange={handleResponsibleHostChange}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4 lg:px-6">
                    <div className="min-w-[8rem] text-sm">
                      <UserStatusBadge user={user} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 lg:px-6 dark:text-gray-400">
                    {formatTimestamp(user.createdAt)}
                  </td>
                  <td className="px-4 py-4 lg:px-6">
                    <div className="min-w-[12rem] space-y-3">
                      <UserActions
                        user={user}
                        currentUser={currentUser}
                        actionLoading={actionLoading}
                        onApprove={handleApprove}
                        onToggleDisabled={handleToggleDisabled}
                        onToggleAssignPermission={handleToggleAssignPermission}
                      />
                      <AssignableUsersEditor
                        targetUser={user}
                        users={users}
                        currentUser={currentUser}
                        actionLoading={actionLoading}
                        expanded={expandedAssignEditor === user.id}
                        onToggleExpanded={(userId) =>
                          setExpandedAssignEditor((current) =>
                            current === userId ? null : userId,
                          )
                        }
                        onUpdateAssignableUsers={handleUpdateAssignableUsers}
                      />
                    </div>
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
