"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify");
        if (response.ok) {
          router.push("/dashboard");
        }
      } catch (error) {
        // User not authenticated, stay on this page
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bizflow ERP + POS
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistem manajemen bisnis terintegrasi untuk operasional yang efisien
          </p>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Button
            size="lg"
            className="px-8 py-3 text-lg"
            onClick={() => router.push("/login")}
          >
            Mulai Sekarang
          </Button>
        </div>
      </div>
    </div>
  );
}
