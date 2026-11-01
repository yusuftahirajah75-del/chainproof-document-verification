import React, { useEffect, useState } from "react";
import {
  History,
  FileText,
  ShieldCheck,
  Search,
  ExternalLink,
  Copy,
  Check,
  Filter,
} from "lucide-react";
import { documentApi } from "../../api/documentApi";
import { verificationApi } from "../../api/verificationApi";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Spinner } from "../../components/common/Spinner";
import { Pagination } from "../../components/common/Pagination";
import { DocumentDetailsModal } from "./DocumentDetailsModal";
import { formatBytes, formatDate, truncateHash, copyToClipboard } from "../../utils/formatters";

export function DocumentHistoryPage() {
  const [activeTab, setActiveTab] = useState("docs"); // "docs" | "verifications"
  const [docs, setDocs] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination states
  const [docPage, setDocPage] = useState(1);
  const [docTotal, setDocTotal] = useState(0);
  const [verifPage, setVerifPage] = useState(1);
  const [verifTotal, setVerifTotal] = useState(0);
  const limit = 10;

  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Fetch documents
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await documentApi.list({
        page: docPage,
        limit,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
      });
      if (res.success) {
        setDocs(res.data || []);
        setDocTotal(res.pagination?.total || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch verifications
  const loadVerifications = async () => {
    try {
      setLoading(true);
      const res = await verificationApi.getHistory({
        page: verifPage,
        limit,
        status: statusFilter || undefined,
      });
      if (res.success) {
        setVerifications(res.data || []);
        setVerifTotal(res.pagination?.total || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "docs") {
      loadDocuments();
    } else {
      loadVerifications();
    }
  }, [activeTab, docPage, verifPage, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (activeTab === "docs") {
      setDocPage(1);
      loadDocuments();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Document Ledgers & Audit History
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.925rem", marginTop: "0.2rem" }}>
          Cryptographic records of registered documents and verification inquiry logs
        </p>
      </div>

      <Card>
        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border-light)",
            marginBottom: "1.5rem",
            gap: "1.5rem",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab("docs");
              setStatusFilter("");
            }}
            style={{
              padding: "0.75rem 0.25rem",
              fontWeight: 600,
              fontSize: "0.95rem",
              borderBottom: activeTab === "docs" ? "2px solid var(--primary-600)" : "2px solid transparent",
              color: activeTab === "docs" ? "var(--primary-600)" : "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FileText size={18} />
            <span>Registered Documents ({docTotal})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("verifications");
              setStatusFilter("");
            }}
            style={{
              padding: "0.75rem 0.25rem",
              fontWeight: 600,
              fontSize: "0.95rem",
              borderBottom: activeTab === "verifications" ? "2px solid var(--primary-600)" : "2px solid transparent",
              color: activeTab === "verifications" ? "var(--primary-600)" : "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <History size={18} />
            <span>Verification Inquiries ({verifTotal})</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          {activeTab === "docs" ? (
            <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "0.5rem", flex: 1, maxWidth: "400px" }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search title or tracking reference..."
                className="form-input"
              />
              <Button type="submit" variant="secondary" icon={Search}>
                Search
              </Button>
            </form>
          ) : (
            <div />
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Status Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ width: "auto" }}
            >
              <option value="">All Statuses</option>
              {activeTab === "docs" ? (
                <>
                  <option value="REGISTERED">Registered On-Chain</option>
                  <option value="PENDING_REGISTRATION">Pending Registration</option>
                </>
              ) : (
                <>
                  <option value="AUTHENTIC">Authentic</option>
                  <option value="TAMPERED">Tampered</option>
                  <option value="NOT_REGISTERED">Not Registered</option>
                </>
              )}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <Spinner size="lg" label="Loading ledger data..." />
          </div>
        ) : activeTab === "docs" ? (
          /* Documents Table */
          docs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
              <FileText size={36} style={{ margin: "0 auto 0.75rem", opacity: 0.4 }} />
              <p>No documents found matching criteria.</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title & Reference</th>
                      <th>SHA-256 Digest</th>
                      <th>Original Filename</th>
                      <th>Upload Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docs.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{item.title}</div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--primary-700)",
                              fontWeight: 500,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                            }}
                            onClick={() => handleCopy(item.document_reference, `ref-${item.id}`)}
                          >
                            <span>{item.document_reference}</span>
                            {copiedKey === `ref-${item.id}` ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <code className="font-mono" style={{ fontSize: "0.8rem" }}>
                              {truncateHash(item.sha256_hash, 6, 6)}
                            </code>
                            <button
                              onClick={() => handleCopy(item.sha256_hash, `hash-${item.id}`)}
                              style={{ color: "var(--text-muted)", cursor: "pointer" }}
                            >
                              {copiedKey === `hash-${item.id}` ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </td>
                        <td style={{ fontSize: "0.85rem" }}>
                          {item.original_filename}
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {formatBytes(item.file_size_bytes)}
                          </div>
                        </td>
                        <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {formatDate(item.created_at)}
                        </td>
                        <td>
                          <Badge status={item.status} />
                        </td>
                        <td>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedDocId(item.id)}
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={docPage}
                totalPages={Math.ceil(docTotal / limit)}
                onPageChange={setDocPage}
                totalItems={docTotal}
                limit={limit}
              />
            </>
          )
        ) : (
          /* Verifications Table */
          verifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
              <History size={36} style={{ margin: "0 auto 0.75rem", opacity: 0.4 }} />
              <p>No verification inquiry history found.</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Evaluated SHA-256 Digest</th>
                      <th>Claimed Reference</th>
                      <th>Outcome</th>
                      <th>Timestamp</th>
                      <th>Verifier Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifications.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <code className="font-mono" style={{ fontSize: "0.825rem" }}>
                            {truncateHash(item.calculated_hash, 8, 8)}
                          </code>
                          {item.submitted_filename && (
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              File: {item.submitted_filename}
                            </div>
                          )}
                        </td>
                        <td>
                          {item.document_reference_claimed ? (
                            <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--primary-700)" }}>
                              {item.document_reference_claimed}
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-subtle)", fontSize: "0.8rem" }}>None claimed</span>
                          )}
                        </td>
                        <td>
                          <Badge status={item.verification_status} />
                        </td>
                        <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {formatDate(item.created_at)}
                        </td>
                        <td style={{ fontSize: "0.8rem" }}>
                          {item.verifier_name ? (
                            <div>
                              <div style={{ fontWeight: 500 }}>{item.verifier_name}</div>
                              <div style={{ color: "var(--text-muted)" }}>{item.verifier_email}</div>
                            </div>
                          ) : (
                            <span style={{ color: "var(--text-subtle)" }}>Public / Unauthenticated</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={verifPage}
                totalPages={Math.ceil(verifTotal / limit)}
                onPageChange={setVerifPage}
                totalItems={verifTotal}
                limit={limit}
              />
            </>
          )
        )}
      </Card>

      {/* Details Modal */}
      {selectedDocId && (
        <DocumentDetailsModal
          documentId={selectedDocId}
          onClose={() => setSelectedDocId(null)}
          onRefresh={loadDocuments}
        />
      )}
    </div>
  );
}

