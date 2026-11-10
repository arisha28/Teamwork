import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { projectApi } from "../api/project.api.js";
import { taskApi } from "../api/task.api.js";
import { KanbanBoard } from "../components/KanbanBoard.jsx";
import { TaskDetailModal } from "../components/TaskDetailModal.jsx";
import { CreateTaskModal } from "../components/CreateTaskModal.jsx";
import { MemberManagerModal } from "../components/MemberManagerModal.jsx";
import { AlertBanner } from "../components/AlertBanner.jsx";
import {
  Users,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  BarChart2,
  AlertTriangle
} from "lucide-react";

export const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("kanban"); // kanban or list

  // Modals
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  useEffect(() => {
    loadProjectAndTasks();
  }, [projectId]);

  const loadProjectAndTasks = async () => {
    try {
      setLoading(true);
      const [projData, tasksData] = await Promise.all([
        projectApi.getById(projectId),
        taskApi.getByProject(projectId, { limit: 100 })
      ]);
      setProject(projData);
      setTasks(tasksData.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
    );
    setSelectedTask(updatedTask);
  };

  const handleTaskDeleted = (deletedTaskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== deletedTaskId));
  };

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  if (loading) {
    return <div className="py-20 text-center text-sm text-slate-400">Loading project details...</div>;
  }

  if (!project) {
    return <div className="py-20 text-center text-sm text-slate-500">Project not found.</div>;
  }

  return (
    <div className="space-y-6">
      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}

      {/* Project Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{project.name}</h1>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                project.status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              {project.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">{project.description || "No description provided."}</p>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Started: {new Date(project.startDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Users className="w-3.5 h-3.5" />
              <span>{project.members?.length || 0} Members</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsMemberModalOpen(true)}
            className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 flex items-center space-x-1.5 transition"
          >
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Members</span>
          </button>

          <button
            onClick={() => setIsCreateTaskOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 flex items-center space-x-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Board & View Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-slate-200/60 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("kanban")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              viewMode === "kanban" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              viewMode === "list" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Task List</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {tasks.length} tasks in this project
        </div>
      </div>

      {/* Views */}
      {viewMode === "kanban" ? (
        <KanbanBoard
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onQuickAddTask={() => setIsCreateTaskOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Task</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Version</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No tasks found
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr
                    key={task._id}
                    onClick={() => handleTaskClick(task)}
                    className="hover:bg-slate-50 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-800">{task.title}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{task.assigneeId?.name || "Unassigned"}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">v{task.version || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Details & Edit Modal */}
      <TaskDetailModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        projectMembers={project.members}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        project={project}
        onTaskCreated={handleTaskCreated}
      />

      {/* Member Management Modal */}
      <MemberManagerModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        project={project}
        onProjectUpdated={(p) => setProject(p)}
      />
    </div>
  );
};
