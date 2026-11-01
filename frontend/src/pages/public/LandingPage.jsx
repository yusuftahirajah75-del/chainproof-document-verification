import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Cpu,
  Database,
  Lock,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  Blocks,
  CheckCircle2,
  FileSearch,
  EyeOff,
  Server,
} from "lucide-react";
import { blockchainApi } from "../../api/blockchainApi";
import { Button } from "../../components/common/Button";

export function LandingPage() {
  const [networkStatus, setNetworkStatus] = useState(null);

  useEffect(() => {
    blockchainApi
      .getStatus()
      .then((res) => {
        if (res.success && res.data) {
          setNetworkStatus(res.data);
        }
      })
      .catch(() => {
        // Status remains null if node is offline
      });
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4rem", paddingBottom: "4rem" }}>
      {/* Hero Section */}
      <section
        style={{
          background: "radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)",
          color: "#ffffff",
          padding: "5rem 1.5rem 6rem",
          borderBottom: "1px solid var(--navy-800)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {networkStatus && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.35rem 0.85rem",
                borderRadius: "9999px",
                backgroundColor: networkStatus.connected
                  ? "rgba(16, 185, 129, 0.15)"
                  : "rgba(245, 158, 11, 0.15)",
                border: `1px solid ${
                  networkStatus.connected ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"
                }`,
                color: networkStatus.connected ? "#34d399" : "#fbbf24",
                fontSize: "0.825rem",
                fontWeight: 500,
                marginBottom: "1.75rem",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: networkStatus.connected ? "#10b981" : "#f59e0b",
                  display: "inline-block",
                }}
              />
              <span>
                {networkStatus.connected
                  ? `Blockchain Ledger Online (Block #${networkStatus.latestBlockNumber})`
                  : "Blockchain Node Offline"}
              </span>
            </div>
          )}

          <h1
            style={{
              fontSize: "3.2rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: "1.5rem",
            }}
          >
            Cryptographic Integrity & Blockchain Verification
          </h1>

          <p
            style={{
              fontSize: "1.2rem",
              color: "#94a3b8",
              lineHeight: 1.6,
              marginBottom: "2.5rem",
              maxWidth: "760px",
              margin: "0 auto 2.5rem",
            }}
          >
            ChainProof pairs byte-level SHA-256 cryptographic hashing with Ethereum
            smart contracts to provide tamper-evident document integrity and verifiable
            authenticity without exposing raw document contents.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <Link to="/verify">
              <Button variant="primary" size="lg" icon={FileSearch}>
                Verify Document Integrity
              </Button>
            </Link>
            <Link to="/register">
              <Button
                variant="secondary"
                size="lg"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  color: "#ffffff",
                  borderColor: "rgba(255,255,255,0.2)",
                }}
                icon={ArrowRight}
              >
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="page-container">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            How Document Integrity Verification Works
          </h2>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            A deterministic three-stage architecture ensuring zero data leakage and permanent verification.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
          }}
        >
          {/* Step 1 */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Cpu size={24} />
            </div>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>
              Step 01
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Raw Byte SHA-256 Hashing</h3>
            <p style={{ fontSize: "0.925rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              The file is processed on the server byte-by-byte into a unique 64-character
              SHA-256 fingerprint. Any modification—even changing a single pixel or comma—produces
              a completely divergent hash.
            </p>
          </div>

          {/* Step 2 */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                backgroundColor: "#ecfdf5",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Blocks size={24} />
            </div>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>
              Step 02
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Blockchain Ledger Anchoring</h3>
            <p style={{ fontSize: "0.925rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              The 32-byte digest is anchored onto an Ethereum-compatible Solidity smart
              contract alongside the submitter address, tracking reference, and immutable block
              timestamp.
            </p>
          </div>

          {/* Step 3 */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                backgroundColor: "#f5f3ff",
                color: "#7c3aed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileCheck2 size={24} />
            </div>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase" }}>
              Step 03
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Tri-State Cryptographic Proof</h3>
            <p style={{ fontSize: "0.925rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Verifiers upload a document or submit a hash. The verification engine analyzes
              the on-chain state to return <strong>AUTHENTIC</strong>, <strong>TAMPERED</strong>,
              or <strong>NOT REGISTERED</strong> with complete mathematical certainty.
            </p>
          </div>
        </div>
      </section>

      {/* Technical Deep Dive: Cryptography & Blockchain */}
      <section
        style={{
          backgroundColor: "#ffffff",
          borderTop: "1px solid var(--border-light)",
          borderBottom: "1px solid var(--border-light)",
          padding: "4rem 1.5rem",
        }}
      >
        <div className="page-container" style={{ padding: 0 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "3rem",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#2563eb",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  marginBottom: "0.75rem",
                }}
              >
                <Lock size={16} /> CRYPTOGRAPHIC FOUNDATION
              </div>
              <h2 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1rem" }}>
                SHA-256 Digesting & Privacy Preservation
              </h2>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                Under SHA-256 (Secure Hash Algorithm 256-bit), any data stream produces a
                fixed-length 256-bit (32-byte) message digest. It is computationally infeasible to
                reverse the hash to reconstruct the document, or to generate two different files
                with the identical digest (second pre-image resistance).
              </p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.95rem" }}>
                  <CheckCircle2 size={18} color="#059669" />
                  <span>Zero exposure of confidential academic or personal contents.</span>
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.95rem" }}>
                  <CheckCircle2 size={18} color="#059669" />
                  <span>Deterministic validation across platforms and machines.</span>
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.95rem" }}>
                  <CheckCircle2 size={18} color="#059669" />
                  <span>Strict PDF magic byte validation (%PDF-) prevents spoofed uploads.</span>
                </li>
              </ul>
            </div>

            <div
              style={{
                backgroundColor: "var(--navy-900)",
                borderRadius: "var(--radius-lg)",
                padding: "2rem",
                color: "#ffffff",
                boxShadow: "var(--shadow-xl)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ef4444" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#f59e0b" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#10b981" }} />
                <span style={{ fontSize: "0.75rem", color: "#64748b", marginLeft: "0.5rem" }}>
                  DocumentRegistry.sol Execution Model
                </span>
              </div>
              <pre
                className="font-mono"
                style={{
                  fontSize: "0.85rem",
                  color: "#38bdf8",
                  lineHeight: 1.5,
                  overflowX: "auto",
                }}
              >
{`// On-Chain Registration Event
event DocumentRegistered(
  bytes32 indexed documentHash,
  address indexed submitter,
  uint256 registeredAt,
  string docReference,
  uint256 blockNumber
);

// Tri-State Query Verification
function verifyDocument(bytes32 documentHash)
  external view returns (
    bool exists,
    address submitter,
    uint256 registeredAt,
    string memory docReference,
    uint256 blockNumber
  );`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Tri-State Outcomes Explanation */}
      <section className="page-container">
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            The Three Verification Outcomes
          </h2>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Unambiguous, verifiable outcomes avoiding false tampering classifications.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div
            style={{
              padding: "1.5rem",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--status-authentic-bg)",
              border: "1px solid var(--status-authentic-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#065f46", fontWeight: 700 }}>
              <CheckCircle2 size={20} /> AUTHENTIC
            </div>
            <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", color: "#065f46", lineHeight: 1.5 }}>
              The uploaded document's calculated SHA-256 digest exactly matches an active,
              confirmed blockchain record. The document is genuine and unmodified.
            </p>
          </div>

          <div
            style={{
              padding: "1.5rem",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--status-tampered-bg)",
              border: "1px solid var(--status-tampered-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#991b1b", fontWeight: 700 }}>
              <AlertTriangle size={20} /> TAMPERED
            </div>
            <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", color: "#991b1b", lineHeight: 1.5 }}>
              The document is associated with an established registration reference, but its
              byte contents have been modified or corrupted since registration.
            </p>
          </div>

          <div
            style={{
              padding: "1.5rem",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--status-unregistered-bg)",
              border: "1px solid var(--status-unregistered-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#92400e", fontWeight: 700 }}>
              <FileSearch size={20} /> NOT REGISTERED
            </div>
            <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", color: "#92400e", lineHeight: 1.5 }}>
              No matching blockchain hash exists. An unregistered file is never falsely
              classified as tampered.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          padding: "4rem 1.5rem",
          borderRadius: "var(--radius-xl)",
          maxWidth: "1280px",
          margin: "0 auto",
          width: "calc(100% - 3rem)",
          textAlign: "center",
          border: "1px solid var(--navy-800)",
        }}
      >
        <h2 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "1rem" }}>
          Ready to verify academic & enterprise credentials?
        </h2>
        <p style={{ color: "#94a3b8", maxWidth: "600px", margin: "0 auto 2rem", fontSize: "1.05rem" }}>
          Verify any PDF document against our decentralized registry or sign in to register new
          transcripts, certifications, and research publications.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          <Link to="/verify">
            <Button variant="primary" size="lg" icon={FileSearch}>
              Launch Public Verifier
            </Button>
          </Link>
          <Link to="/login">
            <Button
              variant="secondary"
              size="lg"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#ffffff",
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              Sign In to Dashboard
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

