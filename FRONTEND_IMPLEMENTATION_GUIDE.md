# Frontend Implementation & Integration Guide: ChainProof Verification System

This comprehensive technical guide outlines the architecture, component hierarchy, UI/UX design decisions, state management, API integration, and execution instructions for the **ChainProof Document Integrity Verification Frontend**.

---

## 1. Frontend Technology Stack & Rationale

- **React 18 & Vite**: Fast development server startup, Hot Module Replacement (HMR), and lightweight tree-shaken production bundles.
- **React Router v6**: Declarative client-side routing, protected route boundaries, and seamless browser history navigation.
- **Axios**: Centralized HTTP client configured with `withCredentials: true` to support secure HTTP-only cookie session authentication.
- **Lucide React**: Clean, modern iconography aligned with enterprise cybersecurity interfaces.
- **Pure Responsive CSS**: Custom CSS variables, responsive flexbox and grid layouts, and zero heavy CSS framework bloat.

---

## 2. Directory Structure

```
frontend/
├── index.html                        # Application HTML5 entry point
├── vite.config.js                    # Vite configuration (port 3000 & /api proxy)
├── package.json                      # Frontend dependencies & scripts
├── .env.example                      # Environment template
├── .env                              # Development environment variables
├── public/
│   └── favicon.svg                   # Cryptographic shield vector icon
├── src/
│   ├── main.jsx                      # Application bootstrap & StrictMode
│   ├── App.jsx                       # Master Router & Route Guards
│   ├── index.css                     # Global styles, variables, typography & layout
│   ├── api/                          # Backend REST API Service Layer
│   │   ├── apiClient.js              # Centralized Axios client with error normalization
│   │   ├── authApi.js                # /api/auth endpoints
│   │   ├── documentApi.js            # /api/documents endpoints
│   │   ├── verificationApi.js        # /api/verification endpoints
│   │   ├── blockchainApi.js          # /api/blockchain endpoints
│   │   └── adminApi.js               # /api/admin endpoints
│   ├── context/                      # Global State Management
│   │   ├── AuthContext.jsx           # User authentication & RBAC state
│   │   └── ToastContext.jsx          # Notification manager
│   ├── components/
│   │   ├── common/                   # Reusable UI Primitives
│   │   │   ├── Navbar.jsx            # Public & shared navigation header
│   │   │   ├── Sidebar.jsx           # Authenticated dashboard sidebar navigation
│   │   │   ├── Footer.jsx            # Platform footer with telemetry indicators
│   │   │   ├── Button.jsx            # Standardized button variants & loading states
│   │   │   ├── Card.jsx              # Surface containers
│   │   │   ├── Input.jsx             # Accessible input & textarea controls
│   │   │   ├── Badge.jsx             # Status pills (AUTHENTIC, TAMPERED, etc.)
│   │   │   ├── Modal.jsx             # Accessible dialog overlays
│   │   │   ├── Spinner.jsx           # Activity loaders
│   │   │   ├── Alert.jsx             # Contextual inline alerts
│   │   │   ├── FileDropzone.jsx      # Drag-and-drop PDF ingestion
│   │   │   └── Pagination.jsx        # Data table pagination controls
│   │   └── layout/
│   │       ├── PublicLayout.jsx      # Wrapper for public-facing views
│   │       └── DashboardLayout.jsx   # Wrapper for authenticated dashboard views
│   ├── routes/
│   │   ├── ProtectedRoute.jsx        # Guards routes requiring authenticated session
│   │   └── AdminRoute.jsx            # Guards routes requiring ADMIN role
│   ├── pages/
│   │   ├── public/
│   │   │   ├── LandingPage.jsx       # Public landing page & technical overview
│   │   │   ├── LoginPage.jsx         # Sign-in portal with seminar demo helpers
│   │   │   ├── RegisterPage.jsx      # Registration with password complexity validator
│   │   │   └── PublicVerifyPage.jsx  # Public document integrity verification portal
│   │   ├── dashboard/
│   │   │   ├── UserDashboard.jsx     # User telemetry metrics & recent registrations
│   │   │   ├── DocumentRegisterPage.jsx # PDF upload & blockchain anchoring workspace
│   │   │   ├── DocumentVerifyPage.jsx # Authenticated verification tool
│   │   │   ├── DocumentHistoryPage.jsx # Document ledger & verification inquiry history
│   │   │   └── DocumentDetailsModal.jsx # Cryptographic audit record viewer
│   │   └── admin/
│   │       ├── AdminDashboard.jsx    # System metrics & smart contract bindings
│   │       ├── AdminUsersPage.jsx    # User management & account activation toggles
│   │       └── AdminAuditLogsPage.jsx # Immutable PostgreSQL audit trail explorer
│   └── utils/
│       ├── constants.js              # System roles & verification status metadata
│       └── formatters.js             # Byte formatting, date formatting, hash truncation
```

---

## 3. UI/UX Design System & Color Palette

