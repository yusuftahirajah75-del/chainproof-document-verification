# ChainProof REST API Documentation

Base URL: `http://localhost:5000/api`

All JSON responses follow a uniform envelope structure:

```json
{
  "success": true,
  "message": "Human readable summary",
  "data": { ... }
}
```

Or for paginated collections:

```json
{
  "success": true,
  "message": "Human readable summary",
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1. Register Account
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Rate Limit**: 20 requests per 15 minutes
- **Request Body**:
  ```json
  {
    "email": "alice@university.edu",
    "password": "StrongPassword123!",
    "fullName": "Alice Researcher",
    "organization": "Department of Computer Science"
  }
  ```
- **Responses**:
  - `201 Created`: User registered; returns user profile, JWT token, and sets HTTP-only `token` cookie.
  - `400 Bad Request`: Validation failure (weak password, invalid email).
  - `409 Conflict`: Email address is already in use.

### 1.2. Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Rate Limit**: 20 requests per 15 minutes
- **Request Body**:
  ```json
  {
    "email": "alice@university.edu",
    "password": "StrongPassword123!"
  }
  ```
- **Responses**:
  - `200 OK`: Login successful; returns user profile, JWT token, and sets HTTP-only `token` cookie.
  - `401 Unauthorized`: Invalid email or password credentials.
  - `403 Forbidden`: Account deactivated by administrator.

### 1.3. Logout
- **Endpoint**: `POST /api/auth/logout`
- **Access**: Public
- **Responses**:
  - `200 OK`: Clears HTTP-only `token` cookie.

### 1.4. Current User Session
- **Endpoint**: `GET /api/auth/me`
- **Access**: Authenticated (via cookie or `Authorization: Bearer <token>`)
- **Responses**:
  - `200 OK`: Returns authenticated user profile.
  - `401 Unauthorized`: No active session.

---

## 2. Document Management Endpoints (`/api/documents`)

*All document endpoints require authentication.*

### 2.1. Upload Document
- **Endpoint**: `POST /api/documents/upload`
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `document`: PDF file (`.pdf`, max 15MB)
  - `title`: String (3-255 characters)
  - `description`: String (optional)
- **Responses**:
  - `201 Created`: Computes byte SHA-256 hash, creates document reference, and stores document in `./storage/documents`.
  - `400 Bad Request`: Missing file, non-PDF MIME, or failed `%PDF-` magic bytes check.
  - `409 Conflict`: Duplicate document detected (hash already exists in database).

### 2.2. Register Document on Blockchain
- **Endpoint**: `POST /api/documents/:id/register`
- **Access**: Document Owner or ADMIN
- **Responses**:
  - `200 OK`: Submits SHA-256 hash to `DocumentRegistry.sol`, logs transaction in `blockchain_transactions`, updates document status to `REGISTERED`.
  - `400 Bad Request`: Document has already been registered on-chain.
  - `403 Forbidden`: Not authorized to register this document.
  - `404 Not Found`: Document not found.

### 2.3. Upload and Register in One Step
- **Endpoint**: `POST /api/documents/upload-and-register`
- **Content-Type**: `multipart/form-data`
- **Form Fields**: Same as `POST /api/documents/upload`
- **Responses**:
  - `201 Created`: Uploads, computes hash, executes blockchain transaction, and returns confirmed state.

### 2.4. List Documents
- **Endpoint**: `GET /api/documents`
- **Query Parameters**:
  - `page`: Integer (default: 1)
  - `limit`: Integer (default: 10, max: 100)
  - `search`: String (searches title and reference)
  - `status`: String (`PENDING_REGISTRATION`, `REGISTERED`, `REVOKED`, `FAILED`)
- **Responses**:
  - `200 OK`: Paginated list of documents with blockchain hashes and status.

### 2.5. Get Document Details
- **Endpoint**: `GET /api/documents/:id`
- **Responses**:
  - `200 OK`: Full document metadata, owner details, hash, and blockchain transaction details.
  - `403 Forbidden`: Access denied.
  - `404 Not Found`: Document not found.

---

## 3. Document Verification Endpoints (`/api/verification`)

### 3.1. Verify by SHA-256 Hash
- **Endpoint**: `POST /api/verification/verify-hash`
- **Access**: Public (Optional authentication tracks verifier)
- **Rate Limit**: 60 requests per 15 minutes
- **Request Body**:
  ```json
  {
    "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "documentReference": "DOC-20261101-ABCD"
  }
  ```
  *(Note: `documentReference` is optional. Provide it when verifying against a known registration identity).*
- **Responses**:
  - `200 OK`:
    - `status`: `AUTHENTIC` | `TAMPERED` | `NOT_REGISTERED`
    - `matchedOnChain`: Boolean
    - `details`: Metadata breakdown, expected vs actual hash, submitter address, and timestamps.

### 3.2. Verify by PDF File Upload
- **Endpoint**: `POST /api/verification/verify-file`
- **Access**: Public (Optional authentication tracks verifier)
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `document`: PDF file to inspect
  - `documentReference`: (Optional) Claimed reference code
- **Responses**:
  - `200 OK`: Computes raw file SHA-256 hash, runs full verification against blockchain and database, records verification record, and cleans up uploaded file.

### 3.3. Verification History
- **Endpoint**: `GET /api/verification/history`
- **Access**: Authenticated (Users see their audits; ADMIN sees all)
- **Query Parameters**: `page`, `limit`, `status`
- **Responses**:
  - `200 OK`: Paginated verification records.

---

## 4. Blockchain Query Endpoints (`/api/blockchain`)

### 4.1. Blockchain & Contract Status
- **Endpoint**: `GET /api/blockchain/status`
- **Access**: Public
- **Responses**:
  - `200 OK`: Current RPC endpoint, connection state, latest block number, and configured contract address.

### 4.2. Transaction Lookup
- **Endpoint**: `GET /api/blockchain/tx/:txHash`
- **Access**: Public
- **Responses**:
  - `200 OK`: Block number, timestamp, gas used, confirmations, and transaction status.

### 4.3. Direct On-Chain Hash Lookup
- **Endpoint**: `GET /api/blockchain/verify/:hash`
- **Access**: Public
- **Responses**:
  - `200 OK`: Query result directly from `DocumentRegistry.sol` contract.

---

## 5. Administrative Endpoints (`/api/admin`)

*All administrative endpoints require authentication and `role: "ADMIN"`.*

### 5.1. System Overview Metrics
- **Endpoint**: `GET /api/admin/stats`
- **Responses**:
  - `200 OK`: Metrics including total users, total documents, registered documents on-chain, and verification status breakdown.

### 5.2. User Management
- **Endpoint**: `GET /api/admin/users`
- **Query Parameters**: `page`, `limit`, `role`
- **Responses**:
  - `200 OK`: Paginated user list.

### 5.3. Update User Status / Role
- **Endpoint**: `PATCH /api/admin/users/:id`
- **Request Body**:
  ```json
  {
    "isActive": false,
    "role": "ADMIN"
  }
  ```
- **Responses**:
  - `200 OK`: User updated and audit trail logged.

### 5.4. Audit Logs Explorer
- **Endpoint**: `GET /api/admin/audit-logs`
- **Query Parameters**: `page`, `limit`, `action`, `entityType`, `userId`
- **Responses**:
  - `200 OK`: System audit records with client IP addresses and user agents.

