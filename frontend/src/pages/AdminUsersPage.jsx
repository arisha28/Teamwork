import React, { useState, useEffect } from "react";
import { userApi } from "../api/extra.api.js";
import { AlertBanner } from "../components/AlertBanner.jsx";
import { Users, Shield, UserCheck, UserX, CheckCircle, Ban } from "lucide-react";

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === "active" ? "disabled" : "active";
    const confirmMsg =
      nextStatus === "disabled"
        ? `Are you sure you want to disable ${user.name}? They will be blocked from logging in.`
        : `Re-activate ${user.name}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const updated = await userApi.setStatus(user._id, nextStatus);
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
      setSuccess(`User status changed to ${nextStatus}.`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const updated = await userApi.update(userId, { role: newRole });
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
      setSuccess("Role updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Admin & User Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Role-Based Access Control (RBAC) & Soft Delete (Disabling users while preserving audit trails)
        </p>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess(null)} />}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status (Soft Delete)</th>
              <th className="py-3 px-4">Joined Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">Loading users...</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="px-2 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                    >
                      <option value="REGULAR_USER">Regular User</option>
                      <option value="PROJECT_ADMIN">Project Admin</option>
                      <option value="SYSTEM_ADMIN">System Admin</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {u.status === "active" ? "Active" : "Disabled (Soft Deleted)"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        u.status === "active"
                          ? "text-red-600 hover:bg-red-50"
                          : "text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      {u.status === "active" ? "Disable User" : "Activate User"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
