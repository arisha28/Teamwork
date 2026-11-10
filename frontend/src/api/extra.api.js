import { api } from "./client.js";

export const commentApi = {
  getByTask: async (taskId) => {
    const res = await api.get(`/tasks/${taskId}/comments`);
    return res.data.data;
  },
  create: async (taskId, content) => {
    const res = await api.post(`/tasks/${taskId}/comments`, { content });
    return res.data.data;
  },
  update: async (commentId, content) => {
    const res = await api.put(`/comments/${commentId}`, { content });
    return res.data.data;
  },
  delete: async (commentId) => {
    const res = await api.delete(`/comments/${commentId}`);
    return res.data;
  }
};

export const attachmentApi = {
  getByTask: async (taskId) => {
    const res = await api.get(`/tasks/${taskId}/attachments`);
    return res.data.data;
  },
  upload: async (taskId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data.data;
  },
  delete: async (attachmentId) => {
    const res = await api.delete(`/attachments/${attachmentId}`);
    return res.data;
  },
  getDownloadUrl: (attachmentId) => `/api/attachments/${attachmentId}/download`
};

export const userApi = {
  getAll: async () => {
    const res = await api.get("/users");
    return res.data.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data.data;
  },
  setStatus: async (id, status) => {
    const res = await api.patch(`/users/${id}/status`, { status });
    return res.data.data;
  }
};

export const notificationApi = {
  getAll: async () => {
    const res = await api.get("/notifications");
    return res.data.data;
  },
  markRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data.data;
  },
  markAllRead: async () => {
    const res = await api.patch("/notifications/read-all");
    return res.data;
  }
};
