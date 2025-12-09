import React, { useRef } from "react";
import "./FileUpload.css";

const FileUpload = ({
  label,
  value,
  onChange,
  onDelete,
  accept = "image/*",
  helperText,
  disabled = false,
  ...props
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="file-upload-container">
      {label && <label className="file-upload-label">{label}</label>}
      <div className="file-upload-wrapper">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          className="file-upload-input"
          {...props}
        />
        <div className="file-upload-display">
          <input
            type="text"
            value={value || ""}
            readOnly
            className="file-upload-text"
            placeholder="Nenhum arquivo selecionado"
          />
          <div className="file-upload-actions">
            {value && onDelete && (
              <button
                type="button"
                className="file-upload-delete"
                onClick={onDelete}
                disabled={disabled}
                aria-label="Remover arquivo"
              >
                🗑️
              </button>
            )}
            <button
              type="button"
              className="file-upload-button"
              onClick={handleClick}
              disabled={disabled}
              aria-label="Selecionar arquivo"
            >
              📎
            </button>
          </div>
        </div>
      </div>
      {helperText && <span className="file-upload-helper">{helperText}</span>}
    </div>
  );
};

export default FileUpload;

