import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'PrimeCare — Next-Gen Clinical Management',
  description: 'Smart Clinical Intake, Triage & Real-Time Clinic Orchestration',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
