import React from "react";
import "./Chip.css";

const Chip = ({ label, onDelete, variant = "default", size = "medium", ...props }) => {
  return (
    <span className={`chip chip-${variant} chip-${size}`} {...props}>
      {label}
      {onDelete && (
        <button
          type="button"
          className="chip-delete"
          onClick={onDelete}
          aria-label="Remover"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default Chip;

