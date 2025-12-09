import React from "react";
import "./Tabs.css";

const Tabs = ({ children, value, onChange, className = "" }) => {
  return (
    <div className={`tabs-container ${className}`}>
      <div className="tabs-wrapper">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              active: child.props.value === value,
              onClick: () => onChange(null, child.props.value),
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

export const Tab = ({ label, value, active, onClick, disabled = false }) => {
  return (
    <button
      className={`tab-item ${active ? "tab-active" : ""} ${disabled ? "tab-disabled" : ""}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {label}
    </button>
  );
};

export default Tabs;

