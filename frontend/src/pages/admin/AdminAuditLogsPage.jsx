import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileSpreadsheet, ArrowLeft, Search, Eye } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Spinner } from "../../components/common/Spinner";
import { Pagination } from "../../components/common/Pagination";
import { Modal } from "../../components/common/Modal";
import { formatDate } from "../../utils/formatters";

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const limit = 20;

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAuditLogs({
        page,
        limit,
        action: actionFilter || undefined,
      });
      if (res.success) {
        setLogs(res.data || []);
        setTotal(res.pagination?.total || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [page, actionFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b21a8", fontWeight: 600, fontSize: "0.85rem" }}>
            <Link to="/admin" style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--text-muted)" }}>
              <ArrowLeft size={14} /> Back to Admin Overview
            </Link>
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 700, letterSpacing: "-0.02em", marginTop: "0.35rem" }}>
            Immutable System Audit Logs
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.925rem" }}>
            PostgreSQL relational audit records capturing user events, uploads, on-chain registrations & client telemetry
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Action Filter:</span>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="form-select"
            style={{ width: "auto" }}
          >
            <option value="">All Actions</option>
            <option value="USER_REGISTER">USER_REGISTER</option>
            <option value="USER_LOGIN_SUCCESS">USER_LOGIN_SUCCESS</option>
            <option value="USER_LOGIN_FAILED">USER_LOGIN_FAILED</option>
            <option value="DOCUMENT_UPLOAD">DOCUMENT_UPLOAD</option>
            <option value="BLOCKCHAIN_REGISTER">BLOCKCHAIN_REGISTER</option>
            <option value="DOCUMENT_VERIFY">DOCUMENT_VERIFY</option>
            <option value="ADMIN_UPDATE_USER">ADMIN_UPDATE_USER</option>
          </select>
        </div>
      </div>

      <Card>
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <Spinner size="lg" label="Loading system audit entries..." />
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            <FileSpreadsheet size={36} style={{ margin: "0 auto 0.75rem", opacity: 0.4 }} />
            <p>No audit events recorded matching criteria.</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Entity Type</th>
                    <th>Actor / User</th>
                    <th>Client IP</th>
                    <th>Payload</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {formatDate(log.created_at)}
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: "0.825rem",
                            backgroundColor: "var(--bg-subtle)",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.85rem" }}>{log.entity_type}</td>
                      <td style={{ fontSize: "0.85rem" }}>
                        {log.user_email ? (
                          <div>
                            <div style={{ fontWeight: 500 }}>{log.user_full_name}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{log.user_email}</div>
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-subtle)", fontSize: "0.8rem" }}>System / Anonymous</span>
                        )}
                      </td>
                      <td style={{ fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
                        {log.ip_address || "127.0.0.1"}
                      </td>
                      <td>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Eye}
                          onClick={() => setSelectedLog(log)}
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalPages={Math.ceil(total / limit)}
              onPageChange={setPage}
              totalItems={total}
              limit={limit}
            />
          </>
        )}
      </Card>

      {/* JSON Payload Inspector Modal */}
      {selectedLog && (
        <Modal
          isOpen={Boolean(selectedLog)}
          onClose={() => setSelectedLog(null)}
          title={`Audit Event: ${selectedLog.action}`}
          maxWidth="680px"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem" }}>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Timestamp:</span>
                <div style={{ fontWeight: 600 }}>{formatDate(selectedLog.created_at)}</div>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Entity ID:</span>
                <div className="font-mono">{selectedLog.entity_id || "N/A"}</div>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Client IP:</span>
                <div className="font-mono">{selectedLog.ip_address || "127.0.0.1"}</div>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>User Agent:</span>
                <div style={{ fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedLog.user_agent || "Browser Client"}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                JSON Event Payload
              </div>
              <pre
                className="font-mono"
                style={{
                  backgroundColor: "var(--navy-900)",
                  color: "#38bdf8",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.8rem",
                  lineHeight: 1.5,
                  overflowX: "auto",
                  maxHeight: "300px",
                }}
              >
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

