import React, { useRef, useState } from "react";
import { UploadCloud, FileText, CheckCircle2, X } from "lucide-react";
import { formatBytes } from "../../utils/formatters";

export function FileDropzone({
  file,
  onFileSelect,
  onFileClear,
  maxSizeMb = 15,
  accept = ".pdf,application/pdf",
  label = "Upload PDF Document",
  description = "Drag and drop your academic or institutional PDF file here, or browse",
  error = null,
}) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSet(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSet(e.target.files[0]);
    }
  };

  const validateAndSet = (selectedFile) => {
    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      alert("Invalid format: Only official PDF documents (.pdf) are permitted.");
      return;
    }

    const maxBytes = maxSizeMb * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      alert(`File size exceeds the maximum allowed limit of ${maxSizeMb} MB.`);
      return;
    }

    onFileSelect(selectedFile);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: "none" }}
      />

      {!file ? (
        <div
          className={`file-dropzone ${isDragActive ? "drag-active" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              fileInputRef.current?.click();
            }
          }}
        >
          <UploadCloud className="dropzone-icon" />
          <h4 className="dropzone-title">{label}</h4>
          <p className="dropzone-subtitle">{description}</p>
          <p style={{ fontSize: "0.775rem", color: "var(--text-subtle)", marginTop: "0.5rem" }}>
            Format: PDF only • Max size: {maxSizeMb} MB
          </p>
        </div>
      ) : (
        <div
          style={{
            border: "1px solid var(--border-light)",
            borderRadius: "var(--radius-md)",
            padding: "1rem 1.25rem",
            backgroundColor: "var(--bg-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: 0 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "8px",
                backgroundColor: "var(--primary-50)",
                color: "var(--primary-600)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileText size={24} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {file.name}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <span>{formatBytes(file.size)}</span>
                <span>•</span>
                <span style={{ color: "#059669", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                  <CheckCircle2 size={12} /> Ready
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFileClear();
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            style={{
              padding: "0.4rem",
              borderRadius: "6px",
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
            aria-label="Remove selected document"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {error && <p className="form-error" style={{ marginTop: "0.5rem" }}>{error}</p>}
    </div>
  );
}

