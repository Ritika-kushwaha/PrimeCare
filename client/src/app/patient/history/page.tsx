'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { 
  FolderHeart, Sparkles, Pill, FileText, 
  Printer, Calendar, Stethoscope, User, ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';

export default function PatientHistoryPage() {
  const { user } = useAuth();
  const [patientRecord, setPatientRecord] = useState<any | null>(null);

  useEffect(() => {
    const userEmail = (user?.email || 'patient.ritika@example.com').toLowerCase().trim();
    try {
      const stored = JSON.parse(localStorage.getItem('primecare_ehr_registry') || '[]');
      const found = stored.find((p: any) => p.patientEmail?.toLowerCase() === userEmail);
      if (found) {
        setPatientRecord(found);
      } else if (stored.length > 0) {
        setPatientRecord(stored[0]); // fallback to latest record
      }
    } catch {}
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        <div className="print:hidden">
          <Navbar />
        </div>

        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <div>
              <Link href="/patient/book" className="text-xs text-emerald-400 font-bold flex items-center gap-1 mb-2 hover:underline">
                <ArrowLeft className="w-3.5 h-3.5" /> Book Another Consultation
              </Link>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                My Clinical Encounters & AI Care Plans
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Access your consultation summaries, medication schedules, and follow-up guidance.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex-shrink-0"
            >
              <Printer className="w-4 h-4" /> Print Medical History
            </button>
          </div>

          {!patientRecord || !patientRecord.visits || patientRecord.visits.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
              No previous clinical consultations on file for this account.
            </div>
          ) : (
            <div className="space-y-6">
              {patientRecord.visits.map((v: any, idx: number) => (
                <div key={idx} className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="font-bold text-base text-white">{v.doctorName}</h3>
                      <p className="text-xs text-emerald-400 font-semibold">{v.department} • {v.date}</p>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl text-slate-300">
                      Visit ID: {v.visitId}
                    </span>
                  </div>

                  {/* AI CARE PLAN */}
                  {v.aiPostVisitSummary ? (
                    <div className="p-5 rounded-2xl bg-purple-950/25 border border-purple-500/30 space-y-3 text-xs">
                      <span className="text-purple-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-400" /> AI Patient-Friendly Diagnosis & Care Plan
                      </span>
                      <p className="text-slate-200 leading-relaxed">{v.aiPostVisitSummary.patientSummary}</p>
                      
                      <div className="p-3 bg-slate-950/80 rounded-xl border border-purple-500/20 space-y-1">
                        <strong className="text-purple-300 block text-[11px] uppercase">Medication Timetable:</strong>
                        <p className="text-slate-300 font-bold">{v.aiPostVisitSummary.medicationSchedule}</p>
                      </div>

                      <div className="pt-1">
                        <strong className="text-slate-400 block text-[11px] uppercase">Follow-up Action Steps:</strong>
                        <p className="text-slate-300">{v.aiPostVisitSummary.followUpSteps}</p>
                      </div>
                    </div>
                  ) : null}

                  {/* PRESCRIPTION & INVOICE */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 font-semibold uppercase text-[10px] block">Prescription (℞)</span>
                      <p className="font-serif font-bold text-emerald-400 text-sm">℞ {v.prescription?.medication}</p>
                      <p className="text-slate-400">Take every {v.prescription?.frequencyHours} hours for {v.prescription?.durationDays} days</p>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 font-semibold uppercase text-[10px] block">Doctor Clinical Examination</span>
                      <p className="text-slate-300 italic">&quot;{v.clinicalNotes}&quot;</p>
                      <p className="text-slate-400 font-mono text-[11px] pt-1">Fee: {v.invoice?.fee || '₹1,200'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
