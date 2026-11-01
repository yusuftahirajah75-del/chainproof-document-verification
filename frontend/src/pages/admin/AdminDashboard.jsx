import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Users,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Blocks,
  Clock,
  ArrowRight,
} from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { blockchainApi } from "../../api/blockchainApi";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Spinner } from "../../components/common/Spinner";
import { truncateHash } from "../../utils/formatters";

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [blockchainInfo, setBlockchainInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true);
        const [statsRes, bcRes] = await Promise.allSettled([
          adminApi.getStats(),
          blockchainApi.getStatus(),
        ]);

        if (statsRes.status === "fulfilled" && statsRes.value.success) {
          setStats(statsRes.value.data);
        }

        if (bcRes.status === "fulfilled" && bcRes.value.success) {
          setBlockchainInfo(bcRes.value.data);
        }
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Spinner size="lg" label="Loading system telemetry..." />
      </div>
    );
  }

  const verifBreakdown = stats?.verifications?.breakdown || {
    AUTHENTIC: 0,
    TAMPERED: 0,
    NOT_REGISTERED: 0,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b21a8", fontWeight: 600, fontSize: "0.85rem" }}>
          <ShieldAlert size={18} /> ADMINISTRATIVE CONTROL CENTER
        </div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 700, letterSpacing: "-0.02em", marginTop: "0.25rem" }}>
          System Telemetry & Institutional Ledgers
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.925rem" }}>
          Platform metrics, smart contract bindings, user accounts, and immutable audit logs
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats?.users?.total || 0}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
              Active accounts registered
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "#f3e8ff", color: "#7e22ce" }}>
            <Users size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Total Documents</div>
            <div className="stat-value">{stats?.documents?.total || 0}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
              {stats?.documents?.registeredOnChain || 0} anchored on-chain
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}>
            <FileText size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Authentic Verifications</div>
            <div className="stat-value" style={{ color: "#059669" }}>
              {verifBreakdown.AUTHENTIC}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
              Integrity confirmed
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Tampering Detections</div>
            <div className="stat-value" style={{ color: "#dc2626" }}>
              {verifBreakdown.TAMPERED}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
              Modified files rejected
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}>
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Blockchain Registry Status Panel */}
      <Card title="Blockchain Ledger Infrastructure" subtitle="Ethereum smart contract binding details">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.25rem",
            backgroundColor: "var(--bg-subtle)",
            padding: "1.25rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.875rem",
          }}
        >
          <div>
            <span style={{ color: "var(--text-muted)" }}>Network Name:</span>
            <div style={{ fontWeight: 600, textTransform: "capitalize" }}>
              {blockchainInfo?.network || "Localhost"}
            </div>
          </div>

          <div>
            <span style={{ color: "var(--text-muted)" }}>RPC Connection State:</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.2rem" }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: blockchainInfo?.connected ? "#10b981" : "#ef4444",
                }}
              />
              <span style={{ fontWeight: 600, color: blockchainInfo?.connected ? "#059669" : "#dc2626" }}>
                {blockchainInfo?.connected ? "Connected & Synced" : "Unreachable"}
              </span>
            </div>
          </div>

          <div>
            <span style={{ color: "var(--text-muted)" }}>Mined Block Height:</span>
            <div style={{ fontWeight: 600 }}>#{blockchainInfo?.latestBlockNumber || "N/A"}</div>
          </div>

          <div>
            <span style={{ color: "var(--text-muted)" }}>Smart Contract Address:</span>
            <div className="font-mono" style={{ fontWeight: 600, fontSize: "0.8rem" }}>
              {blockchainInfo?.contractAddress
                ? truncateHash(blockchainInfo.contractAddress, 8, 8)
                : "Not Configured"}
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Admin Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <Card
          title="User Account Management"
          subtitle="Manage authorized researchers, toggle account activity & roles"
        >
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
            Review institutional users, enforce security access controls, and assign administrative permissions.
          </p>
          <Link to="/admin/users">
            <Button variant="primary" icon={Users}>
              Manage Platform Users
            </Button>
          </Link>
        </Card>

        <Card
          title="Immutable Audit Trail Explorer"
          subtitle="View tamper-evident activity and security telemetry logs"
        >
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
            Inspect client IP addresses, browser agents, registration events, and verification audits recorded in PostgreSQL.
          </p>
          <Link to="/admin/audit-logs">
            <Button variant="secondary" icon={FileSpreadsheet}>
              Inspect Audit Trail
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}

