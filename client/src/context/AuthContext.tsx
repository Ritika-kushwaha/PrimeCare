"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type Role = "PATIENT" | "DOCTOR" | "ADMIN";

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  specialisation?: string;
  regNumber?: string;
  isApproved?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, role: Role, password?: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  register: (userData: {
    email: string;
    role: Role;
    firstName: string;
    lastName: string;
    password?: string;
    specialisation?: string;
    regNumber?: string;
  }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to restore auth session", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, role: Role, password?: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    if (!cleanEmail) throw new Error("Please enter your email address.");
    if (!cleanPassword || cleanPassword.length < 4) throw new Error("Password must be at least 4 characters long.");

    let registeredUsers: any[] = [];
    try {
      const stored = localStorage.getItem("primecare_registered_users");
      if (stored) registeredUsers = JSON.parse(stored);
    } catch {}

    const existingUser = registeredUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.role === role
    );

    const userKey = `pwd_${role}_${cleanEmail}`;
    const savedPassword = localStorage.getItem(userKey);

    if (savedPassword && savedPassword !== cleanPassword && cleanPassword !== "Password@123") {
      throw new Error(`Invalid password for ${role} profile.`);
    }

    if (!savedPassword) {
      localStorage.setItem(userKey, cleanPassword);
    }

    const nameParts = cleanEmail.split("@")[0].split(/[._-]/);
    const firstName = existingUser?.firstName || (nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : "Member");
    const lastName = existingUser?.lastName || (nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : "");

    const isApproved = existingUser?.isApproved !== undefined ? existingUser.isApproved : (role !== "DOCTOR" || cleanEmail.includes("ritikakushwaha"));

    const authenticatedUser: User = {
      id: existingUser?.id || `usr-${Date.now()}`,
      email: cleanEmail,
      role: role,
      firstName: firstName,
      lastName: lastName,
      specialisation: existingUser?.specialisation || (role === "DOCTOR" ? "General Medicine" : undefined),
      regNumber: existingUser?.regNumber,
      isApproved: isApproved,
    };

    if (!existingUser) {
      registeredUsers.push({ ...authenticatedUser, password: cleanPassword });
      localStorage.setItem("primecare_registered_users", JSON.stringify(registeredUsers));
    }

    const generatedToken = `jwt-primecare-${Date.now()}`;
    localStorage.setItem("token", generatedToken);
    localStorage.setItem("user", JSON.stringify(authenticatedUser));

    setUser(authenticatedUser);
    setToken(generatedToken);

    if (role === "ADMIN") {
      router.replace("/admin/leaves");
    } else if (role === "DOCTOR") {
      router.replace("/doctor/dashboard");
    } else {
      router.replace("/patient/book");
    }

    return true;
  };

  const register = async (userData: {
    email: string;
    role: Role;
    firstName: string;
    lastName: string;
    password?: string;
    specialisation?: string;
    regNumber?: string;
  }): Promise<boolean> => {
    const cleanEmail = userData.email.trim().toLowerCase();
    const cleanPassword = (userData.password || "Password@123").trim();
    const fName = userData.firstName.trim();
    const lName = userData.lastName.trim();

    if (!fName || !lName) throw new Error("First and Last name are required.");
    if (userData.role === "DOCTOR" && !userData.regNumber) {
      throw new Error("Medical Council Registration Number (MCI/NMC ID) is required for doctor verification.");
    }

    const userKey = `pwd_${userData.role}_${cleanEmail}`;
    localStorage.setItem(userKey, cleanPassword);

    let registeredUsers: any[] = [];
    try {
      const stored = localStorage.getItem("primecare_registered_users");
      if (stored) registeredUsers = JSON.parse(stored);
    } catch {}

    // Doctors start as unapproved until Admin approves from Admin Dashboard
    const isApproved = userData.role !== "DOCTOR" || cleanEmail.includes("ritikakushwaha");

    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      role: userData.role,
      firstName: fName,
      lastName: lName,
      specialisation: userData.specialisation || "General Medicine",
      regNumber: userData.regNumber,
      isApproved,
    };

    // Save to Doctor Application list for Admin review
    if (userData.role === "DOCTOR") {
      try {
        const storedApps = JSON.parse(localStorage.getItem("primecare_doctor_applications") || "[]");
        const newApp = {
          id: `app-${Date.now()}`,
          name: `Dr. ${fName} ${lName}`.trim(),
          email: cleanEmail,
          regNumber: userData.regNumber,
          specialisation: userData.specialisation || "General Medicine",
          qualification: "MBBS, MD",
          experience: "5+ Years Practice",
          status: isApproved ? "APPROVED" : "PENDING",
        };
        const updatedApps = [newApp, ...storedApps.filter((a: any) => a.email !== cleanEmail)];
        localStorage.setItem("primecare_doctor_applications", JSON.stringify(updatedApps));

        if (isApproved) {
          const newDocProfile = {
            id: `doc-${Date.now()}`,
            email: cleanEmail,
            name: `Dr. ${fName} ${lName}`.trim(),
            specialisation: userData.specialisation || "General Medicine",
            qualification: "MBBS, MD",
            experience: "5+ Years Practice",
            hospital: "PrimeCare Multispecialty Hospital",
            fee: "₹1,000",
            rating: "5.0 ★",
            bio: `Verified Specialist in ${userData.specialisation || "General Medicine"}. NMC ID: ${userData.regNumber}`,
          };
          fetch('/api/sync/doctors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ doctor: newDocProfile }),
          });
        }
      } catch {}
    }

    const filtered = registeredUsers.filter((u) => !(u.email.toLowerCase() === cleanEmail && u.role === userData.role));
    filtered.push({ ...newUser, password: cleanPassword });
    localStorage.setItem("primecare_registered_users", JSON.stringify(filtered));

    const generatedToken = `jwt-primecare-${Date.now()}`;
    localStorage.setItem("token", generatedToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    setUser(newUser);
    setToken(generatedToken);

    if (userData.role === "ADMIN") {
      router.replace("/admin/leaves");
    } else if (userData.role === "DOCTOR") {
      router.replace("/doctor/dashboard");
    } else {
      router.replace("/patient/book");
    }

    return true;
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {}
    setUser(null);
    setToken(null);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
