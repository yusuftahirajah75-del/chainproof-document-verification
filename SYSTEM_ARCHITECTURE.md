# System Architecture: Blockchain-Based Document Integrity Verification System (ChainProof)

## 1. Executive Summary & Purpose

The **ChainProof Document Integrity Verification System** is an enterprise-grade backend architecture developed for university seminar demonstration, cryptographic auditing, and verifiable credential management. The system guarantees that once a digital document (specifically portable document format, PDF) is registered, any subsequent modification, byte truncation, unauthorized metadata modification, or fraud is immediately detectable.

The system harmonizes three distinct architectural layers:
1. **Application & Cryptographic Layer**: Node.js/Express.js backend utilizing deterministic SHA-256 byte extraction, Zod schema validation, and secure HTTP-only cookie authentication.
2. **Relational Ledger & Audit Layer**: PostgreSQL database enforcing foreign key relationships, immutable audit logs, document version references, and user access policies.
3. **Decentralized Ledger Layer**: Ethereum-compatible Solidity smart contract (`DocumentRegistry.sol`) running on a local Hardhat node or public testnet (e.g., Sepolia), storing 32-byte cryptographic digests with submitter identities and blockchain timestamps.

---

## 2. High-Level Architectural Diagram

```mermaid
flowchart TD
    subgraph ClientLayer["Clients & Consumers"]
        BrowserClient["Web Browser / Frontend Client"]
        AuditorClient["External Verifier / Public Client"]
    end

    subgraph SecurityGateways["Security & Gateway Layer"]
        HelmetCors["Helmet + CORS (Restricted Origin)"]
        RateLimiter["Rate Limiters (Auth, Verification, General)"]
        AuthMiddleware["JWT Auth (HTTP-Only Secure Cookie)"]
        PdfValidator["Multer + Magic Bytes Validator (%PDF-)"]
    end

    subgraph ServiceLayer["Core Backend Services"]
        AuthService["Auth Service (bcrypt, JWT)"]
        DocService["Document Service (Metadata, Duplicates)"]
        HashService["Hash Service (SHA-256 -> bytes32)"]
        VerifyService["Verification Engine (3 States)"]
        BcService["Blockchain Service (ethers.js v6)"]
        AuditService["Audit Trail Service"]
    end

    subgraph DataStoreLayer["Persistence & Ledgers"]
        PostgresDB[("PostgreSQL Database
        - users
        - documents
        - document_hashes
        - blockchain_transactions
        - verification_records
        - audit_logs")]
        Blockchain[("Ethereum Blockchain / Hardhat
        - DocumentRegistry.sol
        - bytes32 documentHash
        - Submitter Address
        - Block Timestamp")]
    end

    BrowserClient --> HelmetCors
    AuditorClient --> HelmetCors
    HelmetCors --> RateLimiter
    RateLimiter --> AuthMiddleware
    RateLimiter --> PdfValidator

    AuthMiddleware --> AuthService
    PdfValidator --> DocService
    DocService --> HashService
    DocService --> BcService
    DocService --> PostgresDB

    AuditorClient --> VerifyService
    VerifyService --> HashService
    VerifyService --> BcService
    VerifyService --> PostgresDB

    BcService --> Blockchain
    AuthService --> PostgresDB
    DocService --> AuditService
    VerifyService --> AuditService
    AuditService --> PostgresDB
```

---

## 3. Cryptographic Pipeline & Integrity Invariants

### 3.1. Hashing Pipeline
- **Raw Byte Processing**: Documents are read directly into binary streams or memory buffers. The system niemals trusts user-supplied file names or file extensions.
- **SHA-256 Digest**: Computed via Node.js native `crypto.createHash('sha256')`, producing a deterministic 64-character hexadecimal string:
  $$\text{Hash} = \text{SHA-256}(\text{Document Bytes})$$
- **Solidity Conversion**: The 64-character hexadecimal digest is converted into an Ethereum-native `bytes32` type (`0x` prefixed with 64 hex characters):
  $$\text{bytes32} = \text{0x} + \text{Hash}$$

### 3.2. Verification Engine Tri-State Invariants

The verification engine enforces three mutually exclusive, mathematically rigorous outcomes:

```mermaid
stateDiagram-v2
    [*] --> CalculateHash: Receive Uploaded PDF or SHA-256 Hash
    CalculateHash --> QueryBlockchain: Check DocumentRegistry.sol
    
    QueryBlockchain --> AuthenticState: Hash matches on-chain record
    QueryBlockchain --> CheckClaimedReference: Hash NOT on-chain
    
    CheckClaimedReference --> TamperedState: Claimed Reference exists in DB but Hash differs
    CheckClaimedReference --> NotRegisteredState: No Reference claimed OR Reference not found
    
    AuthenticState --> [*]: AUTHENTIC (Integrity Validated)
    TamperedState --> [*]: TAMPERED (Fraud Detected)
    NotRegisteredState --> [*]: NOT_REGISTERED (Unregistered Document)
```

