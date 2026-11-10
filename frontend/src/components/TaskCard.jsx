import React from "react";
import { Calendar, User, Clock, AlertTriangle, Paperclip, MessageSquare } from "lucide-react";

export const TaskCard = ({ task, onClick, onStatusChange }) => {
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "DONE" &&
    task.status !== "ARCHIVED";

  const priorityColors = {
    LOW: "bg-slate-100 text-slate-700 border-slate-200",
    MEDIUM: "bg-blue-50 text-blue-700 border-blue-200",
    HIGH: "bg-amber-50 text-amber-700 border-amber-200",
    CRITICAL: "bg-red-50 text-red-700 border-red-200"
  };

  return (
    <div
      onClick={() => onClick(task)}
      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
            priorityColors[task.priority] || priorityColors.MEDIUM
          }`}
        >
          {task.priority}
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          v{task.version || 0}
        </span>
      </div>

      <h4 className="font-semibold text-slate-800 text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-1.5">
          <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
            {task.assigneeId?.name ? task.assigneeId.name.charAt(0).toUpperCase() : "?"}
          </div>
          <span className="truncate max-w-[100px] text-[11px]">
            {task.assigneeId?.name || "Unassigned"}
          </span>
        </div>

        {task.dueDate && (
          <div
            className={`flex items-center space-x-1 text-[11px] ${
              isOverdue ? "text-red-600 font-semibold" : "text-slate-400"
            }`}
          >
            {isOverdue && <AlertTriangle className="w-3 h-3 text-red-500" />}
            <Calendar className="w-3 h-3" />
            <span>{new Date(task.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
          </div>
        )}
      </div>
    </div>
  );
};
