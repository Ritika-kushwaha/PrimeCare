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
        const parsed = JSON.parse(storedUser);
        if (parsed.role === "DOCTOR" && !parsed.isApproved) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setToken(null);
        } else {
          setToken(storedToken);
          setUser(parsed);
        }
      }
    } catch (e) {
      console.error("Session restore error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, role: Role, password?: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    if (!cleanEmail) throw new Error("Please enter your email address.");
    if (!cleanPassword) throw new Error("Please enter your password.");

    const res = await fetch('/api/auth/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'LOGIN',
        email: cleanEmail,
        password: cleanPassword,
        role
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      // Clear any remaining storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setToken(null);
      throw new Error(data.error || 'Authentication failed.');
    }

    const authenticatedUser: User = data.user;

    // Hard verification
    if (authenticatedUser.role === 'DOCTOR' && !authenticatedUser.isApproved) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setToken(null);
      throw new Error('Your Doctor application has NOT been approved yet. Please wait for Admin verification before logging in.');
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

    if (!userData.firstName.trim()) {
      throw new Error("First name is required.");
    }

    if (userData.role === "DOCTOR" && !userData.regNumber) {
      throw new Error("NMC / MCI Medical Registration ID is required for verification.");
    }

    const res = await fetch('/api/auth/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'REGISTER',
        email: cleanEmail,
        password: cleanPassword,
        role: userData.role,
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        specialisation: userData.specialisation,
        regNumber: userData.regNumber
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Registration failed.');
    }

    const newUser: User = data.user;

    // NEVER LOGIN AN UNAPPROVED DOCTOR ON SIGNUP
    if (userData.role === 'DOCTOR') {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setToken(null);
      return false; // Tells login page to stay on pending approval screen
    }

    const generatedToken = `jwt-primecare-${Date.now()}`;
    localStorage.setItem("token", generatedToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
    setToken(generatedToken);

    if (userData.role === "ADMIN") {
      router.replace("/admin/leaves");
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
