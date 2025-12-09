import React from "react";
import "./ColorInput.css";

const ColorInput = ({
  label,
  value,
  onClick,
  helperText,
  disabled = false,
  ...props
}) => {
  return (
    <div className="color-input-container">
      {label && <label className="color-input-label">{label}</label>}
      <div className="color-input-wrapper">
        <div
          className="color-input-preview"
          style={{ backgroundColor: value || "#ccc" }}
        />
        <input
          type="text"
          className="color-input-field"
          value={value || ""}
          onClick={onClick}
          readOnly
          disabled={disabled}
          placeholder="#000000"
          {...props}
        />
        <button
          type="button"
          className="color-input-button"
          onClick={onClick}
          disabled={disabled}
          aria-label="Escolher cor"
        >
          🎨
        </button>
      </div>
      {helperText && <span className="color-input-helper">{helperText}</span>}
    </div>
  );
};

export default ColorInput;

