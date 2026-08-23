"use client";

// Universal Cloud Synchronization Helper
export async function syncCloudAppointments(localAppts?: any[]): Promise<any[]> {
  try {
    if (localAppts && localAppts.length > 0) {
      await fetch("/api/sync/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointments: localAppts }),
      });
    }
    const res = await fetch("/api/sync/appointments");
    const data = await res.json();
    if (data.success && Array.isArray(data.appointments)) {
      localStorage.setItem("primecare_appointments", JSON.stringify(data.appointments));
      return data.appointments;
    }
  } catch (e) {
    console.error("Cloud sync appointments error:", e);
  }
  return JSON.parse(localStorage.getItem("primecare_appointments") || "[]");
}

export async function syncCloudDoctors(localDoctors?: any[]): Promise<any[]> {
  try {
    if (localDoctors && localDoctors.length > 0) {
      await fetch("/api/sync/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctors: localDoctors }),
      });
    }
    const res = await fetch("/api/sync/doctors");
    const data = await res.json();
    if (data.success && Array.isArray(data.doctors)) {
      localStorage.setItem("primecare_doctor_profiles", JSON.stringify(data.doctors));
      return data.doctors;
    }
  } catch (e) {
    console.error("Cloud sync doctors error:", e);
  }
  return JSON.parse(localStorage.getItem("primecare_doctor_profiles") || "[]");
}

export async function syncCloudEHR(localEHR?: any[]): Promise<any[]> {
  try {
    if (localEHR && localEHR.length > 0) {
      await fetch("/api/sync/ehr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ehrRegistry: localEHR }),
      });
    }
    const res = await fetch("/api/sync/ehr");
    const data = await res.json();
    if (data.success && Array.isArray(data.ehrRegistry)) {
      localStorage.setItem("primecare_ehr_registry", JSON.stringify(data.ehrRegistry));
      return data.ehrRegistry;
    }
  } catch (e) {
    console.error("Cloud sync EHR error:", e);
  }
  return JSON.parse(localStorage.getItem("primecare_ehr_registry") || "[]");
}

export async function syncCloudLeaves(localLeaves?: any[]): Promise<any[]> {
  try {
    if (localLeaves && localLeaves.length > 0) {
      await fetch("/api/sync/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaves: localLeaves }),
      });
    }
    const res = await fetch("/api/sync/leaves");
    const data = await res.json();
    if (data.success && Array.isArray(data.leaves)) {
      localStorage.setItem("primecare_leaves", JSON.stringify(data.leaves));
      return data.leaves;
    }
  } catch (e) {
    console.error("Cloud sync leaves error:", e);
  }
  return JSON.parse(localStorage.getItem("primecare_leaves") || "[]");
}
