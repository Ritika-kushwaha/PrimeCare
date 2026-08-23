"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Lock, LogIn, ShieldAlert } from "lucide-react";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        router.replace("/login");
      } else if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        router.replace("/login");
      }
    }
  }, [loading, isAuthenticated, user, router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Verifying security credentials...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated, show strict access lock view before redirect completes
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Authentication Required</h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Patient appointment booking and outpatient services are protected. Please sign in or create an account to access clinical scheduling.
            </p>
          </div>
          <Link
            href="/login"
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <LogIn className="w-4 h-4" /> Sign In to Book Appointment
          </Link>
        </div>
      </div>
    );
  }

  // Role Mismatch Protection
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Access Restricted</h2>
          <p className="text-xs text-slate-400">Your profile ({user.role}) is not authorized to access this section.</p>
          <Link href="/login" className="text-xs text-emerald-400 hover:underline">
            Switch Profile
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
