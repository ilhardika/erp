"use client";

import { SessionProvider } from "next-auth/react";
import PWAUpdatePrompt from "@/components/pwa-update-prompt";
import PWAInstallPrompt from "@/components/pwa-install-prompt";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <PWAUpdatePrompt />
      <PWAInstallPrompt />
    </SessionProvider>
  );
}
