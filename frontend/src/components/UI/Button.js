import React from "react";
import "./Button.css";

const Button = ({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  size = "medium",
  ...props
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${fullWidth ? "btn-full-width" : ""} ${loading ? "btn-loading" : ""}`}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <span className="btn-spinner"></span>
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;

