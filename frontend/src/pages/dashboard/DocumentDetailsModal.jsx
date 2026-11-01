import React, { useEffect, useState } from "react";
import { Copy, Check, Blocks, FileText, Calendar, User, Shield, ExternalLink } from "lucide-react";
import { documentApi } from "../../api/documentApi";
import { useToast } from "../../context/ToastContext";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Spinner } from "../../components/common/Spinner";
import { Alert } from "../../components/common/Alert";
import { formatBytes, formatDate, copyToClipboard, truncateHash } from "../../utils/formatters";

export function DocumentDetailsModal({ documentId, onClose, onRefresh = null }) {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const { showToast } = useToast();

  useEffect(() => {
    if (!documentId) return;

    setLoading(true);
    documentApi
      .getById(documentId)
      .then((res) => {
        if (res.success && res.data?.document) {
          setDoc(res.data.document);
        } else {
          setError("Document not found.");
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load document information.");
      })
      .finally(() => setLoading(false));
  }, [documentId]);

  const handleCopy = (text, key) => {
    copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRegisterOnChain = async () => {
    setRegistering(true);
    try {
      const res = await documentApi.registerOnBlockchain(documentId);
      if (res.success) {
        showToast("Document hash anchored to blockchain ledger!", "success");
        // Reload document
        const updated = await documentApi.getById(documentId);
        if (updated.success) {
          setDoc(updated.data.document);
        }
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      showToast(err.message || "Blockchain transaction failed.", "error");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(documentId)}
      onClose={onClose}
      title="Cryptographic Document Audit Record"
      maxWidth="720px"
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <Spinner size="md" label="Loading cryptographic record from ledger..." />
        </div>
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : doc ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Header Info */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h4 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{doc.title}</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.2rem" }}>
                {doc.description || "No extended description provided."}
              </p>
            </div>
            <Badge status={doc.status} />
          </div>

          {/* Reference & Filesize */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
              backgroundColor: "var(--bg-subtle)",
              padding: "0.85rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
            }}
          >
            <div>
              <span style={{ color: "var(--text-muted)" }}>Document Reference:</span>
              <div style={{ fontWeight: 600, color: "var(--primary-700)" }}>{doc.document_reference}</div>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Original Filename:</span>
              <div style={{ fontWeight: 600 }}>{doc.original_filename} ({formatBytes(doc.file_size_bytes)})</div>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Uploaded Date:</span>
              <div>{formatDate(doc.created_at)}</div>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Owner Organization:</span>
              <div>{doc.owner_organization || "University Faculty"}</div>
            </div>
          </div>

          {/* Cryptographic SHA-256 Digest */}
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", color: "var(--text-muted)" }}>
              SHA-256 Hash Digest
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "0.3rem",
                gap: "0.5rem",
              }}
            >
              <code
                className="font-mono"
                style={{
                  fontSize: "0.85rem",
                  backgroundColor: "var(--bg-subtle)",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-light)",
                  flex: 1,
                  overflowX: "auto",
                }}
              >
                {doc.sha256_hash}
              </code>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCopy(doc.sha256_hash, "sha")}
                icon={copiedKey === "sha" ? Check : Copy}
              >
                {copiedKey === "sha" ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Blockchain Ledger Details */}
          {doc.status === "REGISTERED" && doc.transaction_hash ? (
            <div
              style={{
                border: "1px solid #bbf7d0",
                backgroundColor: "#f0fdf4",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#166534", fontWeight: 600, marginBottom: "0.75rem" }}>
                <Blocks size={18} /> On-Chain Blockchain Confirmation
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.825rem" }}>
                <div>
                  <span style={{ color: "#15803d" }}>Transaction Hash:</span>
                  <div className="font-mono" style={{ fontWeight: 600 }}>{truncateHash(doc.transaction_hash, 8, 8)}</div>
                </div>
                <div>
                  <span style={{ color: "#15803d" }}>Mined Block Number:</span>
                  <div style={{ fontWeight: 600 }}>#{doc.block_number}</div>
                </div>
                <div>
                  <span style={{ color: "#15803d" }}>Block Timestamp:</span>
                  <div>{formatDate(doc.block_timestamp)}</div>
                </div>
                <div>
                  <span style={{ color: "#15803d" }}>Submitter Address:</span>
                  <div className="font-mono">{truncateHash(doc.submitter_address, 6, 6)}</div>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                border: "1px solid #fed7aa",
                backgroundColor: "#fff7ed",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: "#9a3412" }}>Pending On-Chain Anchoring</div>
                <div style={{ fontSize: "0.825rem", color: "#c2410c", marginTop: "0.2rem" }}>
                  This document's hash has been stored locally, but not yet anchored to the smart contract.
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={Blocks}
                loading={registering}
                onClick={handleRegisterOnChain}
              >
                Anchor On-Chain Now
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
}

