"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Activity, LogOut, User } from "lucide-react";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-emerald-400 font-extrabold text-lg tracking-tight">
          <Activity className="w-6 h-6 text-emerald-400" />
          <span className="text-white">Prime</span>Care
        </Link>
        <div className="flex items-center gap-4 text-xs font-semibold">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <span className="text-slate-300 hidden sm:inline flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-400" /> {user.firstName || user.email}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-lg shadow-emerald-500/20"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
