# Render Deployment & Verification Guide: ChainProof System

**Project:** Blockchain-Based Document Integrity Verification System  
**Hosting Infrastructure:** Render Only (Web Service + Static Site + Managed PostgreSQL)  
**Deployment Target:** University Seminar Implementation Defense  

---

## 1. Architecture Overview on Render

```
                                      +------------------------------------+
                                      |            Render Cloud            |
                                      +------------------------------------+
                                                        |
                        +-------------------------------+-------------------------------+
                        |                                                               |
                        v                                                               v
      +-----------------------------------+                           +-----------------------------------+
      |      ChainProof Frontend          |                           |       ChainProof Backend          |
      |       (Render Static Site)        |                           |       (Render Web Service)        |
      |   chainproof-frontend.onrender.com|                           |   chainproof-backend.onrender.com |
      |-----------------------------------|                           |-----------------------------------|
      | - Vite + React 18 SPA             |   HTTPS / CORS with       | - Node.js ESM Express API         |
      | - Single Page App Rewrite         |   Credentials             | - Port 0.0.0.0:$PORT              |
      | - Dual Auth: Cookies + Bearer     | ------------------------> | - Rate Limiting & Helmet          |
      | - Dynamic Base URL Resolution     |                           | - SHA-256 Engine                  |
      +-----------------------------------+                           +-----------------------------------+
                                                                                        |
                                                        +-------------------------------+-------------------------------+
                                                        |                                                               |
                                                        v                                                               v
                                      +-----------------------------------+                           +-----------------------------------+
                                      |       ChainProof Database         |                           |      Blockchain Testnet/RPC       |
                                      |     (Render PostgreSQL DB)        |                           |       (Sepolia / Hardhat)         |
                                      |-----------------------------------|                           |-----------------------------------|
                                      | - Users (Admin & Standard)        |                           | - DocumentRegistry Contract       |
                                      | - Documents & File Metadata       |                           | - Immutable Registration Events   |
                                      | - Verification History & Audits   |                           | - SHA-256 Hash Proofs             |
                                      +-----------------------------------+                           +-----------------------------------+
```

---

## 2. Pre-Deployment Verification Status

All local pre-deployment verifications are **passing 100%**:

| Component | Status | Details |
| :--- | :--- | :--- |
| **Backend Integration & Unit Tests** | `PASS` (47 / 47 passed) | Auth, Documents, Verification, Blockchain, RBAC, Hashes |
| **Smart Contract Tests** | `PASS` (9 / 9 passed) | DocumentRegistry Solidity v0.8.20 compiled & tested |
| **Frontend Production Build** | `PASS` (Vite 5.4.14) | Minified bundle + `_redirects` SPA rewrite rule |
| **Git Tracking & Security** | `PASS` (Clean commit) | `.env` ignored, no secrets staged, 118 files committed |
| **Dual Authentication** | `READY` | HTTP-only Cookies (`SameSite=None; Secure`) + Bearer Token |
| **Infrastructure-as-Code** | `READY` | `render.yaml` Blueprint created for automated stack deployment |

---

## 3. Step 1: Push Code to GitHub

Your local git repository is initialized and committed.

### Execute on your machine:
```bash
# 1. Create a new repository on GitHub (e.g. named: chainproof-document-verification)
# Do NOT initialize with README or .gitignore (they already exist locally)

# 2. Add your GitHub remote:
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/chainproof-document-verification.git

# 3. Rename branch to main (if preferred) and push:
git branch -M main
git push -u origin main
```

---

## 4. Step 2: Connect GitHub to Render

