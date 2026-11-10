import React, { useState } from "react";
import { Modal } from "./Modal.jsx";
import { AlertBanner } from "./AlertBanner.jsx";
import { taskApi } from "../api/task.api.js";

export const CreateTaskModal = ({ isOpen, onClose, project, onTaskCreated }) => {
  if (!project) return null;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    assigneeId: "",
    dueDate: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const task = await taskApi.create(project._id, formData);
      onTaskCreated(task);
      setFormData({
        title: "",
        description: "",
        priority: "MEDIUM",
        assigneeId: "",
        dueDate: ""
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. Implement OAuth Authentication"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
          <textarea
            rows={3}
            placeholder="Task description and requirements..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assignee</label>
            <select
              value={formData.assigneeId}
              onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Unassigned</option>
              {project.members?.map((m) => {
                const u = m.userId || m;
                return (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
