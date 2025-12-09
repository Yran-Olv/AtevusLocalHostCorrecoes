import React from "react";
import "./Select.css";

const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Selecione...",
  helperText,
  error,
  disabled = false,
  fullWidth = true,
  required = false,
  ...props
}) => {
  return (
    <div className={`select-container ${fullWidth ? "select-full-width" : ""}`}>
      {label && (
        <label className="select-label">
          {label}
          {required && <span className="select-required">*</span>}
        </label>
      )}
      <div className="select-wrapper">
        <select
          className={`select-field ${error ? "select-error" : ""}`}
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => {
            const value = typeof option === "string" ? option : option.value;
            const label = typeof option === "string" ? option : option.label;
            return (
              <option key={value} value={value}>
                {label}
              </option>
            );
          })}
        </select>
        <span className="select-arrow">▼</span>
      </div>
      {helperText && !error && (
        <span className="select-helper">{helperText}</span>
      )}
      {error && <span className="select-error-text">{error}</span>}
    </div>
  );
};

export default Select;

