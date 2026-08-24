"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, Role } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        router.replace("/login");
        return;
      }

      // STRICT GATE: If role is DOCTOR and not explicitly approved, kick back to login
      if (user.role === "DOCTOR" && user.isApproved !== true) {
        logout();
        router.replace("/login");
        return;
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === "PATIENT") {
          router.replace("/patient/book");
        } else if (user.role === "DOCTOR") {
          router.replace("/doctor/dashboard");
        } else if (user.role === "ADMIN") {
          router.replace("/admin/leaves");
        }
      }
    }
  }, [isAuthenticated, loading, user, allowedRoles, router, logout]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400 font-mono text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying credentials & clinical authorizations...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || (user.role === "DOCTOR" && user.isApproved !== true)) {
    return null;
  }

  return <>{children}</>;
}
