import { NavLink } from "react-router-dom";
import { Calendar, Users, UserCircle, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { EVENT_COLOR_LEGEND } from "../../utils/eventColors";

/**
 * @param {{ isOpen: boolean, onClose: () => void }} props
 */
export default function Sidebar({ isOpen, onClose }) {
  const { isPrivileged } = useAuth();

  const links = [
    { to: "/dashboard", icon: Calendar, label: "Calendar" },
    ...(isPrivileged
      ? [{ to: "/users", icon: Users, label: "User Management" }]
      : []),
    { to: "/profile", icon: UserCircle, label: "Profile" },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex min-h-full w-[min(18rem,85vw)] flex-col border-r border-gray-200 bg-sidebar-light transition-transform duration-200 dark:border-gray-700 dark:bg-sidebar-dark lg:static lg:w-64 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
              K
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              New Areas KPI
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 lg:hidden dark:hover:bg-gray-700"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            ألوان الأحداث
          </p>
          <div className="mt-2 space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
            {EVENT_COLOR_LEGEND.map(({ color, labelAr }) => (
              <div key={labelAr} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded"
                  style={{ backgroundColor: color }}
                />
                {labelAr}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
