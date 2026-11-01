import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export function Alert({
  type = "info",
  title = null,
  children,
  onClose = null,
  className = "",
  style = {},
}) {
  const icons = {
    success: <CheckCircle2 size={20} className="flex-shrink-0" />,
    error: <AlertCircle size={20} className="flex-shrink-0" />,
    warning: <AlertTriangle size={20} className="flex-shrink-0" />,
    info: <Info size={20} className="flex-shrink-0" />,
  };

  return (
    <div className={`alert alert-${type} ${className}`} style={style} role="alert">
      {icons[type] || icons.info}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>{title}</div>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{ opacity: 0.7, cursor: "pointer", padding: "0.2rem" }}
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

