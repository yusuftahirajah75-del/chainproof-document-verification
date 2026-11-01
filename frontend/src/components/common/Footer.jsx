import React from "react";
import { ShieldCheck, Cpu } from "lucide-react";

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--navy-950)",
        color: "#94a3b8",
        padding: "2rem 1.5rem",
        borderTop: "1px solid var(--navy-800)",
        marginTop: "auto",
        fontSize: "0.875rem",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div className="navbar-logo-icon" style={{ width: 26, height: 26 }}>
            <ShieldCheck size={16} />
          </div>
          <div>
            <span style={{ color: "#ffffff", fontWeight: 600 }}>ChainProof System</span>
            <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem", color: "#64748b" }}>
              University Seminar Project
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.8rem" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <Cpu size={14} color="#38bdf8" /> SHA-256 Cryptographic Engine
          </span>
          <span>•</span>
          <span>Ethereum Smart Contract Registry</span>
          <span>•</span>
          <span>PostgreSQL Relational Ledger</span>
        </div>

        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
          © {new Date().getFullYear()} ChainProof. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

