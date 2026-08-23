'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Activity, Stethoscope, Calendar, 
  ShieldCheck, LogOut, LogIn, User, History
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg text-white tracking-tight">PrimeCare</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
              HEALTHCARE v2.5
            </span>
          </div>
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className="flex items-center gap-3 sm:gap-4">
          {/* 1. Patient: Book Appointment */}
          {(!user || user.role === 'PATIENT') && (
            <Link
              href="/patient/book"
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Book Appointment
            </Link>
          )}

          {/* 2. Patient: My Medical History & AI Care Plans */}
          {user && user.role === 'PATIENT' && (
            <Link
              href="/patient/history"
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5 text-purple-400" /> My Care Plans
            </Link>
          )}

          {/* 3. Doctor ONLY: Doctor Clinical Desk */}
          {user && user.role === 'DOCTOR' && (
            <Link
              href="/doctor/dashboard"
              className="text-xs font-bold text-slate-200 bg-blue-950/40 border border-blue-500/30 hover:border-blue-400 px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-blue-500/10"
            >
              <Stethoscope className="w-3.5 h-3.5 text-blue-400" /> Doctor Clinical Desk
            </Link>
          )}

          {/* 4. Admin ONLY: Admin Management Hub */}
          {user && user.role === 'ADMIN' && (
            <Link
              href="/admin/leaves"
              className="text-xs font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-400 px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-emerald-500/10"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Admin Management Hub
            </Link>
          )}

          {/* USER PROFILE & LOGOUT / SIGN IN */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-white block leading-none">
                  {user.firstName} {user.lastName || ''}
                </span>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                  user.role === 'ADMIN' 
                    ? 'text-red-400' 
                    : user.role === 'DOCTOR' 
                    ? 'text-blue-400' 
                    : 'text-emerald-400'
                }`}>
                  {user.role} {user.specialisation ? `• ${user.specialisation}` : ''}
                </span>
              </div>

              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-red-500/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2">
              <Link
                href="/login"
                className="text-xs font-bold px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-emerald-500/20"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
