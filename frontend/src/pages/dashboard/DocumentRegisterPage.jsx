import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileUp, Blocks, CheckCircle2, Copy, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { documentApi } from "../../api/documentApi";
import { useToast } from "../../context/ToastContext";
import { FileDropzone } from "../../components/common/FileDropzone";
import { Button } from "../../components/common/Button";
import { Input, Textarea } from "../../components/common/Input";
import { Card } from "../../components/common/Card";
import { Alert } from "../../components/common/Alert";
import { copyToClipboard, formatDate, truncateHash } from "../../utils/formatters";

export function DocumentRegisterPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [anchorImmediately, setAnchorImmediately] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleCopy = (text, key) => {
    copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      setError("Please select a PDF document to register.");
      return;
    }

    if (!title.trim()) {
      setError("Please provide a title for the document.");
      return;
    }

    setLoading(true);
    setUploadProgress(15);

    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("title", title.trim());
      if (description.trim()) {
        formData.append("description", description.trim());
      }

      const progressHandler = (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(Math.min(90, percent));
        }
      };

      let res;
      if (anchorImmediately) {
        res = await documentApi.uploadAndRegister(formData, progressHandler);
      } else {
        res = await documentApi.upload(formData, progressHandler);
      }

      setUploadProgress(100);

      if (res.success && res.data?.document) {
        setResult(res.data.document);
        showToast(
          anchorImmediately
            ? "Document registered and anchored onto blockchain!"
            : "Document uploaded and hashed successfully.",
          "success"
        );
      } else {
        setError(res.message || "Document registration failed.");
      }
    } catch (err) {
      if (err.status === 409) {
        setError(
          `Duplicate Rejection: This document has already been registered. (Reference: ${
            err.details?.documentReference || "N/A"
          })`
        );
      } else {
        setError(err.message || "Failed to register document.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTitle("");
    setDescription("");
    setResult(null);
    setError(null);
    setUploadProgress(0);
  };

  return (
    <div style={{ maxWidth: "850px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Register Institutional Document
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.925rem", marginTop: "0.2rem" }}>
          Upload a genuine PDF document to compute its SHA-256 digest and anchor it to the Ethereum smart contract
        </p>
      </div>

      {!result ? (
        <Card>
          {error && <Alert type="error">{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1.5rem" }}>
              <FileDropzone
                file={file}
                onFileSelect={setFile}
                onFileClear={() => setFile(null)}
                label="Select Academic / Official PDF Document"
                description="Drag & drop your file here or click to browse"
              />
            </div>

            <Input
              label="Document Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master's Thesis: Quantum Cryptography Verification"
              required
              disabled={loading}
            />

            <Textarea
              label="Extended Description & Metadata (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Approved thesis document signed by examination committee on Nov 1, 2026."
              rows={3}
              disabled={loading}
            />

            {/* Anchoring Options Checkbox */}
            <div
              style={{
                backgroundColor: "var(--bg-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "1rem 1.25rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
              }}
            >
              <input
                type="checkbox"
                id="anchorImmediately"
                checked={anchorImmediately}
                onChange={(e) => setAnchorImmediately(e.target.checked)}
                disabled={loading}
                style={{ marginTop: "0.25rem", width: "16px", height: "16px", cursor: "pointer" }}
              />
              <label htmlFor="anchorImmediately" style={{ cursor: "pointer" }}>
                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  Anchor directly onto the Ethereum smart contract immediately
                </span>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                  Broadcasts a blockchain transaction to commit the SHA-256 digest into DocumentRegistry.sol and obtain a permanent block timestamp.
                </p>
              </label>
            </div>

            {loading && uploadProgress > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.35rem" }}>
                  <span>Processing document & calculating SHA-256...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div style={{ width: "100%", height: 6, backgroundColor: "#e2e8f0", borderRadius: 9999, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${uploadProgress}%`,
                      height: "100%",
                      backgroundColor: "var(--primary-600)",
                      transition: "width 0.2s ease",
                    }}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              style={{ width: "100%" }}
              icon={FileUp}
            >
              {anchorImmediately ? "Upload & Anchor On-Chain" : "Upload Document"}
            </Button>
          </form>
        </Card>
      ) : (
        /* Success Registration Result Card */
        <Card>
          <div style={{ textAlign: "center", padding: "1.5rem 0 1rem" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: "#ecfdf5",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
              Document Successfully Registered!
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.925rem", marginTop: "0.25rem" }}>
              Cryptographic SHA-256 digest computed and recorded into the persistent audit ledger.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "var(--bg-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              margin: "1.5rem 0",
            }}
          >
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                Unique Tracking Reference
              </span>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.25rem" }}>
                <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--primary-700)" }}>
                  {result.documentReference}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(result.documentReference, "ref")}
                  icon={copiedKey === "ref" ? Check : Copy}
                >
                  {copiedKey === "ref" ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "0.75rem" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                SHA-256 Hash Digest
              </span>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.25rem", gap: "0.5rem" }}>
                <code className="font-mono" style={{ fontSize: "0.85rem", overflowX: "auto", flex: 1 }}>
                  {result.sha256Hash}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(result.sha256Hash, "hash")}
                  icon={copiedKey === "hash" ? Check : Copy}
                >
                  {copiedKey === "hash" ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            {result.transaction && (
              <div
                style={{
                  borderTop: "1px solid var(--border-light)",
                  paddingTop: "0.75rem",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                  fontSize: "0.85rem",
                }}
              >
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Transaction Hash:</span>
                  <div className="font-mono" style={{ fontWeight: 600 }}>
                    {truncateHash(result.transaction.transactionHash, 8, 8)}
                  </div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Mined Block:</span>
                  <div style={{ fontWeight: 600 }}>#{result.transaction.blockNumber}</div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Submitter Address:</span>
                  <div className="font-mono">
                    {truncateHash(result.transaction.submitterAddress, 6, 6)}
                  </div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Gas Consumed:</span>
                  <div>{result.transaction.gasUsed} gas</div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Button variant="secondary" onClick={handleReset}>
              Register Another Document
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate("/dashboard/history")}
              icon={ArrowRight}
              style={{ flexDirection: "row-reverse" }}
            >
              View in Document History
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

