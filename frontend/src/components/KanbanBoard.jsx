import React, { useState } from "react";
import { TaskCard } from "./TaskCard.jsx";
import { Plus } from "lucide-react";

const COLUMNS = [
  { id: "TODO", label: "To Do", bg: "bg-slate-50", badge: "bg-slate-200 text-slate-700" },
  { id: "IN_PROGRESS", label: "In Progress", bg: "bg-blue-50/40", badge: "bg-blue-200 text-blue-800" },
  { id: "BLOCKED", label: "Blocked", bg: "bg-amber-50/40", badge: "bg-amber-200 text-amber-800" },
  { id: "DONE", label: "Completed", bg: "bg-emerald-50/40", badge: "bg-emerald-200 text-emerald-800" }
];

export const KanbanBoard = ({ tasks, onTaskClick, onQuickAddTask }) => {
  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const colTasks = getTasksByStatus(col.id);
        return (
          <div
            key={col.id}
            className={`rounded-2xl border border-slate-200 p-4 ${col.bg} flex flex-col min-h-[500px]`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-slate-800">{col.label}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${col.badge}`}
                >
                  {colTasks.length}
                </span>
              </div>
              {col.id === "TODO" && (
                <button
                  onClick={onQuickAddTask}
                  className="p-1 hover:bg-white rounded-lg text-slate-500 hover:text-blue-600 transition"
                  title="Add Task"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Task list in column */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                  No tasks in {col.label}
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard key={task._id} task={task} onClick={onTaskClick} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
