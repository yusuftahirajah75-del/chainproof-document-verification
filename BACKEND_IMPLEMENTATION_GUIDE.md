# Backend Implementation & Operational Guide: ChainProof Document Verification System

This comprehensive technical guide outlines the architecture, installation, configuration, smart contract deployment, database migration, automated testing, and execution lifecycle for the **ChainProof Document Integrity Verification System**.

---

## 1. System Requirements & Prerequisites

Ensure the following runtimes and services are accessible:
- **Node.js**: v20.x or higher (tested on Node.js v24.x, ES Modules).
- **PostgreSQL**: PostgreSQL 14+ (tested on PostgreSQL 17/18, running on port 5432).
- **Hardhat**: Ethereum development suite for contract compilation, testing, and deployment.
- **Operating System**: Windows (PowerShell), Linux, or macOS.

---

## 2. Environment Configuration

All environment variables are declared in `.env` (derived from `.env.example`).

```env
# Application Server
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chainproof_dev
DB_USER=postgres
DB_PASSWORD=postgres
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT_MS=30000

# Security & Authentication
JWT_SECRET=super_secret_jwt_chainproof_key_change_in_production_min_32_chars
JWT_EXPIRES_IN=24h
COOKIE_SECRET=super_secret_cookie_parser_secret_change_in_prod
COOKIE_SECURE=false

# Document Storage & Upload Limits
UPLOAD_STORAGE_DIR=./storage/documents
UPLOAD_MAX_FILE_SIZE_MB=15

# Blockchain Network Configuration
BLOCKCHAIN_NETWORK=localhost
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=
BLOCKCHAIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=20
```

---

## 3. Step-by-Step Installation & Lifecycle Commands (PowerShell)

### Step 3.1: Install Dependencies
```powershell
npm install
```

### Step 3.2: Database Preparation & Migrations
Create databases in PostgreSQL if they do not exist:
```powershell
$env:PGPASSWORD="postgres"
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE chainproof_dev;"
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE chainproof_test;"
```

Run schema migrations to establish all tables, UUID extensions, and indexes:
```powershell
npm run db:migrate
```

Seed the default administrator and research accounts:
```powershell
npm run db:seed
```
*Default Seeded Credentials:*
- **Administrator**: `admin@chainproof.local` / `AdminPass123!` (Role: `ADMIN`)
- **Researcher**: `researcher@chainproof.local` / `UserPass123!` (Role: `USER`)

---

### Step 3.3: Smart Contract Lifecycle

1. **Compile the Solidity Contract**:
```powershell
npx hardhat --config hardhat.config.cjs compile
```

2. **Execute Smart Contract Unit Tests**:
```powershell
npx hardhat --config hardhat.config.cjs test
```

3. **Start Local Hardhat Blockchain Node** (in a dedicated PowerShell terminal):
```powershell
npx hardhat --config hardhat.config.cjs node
```

4. **Deploy Contract to Local Node**:
```powershell
npx hardhat --config hardhat.config.cjs run scripts/deploy.js --network localhost
```
*The deployment script automatically persists contract address metadata to `src/config/contractDeployment.json`, enabling seamless zero-config backend discovery.*

---

### Step 3.4: Automated Test Execution

Execute full integration, unit, and security test suites using Jest:
```powershell
npm test
```

Generate test coverage reports:
```powershell
npm run test:coverage
```

---

### Step 3.5: Start the Backend Server

Start in development mode with auto-reload:
```powershell
npm run dev
```

Start in production mode:
```powershell
npm start
```

---

## 4. Key Component Implementation Details

### 4.1. `HashService.js`
Computes cryptographic SHA-256 digests over raw byte streams and converts them into `bytes32` hexadecimal strings formatted for EVM smart contracts.
- **Why**: File names, timestamps, and metadata can be spoofed; only raw bytes provide immutable guarantees.

### 4.2. `DocumentService.js`
Handles the PDF document intake pipeline:
- Validates magic byte header (`%PDF-`).
- Computes SHA-256 from bytes.
- Queries `document_hashes` to prevent duplicate uploads.
- Issues unique tracking references (`DOC-YYYYMMDD-XXXX`).
- Saves files into non-public `./storage/documents` with random UUID naming.
- Dispatches blockchain registration transactions.

### 4.3. `VerificationService.js`
Evaluates the three precise integrity outcomes:
- `AUTHENTIC`: Computed SHA-256 matches confirmed blockchain record in `DocumentRegistry.sol`.
- `TAMPERED`: Claimed document reference exists in database records, but the uploaded file's computed hash differs from the baseline registered hash.
- `NOT_REGISTERED`: The computed hash does not exist on-chain and no established registration identity was claimed.

### 4.4. Security Middleware
- `uploadMiddleware.js`: Multer PDF restriction and byte header inspection.
- `authMiddleware.js`: Reads JWT from HTTP-only cookie or Bearer header; verifies active status in PostgreSQL.
- `roleMiddleware.js`: Restricts administrative routes to `ADMIN` users.
- `errorMiddleware.js`: Sanitizes error stacks in production and standardizes responses.

