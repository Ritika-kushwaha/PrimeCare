'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, ArrowRight, Activity, 
  AlertCircle, UserPlus, Clock, Stethoscope, 
  User, ShieldCheck, CheckCircle2, KeyRound 
} from 'lucide-react';

const DEFAULT_ROLE_PASSWORDS: Record<string, string> = {
  'ADMIN_ritikakushwaha62@gmail.com': 'Admin@PrimeCare2026',
  'DOCTOR_ritikakushwaha62@gmail.com': 'Doctor@123',
  'PATIENT_ritikakushwaha62@gmail.com': 'Patient@123',
  'DOCTOR_aarav.sharma@primecare.in': 'password123',
  'PATIENT_ritika@example.com': 'password123',
};

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<'PATIENT' | 'DOCTOR' | 'ADMIN'>('PATIENT');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingApproval, setPendingApproval] = useState(false);
  const { login } = useAuth();

  const handleRoleSelect = (role: 'PATIENT' | 'DOCTOR' | 'ADMIN') => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
    setError('');
    setPendingApproval(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPendingApproval(false);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter your email and password.');
      setLoading(false);
      return;
    }

    // 1. ADMIN ROLE SPECIFIC CHECK
    if (selectedRole === 'ADMIN') {
      if (cleanEmail !== 'ritikakushwaha62@gmail.com') {
        setError('Access Denied: Only ritikakushwaha62@gmail.com has Administrator privileges.');
        setLoading(false);
        return;
      }
    }

    // 2. DOCTOR PENDING APPROVAL CHECK
    if (selectedRole === 'DOCTOR') {
      try {
        const storedApps = JSON.parse(localStorage.getItem('primecare_doctor_applications') || '[]');
        const docApp = storedApps.find((a: any) => a.email?.toLowerCase() === cleanEmail);
        if (docApp && docApp.status === 'PENDING') {
          setPendingApproval(true);
          setError(`Doctor application for ${docApp.name} is currently awaiting Administrator approval.`);
          setLoading(false);
          return;
        }
      } catch {}
    }

    // 3. ROLE-ISOLATED PASSWORD LOOKUP
    const roleKey = `role_pwd_${selectedRole}_${cleanEmail}`;
    const userRolePassword = localStorage.getItem(roleKey);

    // Fallback lookup from default seeds
    const defaultKey = `${selectedRole}_${cleanEmail}`;
    const expectedPassword = (userRolePassword || DEFAULT_ROLE_PASSWORDS[defaultKey] || 'password123').trim();

    // STRICT CHECK: The entered password MUST match the password set for THIS specific role
    if (cleanPassword !== expectedPassword) {
      setError(`Invalid password for ${selectedRole} profile. (Patient, Doctor, and Admin passwords are separate).`);
      setLoading(false);
      return;
    }

    // 4. Authenticate user into the chosen role
    const userName = cleanEmail.split('@')[0];
    login(
      {
        id: `usr_${selectedRole.toLowerCase()}_${Date.now()}`,
        firstName: selectedRole === 'ADMIN' ? 'System' : userName.charAt(0).toUpperCase() + userName.slice(1),
        lastName: selectedRole === 'ADMIN' ? 'Administrator' : '',
        email: cleanEmail,
        role: selectedRole,
        specialisation: selectedRole === 'DOCTOR' ? 'General Medicine' : undefined,
      },
      `token_${selectedRole.toLowerCase()}_${Date.now()}`
    );

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 flex flex-col items-center justify-center space-y-8">
        <div className="text-center space-y-2 max-w-lg">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-1">
            <Activity className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Choose Profile & Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Each role maintains its own dedicated, isolated password.
          </p>
        </div>

        {/* ROLE PROFILE SELECTOR CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div
            onClick={() => handleRoleSelect('PATIENT')}
            className={`p-5 rounded-3xl border cursor-pointer transition-all space-y-3 ${
              selectedRole === 'PATIENT'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-xl ring-2 ring-emerald-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <User className="w-5 h-5" />
              </div>
              {selectedRole === 'PATIENT' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Patient Profile</h3>
              <p className="text-xs text-slate-400 mt-0.5">Book consultations & download invoices.</p>
            </div>
          </div>

          <div
            onClick={() => handleRoleSelect('DOCTOR')}
            className={`p-5 rounded-3xl border cursor-pointer transition-all space-y-3 ${
              selectedRole === 'DOCTOR'
                ? 'bg-blue-950/40 border-blue-500 shadow-xl ring-2 ring-blue-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Stethoscope className="w-5 h-5" />
              </div>
              {selectedRole === 'DOCTOR' && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Doctor / Specialist</h3>
              <p className="text-xs text-slate-400 mt-0.5">Clinical desk & write prescriptions.</p>
            </div>
          </div>

          <div
            onClick={() => handleRoleSelect('ADMIN')}
            className={`p-5 rounded-3xl border cursor-pointer transition-all space-y-3 ${
              selectedRole === 'ADMIN'
                ? 'bg-red-950/40 border-red-500 shadow-xl ring-2 ring-red-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              {selectedRole === 'ADMIN' && <CheckCircle2 className="w-5 h-5 text-red-400" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Clinic Admin</h3>
              <p className="text-xs text-slate-400 mt-0.5">Doctor verification & administrative controls.</p>
            </div>
          </div>
        </div>

        {/* LOGIN FORM */}
        <motion.div
          key={selectedRole}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Sign In as <span className="text-white font-extrabold">{selectedRole}</span>
            </span>
          </div>

          <AnimatePresence>
            {pendingApproval && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs rounded-2xl space-y-2 shadow-lg"
              >
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <Clock className="w-4 h-4 flex-shrink-0 text-amber-400" />
                  <span>Pending Admin Verification</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-200/90">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && !pendingApproval && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-950/60 border border-red-500/50 text-red-200 text-xs rounded-2xl space-y-2 shadow-lg"
              >
                <div className="flex items-center gap-2 font-bold text-red-300">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Authentication Error</span>
                </div>
                <p className="text-[11px] leading-relaxed text-red-200/90">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" /> Registered Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder={selectedRole === 'ADMIN' ? 'ritikakushwaha62@gmail.com' : 'name@example.com'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" /> {selectedRole} Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" /> Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 font-extrabold rounded-xl shadow-lg text-xs transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2 ${
                selectedRole === 'DOCTOR'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white shadow-blue-500/20'
                  : selectedRole === 'ADMIN'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/20'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              {loading ? 'Authenticating...' : (<>Sign In as {selectedRole} <ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>

          {selectedRole !== 'ADMIN' && (
            <div className="text-center pt-2 text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-emerald-400 font-bold hover:underline">
                Create Account
              </Link>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
