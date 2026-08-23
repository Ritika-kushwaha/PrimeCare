"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/appointments");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <Link href="/" className="text-sm text-blue-400 hover:underline mb-6 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-2xl font-bold text-blue-500 mb-2">Sign In to PrimeCare</h1>
        <p className="text-sm text-slate-400 mb-6">Access your patient account to book and manage appointments.</p>

        <form onSubmit={handleLogin} className="space-y-4 text-sm">
          <div>
            <label className="block text-slate-300 mb-1">Email Address</label>
            <input
              required
              type="email"
              placeholder="patient@example.com"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Password</label>
            <input
              required
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            Sign In & Continue
          </button>
        </form>
      </div>
    </div>
  );
}
