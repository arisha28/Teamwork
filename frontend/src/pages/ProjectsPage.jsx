import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { projectApi } from "../api/project.api.js";
import { Modal } from "../components/Modal.jsx";
import { AlertBanner } from "../components/AlertBanner.jsx";
import { Plus, FolderKanban, Users, Calendar, ArrowRight } from "lucide-react";

export const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: ""
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectApi.getAll();
      setProjects(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const created = await projectApi.create(formData);
      setProjects([created, ...projects]);
      setIsModalOpen(false);
      setFormData({
        name: "",
        description: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: ""
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and manage your workspace projects and team members
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 flex items-center space-x-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700">No Projects Found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">Get started by creating your first project</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      proj.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {proj.status}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{proj.members?.length || 0} members</span>
                  </div>
                </div>

                <h3 className="font-bold text-lg text-slate-900 mb-2">{proj.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-3 mb-4">{proj.description || "No description provided."}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Started: {new Date(proj.startDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                <Link
                  to={`/projects/${proj._id}`}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 flex items-center space-x-1 transition"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. NextGen Mobile Platform"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Describe project objectives and scope..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
            >
              Create Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
