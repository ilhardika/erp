"use client";

import { useState, useEffect } from "react";

export function usePWA() {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check if the app is already installed
    const isAppInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Handle install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(!isAppInstalled);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Set initial online state
    setIsOnline(navigator.onLine);

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setIsInstallable(false);

    return outcome === "accepted";
  };

  const shareApp = async (data = {}) => {
    const shareData = {
      title: "ERP Management System",
      text: "Check out this comprehensive ERP management system",
      url: window.location.href,
      ...data,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return true;
      } catch (err) {
        return false;
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        return true;
      } catch (err) {
        return false;
      }
    }
  };

  return {
    isOnline,
    isInstallable,
    installApp,
    shareApp,
    isStandalone: window.matchMedia("(display-mode: standalone)").matches,
  };
}

