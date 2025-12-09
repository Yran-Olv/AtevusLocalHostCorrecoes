import React from "react";
import "./Input.css";

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  helperText,
  error,
  disabled,
  fullWidth = true,
  multiline = false,
  rows = 1,
  required = false,
  ...props
}) => {
  return (
    <div className={`input-container ${fullWidth ? "input-full-width" : ""}`}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      {multiline ? (
        <textarea
          className={`input-field ${error ? "input-error" : ""}`}
          type={type}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          {...props}
        />
      ) : (
        <input
          className={`input-field ${error ? "input-error" : ""}`}
          type={type}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          {...props}
        />
      )}
      {helperText && !error && (
        <span className="input-helper">{helperText}</span>
      )}
      {error && typeof error === 'string' && (
        <span className="input-error-text">{error}</span>
      )}
      {error && typeof error !== 'string' && helperText && (
        <span className="input-error-text">{helperText}</span>
      )}
    </div>
  );
};

export default Input;

