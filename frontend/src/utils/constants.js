export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
};

export const VERIFICATION_STATUS = {
  AUTHENTIC: "AUTHENTIC",
  TAMPERED: "TAMPERED",
  NOT_REGISTERED: "NOT_REGISTERED",
};

export const STATUS_META = {
  AUTHENTIC: {
    label: "Authentic",
    description: "The cryptographic SHA-256 hash matches a confirmed blockchain ledger record.",
    badgeClass: "badge-authentic",
    alertClass: "alert-success",
    color: "#059669",
  },
  TAMPERED: {
    label: "Tampered / Modified",
    description: "Document identity is recognized, but byte contents have been altered or corrupted.",
    badgeClass: "badge-tampered",
    alertClass: "alert-error",
    color: "#dc2626",
  },
  NOT_REGISTERED: {
    label: "Not Registered",
    description: "No matching blockchain or registration record exists for this document.",
    badgeClass: "badge-unregistered",
    alertClass: "alert-warning",
    color: "#d97706",
  },
};

