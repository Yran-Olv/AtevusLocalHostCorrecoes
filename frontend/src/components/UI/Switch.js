import React from "react";
import "./Switch.css";

const Switch = ({ checked, onChange, label, disabled = false, ...props }) => {
  return (
    <label className={`switch-container ${disabled ? "switch-disabled" : ""}`}>
      <input
        type="checkbox"
        className="switch-input"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      <span className="switch-slider"></span>
      {label && <span className="switch-label">{label}</span>}
    </label>
  );
};

export default Switch;

