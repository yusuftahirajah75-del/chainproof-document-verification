import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileUp,
  FileSearch,
  ExternalLink,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { documentApi } from "../../api/documentApi";
import { verificationApi } from "../../api/verificationApi";
import { blockchainApi } from "../../api/blockchainApi";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Spinner } from "../../components/common/Spinner";
import { formatDate, truncateHash } from "../../utils/formatters";
import { DocumentDetailsModal } from "./DocumentDetailsModal";

export function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDocs: 0,
    registeredOnChain: 0,
    totalVerifications: 0,
    authenticCount: 0,
  });
  const [recentDocs, setRecentDocs] = useState([]);
  const [recentVerifications, setRecentVerifications] = useState([]);
  const [blockchainStatus, setBlockchainStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        const [docsRes, verifRes, bcRes] = await Promise.allSettled([
          documentApi.list({ page: 1, limit: 5 }),
          verificationApi.getHistory({ page: 1, limit: 5 }),
          blockchainApi.getStatus(),
        ]);

        if (docsRes.status === "fulfilled" && docsRes.value.success) {
          setRecentDocs(docsRes.value.data || []);
          const total = docsRes.value.pagination?.total || 0;
          const registered = (docsRes.value.data || []).filter(
            (d) => d.status === "REGISTERED"
          ).length;
          setStats((prev) => ({ ...prev, totalDocs: total, registeredOnChain: registered }));
        }

        if (verifRes.status === "fulfilled" && verifRes.value.success) {
          setRecentVerifications(verifRes.value.data || []);
          const totalVerif = verifRes.value.pagination?.total || 0;
          setStats((prev) => ({ ...prev, totalVerifications: totalVerif }));
        }

        if (bcRes.status === "fulfilled" && bcRes.value.success) {
          setBlockchainStatus(bcRes.value.data);
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Spinner size="lg" label="Synchronizing dashboard ledger data..." />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Welcome Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Welcome back, {user?.fullName}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.925rem", marginTop: "0.2rem" }}>
            Organization: <strong>{user?.organization || "Institutional Faculty"}</strong> • Role:{" "}
            <Badge role={user?.role} />
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to="/dashboard/register">
            <Button variant="primary" icon={FileUp}>
              Register Document
            </Button>
          </Link>
          <Link to="/dashboard/verify">
            <Button variant="secondary" icon={FileSearch}>
              Verify Integrity
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Documents</div>
            <div className="stat-value">{stats.totalDocs}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
              Uploaded into ledger
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}>
            <FileText size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Anchored On-Chain</div>
            <div className="stat-value">{stats.registeredOnChain}</div>
            <div style={{ fontSize: "0.8rem", color: "#059669", marginTop: "0.35rem" }}>
              Smart contract confirmed
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
            <ShieldCheck size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Verification Inquiries</div>
            <div className="stat-value">{stats.totalVerifications}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
              Audit attempts recorded
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "#f5f3ff", color: "#7c3aed" }}>
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Blockchain Node</div>
            <div className="stat-value" style={{ fontSize: "1.25rem", marginTop: "0.6rem" }}>
              {blockchainStatus?.connected ? "Operational" : "Offline"}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
              Block #{blockchainStatus?.latestBlockNumber || "N/A"}
            </div>
          </div>
          <div
            className="stat-icon"
            style={{
              backgroundColor: blockchainStatus?.connected ? "#ecfdf5" : "#fffbeb",
              color: blockchainStatus?.connected ? "#059669" : "#d97706",
            }}
          >
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Registrations & Verification Log */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* Recent Registered Documents */}
        <Card
          title="Recent Document Registrations"
          subtitle="Latest institutional PDF files uploaded and anchored"
          action={
            <Link to="/dashboard/history" style={{ fontSize: "0.85rem", color: "var(--primary-600)", fontWeight: 600 }}>
              View All
            </Link>
          }
        >
          {recentDocs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--text-muted)" }}>
              <FileText size={36} style={{ margin: "0 auto 0.75rem", opacity: 0.4 }} />
              <p>No documents registered yet.</p>
              <Link to="/dashboard/register" style={{ marginTop: "0.5rem", display: "inline-block" }}>
                <Button variant="primary" size="sm">Register Your First Document</Button>
              </Link>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title & Reference</th>
                    <th>SHA-256 Digest</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDocs.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{doc.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {doc.document_reference}
                        </div>
                      </td>
                      <td>
                        <code className="font-mono" style={{ fontSize: "0.8rem" }}>
                          {truncateHash(doc.sha256_hash, 6, 6)}
                        </code>
                      </td>
                      <td>
                        <Badge status={doc.status} />
                      </td>
                      <td>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedDocId(doc.id)}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Recent Verification Activity */}
        <Card
          title="Recent Verification Inquiries"
          subtitle="Cryptographic verification audits performed"
          action={
            <Link to="/dashboard/history" style={{ fontSize: "0.85rem", color: "var(--primary-600)", fontWeight: 600 }}>
              View Audits
            </Link>
          }
        >
          {recentVerifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--text-muted)" }}>
              <ShieldCheck size={36} style={{ margin: "0 auto 0.75rem", opacity: 0.4 }} />
              <p>No verification activity recorded yet.</p>
              <Link to="/dashboard/verify" style={{ marginTop: "0.5rem", display: "inline-block" }}>
                <Button variant="primary" size="sm">Run Integrity Check</Button>
              </Link>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Evaluated Hash</th>
                    <th>Outcome</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVerifications.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <code className="font-mono" style={{ fontSize: "0.8rem" }}>
                          {truncateHash(item.calculated_hash, 6, 6)}
                        </code>
                        {item.document_reference_claimed && (
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            Ref: {item.document_reference_claimed}
                          </div>
                        )}
                      </td>
                      <td>
                        <Badge status={item.verification_status} />
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {formatDate(item.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Document Details Modal */}
      {selectedDocId && (
        <DocumentDetailsModal
          documentId={selectedDocId}
          onClose={() => setSelectedDocId(null)}
        />
      )}
    </div>
  );
}

