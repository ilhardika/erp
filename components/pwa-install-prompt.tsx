"use client";
// Type definition for BeforeInstallPromptEvent
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};
import { useEffect, useState } from "react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 80,
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
          color: "white",
          padding: 16,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <img
          src="/icon-192.png"
          alt="Install"
          style={{ width: 32, height: 32, marginRight: 8 }}
        />
        <span style={{ marginRight: 12 }}>
          Install aplikasi ERP untuk pengalaman seperti aplikasi native!
        </span>
        <button
          style={{
            background: "white",
            color: "#0CB0FE",
            border: "none",
            borderRadius: 4,
            padding: "4px 12px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
          onClick={async () => {
            if (deferredPrompt) {
              deferredPrompt.prompt();
              setShow(false);
            }
          }}
        >
          Install
        </button>
      </div>
    </div>
  );
}
