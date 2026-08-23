'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  KeyRound, Mail, Lock, ArrowRight, 
  CheckCircle2, AlertCircle, Send, Inbox, 
  User, Stethoscope, ShieldCheck 
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'REQUEST' | 'VERIFY' | 'SUCCESS'>('REQUEST');
  const [targetRole, setTargetRole] = useState<'PATIENT' | 'DOCTOR' | 'ADMIN'>('PATIENT');
  const [email, setEmail] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [expectedOtp, setExpectedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    if (targetRole === 'ADMIN' && cleanEmail !== 'ritikakushwaha62@gmail.com') {
      setError('Only ritikakushwaha62@gmail.com can reset the Administrator profile password.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP.');

      setExpectedOtp(data.otp);
      setSuccessMessage(data.message || `OTP sent to ${cleanEmail}`);
      setStep('VERIFY');
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (enteredOtp.trim() !== expectedOtp.trim()) {
      setError('Invalid OTP code. Please enter the 6-digit code received in your email.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = newPassword.trim();

    // 1. SAVE TO ROLE-ISOLATED LOCAL STORAGE
    const roleKey = `role_pwd_${targetRole}_${cleanEmail}`;
    localStorage.setItem(roleKey, cleanPassword);

    // 2. SYNC TO BACKEND ROLE STORE
    try {
      await fetch('http://localhost:5000/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          otp: enteredOtp.trim(),
          newPassword: cleanPassword,
          role: targetRole,
        }),
      });
    } catch {}

    setLoading(false);
    setStep('SUCCESS');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl space-y-6 backdrop-blur-xl"
        >
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-1">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Reset Role Password
            </h1>
            <p className="text-xs text-slate-400">
              Select which role profile password you want to change.
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3.5 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 1: SELECT ROLE & ENTER EMAIL */}
          {step === 'REQUEST' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                  Select Profile to Reset
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PATIENT', 'DOCTOR', 'ADMIN'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTargetRole(r)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                        targetRole === r
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" /> Account Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 text-xs transition flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {loading ? 'Sending OTP to Email...' : (<><Send className="w-4 h-4" /> Send OTP Code</>)}
              </button>
            </form>
          )}

          {/* STEP 2: VERIFY OTP & SET ROLE PASSWORD */}
          {step === 'VERIFY' && (
            <form onSubmit={handleVerifyAndReset} className="space-y-4">
              <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs rounded-2xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-200">
                  <Inbox className="w-4 h-4 text-emerald-400" /> Updating {targetRole} Password
                </div>
                <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                  {successMessage || `Check inbox for ${email}`}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Enter 6-Digit OTP from Email
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="e.g. 584920"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center text-xl font-mono font-bold tracking-widest text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  New Password for {targetRole} Profile
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 text-xs transition flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {loading ? 'Saving...' : (<>Save New {targetRole} Password <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="p-6 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-white">{targetRole} Password Updated</h3>
                <p className="text-xs text-emerald-400/90 mt-1">
                  Your new password for <strong>{email}</strong> under the <strong>{targetRole}</strong> profile is now active.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition"
              >
                Go to Sign In <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          <div className="text-center pt-2 text-xs text-slate-500">
            <Link href="/login" className="text-emerald-400 font-bold hover:underline">
              Back to Login
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
