import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { projectApi } from "../api/project.api.js";
import { AlertBanner } from "../components/AlertBanner.jsx";
import {
  FolderKanban,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  ArrowRight
} from "lucide-react";

export const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectApi.getAll();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProjectId(data[0]._id);
        loadDashboard(data[0]._id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  const loadDashboard = async (projectId) => {
    try {
      const data = await projectApi.getDashboard(projectId);
      setDashboardData(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (e) => {
    const pId = e.target.value;
    setSelectedProjectId(pId);
    if (pId) loadDashboard(pId);
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Project Analytics & Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time project health, task velocity, and team workload distribution
          </p>
        </div>

        {projects.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Project:</span>
            <select
              value={selectedProjectId}
              onChange={handleProjectChange}
              className="px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading project metrics...</div>
      ) : !dashboardData ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700">No Projects Found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">Create your first project to start tracking analytics</p>
          <Link
            to="/projects"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
          >
            Go to Projects
          </Link>
        </div>
      ) : (
        <>
          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">{dashboardData.totalTasks}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FolderKanban className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</p>
                <h3 className="text-3xl font-black text-emerald-600 mt-1">{dashboardData.completedTasks}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overdue</p>
                <h3 className="text-3xl font-black text-red-600 mt-1">{dashboardData.overdueCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completion Rate</p>
                <h3 className="text-3xl font-black text-blue-600 mt-1">{dashboardData.progressPercentage}%</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Progress Bar & Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Status Breakdown (MongoDB Aggregation)</h3>
                <Link
                  to={`/projects/${selectedProjectId}`}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center space-x-1"
                >
                  <span>Open Kanban Board</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Progress bar visual */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                <div
                  style={{ width: `${dashboardData.progressPercentage}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[11px] font-semibold text-slate-500">To Do</span>
                  <p className="text-xl font-bold text-slate-800 mt-0.5">
                    {dashboardData.statusDistribution?.TODO || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <span className="text-[11px] font-semibold text-blue-600">In Progress</span>
                  <p className="text-xl font-bold text-blue-800 mt-0.5">
                    {dashboardData.statusDistribution?.IN_PROGRESS || 0}
                  </p>
                </div>
                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                  <span className="text-[11px] font-semibold text-amber-600">Blocked</span>
                  <p className="text-xl font-bold text-amber-800 mt-0.5">
                    {dashboardData.statusDistribution?.BLOCKED || 0}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <span className="text-[11px] font-semibold text-emerald-600">Done</span>
                  <p className="text-xl font-bold text-emerald-800 mt-0.5">
                    {dashboardData.statusDistribution?.DONE || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Priority Distribution</h3>
              <div className="space-y-3">
                {[
                  { key: "CRITICAL", label: "Critical", color: "bg-red-500", text: "text-red-700" },
                  { key: "HIGH", label: "High", color: "bg-amber-500", text: "text-amber-700" },
                  { key: "MEDIUM", label: "Medium", color: "bg-blue-500", text: "text-blue-700" },
                  { key: "LOW", label: "Low", color: "bg-slate-400", text: "text-slate-700" }
                ].map((p) => {
                  const count = dashboardData.priorityDistribution?.[p.key] || 0;
                  const pct = dashboardData.totalTasks > 0 ? Math.round((count / dashboardData.totalTasks) * 100) : 0;
                  return (
                    <div key={p.key} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className={p.text}>{p.label}</span>
                        <span className="text-slate-500">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div style={{ width: `${pct}%` }} className={`h-full ${p.color}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Workload Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-base">Team Member Workload</h3>
            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 uppercase font-semibold border-b border-slate-200">
                    <th className="py-2.5">Member</th>
                    <th className="py-2.5">Assigned Tasks</th>
                    <th className="py-2.5">Completed Tasks</th>
                    <th className="py-2.5">Completion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dashboardData.assigneeWorkload?.map((w, idx) => {
                    const rate = w.total > 0 ? Math.round((w.completed / w.total) * 100) : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 font-semibold text-slate-800">{w.assignee}</td>
                        <td className="py-3 text-slate-600 font-bold">{w.total}</td>
                        <td className="py-3 text-emerald-600 font-bold">{w.completed}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
