import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";
import {
  Bell,
  CheckCircle,
  FolderKanban,
  LogOut,
  User as UserIcon,
  CheckCheck
} from "lucide-react";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "SYSTEM_ADMIN":
        return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">Admin</span>;
      case "PROJECT_ADMIN":
        return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">PM</span>;
      default:
        return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">Dev</span>;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
              TW
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">
              TeamWork
            </span>
          </Link>
          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">
            MERN v1.0
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-slate-800">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:underline flex items-center space-x-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-xs text-slate-400">
                      No notifications yet
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => markAsRead(n._id)}
                        className={`px-4 py-2.5 text-xs hover:bg-slate-50 cursor-pointer transition ${
                          !n.isRead ? "bg-blue-50/60 font-medium" : "text-slate-600"
                        }`}
                      >
                        <p className="text-slate-800">{n.message}</p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile info */}
          <div className="flex items-center space-x-3 border-l pl-4 border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-800 flex items-center space-x-1 justify-end">
                <span>{user?.name}</span>
                {getRoleBadge(user?.role)}
              </div>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
