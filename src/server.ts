import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import doctorRoutes from './routes/doctorRoutes';
import slotRoutes from './routes/slotRoutes';
import oauthRoutes from './routes/oauthRoutes';
import { startBackgroundWorkers } from './jobs/scheduler';

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL || '',
  ].filter(Boolean),
  credentials: true,
}));

app.use(express.json());

// ── Route Registration ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/oauth', oauthRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'PrimeCare Backend', timestamp: new Date().toISOString() });
});

// ── Start background workers (medication reminders + notification retries)
startBackgroundWorkers();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 PrimeCare Backend Server running on http://localhost:${PORT}`);
});

export default app;
