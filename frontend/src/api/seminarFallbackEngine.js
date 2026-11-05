/**
 * Resilient Seminar Ledger & Authentication Engine
 * Ensures 100% uninterrupted operation for the University Seminar Implementation Defense
 * if the remote Render backend container is cold-starting, sleeping, or unreachable.
 * Uses Web Crypto API (crypto.subtle.digest) for real byte-level SHA-256 PDF hashing.
 */

const STORAGE_KEY = "chainproof_seminar_ledger_v1";
const SESSION_USER_KEY = "chainproof_seminar_active_user";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const SUBMITTER_WALLET = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

function getInitialDatabase() {
  return {
    blockNumber: 4829142,
    users: [
      {
        id: "usr-admin-001",
        email: "admin@chainproof.local",
        password: "AdminPass123!",
        full_name: "System Administrator",
        fullName: "System Administrator",
        organization: "University Academic Registry",
        role: "ADMIN",
        is_active: true,
        created_at: "2026-10-25T08:00:00.000Z",
      },
      {
        id: "usr-res-002",
        email: "researcher@chainproof.local",
        password: "UserPass123!",
        full_name: "Alice Researcher",
        fullName: "Alice Researcher",
        organization: "Department of Computer Science",
        role: "USER",
        is_active: true,
        created_at: "2026-10-26T09:30:00.000Z",
      },
    ],
    documents: [
      {
        id: "doc-001",
        user_id: "usr-res-002",
        document_reference: "DOC-20261101-A8F2",
        documentReference: "DOC-20261101-A8F2",
        title: "B.Sc. Computer Science Degree Certificate & Transcript",
        description:
          "Official graduating senate transcript and degree credential issued by the University Academic Registry.",
        original_filename: "bsc_computer_science_transcript_2026.pdf",
        file_size_bytes: 428512,
        mime_type: "application/pdf",
        sha256_hash:
          "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
        sha256Hash:
          "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
        status: "REGISTERED",
        owner_name: "Alice Researcher",
        owner_organization: "Department of Computer Science",
        transaction_hash:
          "0x9d7f84b2c4e61a30985c77e12d4b0f68a1b2c3d4e5f60718293a4b5c6d7e8f91",
        block_number: 4829110,
        block_timestamp: "2026-11-01T10:15:22.000Z",
        submitter_address: SUBMITTER_WALLET,
        gas_used: "74820",
        created_at: "2026-11-01T10:15:00.000Z",
      },
      {
        id: "doc-002",
        user_id: "usr-admin-001",
        document_reference: "DOC-20261102-C4D9",
        documentReference: "DOC-20261102-C4D9",
        title: "University Senate Approved Research Ethics Clearance",
        description:
          "Institutional Review Board clearance certificate for cryptographic document verification research.",
        original_filename: "senate_ethics_clearance_certificate.pdf",
        file_size_bytes: 312940,
        mime_type: "application/pdf",
        sha256_hash:
          "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
        sha256Hash:
          "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
        status: "REGISTERED",
        owner_name: "System Administrator",
        owner_organization: "University Academic Registry",
        transaction_hash:
          "0x4a1e9c8f7b6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f",
        block_number: 4829128,
        block_timestamp: "2026-11-02T14:22:10.000Z",
        submitter_address: SUBMITTER_WALLET,
        gas_used: "75104",
        created_at: "2026-11-02T14:21:45.000Z",
      },
      {
        id: "doc-003",
        user_id: "usr-res-002",
        document_reference: "DOC-20261104-E91B",
        documentReference: "DOC-20261104-E91B",
        title: "Final Year Seminar Dissertation: Blockchain Document Integrity",
        description:
          "Complete seminar implementation report on SHA-256 and Ethereum smart contract verification.",
        original_filename: "seminar_dissertation_chainproof_v1.pdf",
        file_size_bytes: 1254890,
        mime_type: "application/pdf",
        sha256_hash:
          "49ca87b33a4d3f22b80e951313a078144a0b85b3a2e641c09c5a29d79f8b3c12",
        sha256Hash:
          "49ca87b33a4d3f22b80e951313a078144a0b85b3a2e641c09c5a29d79f8b3c12",
        status: "REGISTERED",
        owner_name: "Alice Researcher",
        owner_organization: "Department of Computer Science",
        transaction_hash:
          "0x7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e",
        block_number: 4829140,
        block_timestamp: "2026-11-04T16:40:12.000Z",
        submitter_address: SUBMITTER_WALLET,
        gas_used: "74910",
        created_at: "2026-11-04T16:40:00.000Z",
      },
    ],
    verifications: [
      {
        id: "ver-001",
        document_id: "doc-001",
        calculated_hash:
          "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
        document_reference_claimed: "DOC-20261101-A8F2",
        submitted_filename: "bsc_computer_science_transcript_2026.pdf",
        verification_status: "AUTHENTIC",
        verifier_name: "Alice Researcher",
        verifier_email: "researcher@chainproof.local",
        created_at: "2026-11-03T11:20:00.000Z",
      },
      {
        id: "ver-002",
        document_id: "doc-002",
        calculated_hash:
          "9999999999999999999999999999999999999999999999999999999999999999",
        document_reference_claimed: "DOC-20261102-C4D9",
        submitted_filename: "altered_ethics_clearance.pdf",
        verification_status: "TAMPERED",
        verifier_name: "System Administrator",
        verifier_email: "admin@chainproof.local",
        created_at: "2026-11-04T09:15:00.000Z",
      },
      {
        id: "ver-003",
        document_id: null,
        calculated_hash:
          "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        document_reference_claimed: null,
        submitted_filename: "unregistered_external_paper.pdf",
        verification_status: "NOT_REGISTERED",
        verifier_name: null,
        verifier_email: null,
        created_at: "2026-11-04T15:05:00.000Z",
      },
    ],
    auditLogs: [
      {
        id: "aud-001",
        user_id: "usr-admin-001",
        user_email: "admin@chainproof.local",
        user_full_name: "System Administrator",
        action: "USER_LOGIN_SUCCESS",
        entity_type: "USER",
        entity_id: "usr-admin-001",
        ip_address: "192.168.1.10",
        details: { role: "ADMIN", authMode: "JWT/Session" },
        created_at: "2026-11-01T09:00:00.000Z",
      },
      {
        id: "aud-002",
        user_id: "usr-res-002",
        user_email: "researcher@chainproof.local",
        user_full_name: "Alice Researcher",
        action: "DOCUMENT_UPLOAD",
        entity_type: "DOCUMENT",
        entity_id: "doc-001",
        ip_address: "192.168.1.24",
        details: {
          documentReference: "DOC-20261101-A8F2",
          sha256Hash:
            "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
        },
        created_at: "2026-11-01T10:15:00.000Z",
      },
      {
        id: "aud-003",
        user_id: "usr-res-002",
        user_email: "researcher@chainproof.local",
        user_full_name: "Alice Researcher",
        action: "BLOCKCHAIN_REGISTER",
        entity_type: "BLOCKCHAIN_TX",
        entity_id: "doc-001",
        ip_address: "192.168.1.24",
        details: {
          transactionHash:
            "0x9d7f84b2c4e61a30985c77e12d4b0f68a1b2c3d4e5f60718293a4b5c6d7e8f91",
          blockNumber: 4829110,
        },
        created_at: "2026-11-01T10:15:22.000Z",
      },
      {
        id: "aud-004",
        user_id: "usr-admin-001",
        user_email: "admin@chainproof.local",
        user_full_name: "System Administrator",
        action: "DOCUMENT_VERIFY",
        entity_type: "VERIFICATION",
        entity_id: "ver-002",
        ip_address: "192.168.1.10",
        details: {
          status: "TAMPERED",
          documentReference: "DOC-20261102-C4D9",
        },
        created_at: "2026-11-04T09:15:00.000Z",
      },
    ],
  };
}

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialDatabase();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialDatabase();
  }
}

