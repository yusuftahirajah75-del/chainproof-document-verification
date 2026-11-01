# ChainProof: Blockchain-Based Document Integrity Verification System

> **University Seminar Project:** Development of a Blockchain-Based Document Integrity Verification System  
> **Backend Architecture:** Node.js (ESM), Express.js, PostgreSQL, Solidity, Hardhat, Ethers.js, SHA-256

---

## Overview

**ChainProof** is a secure, verifiable, decentralized document integrity verification backend. It pairs cryptographic hashing (SHA-256) with an Ethereum-compatible Solidity smart contract registry (`DocumentRegistry.sol`) and a PostgreSQL auditing ledger. The system allows academic and enterprise organizations to upload, timestamp, and anchor documents on a blockchain, providing public mathematical proof of document authenticity and instant detection of fraudulent modifications.

---

## Key Features

- **Byte-Level Cryptographic Hashing**: Deterministic SHA-256 digest computation directly from file bytes.
- **On-Chain Immutability**: Hashes, submitter addresses, and timestamps anchored in Solidity smart contracts.
- **Tri-State Verification Engine**:
  - `AUTHENTIC`: File hash matches confirmed blockchain registry record.
  - `TAMPERED`: Document matches a registered document identity/reference, but file contents have changed.
  - `NOT_REGISTERED`: No matching blockchain record exists (unregistered files are never falsely classified as tampered).
- **Hardened File Storage**: PDFs are validated via magic bytes (`%PDF-`), size-restricted (15MB limit), and stored outside web root.
- **Dual Session Authentication**: Secure HTTP-only cookies and Authorization headers using signed JSON Web Tokens (JWT).
- **PostgreSQL Relational Ledger**: Complete audit logging, transaction logs, and role-based access control (`USER` and `ADMIN`).
- **Comprehensive Defense-in-Depth**: Helmet security headers, CORS restrictions, rate limiting, and SQL injection prevention.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Runtime & Server** | Node.js v24 (ES Modules), Express.js |
| **Relational Database** | PostgreSQL, `pg` connection pool |
| **Smart Contracts** | Solidity `^0.8.20`, Hardhat |
| **Blockchain Client** | Ethers.js v6 |
| **Authentication** | JWT, `bcryptjs`, HTTP-only secure cookies |
| **Validation** | Zod schemas |
| **File Intake** | Multer, PDF magic byte parser |
| **Testing** | Jest, Supertest, Chai |

---

## Directory Structure

```
chainproof-document-verification/
├── contracts/
│   └── DocumentRegistry.sol          # Solidity registry contract
├── migrations/
│   ├── 001_initial_schema.sql        # Users and UUID extensions
│   ├── 002_create_documents.sql      # Documents and SHA-256 hashes
│   ├── 003_create_blockchain_txs.sql # Blockchain transactions ledger
│   └── 004_create_verifications_and_audits.sql # Verification records & audit logs
├── scripts/
│   ├── deploy.js                     # Hardhat contract deployment script
│   ├── migrate.js                    # PostgreSQL automated migration runner
│   └── seed.js                       # Initial user and admin seed script
├── src/
│   ├── config/                       # Environment, database pool, blockchain provider
│   ├── constants/                    # System roles & verification status constants
│   ├── controllers/                  # Route controllers (Auth, Docs, Verification, Admin)
│   ├── middleware/                   # JWT auth, RBAC, Multer, Zod validator, Rate limiters
│   ├── routes/                       # Express modular REST API routes
│   ├── services/                     # Business logic (Hash, Blockchain, Docs, Verify, Audit)
│   ├── utils/                        # Structured logger, AppError, ApiResponse envelopes
│   ├── validators/                   # Zod request validation schemas
│   ├── app.js                        # Express application configuration
│   └── server.js                     # Server entrypoint with graceful shutdown
├── storage/
│   └── documents/                    # Private secure storage for uploaded PDFs
├── test/
│   ├── contracts/                    # Hardhat Solidity smart contract tests
│   ├── helpers/                      # Test database fixtures & seeders
│   ├── integration/                  # Auth, document, verification, blockchain, admin tests
│   └── unit/                         # Hash service and Zod validator unit tests
├── .env.example                      # Environment template
├── hardhat.config.cjs                # Hardhat network and compiler configuration
├── jest.config.js                    # Jest test runner configuration
└── package.json                      # Project manifest
```

---

## Quickstart Guide (PowerShell)

### 1. Prerequisites
Ensure PostgreSQL is running locally on port `5432` with user `postgres` and password `postgres`.

### 2. Install Dependencies
```powershell
npm install
```

### 3. Run Database Migrations and Seeding
```powershell
npm run db:migrate
npm run db:seed
```

### 4. Smart Contract Compilation & Tests
```powershell
npx hardhat --config hardhat.config.cjs compile
npx hardhat --config hardhat.config.cjs test
```

### 5. Run Integration & Unit Test Suite
```powershell
npm test
```

### 6. Start the Backend Server
```powershell
npm run dev
```
The server will boot on `http://localhost:5000`.

---

## Default Seeded Accounts

| Role | Email | Password |
|---|---|---|
| **ADMIN** | `admin@chainproof.local` | `AdminPass123!` |
| **USER** | `researcher@chainproof.local` | `UserPass123!` |

---

## Verification Outcomes Reference

| Status | Condition | Meaning |
|---|---|---|
| `AUTHENTIC` | Calculated hash matches smart contract record. | The file is genuine, unchanged, and registered on-chain. |
| `TAMPERED` | Document claims an existing reference, but hash does not match baseline. | File contents or academic credentials have been fraudulently altered. |
| `NOT_REGISTERED` | Hash not on-chain; no established reference claimed. | Document has not been registered on this ledger. |

---

## Academic Seminar Notes
- Meets all security and structural mandates for the academic seminar: **Development of a Blockchain-Based Document Integrity Verification System**.
- Clean separation of concerns between smart contracts, relational auditing, and REST API controllers.

