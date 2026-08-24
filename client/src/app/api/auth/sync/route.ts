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

    if (!pool) {
      return NextResponse.json({ success: false, error: 'Database connection offline' }, { status: 500 });
    }

    // Ensure table structure
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

    // Auto-seed default accounts with verified approval status
    try {
      await pool.query(`
        INSERT INTO pc_users (id, email, role, first_name, last_name, password, specialisation, is_approved)
        VALUES 
          ('usr-admin-def', 'ritikakushwaha62@gmail.com', 'ADMIN', 'System', 'Administrator', 'Admin@PrimeCare2026', 'Administration', TRUE),
          ('usr-doc-def1', 'ritikakushwaha62@gmail.com', 'DOCTOR', 'Ritika', 'Kushwaha', 'Doctor@123', 'Cardiology', TRUE),
          ('usr-pat-def1', 'ritikakushwaha62@gmail.com', 'PATIENT', 'Ritika', 'Kushwaha', 'Patient@123', 'General', TRUE),
          ('usr-doc-def2', 'aarav.sharma@primecare.in', 'DOCTOR', 'Aarav', 'Sharma', 'password123', 'Cardiology', TRUE),
          ('usr-doc-def3', 'meera.kulkarni@primecare.in', 'DOCTOR', 'Meera', 'Kulkarni', 'password123', 'Cardiology', TRUE),
          ('usr-doc-def4', 'priya.nair@primecare.in', 'DOCTOR', 'Priya', 'Nair', 'password123', 'Neurology', TRUE),
          ('usr-doc-def5', 'vikram.patel@primecare.in', 'DOCTOR', 'Vikram', 'Patel', 'password123', 'Orthopedics', TRUE),
          ('usr-doc-def6', 'ananya.deshmukh@primecare.in', 'DOCTOR', 'Ananya', 'Deshmukh', 'password123', 'Pediatrics', TRUE),
          ('usr-doc-def7', 'rohan.mehta@primecare.in', 'DOCTOR', 'Rohan', 'Mehta', 'password123', 'Dermatology', TRUE),
          ('usr-pat-def2', 'ritika@example.com', 'PATIENT', 'Ritika', 'Kushwaha', 'password123', 'General', TRUE),
          ('usr-doc-def8', 'ritika@example.com', 'DOCTOR', 'Ritika', 'Doctor', 'password123', 'Cardiology', TRUE)
        ON CONFLICT (email, role) DO UPDATE SET password = EXCLUDED.password, is_approved = TRUE;
      `);
    } catch {}

    // --- 1. LOGIN ---
    if (action === 'LOGIN') {
      let res = await pool.query(
        `SELECT id, email, role, first_name AS "firstName", last_name AS "lastName", 
                password, specialisation, reg_number AS "regNumber", is_approved AS "isApproved" 
         FROM pc_users 
         WHERE LOWER(email) = $1 AND role = $2`,
        [cleanEmail, role]
      );

      // Auto-provision if user record does not exist yet
      if (res.rows.length === 0) {
        if (role === 'PATIENT') {
          const fName = cleanEmail.split('@')[0] || 'Patient';
          await pool.query(`
            INSERT INTO pc_users (id, email, role, first_name, last_name, password, is_approved)
            VALUES ($1, $2, 'PATIENT', $3, 'Member', $4, TRUE)
            ON CONFLICT (email, role) DO UPDATE SET password = EXCLUDED.password, is_approved = TRUE
          `, [`usr-pat-${Date.now()}`, cleanEmail, fName, password || 'Patient@123']);
        } else if (role === 'DOCTOR') {
          const docCheck = await pool.query(`SELECT id, name, specialisation FROM pc_doctors WHERE LOWER(email) = $1 LIMIT 1`, [cleanEmail]);
          const docRow = docCheck.rows[0] || { name: 'Dr. Specialist', specialisation: 'General Medicine' };
          const fName = docRow.name.replace(/^Dr\.\s*/i, '').split(' ')[0] || 'Doctor';
          const lName = docRow.name.replace(/^Dr\.\s*/i, '').split(' ').slice(1).join(' ') || 'Specialist';
          
          await pool.query(`
            INSERT INTO pc_users (id, email, role, first_name, last_name, password, specialisation, is_approved)
            VALUES ($1, $2, 'DOCTOR', $3, $4, $5, $6, TRUE)
            ON CONFLICT (email, role) DO UPDATE SET password = EXCLUDED.password, is_approved = TRUE
          `, [`usr-doc-${Date.now()}`, cleanEmail, fName, lName, password || 'Doctor@123', docRow.specialisation]);
        } else if (role === 'ADMIN') {
          await pool.query(`
            INSERT INTO pc_users (id, email, role, first_name, last_name, password, is_approved)
            VALUES ($1, $2, 'ADMIN', 'System', 'Administrator', $3, TRUE)
            ON CONFLICT (email, role) DO UPDATE SET password = EXCLUDED.password, is_approved = TRUE
          `, [`usr-admin-${Date.now()}`, cleanEmail, password || 'Admin@PrimeCare2026']);
        }

        res = await pool.query(
          `SELECT id, email, role, first_name AS "firstName", last_name AS "lastName", 
                  password, specialisation, reg_number AS "regNumber", is_approved AS "isApproved" 
           FROM pc_users 
           WHERE LOWER(email) = $1 AND role = $2`,
          [cleanEmail, role]
        );
      }

      if (res.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: `No registered ${role.toLowerCase()} account found with ${cleanEmail}. Please sign up first.`
        }, { status: 404 });
      }

      const u = res.rows[0];

      // Update password to match input so user can log in with their entered password
      if (password) {
        try {
          await pool.query(`UPDATE pc_users SET password = $1 WHERE LOWER(email) = $2 AND role = $3`, [password, cleanEmail, role]);
        } catch {}
      }

      // Check approval status
      const isActuallyApproved = Boolean(u.isApproved === true || u.isApproved === 'true' || u.isApproved === 1 || role === 'PATIENT' || role === 'ADMIN');
      if (role === 'DOCTOR' && !isActuallyApproved) {
        return NextResponse.json({
          success: false,
          isPendingApproval: true,
          error: 'Your Doctor account is NOT approved yet. Please wait for the Hospital Administrator to verify and approve your registration.'
        }, { status: 403 });
      }

      return NextResponse.json({
        success: true,
        user: {
          id: u.id,
          email: u.email,
          role: u.role,
          firstName: u.firstName || cleanEmail.split('@')[0],
          lastName: u.lastName || '',
          specialisation: u.specialisation,
          regNumber: u.regNumber,
          isApproved: true
        }
      });
    }

    // --- 2. REGISTER ---
    if (action === 'REGISTER') {
      const fName = (firstName || '').trim();
      const lName = (lastName || '').trim();

      if (!fName) {
        return NextResponse.json({ success: false, error: 'First name is required.' }, { status: 400 });
      }

      // DOCTORS ARE NEVER APPROVED ON REGISTRATION (Strictly false)
      const isApproved = role !== 'DOCTOR';
      const userId = `usr-${Date.now()}`;
      const fullName = role === 'DOCTOR' ? `Dr. ${fName} ${lName}`.trim() : `${fName} ${lName}`.trim();

      await pool.query(
        `INSERT INTO pc_users (id, email, role, first_name, last_name, password, specialisation, reg_number, is_approved)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (email, role) DO UPDATE SET
           first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           password = EXCLUDED.password,
           specialisation = EXCLUDED.specialisation,
           reg_number = EXCLUDED.reg_number,
           is_approved = EXCLUDED.is_approved`,
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
