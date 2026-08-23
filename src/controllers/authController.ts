import { Request, Response } from 'express';

// Role-isolated password store: Record<"ROLE_email", string>
let rolePasswordStore: Record<string, string> = {
  'ADMIN_ritikakushwaha62@gmail.com': 'Admin@PrimeCare2026',
  'DOCTOR_ritikakushwaha62@gmail.com': 'Doctor@123',
  'PATIENT_ritikakushwaha62@gmail.com': 'Patient@123',
  'DOCTOR_aarav.sharma@primecare.in': 'password123',
  'PATIENT_ritika@example.com': 'password123',
};

let activeOtps: Record<string, { otp: string; expiresAt: number }> = {};

export const requestPasswordOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      res.status(400).json({ error: 'Email address is required.' });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    activeOtps[cleanEmail] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    console.log(`[OTP DISPATCHED] Email: ${cleanEmail} | OTP: ${otp}`);

    res.status(200).json({
      message: `OTP dispatched to ${cleanEmail}`,
      email: cleanEmail,
      otp,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate OTP.' });
  }
};

export const resetPasswordWithOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword, role } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanOtp = (otp || '').trim();
    const cleanPassword = (newPassword || '').trim();
    const selectedRole = (role || 'PATIENT').toUpperCase();

    if (!cleanEmail || !cleanOtp || !cleanPassword) {
      res.status(400).json({ error: 'All fields are required.' });
      return;
    }

    const record = activeOtps[cleanEmail];
    if (!record || record.otp !== cleanOtp || Date.now() > record.expiresAt) {
      res.status(400).json({ error: 'Invalid or expired OTP code.' });
      return;
    }

    delete activeOtps[cleanEmail];

    // Store password strictly under the specific ROLE + EMAIL combination
    const key = `${selectedRole}_${cleanEmail}`;
    rolePasswordStore[key] = cleanPassword;

    console.log(`[PASSWORD UPDATED] Role: ${selectedRole} | Email: ${cleanEmail}`);

    res.status(200).json({
      message: `Password for ${selectedRole} profile updated successfully.`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update password.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const selectedRole = (role || 'PATIENT').toUpperCase();

    if (!cleanEmail || !cleanPassword) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const key = `${selectedRole}_${cleanEmail}`;
    const expectedPassword = rolePasswordStore[key];

    // Strictly check the password for THIS selected role
    if (!expectedPassword || cleanPassword !== expectedPassword) {
      res.status(401).json({
        error: `Invalid password for the ${selectedRole} profile.`,
      });
      return;
    }

    res.status(200).json({
      message: `Logged in as ${selectedRole}`,
      token: `token_${selectedRole}_${Date.now()}`,
      user: {
        id: `usr_${selectedRole}_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '')}`,
        firstName: selectedRole === 'ADMIN' ? 'System' : cleanEmail.split('@')[0],
        lastName: selectedRole === 'ADMIN' ? 'Administrator' : '',
        email: cleanEmail,
        role: selectedRole,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed.' });
  }
};
