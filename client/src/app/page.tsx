export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-extrabold text-blue-600 mb-4">PrimeCare Healthcare Portal</h1>
      <p className="text-lg text-slate-600 max-w-md mb-6">
        Clinical Appointment Booking & Healthcare Management System.
      </p>
      <div className="flex gap-4">
        <a href="/appointments" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition">
          Book Appointment
        </a>
      </div>
    </main>
  );
}
