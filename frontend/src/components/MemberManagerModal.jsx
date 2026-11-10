import React, { useState, useEffect } from "react";
import { Modal } from "./Modal.jsx";
import { AlertBanner } from "./AlertBanner.jsx";
import { projectApi } from "../api/project.api.js";
import { userApi } from "../api/extra.api.js";
import { UserPlus, Trash2, Shield, User } from "lucide-react";

export const MemberManagerModal = ({ isOpen, onClose, project, onProjectUpdated }) => {
  if (!project) return null;

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("MEMBER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadAllUsers();
    }
  }, [isOpen]);

  const loadAllUsers = async () => {
    try {
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await projectApi.addMember(project._id, {
        userId: selectedUserId,
        role: selectedRole
      });
      setSuccess("Member added successfully!");
      onProjectUpdated(updated);
      setSelectedUserId("");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member from the project?")) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await projectApi.removeMember(project._id, userId);
      setSuccess("Member removed.");
      onProjectUpdated(updated);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Members — ${project.name}`} maxWidth="max-w-xl">
      <div className="space-y-4">
        {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}
        {success && <AlertBanner type="success" message={success} onClose={() => setSuccess(null)} />}

        {/* Add Member Form */}
        <form onSubmit={handleAddMember} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1">
            <UserPlus className="w-3.5 h-3.5 mr-1 text-blue-600" />
            Add New Member
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a user...</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !selectedUserId}
            className="w-full py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Adding..." : "Add to Project"}
          </button>
        </form>

        {/* Member List */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Current Members ({project.members?.length || 0})
          </h4>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-60 overflow-y-auto">
            {project.members?.map((m) => {
              const u = m.userId || {};
              const isOwner = project.ownerId?._id === u._id || project.ownerId === u._id;
              return (
                <div key={u._id || Math.random()} className="p-3 flex items-center justify-between hover:bg-slate-50 text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                        <span>{u.name || "Unknown"}</span>
                        {isOwner && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                            Owner
                          </span>
                        )}
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                          {m.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </div>
                  </div>

                  {!isOwner && (
                    <button
                      onClick={() => handleRemoveMember(u._id)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
