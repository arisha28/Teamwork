import React, { useState, useEffect } from "react";
import { Modal } from "./Modal.jsx";
import { AlertBanner } from "./AlertBanner.jsx";
import { taskApi } from "../api/task.api.js";
import { commentApi, attachmentApi } from "../api/extra.api.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Clock,
  MessageSquare,
  Paperclip,
  History,
  RotateCcw,
  Trash2,
  Download,
  Send,
  UploadCloud
} from "lucide-react";

export const TaskDetailModal = ({ isOpen, onClose, task, projectMembers = [], onTaskUpdated, onTaskDeleted }) => {
  if (!task) return null;

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview"); // overview, comments, attachments, history
  const [formData, setFormData] = useState({
    title: task.title || "",
    description: task.description || "",
    status: task.status || "TODO",
    priority: task.priority || "MEDIUM",
    assigneeId: task.assigneeId?._id || task.assigneeId || "",
    dueDate: task.dueDate ? task.dueDate.split("T")[0] : ""
  });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "TODO",
        priority: task.priority || "MEDIUM",
        assigneeId: task.assigneeId?._id || task.assigneeId || "",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : ""
      });
      setError(null);
      setSuccess(null);
      loadComments();
      loadAttachments();
      loadHistory();
    }
  }, [task, isOpen]);

  const loadComments = async () => {
    try {
      const data = await commentApi.getByTask(task._id);
      setComments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAttachments = async () => {
    try {
      const data = await attachmentApi.getByTask(task._id);
      setAttachments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await taskApi.getHistory(task._id);
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Send optimistic concurrency control version
      const payload = {
        ...formData,
        version: task.version
      };
      const updated = await taskApi.update(task._id, payload);
      setSuccess("Task updated successfully!");
      onTaskUpdated(updated);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReopen = async () => {
    setLoading(true);
    setError(null);
    try {
      const updated = await taskApi.reopen(task._id, task.version);
      setSuccess("Task reopened successfully and moved back to To Do!");
      setFormData((prev) => ({ ...prev, status: "TODO" }));
      onTaskUpdated(updated);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await taskApi.delete(task._id);
      onTaskDeleted(task._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const created = await commentApi.create(task._id, newComment);
      setComments((prev) => [...prev, created]);
      setNewComment("");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentApi.delete(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleUploadAttachment = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    try {
      const uploaded = await attachmentApi.upload(task._id, uploadFile);
      setAttachments((prev) => [uploaded, ...prev]);
      setUploadFile(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteAttachment = async (id) => {
    try {
      await attachmentApi.delete(id);
      setAttachments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.title} maxWidth="max-w-3xl">
      <div className="space-y-4">
        {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}
        {success && <AlertBanner type="success" message={success} onClose={() => setSuccess(null)} />}

        {/* Tab Buttons */}
        <div className="flex space-x-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              activeTab === "overview" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Overview & Edit</span>
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              activeTab === "comments" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comments ({comments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("attachments")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              activeTab === "attachments" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>Attachments ({attachments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              activeTab === "history" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit History</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="BLOCKED">Blocked</option>
                  <option value="DONE">Done</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
                {task.status === "DONE" && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    Note: To return a completed task to To Do, use the Reopen button.
                  </p>
                )}
              </div>

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
                  {projectMembers.map((m) => {
                    const u = m.userId || m;
                    return (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.email})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {task.status === "DONE" && (
                  <button
                    type="button"
                    onClick={handleReopen}
                    disabled={loading}
                    className="px-3.5 py-2 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 flex items-center space-x-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reopen Task</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Task</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Comments */}
        {activeTab === "comments" && (
          <div className="space-y-4">
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">No comments yet. Start the conversation!</p>
              ) : (
                comments.map((c) => (
                  <div key={c._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800">{c.authorId?.name || "User"}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {c.authorId?._id === user?._id && (
                          <button
                            onClick={() => handleDeleteComment(c._id)}
                            className="text-slate-400 hover:text-red-600"
                            title="Delete comment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-700">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center space-x-1"
              >
                <Send className="w-3 h-3" />
                <span>Post</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Attachments */}
        {activeTab === "attachments" && (
          <div className="space-y-4">
            <form onSubmit={handleUploadAttachment} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                type="submit"
                disabled={!uploadFile}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-1"
              >
                <UploadCloud className="w-3.5 h-3.5 mr-1" />
                Upload
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {attachments.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">No attachments uploaded yet.</p>
              ) : (
                attachments.map((att) => (
                  <div key={att._id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{att.originalFileName}</span>
                      <span className="text-[10px] text-slate-400">({Math.round(att.fileSize / 1024)} KB)</span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <a
                        href={attachmentApi.getDownloadUrl(att._id)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteAttachment(att._id)}
                        className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Audit History */}
        {activeTab === "history" && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">No field changes recorded yet.</p>
            ) : (
              history.map((h) => (
                <div key={h._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">
                      {h.changedBy?.name || "System"} updated <span className="font-mono text-blue-600">{h.fieldName}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(h.changedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center space-x-1">
                    <span className="line-through text-red-500">{String(h.oldValue || "empty")}</span>
                    <span>→</span>
                    <span className="font-semibold text-emerald-600">{String(h.newValue || "empty")}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
