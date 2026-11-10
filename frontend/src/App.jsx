import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { ProjectsPage } from "./pages/ProjectsPage.jsx";
import { ProjectDetailPage } from "./pages/ProjectDetailPage.jsx";
import { TasksListPage } from "./pages/TasksListPage.jsx";
import { AdminUsersPage } from "./pages/AdminUsersPage.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="/tasks" element={<TasksListPage />} />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<AppLayout />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
export default App;
