import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-slate-950 text-slate-100">
      <h1 className="text-4xl font-extrabold text-blue-500 mb-4">PrimeCare Healthcare Portal</h1>
      <p className="text-lg text-slate-400 max-w-md mb-8">
        Clinical Appointment Booking & Healthcare Management System.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition"
        >
          Book Appointment
        </Link>
      </div>
    </main>
  );
}
