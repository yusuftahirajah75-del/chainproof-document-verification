import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

// Layouts
import { PublicLayout } from "./components/layout/PublicLayout";
import { DashboardLayout } from "./components/layout/DashboardLayout";

// Route Guards
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AdminRoute } from "./routes/AdminRoute";

// Public Pages
import { LandingPage } from "./pages/public/LandingPage";
import { LoginPage } from "./pages/public/LoginPage";
import { RegisterPage } from "./pages/public/RegisterPage";
import { PublicVerifyPage } from "./pages/public/PublicVerifyPage";

// Dashboard Pages
import { UserDashboard } from "./pages/dashboard/UserDashboard";
import { DocumentRegisterPage } from "./pages/dashboard/DocumentRegisterPage";
import { DocumentVerifyPage } from "./pages/dashboard/DocumentVerifyPage";
import { DocumentHistoryPage } from "./pages/dashboard/DocumentHistoryPage";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminAuditLogsPage } from "./pages/admin/AdminAuditLogsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Section */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/verify" element={<PublicVerifyPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Authenticated Dashboard Section */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<UserDashboard />} />
              <Route path="register" element={<DocumentRegisterPage />} />
              <Route path="verify" element={<DocumentVerifyPage />} />
              <Route path="history" element={<DocumentHistoryPage />} />
            </Route>

            {/* Admin Protected Section */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <DashboardLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            </Route>

            {/* 404 Fallback */}
            <Route
              path="*"
              element={
                <div style={{ textAlign: "center", padding: "6rem 1.5rem" }}>
                  <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>404 - Page Not Found</h1>
                  <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
                    The requested route does not exist.
                  </p>
                  <a href="/" style={{ color: "var(--primary-600)", fontWeight: 600, display: "inline-block", marginTop: "1rem" }}>
                    Return to Home
                  </a>
                </div>
              }
            />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

