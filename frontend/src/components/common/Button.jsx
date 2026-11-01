import React from "react";
import { Loader2 } from "lucide-react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  disabled = false,
  icon: Icon = null,
  onClick,
  className = "",
  style = {},
  ...props
}) {
  const sizeClasses = {
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn btn-${variant} ${sizeClasses[size]} ${className}`}
      style={style}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={18} />}
          {children}
        </>
      )}
    </button>
  );
}