1. **`AUTHENTIC`**:
   - **Condition**: The computed SHA-256 digest exists in the `DocumentRegistry` contract mapping.
   - **Meaning**: The document is byte-for-byte identical to the version registered on-chain.
   - **Payload**: Includes on-chain submitter address, mined block number, registration timestamp, and document reference.

2. **`TAMPERED`**:
   - **Condition**: A claimed document identity or tracking reference (e.g., `DOC-20261101-ABCD`) is asserted by the user or embedded barcode, and that reference exists in the registered database ledger, **BUT** the computed byte-level SHA-256 hash does not match the baseline hash.
   - **Meaning**: The document has been intentionally altered, modified, forged, or corrupted.
   - **Payload**: Includes registered title, original expected SHA-256 hash, computed actual hash, and registration date.

3. **`NOT_REGISTERED`**:
   - **Condition**: The computed SHA-256 hash does not exist on the blockchain, and no valid established document reference was claimed.
   - **Invariant**: Strict avoidance of false tampering reports. An unknown document is never classified as `TAMPERED` merely because it is unregistered.

---

## 4. PostgreSQL Relational Database Schema

```mermaid
erDiagram
    USERS ||--o{ DOCUMENTS : owns
    USERS ||--o{ VERIFICATION_RECORDS : performs
    USERS ||--o{ AUDIT_LOGS : triggers
    DOCUMENTS ||--|| DOCUMENT_HASHES : has
    DOCUMENTS ||--o| BLOCKCHAIN_TRANSACTIONS : anchored_by
    DOCUMENTS ||--o{ VERIFICATION_RECORDS : verified_against

    USERS {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar full_name
        varchar organization
        varchar role
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    DOCUMENTS {
        uuid id PK
        uuid user_id FK
        varchar document_reference UK
        varchar title
        text description
        varchar original_filename
        varchar stored_filename
        varchar file_path
        varchar mime_type
        bigint file_size_bytes
        varchar status
        timestamptz created_at
        timestamptz updated_at
    }

    DOCUMENT_HASHES {
        uuid id PK
        uuid document_id FK
        varchar sha256_hash UK
        varchar bytes32_hash
        varchar algorithm
        timestamptz created_at
    }

    BLOCKCHAIN_TRANSACTIONS {
        uuid id PK
        uuid document_id FK
        varchar transaction_hash UK
        bigint block_number
        timestamptz block_timestamp
        varchar network_name
        bigint chain_id
        varchar contract_address
        varchar submitter_address
        bigint gas_used
        varchar effective_gas_price
        varchar status
        timestamptz created_at
    }

    VERIFICATION_RECORDS {
        uuid id PK
        uuid document_id FK
        uuid verified_by_user_id FK
        varchar submitted_filename
        varchar calculated_hash
        varchar verification_status
        boolean matched_on_chain
        varchar document_reference_claimed
        timestamptz blockchain_timestamp
        varchar ip_address
        text user_agent
        jsonb details
        timestamptz created_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        varchar action
        varchar entity_type
        varchar entity_id
        varchar ip_address
        text user_agent
        jsonb details
        timestamptz created_at
    }
```

---

## 5. Solidity Smart Contract Architecture

The smart contract `DocumentRegistry.sol` is designed with minimal gas overhead:
- **Storage**: `mapping(bytes32 => DocumentRecord) private records;` ensures $O(1)$ lookup time and prevents hash collisions.
- **Uniqueness Check**: `require(!records[documentHash].exists, "DocumentRegistry: document hash already registered");` prevents front-running and double-registration.
- **Event Logging**: `emit DocumentRegistered(bytes32 indexed documentHash, address indexed submitter, uint256 registeredAt, string docReference, uint256 blockNumber);` enables indexing by subgraphs and off-chain listeners.
- **View Method**: `verifyDocument(bytes32 documentHash)` returns the boolean existence flag, submitter address, timestamp, docReference, and block number with zero gas cost for read operations.

---

## 6. Cybersecurity & Defense-in-Depth

| Security Vector | Implementation Detail |
|---|---|
| **Session Security** | HTTP-Only, `SameSite=Lax`, and SSL/TLS secure cookie delivery prevents client-side XSS token theft. |
| **Password Hashing** | Adaptive `bcrypt` salt rounds (cost factor 10) mitigate rainbow table and offline GPU attacks. |
| **File Upload Hardening** | Extension check (`.pdf`), MIME verification (`application/pdf`), and 5-byte file header validation (`%PDF-`). Stored outside web server document root in `./storage/documents` with randomized UUID file names to eliminate directory traversal and remote code execution (RCE). |
| **SQL Injection Prevention** | 100% parameterized queries via `pg` connection pool with zero dynamic string concatenations. |
| **DDoS & Brute Force Defense** | Multi-tier `express-rate-limit`: General API (100 req/15min), Auth endpoints (20 req/15min), Verification (60 req/15min). |
| **HTTP Headers** | `helmet` enforces Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), X-Content-Type-Options: `nosniff`, and clickjacking defense (`X-Frame-Options: DENY`). |
| **Role-Based Access Control** | Strictly partitioned `USER` and `ADMIN` roles enforced by dedicated Express middleware gates. |

