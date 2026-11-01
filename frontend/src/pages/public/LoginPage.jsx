import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, LogIn, Lock, Mail, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Alert } from "../../components/common/Alert";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      showToast("Signed in successfully.", "success");
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 160px)",
        padding: "2rem 1.5rem",
      }}
    >
      <div style={{ maxWidth: "440px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            className="navbar-logo-icon"
            style={{ width: 48, height: 48, margin: "0 auto 1rem", borderRadius: "12px" }}
          >
            <ShieldCheck size={28} />
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Sign In to ChainProof
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Access document registration, verification audits & blockchain ledgers
          </p>
        </div>

        <div className="card" style={{ padding: "2rem" }}>
          {error && <Alert type="error">{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Input
              label="Institutional Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. researcher@university.edu"
              required
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              style={{ width: "100%", marginTop: "0.5rem" }}
              icon={LogIn}
            >
              Sign In
            </Button>
          </form>

          {/* Demo Credentials Helper */}
          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid var(--border-light)",
              fontSize: "0.8rem",
            }}
          >
            <div style={{ color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 500 }}>
              Seminar Demo Quick-Fill:
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDemoFill("admin@chainproof.local", "AdminPass123!")}
                disabled={loading}
                style={{ flex: 1 }}
              >
                Admin Account
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDemoFill("researcher@chainproof.local", "UserPass123!")}
                disabled={loading}
                style={{ flex: 1 }}
              >
                Researcher Account
              </Button>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--primary-600)", fontWeight: 600 }}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

