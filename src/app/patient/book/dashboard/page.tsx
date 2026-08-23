'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Stethoscope, User, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

interface Appointment {
  id: string;
  startTime: string;
  status: string;
  symptomsRaw: string;
  aiUrgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  aiChiefComplaint: string;
  aiSuggestedQuestions: string[];
  patient: { firstName: string; lastName: string; email: string };
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [rxName, setRxName] = useState('');
  const [rxDosage, setRxDosage] = useState('');
  const [rxFreq, setRxFreq] = useState(8);
  const [rxDays, setRxDays] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    api.get('/appointments/doctor/agenda').then((res) => {
      setAppointments(res.data.appointments);
    });
  }, []);

  const handleCompleteConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;

    setSubmitting(true);
    try {
      const prescriptions = rxName
        ? [{ name: rxName, dosage: rxDosage, frequency_hours: rxFreq, duration_days: rxDays }]
        : [];

      await api.post(`/appointments/${selectedAppt.id}/complete`, {
        clinicalNotes,
        prescriptions,
      });

      setSuccessMessage('Consultation finalized! Patient summary generated and medication reminders queued.');
      setSelectedAppt(null);
      setClinicalNotes('');
      setRxName('');
      // Refresh agenda
      const res = await api.get('/appointments/doctor/agenda');
      setAppointments(res.data.appointments);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doctor Consultation Desk</h1>
          <p className="text-slate-600">Review triage assessments and record consultation outcomes.</p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Patient Agenda */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Today's Appointments</h2>
          <div className="space-y-3">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                onClick={() => setSelectedAppt(appt)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedAppt?.id === appt.id
                    ? 'border-blue-600 bg-blue-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900">{appt.patient.firstName} {appt.patient.lastName}</h3>
                    <p className="text-xs text-slate-500">{new Date(appt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    appt.aiUrgency === 'HIGH' ? 'bg-red-100 text-red-700' :
                    appt.aiUrgency === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {appt.aiUrgency}
                  </span>
                </div>
                <p className="text-sm text-slate-700 mt-2 line-clamp-2"><span className="font-semibold">AI Summary:</span> {appt.aiChiefComplaint}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Consultation Notes Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> Post-Visit Consultation Notes
          </h2>

          {selectedAppt ? (
            <form onSubmit={handleCompleteConsultation} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl text-sm space-y-2 border border-slate-200">
                <span className="font-bold text-slate-700">AI Suggested Diagnostic Questions:</span>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  {selectedAppt.aiSuggestedQuestions?.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Clinical Notes & Diagnosis</label>
                <textarea
                  required
                  rows={4}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Patient diagnosed with acute bacterial bronchitis. Advised 4 days bed rest..."
                  className="w-full border rounded-lg p-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="border-t pt-4 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase">Prescription (Automates Reminder Queue)</span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Medication (e.g. Amoxicillin)"
                    value={rxName}
                    onChange={(e) => setRxName(e.target.value)}
                    className="border rounded-lg p-2 text-sm bg-slate-50"
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 500mg)"
                    value={rxDosage}
                    onChange={(e) => setRxDosage(e.target.value)}
                    className="border rounded-lg p-2 text-sm bg-slate-50"
                  />
                  <div className="flex items-center gap-2 text-xs">
                    <span>Every</span>
                    <input
                      type="number"
                      value={rxFreq}
                      onChange={(e) => setRxFreq(Number(e.target.value))}
                      className="border rounded p-1 w-16 text-center"
                    />
                    <span>hours</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span>For</span>
                    <input
                      type="number"
                      value={rxDays}
                      onChange={(e) => setRxDays(Number(e.target.value))}
                      className="border rounded p-1 w-16 text-center"
                    />
                    <span>days</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow"
              >
                {submitting ? 'Processing AI Summary...' : 'Finalize & Send Summary'}
              </button>
            </form>
          ) : (
            <p className="text-slate-400 text-sm italic">Select a patient from the list to start the consultation.</p>
          )}
        </div>
      </div>
    </div>
  );
}