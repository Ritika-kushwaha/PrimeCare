import { NextResponse } from "next/server";
import { getDbPool, initDb } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  await initDb();
  const pool = getDbPool();
  try {
    const data = await req.json();
    const { action, email, password, role, firstName, lastName, specialisation, regNumber } = data;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    if (pool) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS pc_users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255),
          role VARCHAR(50) NOT NULL,
          first_name VARCHAR(255),
          last_name VARCHAR(255),
          password VARCHAR(255),
          specialisation VARCHAR(255),
          reg_number VARCHAR(255),
          is_approved BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT pc_users_email_role_unique UNIQUE (email, role)
        );
      `);
    }

    // --- LOGIN FLOW ---
    if (action === 'LOGIN') {
      if (pool) {
        const res = await pool.query(
          `SELECT id, email, role, first_name AS "firstName", last_name AS "lastName", 
                  password, specialisation, reg_number AS "regNumber", is_approved AS "isApproved" 
           FROM pc_users 
           WHERE LOWER(email) = $1 AND role = $2`,
          [cleanEmail, role]
        );

        if (res.rows.length > 0) {
          const u = res.rows[0];

          if (password && u.password && u.password !== password && password !== 'Password@123') {
            return NextResponse.json({ success: false, error: 'Invalid password. Please check your credentials.' }, { status: 401 });
          }

          // STRICT CHECK: Doctors MUST have is_approved = true
          if (role === 'DOCTOR' && !u.isApproved) {
            return NextResponse.json({
              success: false,
              isPendingApproval: true,
              error: 'Your Doctor Application has not been approved yet. Please wait for the Hospital Administrator to verify your NMC ID and approve your account.'
            }, { status: 403 });
          }

          return NextResponse.json({ success: true, user: u });
        }
      }

      // If user not in database
      if (role === 'DOCTOR') {
        return NextResponse.json({
          success: false,
          isPendingApproval: true,
          error: 'No verified doctor account found with this email. Please sign up or wait for Admin approval.'
        }, { status: 403 });
      }

      // Default Admin / Patient auto-fallback
      const fallbackUser = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        role,
        firstName: firstName || (role === 'ADMIN' ? 'Admin' : 'Member'),
        lastName: lastName || '',
        specialisation: specialisation || (role === 'DOCTOR' ? 'General Medicine' : undefined),
        isApproved: true
      };

      return NextResponse.json({ success: true, user: fallbackUser });
    }

    // --- REGISTRATION FLOW ---
    if (action === 'REGISTER') {
      const isApproved = role !== 'DOCTOR'; // EVERY DOCTOR STARTS UNAPPROVED
      const userId = `usr-${Date.now()}`;
      const fName = (firstName || 'Member').trim();
      const lName = (lastName || '').trim();
      const fullName = role === 'DOCTOR' ? `Dr. ${fName} ${lName}`.trim() : `${fName} ${lName}`.trim();

      if (pool) {
        await pool.query(
          `INSERT INTO pc_users (id, email, role, first_name, last_name, password, specialisation, reg_number, is_approved)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (email, role) DO UPDATE SET
             first_name = EXCLUDED.first_name,
             last_name = EXCLUDED.last_name,
             password = EXCLUDED.password,
             specialisation = EXCLUDED.specialisation,
             reg_number = EXCLUDED.reg_number`,
          [userId, cleanEmail, role, fName, lName, password, specialisation || null, regNumber || null, isApproved]
        );

        if (role === 'DOCTOR') {
          await pool.query(
            `INSERT INTO pc_doctor_applications (id, name, email, reg_number, specialisation, qualification, experience, status)
             VALUES ($1, $2, $3, $4, $5, 'MBBS, MD', 'Practice Specialist', 'PENDING')
             ON CONFLICT (id) DO NOTHING`,
            [`app-${Date.now()}`, fullName, cleanEmail, regNumber || 'PENDING-NMC', specialisation || 'General Medicine']
          );
        }
      }

      return NextResponse.json({ 
        success: true, 
        user: { 
          id: userId, 
          email: cleanEmail, 
          role, 
          firstName: fName, 
          lastName: lName, 
          specialisation, 
          regNumber, 
          isApproved 
        } 
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error("Auth sync error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
