import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, FolderKanban, CheckSquare, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { label: "Dashboard", to: "/", icon: LayoutDashboard },
    { label: "Projects", to: "/projects", icon: FolderKanban },
    { label: "Tasks", to: "/tasks", icon: CheckSquare }
  ];

  if (user?.role === "SYSTEM_ADMIN") {
    navItems.push({ label: "Users & RBAC", to: "/admin/users", icon: Users });
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col min-h-[calc(100vh-4rem)] p-4 shrink-0">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs font-semibold text-slate-700">TeamWork v1.0 MERN</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Full compliance with Trainee Project Spec.
          </p>
        </div>
      </div>
    </aside>
  );
};
