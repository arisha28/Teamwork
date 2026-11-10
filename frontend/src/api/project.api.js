import { api } from "./client.js";

export const projectApi = {
  getAll: async () => {
    const res = await api.get("/projects");
    return res.data.data;
  },
  getById: async (projectId) => {
    const res = await api.get(`/projects/${projectId}`);
    return res.data.data;
  },
  create: async (projectData) => {
    const res = await api.post("/projects", projectData);
    return res.data.data;
  },
  update: async (projectId, projectData) => {
    const res = await api.put(`/projects/${projectId}`, projectData);
    return res.data.data;
  },
  addMember: async (projectId, memberData) => {
    const res = await api.post(`/projects/${projectId}/members`, memberData);
    return res.data.data;
  },
  removeMember: async (projectId, userId) => {
    const res = await api.delete(`/projects/${projectId}/members/${userId}`);
    return res.data.data;
  },
  getDashboard: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/dashboard`);
    return res.data.data;
  }
};
