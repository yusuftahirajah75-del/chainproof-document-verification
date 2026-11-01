import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Shield, User, Clock } from "lucide-react";
import { STATUS_META } from "../../utils/constants";

export function Badge({ status, role, children, className = "" }) {
  if (status) {
    const meta = STATUS_META[status];
    if (meta) {
      const icons = {
        AUTHENTIC: <CheckCircle2 size={13} />,
        TAMPERED: <AlertCircle size={13} />,
        NOT_REGISTERED: <AlertTriangle size={13} />,
      };

      return (
        <span className={`badge ${meta.badgeClass} ${className}`}>
          {icons[status]}
          {meta.label}
        </span>
      );
    }

    if (status === "REGISTERED") {
      return (
        <span className="badge badge-authentic">
          <CheckCircle2 size={13} />
          Anchored On-Chain
        </span>
      );
    }

    if (status === "PENDING_REGISTRATION") {
      return (
        <span className="badge badge-unregistered">
          <Clock size={13} />
          Pending Registration
        </span>
      );
    }
  }

  if (role) {
    if (role === "ADMIN") {
      return (
        <span className="badge badge-admin">
          <Shield size={13} />
          Admin
        </span>
      );
    }
    return (
      <span className="badge badge-user">
        <User size={13} />
        Researcher
      </span>
    );
  }

  return <span className={`badge ${className}`}>{children}</span>;
}

