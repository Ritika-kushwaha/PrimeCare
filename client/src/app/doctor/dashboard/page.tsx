'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Stethoscope, Clock, CheckCircle2, 
  Pill, FileText, Send, Calendar, 
  Printer, Receipt, Lock, Search, History, FolderHeart, User, Users, X, 
  Edit3, Save, BadgeCheck, Sparkles, AlertTriangle, HelpCircle, Check, ArrowRight
} from 'lucide-react';

interface VisitRecord {
  visitId: string;
  date: string;
  doctorName: string;
  department: string;
  symptoms: string;
  clinicalNotes: string;
  prescription: {
    medication: string;
    frequencyHours: number;
    durationDays: number;
    startDateTime: string;
  };
  aiPostVisitSummary?: {
    patientSummary: string;
    medicationSchedule: string;
    followUpSteps: string;
  };
  invoice: {
    invoiceNumber: string;
    fee: string;
  };
}

interface PatientEHR {
  patientKey?: string;
  patientEmail: string;
  patientName: string;
  age: number | string;
  gender: string;
  visits: VisitRecord[];
}

interface AppointmentItem {
  id: string;
  tokenNumber?: string;
  doctorId?: string;
  doctorName?: string;
  doctorEmail?: string;
  department?: string;
  fee?: string;
  date?: string;
  timeSlot?: string;
  symptoms?: string;
  patientName?: string;
  patientEmail?: string;
  aiUrgency?: 'LOW' | 'MEDIUM' | 'HIGH';
  aiChiefComplaint?: string;
  aiQuestions?: string[];
  status?: string;
}

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'CLINICAL' | 'EHR'>('CLINICAL');
  const [allAppointments, setAllAppointments] = useState<AppointmentItem[]>([]);
  const [activePatient, setActivePatient] = useState<AppointmentItem | null>(null);
  
  // AI Pre-Visit State
  const [aiTriageLoading, setAiTriageLoading] = useState(false);
  const [preVisitTriage, setPreVisitTriage] = useState<{
    urgency: 'LOW' | 'MEDIUM' | 'HIGH';
    chiefComplaint: string;
    suggestedQuestions: string[];
  } | null>(null);

  // EHR State
  const [ehrRegistry, setEhrRegistry] = useState<PatientEHR[]>([]);
  const [ehrSearch, setEhrSearch] = useState('');
  const [selectedEhrPatient, setSelectedEhrPatient] = useState<PatientEHR | null>(null);

  // Doctor Profile
  const currentDoctorName = user ? `Dr. ${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Dr. Specialist';
  const currentSpecialty = user?.specialisation || 'General Medicine';

  // Clinical Form
  const [clinicalNotes, setClinicalNotes] = useState('Patient presents with mild respiratory congestion. Vitals stable. Initiating antibacterial therapy.');
  const [medication, setMedication] = useState('Amoxicillin 500mg');
  const [frequencyHours, setFrequencyHours] = useState(8);
  const [durationDays, setDurationDays] = useState(5);
  const [loading, setLoading] = useState(false);
  const [completedRecord, setCompletedRecord] = useState<any | null>(null);
  const [printDocType, setPrintDocType] = useState<'PRESCRIPTION' | 'INVOICE' | 'AI_SUMMARY' | null>(null);

  const loadData = () => {
    try {
      const stored = localStorage.getItem('primecare_appointments');
      if (stored) {
        setAllAppointments(JSON.parse(stored));
      } else {
        const initialAppts: AppointmentItem[] = [
          {
            id: 'apt-demo-1',
            tokenNumber: 'TK-301',
            doctorName: currentDoctorName,
            department: currentSpecialty,
            fee: '₹1,200',
            date: '2026-08-28',
            timeSlot: '10:00 AM',
            symptoms: 'Persistent dry cough for 4 days with mild throat irritation and fever spikes',
            patientName: 'Ritika Kushwaha',
            patientEmail: 'patient.ritika@example.com',
            status: 'CONFIRMED',
          },
          {
            id: 'apt-demo-2',
            tokenNumber: 'TK-302',
            doctorName: currentDoctorName,
            department: currentSpecialty,
            fee: '₹1,200',
            date: '2026-08-28',
            timeSlot: '11:30 AM',
            symptoms: 'Mild chest heaviness after physical exertion',
            patientName: 'Suresh Kushwaha',
            patientEmail: 'patient.suresh@example.com',
            status: 'CONFIRMED',
          }
        ];
        setAllAppointments(initialAppts);
        localStorage.setItem('primecare_appointments', JSON.stringify(initialAppts));
      }
    } catch {}

    try {
      const storedEHR = localStorage.getItem('primecare_ehr_registry');
      if (storedEHR) {
        setEhrRegistry(JSON.parse(storedEHR));
      }
    } catch {}
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const doctorIsolatedQueue = useMemo(() => {
    const cleanDocName = currentDoctorName.toLowerCase().replace('dr. ', '').trim();
    return allAppointments.filter((a) => {
      if (!a) return false;
      const aDoc = (a.doctorName || '').toLowerCase();
      return cleanDocName ? aDoc.includes(cleanDocName) : true;
    });
  }, [allAppointments, currentDoctorName]);

  useEffect(() => {
    if (doctorIsolatedQueue.length > 0 && !activePatient) {
      handleSelectPatient(doctorIsolatedQueue[0]);
    }
  }, [doctorIsolatedQueue, activePatient]);

  const handleSelectPatient = async (patient: AppointmentItem) => {
    setActivePatient(patient);
    setCompletedRecord(null);

    if (patient.aiUrgency && patient.aiChiefComplaint && patient.aiQuestions) {
      setPreVisitTriage({
        urgency: patient.aiUrgency,
        chiefComplaint: patient.aiChiefComplaint,
        suggestedQuestions: patient.aiQuestions,
      });
      return;
    }

    setAiTriageLoading(true);
    try {
      const res = await fetch('/api/ai/pre-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: patient.symptoms || '' }),
      });
      const data = await res.json();
      setPreVisitTriage(data);
    } catch {
      setPreVisitTriage({
        urgency: 'MEDIUM',
        chiefComplaint: patient.symptoms || 'General Checkup',
        suggestedQuestions: ['How long have symptoms lasted?', 'Any prior medical conditions?'],
      });
    } finally {
      setAiTriageLoading(false);
    }
  };

  const handleFinalizeConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    setLoading(true);

    const pName = activePatient.patientName || 'Patient Member';
    const pEmail = (activePatient.patientEmail || 'patient@primecare.in').toLowerCase();

    // 1. Generate AI Patient-Friendly Summary
    let aiPostVisit = {
      patientSummary: `Diagnosis: ${clinicalNotes}`,
      medicationSchedule: `Take ${medication} every ${frequencyHours} hours for ${durationDays} days.`,
      followUpSteps: 'Rest, hydrate, and return if symptoms persist.',
    };

    try {
      const aiRes = await fetch('/api/ai/post-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicalNotes,
          medication,
          frequencyHours,
          durationDays,
        }),
      });
      const aiData = await aiRes.json();
      if (aiData.patientSummary) aiPostVisit = aiData;
    } catch {}

    const visitEntry: VisitRecord = {
      visitId: 'VST-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().split('T')[0],
      doctorName: currentDoctorName,
      department: activePatient.department || currentSpecialty,
      symptoms: activePatient.symptoms || 'General Consultation',
      clinicalNotes,
      prescription: {
        medication,
        frequencyHours: Number(frequencyHours),
        durationDays: Number(durationDays),
        startDateTime: new Date().toISOString(),
      },
      aiPostVisitSummary: aiPostVisit,
      invoice: {
        invoiceNumber: 'INV-' + Math.floor(100000 + Math.random() * 900000),
        fee: activePatient.fee || '₹1,200',
      },
    };

    const patientKey = `${pEmail}_${pName.toLowerCase().replace(/\s+/g, '')}`;

    try {
      const storedEHR: PatientEHR[] = JSON.parse(localStorage.getItem('primecare_ehr_registry') || '[]');
      const patientIndex = storedEHR.findIndex((p) => p.patientKey === patientKey);

      if (patientIndex > -1) {
        storedEHR[patientIndex].visits.unshift(visitEntry);
      } else {
        storedEHR.unshift({
          patientKey,
          patientEmail: pEmail,
          patientName: pName,
          age: 21,
          gender: 'Member',
          visits: [visitEntry],
        });
      }

      localStorage.setItem('primecare_ehr_registry', JSON.stringify(storedEHR));
      setEhrRegistry(storedEHR);
    } catch {}

    // 2. Dispatch Email with AI Summary to Patient
    try {
      await fetch('/api/consultations/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: pName,
          patientEmail: pEmail,
          doctorName: currentDoctorName,
          department: activePatient.department || currentSpecialty,
          clinicalNotes,
          prescription: visitEntry.prescription,
          aiSummary: aiPostVisit,
          fee: activePatient.fee || '₹1,200',
        }),
      });
    } catch {}

    setCompletedRecord({
      patient: activePatient,
      clinicalNotes,
      prescription: visitEntry.prescription,
      aiSummary: aiPostVisit,
      invoice: visitEntry.invoice,
    });

    setLoading(false);
  };

  const triggerPrint = (type: 'PRESCRIPTION' | 'INVOICE' | 'AI_SUMMARY') => {
    setPrintDocType(type);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        <div className="print:hidden">
          <Navbar />
        </div>

        {/* PRINTABLE VIEW */}
        {completedRecord && printDocType && (
          <div className="hidden print:block p-8 bg-white text-black font-sans min-h-screen">
            {printDocType === 'AI_SUMMARY' ? (
              <div className="space-y-6">
                <div className="border-b-2 border-black pb-4 flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold">PrimeCare Patient Care Plan</h1>
                    <p className="text-sm font-semibold">{currentDoctorName} • {currentSpecialty}</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-lg font-bold text-emerald-800">AI POST-VISIT SUMMARY</h2>
                    <p className="text-xs text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="border border-gray-300 p-4 rounded space-y-2 text-xs">
                  <strong>Patient:</strong> {completedRecord.patient.patientName} ({completedRecord.patient.patientEmail})
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-gray-900 uppercase">1. Plain-Language Diagnosis & Overview</h3>
                  <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 p-3 rounded border border-gray-200">
                    {completedRecord.aiSummary.patientSummary}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-gray-900 uppercase">2. Medication Regimen</h3>
                  <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 p-3 rounded border border-gray-200">
                    {completedRecord.aiSummary.medicationSchedule}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-gray-900 uppercase">3. Actionable Follow-up Steps</h3>
                  <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 p-3 rounded border border-gray-200">
                    {completedRecord.aiSummary.followUpSteps}
                  </p>
                </div>
              </div>
            ) : printDocType === 'PRESCRIPTION' ? (
              <div className="space-y-6">
                <div className="border-b-2 border-black pb-4 flex justify-between items-start">
                  <div><h1 className="text-2xl font-bold">PrimeCare Multispecialty Hospital</h1></div>
                  <div className="text-right"><h2 className="text-xl font-bold text-gray-800">OFFICIAL MEDICAL PRESCRIPTION</h2></div>
                </div>
                <div className="p-4 border border-gray-300 text-xs">
                  <p><strong>Patient:</strong> {completedRecord.patient.patientName}</p>
                  <p><strong>Rx:</strong> {completedRecord.prescription.medication} every {completedRecord.prescription.frequencyHours} hours for {completedRecord.prescription.durationDays} days</p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* WEB INTERFACE */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8 print:hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-2">
                <Stethoscope className="w-3.5 h-3.5" /> Doctor Workspace
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {currentDoctorName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {currentSpecialty} Specialist • PrimeCare Hospital
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('CLINICAL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'CLINICAL' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                My Queue ({doctorIsolatedQueue.length})
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('EHR'); loadData(); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'EHR' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" /> Patient Medical History ({ehrRegistry.length})
              </button>
            </div>
          </div>

          {/* TAB 1: CLINICAL DESK */}
          {activeTab === 'CLINICAL' && (
            <div className="space-y-6">
              <AnimatePresence>
                {completedRecord && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 shadow-2xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                          <Sparkles className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-emerald-100">
                            AI Patient Summary Dispatched to {completedRecord.patient.patientName}
                          </h3>
                          <p className="text-xs text-emerald-400">Diagnosis and timetable delivered to {completedRecord.patient.patientEmail}.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => triggerPrint('AI_SUMMARY')}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/25"
                        >
                          <Sparkles className="w-4 h-4" /> Print AI Patient Care Plan
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerPrint('PRESCRIPTION')}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                        >
                          <Printer className="w-4 h-4" /> Print Rx (℞)
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/80 rounded-xl border border-emerald-500/30 text-xs space-y-2">
                      <div>
                        <strong className="text-emerald-400 uppercase text-[10px] tracking-wider block">Patient-Friendly Summary:</strong>
                        <p className="text-slate-200 mt-0.5">{completedRecord.aiSummary.patientSummary}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-800">
                        <strong className="text-emerald-400 uppercase text-[10px] tracking-wider block">Medication Schedule:</strong>
                        <p className="text-slate-300 mt-0.5">{completedRecord.aiSummary.medicationSchedule}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* QUEUE */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-400" /> Patient Queue ({doctorIsolatedQueue.length})
                    </span>

                    <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                      {doctorIsolatedQueue.map((p) => {
                        const isSelected = activePatient?.id === p.id;

                        return (
                          <div
                            key={p.id}
                            onClick={() => handleSelectPatient(p)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-emerald-950/40 border-emerald-500 shadow-lg'
                                : 'bg-slate-950/70 border-slate-800 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-sm text-white">{p.patientName}</h4>
                                <p className="text-[11px] text-slate-400">{p.patientEmail}</p>
                              </div>
                              <span className="text-xs font-mono text-emerald-400 font-bold">{p.timeSlot}</span>
                            </div>
                            <p className="text-xs text-slate-300 truncate mt-2 italic">&quot;{p.symptoms}&quot;</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* CONSULTATION & PRE-VISIT AI SUMMARY */}
                <div className="lg:col-span-7 space-y-6">
                  {activePatient ? (
                    <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6">
                      {/* PRE-VISIT AI SYMPTOM SUMMARY CARD */}
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-blue-950/30 border border-blue-500/40 shadow-xl space-y-3">
                        <div className="flex items-center justify-between border-b border-blue-500/20 pb-2.5">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                            <Sparkles className="w-4 h-4 text-blue-400" /> AI Pre-Visit Symptom Analysis
                          </div>

                          {preVisitTriage && (
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                              preVisitTriage.urgency === 'HIGH'
                                ? 'bg-red-500/15 border-red-500/30 text-red-400'
                                : preVisitTriage.urgency === 'MEDIUM'
                                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            }`}>
                              Urgency: {preVisitTriage.urgency}
                            </span>
                          )}
                        </div>

                        {aiTriageLoading ? (
                          <div className="text-xs text-slate-400 italic py-2 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-400" /> Analyzing symptoms & formulating inquiries...
                          </div>
                        ) : preVisitTriage ? (
                          <div className="space-y-3 text-xs">
                            <div>
                              <span className="text-slate-400 font-semibold block text-[10px] uppercase">AI Chief Complaint:</span>
                              <p className="text-slate-200 font-medium">{preVisitTriage.chiefComplaint}</p>
                            </div>

                            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
                              <span className="text-blue-300 font-bold block text-[11px] flex items-center gap-1.5">
                                <HelpCircle className="w-3.5 h-3.5 text-blue-400" /> Suggested Diagnostic Questions for Doctor:
                              </span>
                              <ul className="space-y-1 text-[11px] text-slate-300 pl-4 list-disc">
                                {preVisitTriage.suggestedQuestions.map((q, idx) => (
                                  <li key={idx}>{q}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* CLINICAL FORM */}
                      <form onSubmit={handleFinalizeConsultation} className="space-y-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-400" /> Clinical Examination Notes
                          </label>
                          <textarea
                            rows={3}
                            required
                            value={clinicalNotes}
                            onChange={(e) => setClinicalNotes(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>

                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Pill className="w-4 h-4" /> Prescription (℞)
                          </span>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <span className="block text-[11px] text-slate-400 mb-1">Medication</span>
                              <input
                                type="text"
                                required
                                value={medication}
                                onChange={(e) => setMedication(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                              />
                            </div>
                            <div>
                              <span className="block text-[11px] text-slate-400 mb-1">Interval (Hours)</span>
                              <input
                                type="number"
                                required
                                value={frequencyHours}
                                onChange={(e) => setFrequencyHours(Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 text-xs sm:text-sm transition flex items-center justify-center gap-2"
                        >
                          {loading ? 'Generating AI Summary & Emailing...' : (<><Sparkles className="w-4 h-4" /> Finalize Consultation & Dispatch AI Care Plan</>)}
                        </button>
                      </form>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EHR */}
          {activeTab === 'EHR' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ehrRegistry.map((patient, idx) => (
                  <div key={idx} className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base text-white">{patient.patientName}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">{patient.patientEmail}</p>
                      <p className="text-xs text-emerald-400 mt-2 font-bold">{patient.visits?.length || 0} Encounters</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedEhrPatient(patient)}
                      className="w-full py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl text-xs transition"
                    >
                      View Encounters & AI Summaries
                    </button>
                  </div>
                ))}
              </div>

              {/* MODAL */}
              <AnimatePresence>
                {selectedEhrPatient && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6"
                    >
                      <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                        <div>
                          <h3 className="text-xl font-bold text-white">{selectedEhrPatient.patientName}</h3>
                          <p className="text-xs text-slate-400">{selectedEhrPatient.patientEmail}</p>
                        </div>
                        <button onClick={() => setSelectedEhrPatient(null)} className="text-slate-400 hover:text-white">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {selectedEhrPatient.visits?.map((v, i) => (
                          <div key={i} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
                            <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2">
                              <span><strong>Attending:</strong> {v.doctorName}</span>
                              <span>{v.date}</span>
                            </div>
                            <p><strong>Clinical Notes:</strong> {v.clinicalNotes}</p>
                            <p className="text-emerald-400 font-serif"><strong>Rx:</strong> ℞ {v.prescription?.medication}</p>

                            {v.aiPostVisitSummary && (
                              <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl space-y-1.5">
                                <span className="text-purple-300 font-bold block flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5" /> AI Patient Care Plan:
                                </span>
                                <p className="text-slate-300">{v.aiPostVisitSummary.patientSummary}</p>
                                <p className="text-slate-400"><strong>Schedule:</strong> {v.aiPostVisitSummary.medicationSchedule}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
