# ChainProof Frontend Application

> **Project:** Development of a Blockchain-Based Document Integrity Verification System  
> **Tech Stack:** React 18, Vite, React Router 6, Axios, Lucide React, Modern CSS3

---

## Overview

The **ChainProof Frontend** is a modern, responsive, cybersecurity and blockchain-inspired web application. It connects directly with the ChainProof Node.js/Express backend, Ethereum smart contracts (`DocumentRegistry.sol`), and PostgreSQL relational ledger.

---

## Features & Modules

- **Public Landing Page**: Project introduction, visual three-step workflow, cryptographic SHA-256 deep-dive, Ethereum smart contract execution model, and live blockchain network telemetry.
- **Public Verification Portal (`/verify`)**: Direct file upload or SHA-256 hash input with instant evaluation into **AUTHENTIC**, **TAMPERED**, or **NOT_REGISTERED** states.
- **Authentication**: Institutional user registration with password complexity verification, secure sign-in, HTTP-only cookie session handling, and role-based access control.
- **User Dashboard (`/dashboard`)**: Summary telemetry cards, recent document registrations, recent verification logs, and quick actions.
- **Document Registration (`/dashboard/register`)**: PDF drag-and-drop dropzone, byte-level SHA-256 calculation, optional immediate smart contract anchoring, and duplicate upload protection.
- **Document Integrity Verification (`/dashboard/verify`)**: Authenticated verification workspace displaying expected vs. actual hashes, mined block numbers, and submitter wallet addresses.
- **Ledger & Audit History (`/dashboard/history`)**: Paginated document ledger, copyable tracking references, search filters, and verification inquiry history.
- **Administrator Console (`/admin`)**: Institutional overview metrics, user account management (activate/deactivate, role promotion/demotion), and immutable PostgreSQL audit log explorer.

---

## Getting Started (PowerShell)

### 1. Install Dependencies
```powershell
cd frontend
npm install
```

### 2. Configure Environment
A `.env` file is pre-configured with the default backend URL:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=ChainProof
```

### 3. Start Development Server
```powershell
npm run dev
```
The Vite development server will start at: `http://localhost:3000`

### 4. Build for Production
```powershell
npm run build
```
Generates optimized, minified production assets in `frontend/dist/`.

---

## Demonstration Credentials

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@chainproof.local` | `AdminPass123!` |
| **Researcher** | `researcher@chainproof.local` | `UserPass123!` |

