import * as dashboardService from "../services/dashboard.service.js";

export const getDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardService.getProjectDashboard(req.params.projectId);
    res.status(200).json({ status: "success", data: stats });
  } catch (error) {
    next(error);
  }
};
