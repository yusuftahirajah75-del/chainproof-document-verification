import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, LogIn, UserPlus, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "./Button";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="navbar-logo-icon">
          <ShieldCheck size={20} />
        </div>
        <span>ChainProof</span>
      </Link>

      <nav className="navbar-links">
        <Link
          to="/"
          className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
        >
          Home
        </Link>
        <Link
          to="/verify"
          className={`nav-link ${location.pathname === "/verify" ? "active" : ""}`}
        >
          Verify Document
        </Link>

        {isAuthenticated ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link to="/dashboard">
              <Button variant="primary" size="sm" icon={LayoutDashboard}>
                Dashboard
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              icon={LogOut}
              onClick={handleLogout}
              style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}
            >
              Logout
            </Button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link to="/login">
              <Button
                variant="secondary"
                size="sm"
                icon={LogIn}
                style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}
              >
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm" icon={UserPlus}>
                Register
              </Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

