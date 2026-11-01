import React, { useState } from "react";
import {
  FileCheck2,
  Cpu,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Shield,
  FileText,
} from "lucide-react";
import { verificationApi } from "../../api/verificationApi";
import { FileDropzone } from "../../components/common/FileDropzone";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Alert } from "../../components/common/Alert";
import { copyToClipboard, formatDate, truncateHash } from "../../utils/formatters";

export function PublicVerifyPage() {
  const [tab, setTab] = useState("file"); // "file" | "hash"
  const [file, setFile] = useState(null);
  const [hashInput, setHashInput] = useState("");
  const [referenceInput, setReferenceInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (tab === "file" && !file) {
      setError("Please select a PDF document file to verify.");
      return;
    }

    if (tab === "hash" && !hashInput.trim()) {
      setError("Please input a 64-character SHA-256 hexadecimal hash.");
      return;
    }

    setLoading(true);
    try {
      let res;
      if (tab === "file") {
        const formData = new FormData();
        formData.append("document", file);
        if (referenceInput.trim()) {
          formData.append("documentReference", referenceInput.trim());
        }
        res = await verificationApi.verifyFile(formData);
      } else {
        res = await verificationApi.verifyHash({
          hash: hashInput.trim(),
          documentReference: referenceInput.trim() || undefined,
        });
      }

      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.message || "Verification inquiry could not be completed.");
      }
    } catch (err) {
      setError(err.message || "Verification service failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setHashInput("");
    setReferenceInput("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="page-container" style={{ maxWidth: "900px" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div
          className="navbar-logo-icon"
          style={{ width: 44, height: 44, margin: "0 auto 0.75rem", borderRadius: "10px" }}
        >
          <FileCheck2 size={24} />
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Document Integrity Verification Portal
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
          Verify any PDF document against our decentralized blockchain ledger
        </p>
      </div>

      {!result ? (
        <Card>
          {/* Mode Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid var(--border-light)",
              marginBottom: "1.75rem",
              gap: "1.5rem",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setTab("file");
                setError(null);
              }}
              style={{
                padding: "0.75rem 0.25rem",
                fontWeight: 600,
                fontSize: "0.95rem",
                borderBottom: tab === "file" ? "2px solid var(--primary-600)" : "2px solid transparent",
                color: tab === "file" ? "var(--primary-600)" : "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              Verify by PDF Upload
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("hash");
                setError(null);
              }}
              style={{
                padding: "0.75rem 0.25rem",
                fontWeight: 600,
                fontSize: "0.95rem",
                borderBottom: tab === "hash" ? "2px solid var(--primary-600)" : "2px solid transparent",
                color: tab === "hash" ? "var(--primary-600)" : "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              Verify by SHA-256 Hash
            </button>
          </div>

          {error && <Alert type="error">{error}</Alert>}

          <form onSubmit={handleVerify}>
            {tab === "file" ? (
              <div style={{ marginBottom: "1.5rem" }}>
                <FileDropzone
                  file={file}
                  onFileSelect={setFile}
                  onFileClear={() => setFile(null)}
                  label="Upload PDF for Integrity Analysis"
                  description="Upload the candidate document to verify byte-level authenticity"
                />
              </div>
            ) : (
              <div style={{ marginBottom: "1.5rem" }}>
                <Input
                  label="Document SHA-256 Hash (64-character Hex)"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  placeholder="e.g. e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                  required
                />
              </div>
            )}

            <div style={{ marginBottom: "1.75rem" }}>
              <Input
                label="Claimed Document Reference (Optional)"
                value={referenceInput}
                onChange={(e) => setReferenceInput(e.target.value)}
                placeholder="e.g. DOC-20261101-ABCD (printed on official credential/barcode)"
                helperText="Providing an established document reference allows the system to detect if an existing registration has been tampered with or altered."
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              style={{ width: "100%" }}
              icon={FileCheck2}
            >
              Verify Document Integrity
            </Button>
          </form>
        </Card>
      ) : (
        /* Results Card */
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div
            className="card"
            style={{
              padding: "2rem",
              borderLeft: `6px solid ${
                result.status === "AUTHENTIC"
                  ? "#10b981"
                  : result.status === "TAMPERED"
                  ? "#ef4444"
                  : "#f59e0b"
              }`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <Badge status={result.status} style={{ fontSize: "0.9rem", padding: "0.35rem 0.85rem" }} />
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.75rem", letterSpacing: "-0.01em" }}>
                  {result.status === "AUTHENTIC" && "Authentic Document Verified"}
                  {result.status === "TAMPERED" && "Security Rejection: Tampering Detected"}
                  {result.status === "NOT_REGISTERED" && "Document Not Registered on Ledger"}
                </h2>
              </div>

              <Button variant="secondary" size="sm" onClick={handleReset} icon={RotateCcw}>
                Verify Another Document
              </Button>
            </div>

            <p style={{ marginTop: "0.75rem", color: "var(--text-muted)", fontSize: "0.975rem", lineHeight: 1.6 }}>
              {result.details?.message}
            </p>

            {/* Cryptographic Hash Comparison */}
            <div
              style={{
                marginTop: "1.75rem",
                padding: "1.25rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-subtle)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  Calculated Document SHA-256 Digest
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "0.35rem",
                    gap: "0.5rem",
                  }}
                >
                  <code
                    className="font-mono"
                    style={{
                      fontSize: "0.85rem",
                      backgroundColor: "var(--bg-surface)",
                      padding: "0.4rem 0.6rem",
                      borderRadius: "6px",
                      border: "1px solid var(--border-light)",
                      flex: 1,
                      overflowX: "auto",
                    }}
                  >
                    {result.calculatedHash}
                  </code>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopy(result.calculatedHash, "hash")}
                    icon={copiedKey === "hash" ? Check : Copy}
                  >
                    {copiedKey === "hash" ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              {/* If Tampered: Show Expected vs Actual */}
              {result.status === "TAMPERED" && result.details?.expectedHash && (
                <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "1rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 600, textTransform: "uppercase" }}>
                    Expected Baseline Hash (On-Chain Reference: {result.details.documentReference})
                  </div>
                  <code
                    className="font-mono"
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      backgroundColor: "#fef2f2",
                      color: "#991b1b",
                      padding: "0.4rem 0.6rem",
                      borderRadius: "6px",
                      border: "1px solid #fecaca",
                      marginTop: "0.35rem",
                    }}
                  >
                    {result.details.expectedHash}
                  </code>
                </div>
              )}
            </div>

            {/* On-Chain Blockchain Metadata (If Authentic or Registered) */}
            {result.matchedOnChain && result.details && (
              <div
                style={{
                  marginTop: "1.5rem",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                }}
              >
                {result.details.documentReference && (
                  <div style={{ padding: "0.85rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Document Reference</div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem", marginTop: "0.2rem" }}>
                      {result.details.documentReference}
                    </div>
                  </div>
                )}

                {result.details.registeredAt && (
                  <div style={{ padding: "0.85rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Registration Timestamp</div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem", marginTop: "0.2rem" }}>
                      {formatDate(result.details.registeredAt)}
                    </div>
                  </div>
                )}

                {result.details.blockNumber && (
                  <div style={{ padding: "0.85rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Mined Block Number</div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem", marginTop: "0.2rem" }}>
                      #{result.details.blockNumber}
                    </div>
                  </div>
                )}

                {result.details.submitterAddress && (
                  <div style={{ padding: "0.85rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Submitter Wallet</div>
                    <div className="font-mono" style={{ fontWeight: 600, fontSize: "0.85rem", marginTop: "0.2rem" }}>
                      {truncateHash(result.details.submitterAddress, 6, 6)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