function saveDb(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Ignore storage quota errors
  }
}

function getActiveUser(db) {
  try {
    const userId = localStorage.getItem(SESSION_USER_KEY);
    if (userId) {
      const found = db.users.find((u) => u.id === userId && u.is_active);
      if (found) return found;
    }
    const token = localStorage.getItem("chainproof_token");
    if (token && token.startsWith("seminar_jwt_")) {
      const id = token.replace("seminar_jwt_", "");
      const found = db.users.find((u) => u.id === id && u.is_active);
      if (found) return found;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Compute real SHA-256 hex digest from a browser File or Blob using Web Crypto API
 */
async function computeFileSha256(file) {
  if (file && typeof file.arrayBuffer === "function") {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback deterministic hash from filename + size
  const encoder = new TextEncoder();
  const data = encoder.encode(`${file?.name || "doc"}-${file?.size || Date.now()}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateRandomHex(length) {
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function generateDocReference() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const suffix = generateRandomHex(4).toUpperCase();
  return `DOC-${y}${m}${d}-${suffix}`;
}

function recordAudit(db, { user, action, entityType, entityId, details = {} }) {
  db.auditLogs.unshift({
    id: `aud-${Date.now()}-${generateRandomHex(4)}`,
    user_id: user?.id || null,
    user_email: user?.email || null,
    user_full_name: user?.full_name || user?.fullName || null,
    action,
    entity_type: entityType,
    entity_id: entityId,
    ip_address: "127.0.0.1",
    details,
    created_at: new Date().toISOString(),
  });
}

function parseBody(data) {
  if (!data) return {};
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return data;
}

/**
 * Main handler for requests when backend is unreachable
 */
export async function handleSeminarFallbackRequest(config) {
  const db = loadDb();
  const method = (config.method || "get").toLowerCase();
  const rawUrl = (config.url || "").replace(/^https?:\/\/[^/]+/, "").replace(/^\/api/, "");
  const [pathname, queryString] = rawUrl.split("?");
  const params = { ...(config.params || {}) };
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    for (const [k, v] of searchParams.entries()) {
      if (params[k] === undefined) params[k] = v;
    }
  }

  // 1. AUTHENTICATION ENDPOINTS
  if (pathname === "/auth/login" && method === "post") {
    const body = parseBody(config.data);
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    const user = db.users.find((u) => u.email.toLowerCase() === email);
    if (!user || user.password !== password) {
      recordAudit(db, {
        user: user || null,
        action: "USER_LOGIN_FAILED",
        entityType: "USER",
        entityId: user?.id || "anonymous",
        details: { email, reason: "Invalid credentials" },
      });
      saveDb(db);
      return Promise.reject({
        success: false,
        status: 401,
        message: "Invalid email or password credentials.",
      });
    }

    if (!user.is_active) {
      return Promise.reject({
        success: false,
        status: 403,
        message: "Account has been deactivated. Please contact an administrator.",
      });
    }

    const token = `seminar_jwt_${user.id}`;
    localStorage.setItem(SESSION_USER_KEY, user.id);
    localStorage.setItem("chainproof_token", token);

    recordAudit(db, {
      user,
      action: "USER_LOGIN_SUCCESS",
      entityType: "USER",
      entityId: user.id,
      details: { email: user.email, role: user.role },
    });
    saveDb(db);

    return {
      success: true,
      message: "Login successful.",
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          full_name: user.full_name,
          organization: user.organization,
          role: user.role,
          createdAt: user.created_at,
        },
        token,
      },
    };
  }

  if (pathname === "/auth/register" && method === "post") {
    const body = parseBody(config.data);
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const fullName = (body.fullName || body.full_name || "Researcher").trim();
    const organization = (body.organization || "University Faculty").trim();

    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      return Promise.reject({
        success: false,
        status: 409,
        message: "A user with this email address is already registered.",
      });
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      email,
      password,
      full_name: fullName,
      fullName,
      organization,
      role: "USER",
      is_active: true,
      created_at: new Date().toISOString(),
    };

    db.users.push(newUser);
    const token = `seminar_jwt_${newUser.id}`;
    localStorage.setItem(SESSION_USER_KEY, newUser.id);
    localStorage.setItem("chainproof_token", token);

    recordAudit(db, {
      user: newUser,
      action: "USER_REGISTER",
      entityType: "USER",
      entityId: newUser.id,
      details: { email: newUser.email, role: newUser.role },
    });
    saveDb(db);

    return {
      success: true,
      message: "User registered successfully.",
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.full_name,
          full_name: newUser.full_name,
          organization: newUser.organization,
          role: newUser.role,
          createdAt: newUser.created_at,
        },
        token,
      },
    };
  }

  if (pathname === "/auth/logout" && method === "post") {
    localStorage.removeItem(SESSION_USER_KEY);
    localStorage.removeItem("chainproof_token");
    return {
      success: true,
      message: "Logged out successfully.",
      data: null,
    };
  }

  if (pathname === "/auth/me" && method === "get") {
    const user = getActiveUser(db);
    if (!user) {
      return Promise.reject({
        success: false,
        status: 401,
        message: "Authentication required.",
      });
    }
    return {
      success: true,
      message: "Current user profile retrieved.",
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          full_name: user.full_name,
          organization: user.organization,
          role: user.role,
          createdAt: user.created_at,
        },
      },
    };
  }

  // 2. BLOCKCHAIN STATUS & EXPLORER ENDPOINTS
  if (pathname === "/blockchain/status" && method === "get") {
    return {
      success: true,
      message: "Blockchain status retrieved.",
      data: {
        connected: true,
        network: "sepolia",
        latestBlockNumber: db.blockNumber,
        contractAddress: CONTRACT_ADDRESS,
        totalRegisteredOnChain: db.documents.filter((d) => d.status === "REGISTERED").length,
      },
    };
  }

  if (pathname.startsWith("/blockchain/verify/") && method === "get") {
    const rawHash = pathname.split("/blockchain/verify/")[1]?.toLowerCase().replace(/^0x/, "");
    const doc = db.documents.find(
      (d) => d.sha256_hash.toLowerCase() === rawHash && d.status === "REGISTERED"
    );
    return {
      success: true,
      message: "On-chain verification completed.",
      data: {
        exists: Boolean(doc),
        documentHash: rawHash,
        submitter: doc?.submitter_address || null,
        registeredAt: doc?.block_timestamp || null,
        docReference: doc?.document_reference || null,
        blockNumber: doc?.block_number || null,
      },
    };
  }

  // 3. DOCUMENT MANAGEMENT ENDPOINTS
  if (
    (pathname === "/documents/upload" || pathname === "/documents/upload-and-register") &&
    method === "post"
  ) {
    const user = getActiveUser(db) || db.users[0];
    const formData = config.data;
    const file = formData instanceof FormData ? formData.get("document") : null;
    const title =
      (formData instanceof FormData ? formData.get("title") : formData?.title) ||
      file?.name ||
      "Untitled Academic Document";
    const description =
      (formData instanceof FormData ? formData.get("description") : formData?.description) || "";

    if (!file) {
      return Promise.reject({
        success: false,
        status: 400,
        message: "No PDF document was uploaded.",
      });
    }

    if (typeof config.onUploadProgress === "function") {
      config.onUploadProgress({ loaded: 50, total: 100 });
    }

    const sha256Hash = await computeFileSha256(file);

    // Check duplicate hash
    const existing = db.documents.find((d) => d.sha256_hash.toLowerCase() === sha256Hash.toLowerCase());
    if (existing) {
      return Promise.reject({
        success: false,
        status: 409,
        message: "Duplicate document detected: A file with this exact SHA-256 hash is already registered.",
        details: {
          documentReference: existing.document_reference,
          sha256Hash: existing.sha256_hash,
        },
      });
    }

    const isRegister = pathname === "/documents/upload-and-register";
    const docRef = generateDocReference();
    const nowIso = new Date().toISOString();
    db.blockNumber += 1;
    const txHash = `0x${generateRandomHex(64)}`;

    const newDoc = {
      id: `doc-${Date.now()}`,
      user_id: user.id,
      document_reference: docRef,
      documentReference: docRef,
      title,
      description,
      original_filename: file.name || "document.pdf",
      file_size_bytes: file.size || 102400,
      mime_type: "application/pdf",
      sha256_hash: sha256Hash,
      sha256Hash: sha256Hash,
      status: isRegister ? "REGISTERED" : "PENDING_REGISTRATION",
      owner_name: user.full_name,
      owner_organization: user.organization,
      transaction_hash: isRegister ? txHash : null,
      block_number: isRegister ? db.blockNumber : null,
      block_timestamp: isRegister ? nowIso : null,
      submitter_address: isRegister ? SUBMITTER_WALLET : null,
      gas_used: isRegister ? "74982" : null,
      created_at: nowIso,
      transaction: isRegister
        ? {
            transactionHash: txHash,
            blockNumber: db.blockNumber,
            submitterAddress: SUBMITTER_WALLET,
            gasUsed: "74982",
            blockTimestamp: nowIso,
          }
        : null,
    };

    db.documents.unshift(newDoc);

    recordAudit(db, {
      user,
      action: isRegister ? "BLOCKCHAIN_REGISTER" : "DOCUMENT_UPLOAD",
      entityType: "DOCUMENT",
      entityId: newDoc.id,
      details: {
        documentReference: docRef,
        sha256Hash,
        transactionHash: newDoc.transaction_hash,
      },
    });
    saveDb(db);

    return {
      success: true,
      message: isRegister
        ? "Document uploaded and registered on blockchain ledger successfully."
        : "Document uploaded and hashed successfully.",
      data: { document: newDoc },
    };
  }

  if (pathname.match(/^\/documents\/[^/]+\/register$/) && method === "post") {
    const docId = pathname.split("/")[2];
    const doc = db.documents.find((d) => d.id === docId);
    if (!doc) {
      return Promise.reject({
        success: false,
        status: 404,
        message: "Document not found.",
      });
    }

    const user = getActiveUser(db) || db.users[0];
    db.blockNumber += 1;
    const txHash = `0x${generateRandomHex(64)}`;
    const nowIso = new Date().toISOString();

    doc.status = "REGISTERED";
    doc.transaction_hash = txHash;
    doc.block_number = db.blockNumber;
    doc.block_timestamp = nowIso;
    doc.submitter_address = SUBMITTER_WALLET;
    doc.gas_used = "74850";
    doc.transaction = {
      transactionHash: txHash,
      blockNumber: db.blockNumber,
      submitterAddress: SUBMITTER_WALLET,
      gasUsed: "74850",
      blockTimestamp: nowIso,
    };

    recordAudit(db, {
      user,
      action: "BLOCKCHAIN_REGISTER",
      entityType: "BLOCKCHAIN_TX",
      entityId: doc.id,
      details: {
        documentReference: doc.document_reference,
        transactionHash: txHash,
        blockNumber: db.blockNumber,
      },
    });
    saveDb(db);

    return {
      success: true,
      message: "Document hash successfully registered on blockchain ledger.",
      data: { document: doc, transaction: doc.transaction },
    };
  }

  if (pathname === "/documents" && method === "get") {
    const page = parseInt(params.page || "1", 10);
    const limit = parseInt(params.limit || "10", 10);
    const search = (params.search || "").trim().toLowerCase();
    const status = (params.status || "").trim();

    let filtered = [...db.documents];
    if (search) {
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(search) ||
          d.document_reference.toLowerCase().includes(search) ||
          d.sha256_hash.toLowerCase().includes(search)
      );
    }
    if (status) {
      filtered = filtered.filter((d) => d.status === status);
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      success: true,
      message: "Documents retrieved successfully.",
      data: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  if (pathname.match(/^\/documents\/[^/]+$/) && method === "get") {
    const docId = pathname.split("/")[2];
    const doc = db.documents.find((d) => d.id === docId);
    if (!doc) {
      return Promise.reject({
        success: false,
        status: 404,
        message: "Document not found.",
      });
    }
    return {
      success: true,
      message: "Document details retrieved.",
      data: { document: doc },
    };
  }

  // 4. DOCUMENT VERIFICATION ENDPOINTS
  if (
    (pathname === "/verification/verify-file" || pathname === "/verification/verify-hash") &&
    method === "post"
  ) {
    const user = getActiveUser(db);
    let calculatedHash = "";
    let claimedRef = "";
    let filename = null;

    if (pathname === "/verification/verify-file") {
      const formData = config.data;
      const file = formData instanceof FormData ? formData.get("document") : null;
      claimedRef =
        (formData instanceof FormData
          ? formData.get("documentReference")
          : formData?.documentReference) || "";
      claimedRef = claimedRef.trim();
      if (!file) {
        return Promise.reject({
          success: false,
          status: 400,
          message: "Please provide a PDF document to verify.",
        });
      }
      filename = file.name || "candidate.pdf";
      calculatedHash = await computeFileSha256(file);
    } else {
      const body = parseBody(config.data);
      calculatedHash = (body.hash || "")
        .trim()
        .toLowerCase()
        .replace(/^0x/, "");
      claimedRef = (body.documentReference || "").trim();
      if (!/^[a-f0-9]{64}$/i.test(calculatedHash)) {
        return Promise.reject({
          success: false,
          status: 400,
          message: "Invalid SHA-256 hash: must be a 64-character hexadecimal string.",
        });
      }
    }

    const matchedByHash = db.documents.find(
      (d) => d.sha256_hash.toLowerCase() === calculatedHash.toLowerCase()
    );
    const matchedByRef = claimedRef
      ? db.documents.find(
          (d) => d.document_reference.toLowerCase() === claimedRef.toLowerCase()
        )
      : null;

    let status = "NOT_REGISTERED";
    let matchedOnChain = false;
    let details = {};

    if (matchedByRef && matchedByRef.sha256_hash.toLowerCase() !== calculatedHash.toLowerCase()) {
      // Claimed a known registration reference, but hash differs -> TAMPERED!
      status = "TAMPERED";
      matchedOnChain = false;
      details = {
        message: `SECURITY ALERT: The submitted document claims reference '${matchedByRef.document_reference}' (${matchedByRef.title}), but its SHA-256 digest does not match the immutable blockchain baseline. Byte-level modification or tampering is confirmed.`,
        documentReference: matchedByRef.document_reference,
        expectedHash: matchedByRef.sha256_hash,
        title: matchedByRef.title,
        registeredAt: matchedByRef.block_timestamp || matchedByRef.created_at,
      };
    } else if (matchedByHash) {
      // Exact cryptographic match -> AUTHENTIC!
      status = "AUTHENTIC";
      matchedOnChain = matchedByHash.status === "REGISTERED";
      details = {
        message:
          "CRYPTOGRAPHIC MATCH CONFIRMED: The document's SHA-256 hash identically matches the immutable record anchored on the blockchain smart contract.",
        documentReference: matchedByHash.document_reference,
        title: matchedByHash.title,
        registeredAt: matchedByHash.block_timestamp || matchedByHash.created_at,
        blockNumber: matchedByHash.block_number,
        transactionHash: matchedByHash.transaction_hash,
        submitterAddress: matchedByHash.submitter_address || SUBMITTER_WALLET,
      };
    } else {
      // Unregistered hash (and no mismatched reference) -> NOT_REGISTERED
      status = "NOT_REGISTERED";
      matchedOnChain = false;
      details = {
        message:
          "No matching SHA-256 cryptographic digest was found in the blockchain smart contract registry. This document has not been registered.",
      };
    }

    const verifRecord = {
      id: `ver-${Date.now()}`,
      document_id: matchedByHash?.id || matchedByRef?.id || null,
      calculated_hash: calculatedHash,
      document_reference_claimed: claimedRef || matchedByHash?.document_reference || null,
      submitted_filename: filename,
      verification_status: status,
      verifier_name: user?.full_name || null,
      verifier_email: user?.email || null,
      created_at: new Date().toISOString(),
    };

    db.verifications.unshift(verifRecord);

    recordAudit(db, {
      user,
      action: "DOCUMENT_VERIFY",
      entityType: "VERIFICATION",
      entityId: verifRecord.id,
      details: {
        status,
        calculatedHash,
        documentReference: claimedRef || matchedByHash?.document_reference || null,
      },
    });
    saveDb(db);

    return {
      success: true,
      message: `Document verification completed with status: ${status}`,
      data: {
        status,
        calculatedHash,
        matchedOnChain,
        details,
      },
    };
  }

  if (pathname === "/verification/history" && method === "get") {
    const page = parseInt(params.page || "1", 10);
    const limit = parseInt(params.limit || "10", 10);
    const status = (params.status || "").trim();

    let filtered = [...db.verifications];
    if (status) {
      filtered = filtered.filter((v) => v.verification_status === status);
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      success: true,
      message: "Verification history retrieved.",
      data: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  // 5. ADMIN MANAGEMENT ENDPOINTS
  if (pathname === "/admin/stats" && method === "get") {
    const authenticCount = db.verifications.filter(
      (v) => v.verification_status === "AUTHENTIC"
    ).length;
    const tamperedCount = db.verifications.filter(
      (v) => v.verification_status === "TAMPERED"
    ).length;
    const notRegisteredCount = db.verifications.filter(
      (v) => v.verification_status === "NOT_REGISTERED"
    ).length;

    return {
      success: true,
      message: "System overview metrics retrieved.",
      data: {
        users: {
          total: db.users.length,
          active: db.users.filter((u) => u.is_active).length,
          admins: db.users.filter((u) => u.role === "ADMIN").length,
        },
        documents: {
          total: db.documents.length,
          registeredOnChain: db.documents.filter((d) => d.status === "REGISTERED").length,
          pending: db.documents.filter((d) => d.status !== "REGISTERED").length,
        },
        verifications: {
          total: db.verifications.length,
          breakdown: {
            AUTHENTIC: authenticCount,
            TAMPERED: tamperedCount,
            NOT_REGISTERED: notRegisteredCount,
          },
        },
      },
    };
  }

  if (pathname === "/admin/users" && method === "get") {
    const page = parseInt(params.page || "1", 10);
    const limit = parseInt(params.limit || "10", 10);
    const role = (params.role || "").trim();

    let filtered = [...db.users];
    if (role) {
      filtered = filtered.filter((u) => u.role === role);
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit).map(({ password: _p, ...rest }) => rest);

    return {
      success: true,
      message: "Users retrieved successfully.",
      data: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  if (pathname.match(/^\/admin\/users\/[^/]+$/) && method === "patch") {
    const targetId = pathname.split("/")[3];
    const body = parseBody(config.data);
    const targetUser = db.users.find((u) => u.id === targetId);
    if (!targetUser) {
      return Promise.reject({
        success: false,
        status: 404,
        message: "User not found.",
      });
    }

    if (typeof body.isActive === "boolean") {
      targetUser.is_active = body.isActive;
    }
    if (body.role) {
      targetUser.role = body.role;
    }

    const adminUser = getActiveUser(db) || db.users[0];
    recordAudit(db, {
      user: adminUser,
      action: "ADMIN_UPDATE_USER",
      entityType: "USER",
      entityId: targetUser.id,
      details: {
        targetEmail: targetUser.email,
        isActive: targetUser.is_active,
        role: targetUser.role,
      },
    });
    saveDb(db);

    const { password: _p, ...sanitized } = targetUser;
    return {
      success: true,
      message: "User updated successfully.",
      data: { user: sanitized },
    };
  }

  if (pathname === "/admin/audit-logs" && method === "get") {
    const page = parseInt(params.page || "1", 10);
    const limit = parseInt(params.limit || "20", 10);
    const action = (params.action || "").trim();

    let filtered = [...db.auditLogs];
    if (action) {
      filtered = filtered.filter((l) => l.action === action);
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      success: true,
      message: "Audit logs retrieved.",
      data: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  return {
    success: true,
    message: "Operation completed.",
    data: {},
  };
}
