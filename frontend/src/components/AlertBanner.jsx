import React from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export const AlertBanner = ({ type = "error", message, onClose }) => {
  if (!message) return null;

  const styles = {
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  };

  const icons = {
    error: <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />,
    success: <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-500 shrink-0" />
  };

  return (
    <div
      className={`border rounded-xl p-3.5 flex items-start justify-between text-sm shadow-sm transition ${styles[type]}`}
    >
      <div className="flex items-center space-x-2">
        {icons[type]}
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:opacity-75 transition">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
