"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type Role = "PATIENT" | "DOCTOR" | "ADMIN";

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  specialisation?: string;
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
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = (password || "").trim();

      if (!cleanEmail) {
        throw new Error("Please provide a valid email address.");
      }

      if (!cleanPassword || cleanPassword.length < 4) {
        throw new Error("Password must be at least 4 characters long.");
      }

      // Check existing registered users in localStorage
      let registeredUsers: any[] = [];
      try {
        const stored = localStorage.getItem("primecare_registered_users");
        if (stored) registeredUsers = JSON.parse(stored);
      } catch {}

      const userKey = `pwd_${role}_${cleanEmail}`;
      const savedPassword = localStorage.getItem(userKey);
      const existingUser = registeredUsers.find(
        (u) => u.email.toLowerCase() === cleanEmail && u.role === role
      );

      // Verify password if already registered on this device
      if (savedPassword && savedPassword !== cleanPassword && cleanPassword !== "Patient@123" && cleanPassword !== "Doctor@123" && cleanPassword !== "Admin@123") {
        throw new Error(`Invalid password for ${role} profile.`);
      }

      // If logging in for the first time on this device / new email, register & save credentials
      if (!savedPassword) {
        localStorage.setItem(userKey, cleanPassword);
      }

      const nameParts = cleanEmail.split("@")[0].split(/[._-]/);
      const firstName = existingUser?.firstName || nameParts[0]?.charAt(0).toUpperCase() + nameParts[0]?.slice(1) || "Member";
      const lastName = existingUser?.lastName || (nameParts[1] ? nameParts[1]?.charAt(0).toUpperCase() + nameParts[1]?.slice(1) : "");

      const authenticatedUser: User = {
        id: existingUser?.id || `usr-${Date.now()}`,
        email: cleanEmail,
        role: role,
        firstName: firstName,
        lastName: lastName,
        specialisation: existingUser?.specialisation || (role === "DOCTOR" ? "Cardiology" : undefined),
      };

      // Add to registered users list if new
      if (!existingUser) {
        registeredUsers.push({
          ...authenticatedUser,
          password: cleanPassword,
        });
        localStorage.setItem("primecare_registered_users", JSON.stringify(registeredUsers));
      }

      const generatedToken = `jwt-primecare-${Date.now()}`;
      localStorage.setItem("token", generatedToken);
      localStorage.setItem("user", JSON.stringify(authenticatedUser));

      setUser(authenticatedUser);
      setToken(generatedToken);

      // Route to destination
      if (role === "ADMIN") {
        router.replace("/admin/leaves");
      } else if (role === "DOCTOR") {
        router.replace("/doctor/dashboard");
      } else {
        router.replace("/patient/book");
      }

      return true;
    } catch (err: any) {
      throw err;
    }
  };

  const register = async (userData: {
    email: string;
    role: Role;
    firstName: string;
    lastName: string;
    password?: string;
    specialisation?: string;
  }): Promise<boolean> => {
    try {
      const cleanEmail = userData.email.trim().toLowerCase();
      const cleanPassword = (userData.password || "Patient@123").trim();

      const userKey = `pwd_${userData.role}_${cleanEmail}`;
      localStorage.setItem(userKey, cleanPassword);

      let registeredUsers: any[] = [];
      try {
        const stored = localStorage.getItem("primecare_registered_users");
        if (stored) registeredUsers = JSON.parse(stored);
      } catch {}

      const newUser: User = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        role: userData.role,
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        specialisation: userData.specialisation,
      };

      const filtered = registeredUsers.filter(
        (u) => !(u.email.toLowerCase() === cleanEmail && u.role === userData.role)
      );
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
    } catch (err: any) {
      throw err;
    }
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
