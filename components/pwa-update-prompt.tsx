"use client";
import { useEffect, useState } from "react";

export default function PWAUpdatePrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator))
      return;
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      setShow(true);
      refreshing = true;
    });
  }, []);

  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#0CB0FE",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          fontWeight: "bold",
        }}
      >
        Versi baru tersedia!{" "}
        <button
          style={{
            marginLeft: 12,
            background: "#fff",
            color: "#0CB0FE",
            border: "none",
            borderRadius: 4,
            padding: "4px 12px",
            cursor: "pointer",
          }}
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
