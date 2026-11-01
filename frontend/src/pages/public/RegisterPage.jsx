import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, UserPlus, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Alert } from "../../components/common/Alert";

export function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Password rules
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !email || !password) {
      setError("Please complete all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isPasswordValid) {
      setError("Password does not meet complexity requirements.");
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName,
        email,
        organization: organization || undefined,
        password,
      });
      showToast("Account registered successfully.", "success");
      navigate("/dashboard");
    } catch (err) {
      if (err.details && Array.isArray(err.details)) {
        setError(err.details.map((d) => d.message).join(". "));
      } else {
        setError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
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
      <div style={{ maxWidth: "500px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            className="navbar-logo-icon"
            style={{ width: 48, height: 48, margin: "0 auto 1rem", borderRadius: "12px" }}
          >
            <ShieldCheck size={28} />
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Create an Account
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Register to anchor documents and verify institutional credentials
          </p>
        </div>

        <div className="card" style={{ padding: "2rem" }}>
          {error && <Alert type="error">{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Dr. Jane Smith"
              required
              disabled={loading}
            />

            <Input
              label="Institutional Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. jsmith@university.edu"
              required
              disabled={loading}
            />

            <Input
              label="Organization / Department"
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. Academic Registry, Dept. of Computer Science"
              disabled={loading}
              helperText="Optional institutional affiliation"
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

            {/* Password Complexity Checklist */}
            <div
              style={{
                backgroundColor: "var(--bg-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem",
                marginBottom: "1.25rem",
                fontSize: "0.775rem",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.35rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: hasMinLength ? "#059669" : "#64748b" }}>
                {hasMinLength ? <CheckCircle2 size={13} /> : <XCircle size={13} />} At least 8 chars
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: hasUpper ? "#059669" : "#64748b" }}>
                {hasUpper ? <CheckCircle2 size={13} /> : <XCircle size={13} />} Upper case letter
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: hasLower ? "#059669" : "#64748b" }}>
                {hasLower ? <CheckCircle2 size={13} /> : <XCircle size={13} />} Lower case letter
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: hasNumber && hasSpecial ? "#059669" : "#64748b" }}>
                {hasNumber && hasSpecial ? <CheckCircle2 size={13} /> : <XCircle size={13} />} Number & Symbol
              </div>
            </div>

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={!isPasswordValid || password !== confirmPassword}
              style={{ width: "100%", marginTop: "0.5rem" }}
              icon={UserPlus}
            >
              Complete Registration
            </Button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--primary-600)", fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

