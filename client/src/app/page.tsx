import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-slate-950 text-slate-100">
      <div className="max-w-xl space-y-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-500 tracking-tight">
          PrimeCare Healthcare
        </h1>
        <p className="text-lg text-slate-400">
          Smart Clinical Management & Appointment Scheduling Platform
        </p>
        <div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-xl shadow-lg transition-all"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </main>
  );
}
