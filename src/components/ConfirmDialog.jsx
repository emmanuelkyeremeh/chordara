import React from "react";
import "./ConfirmDialog.css";

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmType = "danger",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay" style={{ zIndex: 9999 }}>
      <div className="confirm-dialog">
        <div className="confirm-dialog-header">
          <h3>{title}</h3>
        </div>

        <div className="confirm-dialog-body">
          <p>{message}</p>
        </div>

        <div className="confirm-dialog-actions">
          <button onClick={onCancel} className="confirm-dialog-cancel">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`confirm-dialog-confirm confirm-dialog-${confirmType}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