1. Log in to [Render](https://dashboard.render.com/).
2. Click **Account Settings** (top-right profile icon).
3. Under **Connected Accounts**, verify or connect your **GitHub** account.
4. Grant Render access to the `chainproof-document-verification` repository.

---

## 5. Step 3: Deploy Option A — Automated Blueprint (Recommended)

Render provides native **Infrastructure as Code** using the included `render.yaml`:

1. In the Render Dashboard, click **New +** in the top navigation bar.
2. Select **Blueprint**.
3. Select your GitHub repository: `chainproof-document-verification`.
4. Render will read `render.yaml` and display the three provisioned services:
   - **`chainproof-db`**: PostgreSQL Managed Database
   - **`chainproof-backend`**: Node.js Web Service
   - **`chainproof-frontend`**: Static Site
5. Click **Apply**.
6. Render will automatically:
   - Provision the PostgreSQL database.
   - Run migrations (`npm run db:migrate`) and seed initial accounts (`npm run db:seed`).
   - Wire `DATABASE_URL` directly into the backend.
   - Wire backend URL into frontend `VITE_API_URL`.
   - Wire frontend URL into backend `CLIENT_ORIGIN`.

---

## 6. Step 4: Deploy Option B — Manual Dashboard Configuration

If you prefer configuring each service individually in the Render Dashboard:

### A. Create the PostgreSQL Database
1. Click **New +** -> **PostgreSQL**.
2. **Name:** `chainproof-db`
3. **Database Name:** `chainproof`
4. **User:** `chainproof_user`
5. **Region:** Oregon (US West) or your closest region.
6. **Plan:** Free
7. Click **Create Database**.
8. Once created, copy the **Internal Database URL** (e.g. `postgres://chainproof_user:...@dpg-...-a/chainproof`).

---

### B. Create the Backend Web Service
1. Click **New +** -> **Web Service**.
2. Select repository: `chainproof-document-verification`.
3. Fill in the following exact settings:
   - **Name:** `chainproof-backend`
   - **Region:** Same region as your database (e.g. Oregon).
   - **Branch:** `main` (or `master`)
   - **Root Directory:** *(leave blank for root)*
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     npm install && npm run db:migrate && npm run db:seed
     ```
   - **Start Command:**
     ```bash
     npm start
     ```
   - **Plan:** Free
   - **Health Check Path:** `/api/health`
4. Expand **Environment Variables** and add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` *(or leave blank; Render assigns it automatically)*
   - `DATABASE_URL` = *(Paste Internal Database URL from step A)*
   - `CLIENT_ORIGIN` = `https://chainproof-frontend.onrender.com` *(Update after frontend is created)*
   - `JWT_SECRET` = *(Generate a random 32+ character string or click Generate)*
   - `COOKIE_SECRET` = *(Generate a random 32+ character string or click Generate)*
   - `COOKIE_SECURE` = `true`
   - `BLOCKCHAIN_NETWORK` = `sepolia`
   - `BLOCKCHAIN_RPC_URL` = `https://rpc.sepolia.org`
   - `CONTRACT_ADDRESS` = `0x5FbDB2315678afecb367f032d93F642f64180aa3`
   - `UPLOAD_STORAGE_DIR` = `./storage/documents`
   - `UPLOAD_MAX_FILE_SIZE_MB` = `15`
5. Click **Create Web Service**.

---

### C. Create the Frontend Static Site
1. Click **New +** -> **Static Site**.
2. Select repository: `chainproof-document-verification`.
3. Fill in the following exact settings:
   - **Name:** `chainproof-frontend`
   - **Branch:** `main` (or `master`)
   - **Root Directory:** `frontend`
   - **Build Command:**
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory:** `dist`
4. Expand **Redirects/Rewrites** and add:
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`
   *(Also already handled automatically by `frontend/public/_redirects`)*
5. Expand **Environment Variables** and add:
   - `VITE_API_URL` = `https://chainproof-backend.onrender.com/api` *(Use your actual backend URL)*
6. Click **Create Static Site**.

---

## 7. Step 5: Post-Deployment Verification Checklist

Once Render marks both services as **Live**, execute this test checklist:

### 1. Backend Health Check
Visit in browser:
```
https://chainproof-backend.onrender.com/api/health
```
**Expected Response:**
```json
{
  "success": true,
  "message": "ChainProof Document Verification API is operational.",
  "timestamp": "2026-11-01T..."
}
```

### 2. Frontend Public Landing Page
Visit in browser:
```
https://chainproof-frontend.onrender.com
```
- Verify the UI loads cleanly with Navy/slate styling.
- Verify the SHA-256 and Blockchain explanation cards render.

### 3. Public Verification Test
1. Click **Verify Document** on the navigation bar (`/verify`).
2. Input an unregistered SHA-256 hash (e.g. `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`).
3. Verify the status returns **`NOT REGISTERED`** (never erroneously TAMPERED).

### 4. Admin & User Authentication
Log in with the seeded accounts:
- **System Administrator:**
  - Email: `admin@chainproof.local`
  - Password: `AdminPass123!`
  - Role: `ADMIN` -> Access to `/admin`, audit logs, and user management.
- **Academic Researcher:**
  - Email: `researcher@chainproof.local`
  - Password: `UserPass123!`
  - Role: `USER` -> Access to `/dashboard`, document upload, and registration history.

### 5. End-to-End Document Registration
1. In the User Dashboard, click **Register Document**.
2. Upload any test PDF file.
3. Observe client-side byte-level SHA-256 computation.
4. Click **Register Document on Blockchain**.
5. Verify transaction record appears in **Document History**.

