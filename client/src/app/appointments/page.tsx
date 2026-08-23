"use client";

import { useState } from "react";
import Link from "next/link";

export default function AppointmentsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    email: "",
    date: "",
    time: "",
    doctor: "General Physician",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <Link href="/" className="text-sm text-blue-400 hover:underline mb-6 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-2xl font-bold text-blue-500 mb-2">Book an Appointment</h1>
        <p className="text-sm text-slate-400 mb-6">Schedule your clinical consultation with PrimeCare.</p>

        {submitted ? (
          <div className="bg-blue-950/60 border border-blue-600/40 rounded-xl p-6 text-center space-y-3">
            <h2 className="text-lg font-semibold text-blue-400">Appointment Requested!</h2>
            <p className="text-sm text-slate-300">
              Confirmation details will be sent to <span className="text-white font-medium">{formData.email}</span>.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Book Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-slate-300 mb-1">Full Name</label>
              <input
                required
                type="text"
                placeholder="John Doe"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Email Address</label>
              <input
                required
                type="email"
                placeholder="patient@example.com"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">Date</label>
                <input
                  required
                  type="date"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-slate-200"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Time</label>
                <input
                  required
                  type="time"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-slate-200"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Department / Specialist</label>
              <select
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                value={formData.doctor}
                onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
              >
                <option>General Physician</option>
                <option>Cardiology</option>
                <option>Neurology</option>
                <option>Orthopedics</option>
                <option>Pediatrics</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              Confirm Appointment
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
