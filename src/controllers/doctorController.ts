import { Request, Response } from 'express';
import prisma from '../config/prisma';

const FULL_DOCTORS_ROSTER = [
  // Cardiology
  { id: 'doc-cardio-01', firstName: 'Aarav', lastName: 'Sharma', specialisation: 'Cardiology', qualification: 'MD, DM (Cardiology)', experience: '14 yrs', fee: '₹1,200' },
  { id: 'doc-cardio-02', firstName: 'Meera', lastName: 'Kulkarni', specialisation: 'Cardiology', qualification: 'MD, DNB (Interventional Cardiology)', experience: '10 yrs', fee: '₹1,400' },

  // Neurology
  { id: 'doc-neuro-01', firstName: 'Priya', lastName: 'Nair', specialisation: 'Neurology', qualification: 'MD, DM (Neurology)', experience: '12 yrs', fee: '₹1,500' },
  { id: 'doc-neuro-02', firstName: 'Siddharth', lastName: 'Menon', specialisation: 'Neurology', qualification: 'MCh (Neuro Surgery)', experience: '16 yrs', fee: '₹1,800' },

  // Orthopedics
  { id: 'doc-ortho-01', firstName: 'Vikram', lastName: 'Patel', specialisation: 'Orthopedics', qualification: 'MS (Orthopedics), MCh', experience: '15 yrs', fee: '₹1,000' },
  { id: 'doc-ortho-02', firstName: 'Rajesh', lastName: 'Bhardwaj', specialisation: 'Orthopedics', qualification: 'MS (Ortho), Fellowship in Joint Replacement', experience: '11 yrs', fee: '₹1,100' },

  // Pediatrics
  { id: 'doc-pedia-01', firstName: 'Ananya', lastName: 'Deshmukh', specialisation: 'Pediatrics', qualification: 'MD (Pediatrics), DCH', experience: '9 yrs', fee: '₹900' },
  { id: 'doc-pedia-02', firstName: 'Karan', lastName: 'Malhotra', specialisation: 'Pediatrics', qualification: 'MD (Pediatrics), Fellowship Neonatology', experience: '13 yrs', fee: '₹1,000' },

  // Dermatology
  { id: 'doc-derma-01', firstName: 'Rohan', lastName: 'Mehta', specialisation: 'Dermatology', qualification: 'MD (Dermatology, Venereology & Leprosy)', experience: '8 yrs', fee: '₹1,100' },
  { id: 'doc-derma-02', firstName: 'Sunita', lastName: 'Chopra', specialisation: 'Dermatology', qualification: 'DVD, MD (Cosmetology & Dermatology)', experience: '12 yrs', fee: '₹1,250' },

  // General Medicine
  { id: 'doc-genmed-01', firstName: 'Suresh', lastName: 'Verma', specialisation: 'General Medicine', qualification: 'MD (Internal Medicine)', experience: '18 yrs', fee: '₹750' },
  { id: 'doc-genmed-02', firstName: 'Pooja', lastName: 'Reddy', specialisation: 'General Medicine', qualification: 'MBBS, DNB (Family Medicine)', experience: '7 yrs', fee: '₹600' },

  // Gynecology
  { id: 'doc-gynae-01', firstName: 'Neha', lastName: 'Gupta', specialisation: 'Gynecology', qualification: 'MS (Obstetrics & Gynecology)', experience: '14 yrs', fee: '₹1,300' },
  { id: 'doc-gynae-02', firstName: 'Shweta', lastName: 'Tiwari', specialisation: 'Gynecology', qualification: 'DGO, DNB (Gynecology & Laparoscopy)', experience: '10 yrs', fee: '₹1,200' },

  // ENT
  { id: 'doc-ent-01', firstName: 'Aditya', lastName: 'Rao', specialisation: 'ENT', qualification: 'MS (ENT - Otorhinolaryngology)', experience: '11 yrs', fee: '₹850' },
  { id: 'doc-ent-02', firstName: 'Deepak', lastName: 'Joshi', specialisation: 'ENT', qualification: 'DLO, MS (Head & Neck Surgery)', experience: '15 yrs', fee: '₹950' },

  // Oncology
  { id: 'doc-onco-01', firstName: 'Kavita', lastName: 'Iyer', specialisation: 'Oncology', qualification: 'DM (Medical Oncology)', experience: '16 yrs', fee: '₹1,800' },
  { id: 'doc-onco-02', firstName: 'Manoj', lastName: 'Saxena', specialisation: 'Oncology', qualification: 'MS, MCh (Surgical Oncology)', experience: '20 yrs', fee: '₹2,000' },

  // Psychiatry
  { id: 'doc-psych-01', firstName: 'Arjun', lastName: 'Singhania', specialisation: 'Psychiatry', qualification: 'MD (Psychiatry), DPM', experience: '10 yrs', fee: '₹1,400' },
  { id: 'doc-psych-02', firstName: 'Nandini', lastName: 'Sen', specialisation: 'Psychiatry', qualification: 'MD (Neuro-Psychiatry & Behavioral Health)', experience: '14 yrs', fee: '₹1,600' },

  // Ophthalmology
  { id: 'doc-opht-01', firstName: 'Harish', lastName: 'Bansal', specialisation: 'Ophthalmology', qualification: 'MS (Ophthalmology), Cornea Specialist', experience: '13 yrs', fee: '₹800' },
  { id: 'doc-opht-02', firstName: 'Ritu', lastName: 'Agarwal', specialisation: 'Ophthalmology', qualification: 'DO, DNB (Retina & Cataract Surgery)', experience: '9 yrs', fee: '₹850' }
];

export const getDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const formattedDoctors = FULL_DOCTORS_ROSTER.map((d) => ({
      id: d.id,
      specialisation: d.specialisation,
      qualification: d.qualification,
      experience: d.experience,
      fee: d.fee,
      user: {
        id: d.id,
        firstName: d.firstName,
        lastName: d.lastName,
        email: `${d.firstName.toLowerCase()}.${d.lastName.toLowerCase()}@primecare.in`,
      },
    }));

    res.status(200).json({ doctors: formattedDoctors });
  } catch (error: any) {
    console.error('[GET DOCTORS ERROR]:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch doctors.' });
  }
};
