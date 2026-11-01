import React from "react";
import { Loader2 } from "lucide-react";

export function Spinner({ size = "md", label = null, className = "" }) {
  const pixelSizes = {
    sm: 16,
    md: 24,
    lg: 36,
    xl: 48,
  };

  const px = pixelSizes[size] || 24;

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
      }}
      className={className}
    >
      <Loader2
        size={px}
        style={{
          animation: "spin 1s linear infinite",
          color: "var(--primary-600)",
        }}
      />
      {label && <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{label}</span>}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

