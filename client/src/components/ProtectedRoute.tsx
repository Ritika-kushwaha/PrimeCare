'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, LogIn } from 'lucide-react';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'PATIENT' | 'DOCTOR' | 'ADMIN'>;
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('primecare_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
          <h2 className="text-xl font-bold text-white">Authentication Required</h2>
          <p className="text-xs text-slate-400">
            You must be signed in to PrimeCare to access this portal.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/20"
          >
            <LogIn className="w-4 h-4" /> Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-xs text-slate-400">
            Your current role (<strong className="text-emerald-400">{user.role}</strong>) does not have permission to view this resource.
          </p>
          <Link
            href={user.role === 'PATIENT' ? '/patient/book' : user.role === 'DOCTOR' ? '/doctor/dashboard' : '/admin/leaves'}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
          >
            Return to Authorized Portal
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
