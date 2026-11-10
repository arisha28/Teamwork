import { api } from "./client.js";

export const taskApi = {
  getByProject: async (projectId, params = {}) => {
    const res = await api.get(`/projects/${projectId}/tasks`, { params });
    return res.data;
  },
  getById: async (taskId) => {
    const res = await api.get(`/tasks/${taskId}`);
    return res.data.data;
  },
  create: async (projectId, taskData) => {
    const res = await api.post(`/projects/${projectId}/tasks`, taskData);
    return res.data.data;
  },
  update: async (taskId, taskData) => {
    const res = await api.put(`/tasks/${taskId}`, taskData);
    return res.data.data;
  },
  updateStatus: async (taskId, status, version) => {
    const res = await api.patch(`/tasks/${taskId}/status`, { status, version });
    return res.data.data;
  },
  reopen: async (taskId, version) => {
    const res = await api.patch(`/tasks/${taskId}/reopen`, { version });
    return res.data.data;
  },
  delete: async (taskId) => {
    const res = await api.delete(`/tasks/${taskId}`);
    return res.data;
  },
  getHistory: async (taskId) => {
    const res = await api.get(`/tasks/${taskId}/history`);
    return res.data.data;
  }
};
