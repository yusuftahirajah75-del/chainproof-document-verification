import React from "react";

export function Input({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = null,
  helperText = null,
  required = false,
  disabled = false,
  className = "",
  ...props
}) {
  const inputId = id || `input-${label?.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="form-input"
        style={error ? { borderColor: "#ef4444" } : {}}
        {...props}
      />
      {error && <p className="form-error">{error}</p>}
      {helperText && !error && <p className="form-helper">{helperText}</p>}
    </div>
  );
}

export function Textarea({
  label,
  id,
  value,
  onChange,
  rows = 3,
  placeholder = "",
  error = null,
  helperText = null,
  required = false,
  disabled = false,
  className = "",
  ...props
}) {
  const inputId = id || `textarea-${label?.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="form-textarea"
        style={error ? { borderColor: "#ef4444" } : {}}
        {...props}
      />
      {error && <p className="form-error">{error}</p>}
      {helperText && !error && <p className="form-helper">{helperText}</p>}
    </div>
  );
}

