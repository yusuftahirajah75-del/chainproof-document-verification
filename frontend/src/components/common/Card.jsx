import React from "react";

export function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
  style = {},
  headerStyle = {},
}) {
  return (
    <div className={`card ${className}`} style={style}>
      {(title || action) && (
        <div className="card-header" style={headerStyle}>
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

