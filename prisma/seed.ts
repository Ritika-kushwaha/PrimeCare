import prisma from '../src/config/prisma';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cliniccare.com' },
    update: {},
    create: {
      email: 'admin@cliniccare.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.ADMIN,
      firstName: 'System',
      lastName: 'Administrator',
    },
  });

  // 2. Seed Doctor User + Profile
  const doctorUser = await prisma.user.upsert({
    where: { email: 'dr.sharma@cliniccare.com' },
    update: {},
    create: {
      email: 'dr.sharma@cliniccare.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.DOCTOR,
      firstName: 'Aarav',
      lastName: 'Sharma',
      phone: '+919876543210',
      doctorProfile: {
        create: {
          specialisation: 'Cardiology',
          slotDurationMinutes: 30,
          workingHoursStart: '09:00',
          workingHoursEnd: '17:00',
        },
      },
    },
    include: {
      doctorProfile: true,
    },
  });

  // 3. Seed Patient User
  const patient = await prisma.user.upsert({
    where: { email: 'patient@example.com' },
    update: {},
    create: {
      email: 'patient@example.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.PATIENT,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+919812345678',
    },
  });

  console.log('✅ Database seeded successfully:');
  console.log({
    admin: admin.email,
    doctor: doctorUser.email,
    doctorId: doctorUser.doctorProfile?.id,
    patient: patient.email,
  });
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });