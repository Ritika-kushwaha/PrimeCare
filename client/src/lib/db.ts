// Direct, zero-dependency HTTP SQL executor for Neon Postgres
export async function queryNeon(sqlQuery: string, params: any[] = []): Promise<any[]> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return [];
  }

  try {
    // Convert parameterized query $1, $2 to inline escaped values for HTTP endpoint
    let formattedQuery = sqlQuery;
    params.forEach((param, index) => {
      const placeholder = new RegExp(`\\$${index + 1}\\b`, 'g');
      if (param === null || param === undefined) {
        formattedQuery = formattedQuery.replace(placeholder, 'NULL');
      } else if (typeof param === 'number' || typeof param === 'boolean') {
        formattedQuery = formattedQuery.replace(placeholder, String(param));
      } else {
        const escaped = String(param).replace(/'/g, "''");
        formattedQuery = formattedQuery.replace(placeholder, `'${escaped}'`);
      }
    });

    const parsed = new URL(dbUrl);
    const host = parsed.host;
    const endpoint = `https://${host}/sql`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${parsed.password}`,
        'Neon-Connection-String': dbUrl,
      },
      body: JSON.stringify({ query: formattedQuery }),
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error("Neon HTTP Error:", await res.text());
      return [];
    }

    const data = await res.json();
    return data.rows || [];
  } catch (err) {
    console.error("queryNeon execution error:", err);
    return [];
  }
}

let isInit = false;

export async function initDb(): Promise<void> {
  if (isInit) return;
  try {
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS pc_appointments (
        id VARCHAR(255) PRIMARY KEY,
        token_number VARCHAR(100),
        doctor_id VARCHAR(255),
        doctor_name VARCHAR(255),
        doctor_email VARCHAR(255),
        department VARCHAR(255),
        fee VARCHAR(50),
        hospital VARCHAR(255),
        date VARCHAR(50),
        time_slot VARCHAR(50),
        symptoms TEXT,
        patient_name VARCHAR(255),
        patient_email VARCHAR(255),
        age VARCHAR(50),
        gender VARCHAR(50),
        status VARCHAR(50) DEFAULT 'CONFIRMED',
        finalized_at VARCHAR(100),
        leave_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryNeon(`
      CREATE TABLE IF NOT EXISTS pc_doctors (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        specialisation VARCHAR(255),
        qualification VARCHAR(255),
        experience VARCHAR(255),
        hospital VARCHAR(255),
        fee VARCHAR(50),
        rating VARCHAR(50),
        bio TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryNeon(`
      CREATE TABLE IF NOT EXISTS pc_leaves (
        id VARCHAR(255) PRIMARY KEY,
        doctor_id VARCHAR(255),
        doctor_name VARCHAR(255),
        specialisation VARCHAR(255),
        leave_date VARCHAR(50),
        reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryNeon(`
      CREATE TABLE IF NOT EXISTS pc_ehr (
        patient_key VARCHAR(255) PRIMARY KEY,
        patient_email VARCHAR(255),
        patient_name VARCHAR(255),
        age VARCHAR(50),
        gender VARCHAR(50),
        visits JSONB DEFAULT '[]'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    isInit = true;
  } catch (err) {
    console.error("initDb error:", err);
  }
}
