import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  Blocks,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { verificationApi } from "../../api/verificationApi";
import { FileDropzone } from "../../components/common/FileDropzone";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Alert } from "../../components/common/Alert";
import { copyToClipboard, formatDate, truncateHash } from "../../utils/formatters";

export function DocumentVerifyPage() {
  const [tab, setTab] = useState("file");
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
      setError("Please select a PDF document to verify.");
      return;
    }

    if (tab === "hash" && !hashInput.trim()) {
      setError("Please input a 64-character SHA-256 hash string.");
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
        setError(res.message || "Failed to complete verification query.");
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
    <div style={{ maxWidth: "850px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Verify Document Integrity
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.925rem", marginTop: "0.2rem" }}>
          Execute an independent cryptographic hash comparison against the Ethereum smart contract registry
        </p>
      </div>

      {!result ? (
        <Card>
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
              Verify Candidate File (.PDF)
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
              Verify Direct SHA-256 Hash
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
                  label="Select Candidate PDF Document"
                  description="Upload file to extract bytes and compare against blockchain registry"
                />
              </div>
            ) : (
              <div style={{ marginBottom: "1.5rem" }}>
                <Input
                  label="64-character SHA-256 Hash"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  placeholder="e.g. e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                  required
                />
              </div>
            )}

            <div style={{ marginBottom: "1.75rem" }}>
              <Input
                label="Asserted Document Reference (Optional)"
                value={referenceInput}
                onChange={(e) => setReferenceInput(e.target.value)}
                placeholder="e.g. DOC-20261101-ABCD (for detecting tampered baselines)"
                helperText="If the document claims an established reference code, enter it here. If the contents have been modified, the engine will flag it as TAMPERED."
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
              Analyze Document Authenticity
            </Button>
          </form>
        </Card>
      ) : (
        /* Result Display Card */
        <Card>
          <div
            style={{
              padding: "1rem",
              borderRadius: "var(--radius-lg)",
              backgroundColor:
                result.status === "AUTHENTIC"
                  ? "var(--status-authentic-bg)"
                  : result.status === "TAMPERED"
                  ? "var(--status-tampered-bg)"
                  : "var(--status-unregistered-bg)",
              border: `1px solid ${
                result.status === "AUTHENTIC"
                  ? "var(--status-authentic-border)"
                  : result.status === "TAMPERED"
                  ? "var(--status-tampered-border)"
                  : "var(--status-unregistered-border)"
              }`,
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              <Badge status={result.status} style={{ fontSize: "0.95rem", padding: "0.35rem 0.85rem" }} />
              <Button variant="secondary" size="sm" onClick={handleReset} icon={RotateCcw}>
                Reset Form
              </Button>
            </div>

            <h3 style={{ fontSize: "1.35rem", fontWeight: 700, marginTop: "0.75rem", letterSpacing: "-0.01em" }}>
              {result.status === "AUTHENTIC" && "Authentic: Cryptographic Match Confirmed"}
              {result.status === "TAMPERED" && "Tampered: Content Discrepancy Detected"}
              {result.status === "NOT_REGISTERED" && "Not Registered on Ledger"}
            </h3>

            <p style={{ marginTop: "0.4rem", fontSize: "0.95rem", lineHeight: 1.5 }}>
              {result.details?.message}
            </p>
          </div>

          {/* Cryptographic Hash Summary */}
          <div
            style={{
              backgroundColor: "var(--bg-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                Calculated Candidate Hash
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                <code className="font-mono" style={{ fontSize: "0.85rem", flex: 1, overflowX: "auto" }}>
                  {result.calculatedHash}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(result.calculatedHash, "calc")}
                  icon={copiedKey === "calc" ? Check : Copy}
                >
                  {copiedKey === "calc" ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            {result.status === "TAMPERED" && result.details?.expectedHash && (
              <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#dc2626", textTransform: "uppercase", fontWeight: 600 }}>
                  Original Baseline Hash (Ref: {result.details.documentReference})
                </span>
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
                    marginTop: "0.25rem",
                  }}
                >
                  {result.details.expectedHash}
                </code>
              </div>
            )}
          </div>

          {/* Action Links */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
            <Link to="/dashboard/history">
              <Button variant="secondary" icon={ArrowRight} style={{ flexDirection: "row-reverse" }}>
                View in Audit History
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

