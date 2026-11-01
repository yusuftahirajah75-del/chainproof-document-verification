import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  LayoutDashboard,
  FileUp,
  CheckCircle,
  History,
  ShieldAlert,
  Users,
  FileSpreadsheet,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "./Badge";

export function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div className="navbar-logo-icon">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.01em" }}>
              ChainProof
            </div>
            <div style={{ fontSize: "0.725rem", color: "#64748b" }}>
              Document Integrity Ledger
            </div>
          </div>
        </Link>
      </div>

      <div className="sidebar-nav">
        <div className="sidebar-section-title">Core Operations</div>

        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard Overview</span>
        </NavLink>

        <NavLink
          to="/dashboard/register"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <FileUp size={18} />
          <span>Register Document</span>
        </NavLink>

        <NavLink
          to="/dashboard/verify"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <CheckCircle size={18} />
          <span>Verify Integrity</span>
        </NavLink>

        <NavLink
          to="/dashboard/history"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <History size={18} />
          <span>Document History</span>
        </NavLink>

        {isAdmin && (
          <>
            <div className="sidebar-section-title" style={{ marginTop: "1rem" }}>
              Administration
            </div>

            <NavLink
              to="/admin"
              end
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              <ShieldAlert size={18} />
              <span>Admin Overview</span>
            </NavLink>

            <NavLink
              to="/admin/users"
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              <Users size={18} />
              <span>User Management</span>
            </NavLink>

            <NavLink
              to="/admin/audit-logs"
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              <FileSpreadsheet size={18} />
              <span>System Audit Logs</span>
            </NavLink>
          </>
        )}

        <div className="sidebar-section-title" style={{ marginTop: "1rem" }}>
          Quick Links
        </div>
        <Link to="/verify" target="_blank" className="sidebar-link">
          <ExternalLink size={18} />
          <span>Public Portal</span>
        </Link>
      </div>

      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="user-avatar">
            {user?.fullName?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.fullName || "User"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.15rem" }}>
              <Badge role={user?.role} />
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              color: "#94a3b8",
              cursor: "pointer",
              padding: "0.4rem",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
            }}
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

