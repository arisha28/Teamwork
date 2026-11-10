import React, { useState, useEffect } from "react";
import { projectApi } from "../api/project.api.js";
import { taskApi } from "../api/task.api.js";
import { useDebounce } from "../hooks/useDebounce.js";
import { TaskDetailModal } from "../components/TaskDetailModal.jsx";
import { AlertBanner } from "../components/AlertBanner.jsx";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FolderKanban
} from "lucide-react";

export const TasksListPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1, limit: 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [sort, setSort] = useState("createdAt:desc");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  // Detail Modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectApi.getAll();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProjectId(data[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      loadTasks();
    }
  }, [selectedProjectId, debouncedSearch, status, priority, sort, page]);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await taskApi.getByProject(selectedProjectId, {
        page,
        limit: 10,
        search: debouncedSearch,
        status: status || undefined,
        priority: priority || undefined,
        sort
      });
      setTasks(res.data || []);
      setPagination(res.pagination || { total: 0, pages: 1, currentPage: 1, limit: 10 });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleTaskUpdated = (updated) => {
    setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    setSelectedTask(updated);
  };

  const handleTaskDeleted = (id) => {
    setTasks((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Task Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Server-side search, multi-field filtering, sorting, and pagination
          </p>
        </div>

        {projects.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="BLOCKED">Blocked</option>
          <option value="DONE">Done</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>

        {/* Sort Select */}
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="createdAt:desc">Newest First</option>
          <option value="createdAt:asc">Oldest First</option>
          <option value="dueDate:asc">Due Date (Earliest)</option>
          <option value="dueDate:desc">Due Date (Latest)</option>
          <option value="priority:desc">Priority (High to Low)</option>
        </select>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
            <tr>
              <th className="py-3 px-4">Task Details</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4 text-right">OCC Version</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  Loading tasks...
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No matching tasks found. Try adjusting your query or filters.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr
                  key={task._id}
                  onClick={() => handleTaskClick(task)}
                  className="hover:bg-slate-50 cursor-pointer transition"
                >
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800 text-sm hover:text-blue-600 transition">
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">{task.description}</p>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {task.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{task.assigneeId?.name || "Unassigned"}</td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-400">v{task.version || 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-bold">{tasks.length}</span> of{" "}
            <span className="font-bold">{pagination.total}</span> tasks (Page {pagination.currentPage} of{" "}
            {pagination.pages})
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.currentPage <= 1}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-40 transition flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={pagination.currentPage >= pagination.pages}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-40 transition flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={selectedTask}
          projectMembers={projects.find((p) => p._id === selectedProjectId)?.members || []}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
};