The interface follows a modern, authoritative cybersecurity theme:
- **Navy Primary (`#0f172a`, `#1e293b`)**: Provides high contrast, stability, and professional academic appearance.
- **Slate Primary Background (`#f8fafc`)**: Ensures readability and reduces eye strain across data tables.
- **Accent Blues (`#2563eb`, `#38bdf8`)**: Highlights interactive actions, primary buttons, and blockchain telemetry.
- **Status Green (`#059669`, `#ecfdf5`)**: Designates `AUTHENTIC` and on-chain anchored documents.
- **Status Red (`#dc2626`, `#fef2f2`)**: Clearly flags `TAMPERED` document content discrepancies.
- **Status Amber (`#d97706`, `#fffbeb`)**: Designates `NOT_REGISTERED` documents.
- **Monospace Font (`JetBrains Mono`, `Consolas`)**: Formats 64-character SHA-256 digests, contract addresses, and transaction hashes for error-free visual auditing.

---

## 4. API Integration & Real Backend Endpoint Mapping

All application forms and views connect to real backend endpoints:

| Frontend View / Component | Backend REST Endpoint | Functionality |
|---|---|---|
| `LoginPage.jsx` | `POST /api/auth/login` | Validates credentials, sets HTTP-only cookie |
| `RegisterPage.jsx` | `POST /api/auth/register` | Creates account with encrypted password |
| `AuthContext.jsx` | `GET /api/auth/me` | Validates active cookie session on mount |
| `Navbar.jsx` / `Sidebar.jsx` | `POST /api/auth/logout` | Clears HTTP-only cookie session |
| `DocumentRegisterPage.jsx` | `POST /api/documents/upload-and-register` | Uploads PDF & anchors onto blockchain |
| `DocumentRegisterPage.jsx` | `POST /api/documents/upload` | Uploads PDF and computes hash |
| `DocumentDetailsModal.jsx` | `POST /api/documents/:id/register` | Anchors pending document to smart contract |
| `DocumentHistoryPage.jsx` | `GET /api/documents` | Lists documents with pagination & search |
| `DocumentDetailsModal.jsx` | `GET /api/documents/:id` | Loads full cryptographic record & tx metadata |
| `PublicVerifyPage.jsx` | `POST /api/verification/verify-file` | Verifies uploaded PDF file |
| `PublicVerifyPage.jsx` | `POST /api/verification/verify-hash` | Verifies SHA-256 hash string directly |
| `DocumentHistoryPage.jsx` | `GET /api/verification/history` | Lists recorded verification audits |
| `AdminDashboard.jsx` | `GET /api/admin/stats` | Fetches platform telemetry & status counts |
| `AdminUsersPage.jsx` | `GET /api/admin/users` | Lists users with pagination & role filtering |
| `AdminUsersPage.jsx` | `PATCH /api/admin/users/:id` | Toggles user active state or updates role |
| `AdminAuditLogsPage.jsx` | `GET /api/admin/audit-logs` | Queries PostgreSQL audit logs & IP addresses |
| `LandingPage.jsx` | `GET /api/blockchain/status` | Queries blockchain RPC node & contract address |

---

## 5. End-to-End Verification User Experience

The verification workflow provides clear visual feedback:
1. **User Action**: The user uploads a candidate PDF file or pastes a 64-character SHA-256 hash, optionally entering a claimed reference code (e.g. `DOC-20261101-ABCD`).
2. **Backend Processing**: The server extracts raw bytes, calculates SHA-256, and queries `DocumentRegistry.sol` on the Ethereum blockchain.
3. **Tri-State Rendering**:
   - `AUTHENTIC`: Visual green badge, confirmed block number, submitter wallet address, and registration timestamp.
   - `TAMPERED`: Visual red warning alert displaying a side-by-side comparison of the **expected baseline hash** versus the **actual candidate hash**, explaining that content has been altered.
   - `NOT_REGISTERED`: Visual amber alert indicating that the file hash is unknown to the registry.

---

## 6. How to Run the Complete Stack (PowerShell)

### Step 1: Start the Backend Server (Terminal 1)
```powershell
# Navigate to project root
cd "C:\Users\Web developer\Desktop\chainproof-document-verification"

# Start the Node.js/Express backend on port 5000
npm start
```

### Step 2: Start the Frontend Application (Terminal 2)
```powershell
# Open a second PowerShell terminal and navigate to frontend directory
cd "C:\Users\Web developer\Desktop\chainproof-document-verification\frontend"

# Launch the Vite development server on port 3000
npm run dev
```

### Step 3: Access the Application in Browser
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 7. Pre-Seeded Accounts for Seminar Demonstration

| Role | Institutional Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@chainproof.local` | `AdminPass123!` | Full system metrics, user deactivation/promotion, audit logs |
| **Researcher** | `researcher@chainproof.local` | `UserPass123!` | Document registration, verification audits, personal history |

