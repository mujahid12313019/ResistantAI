import React, { useState } from "react";

export default function Toast() {
  return null; // Used externally via module
}

// Standalone toast hook
let _setToasts = null;

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  _setToasts = setToasts;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === "success" ? "✅" : "❌"}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

export function showToast(message, type = "success") {
  if (!_setToasts) return;
  const id = Date.now();
  _setToasts((prev) => [...prev, { id, message, type }]);
  setTimeout(() => {
    _setToasts((prev) => prev.filter((t) => t.id !== id));
  }, 3500);
}
