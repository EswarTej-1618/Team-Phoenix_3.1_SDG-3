import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { getMotherProfileByEmail, verifyMotherPassword, type MotherSignupProfile } from "@/data/motherProfiles";

export type UserRole = "mother" | "doctor" | "asha";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isDoctor: boolean;
  isAsha: boolean;
  isMother: boolean;
  login: (email: string, password: string, role: UserRole) => boolean;
  signUpMother: (profile: MotherSignupProfile) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_DOCTOR = {
  email: "doctor@safemom.com",
  password: "doctor123",
  name: "Dr. Clinician",
};

const DEMO_ASHA = {
  email: "asha@safemom.com",
  password: "asha123",
  name: "Rani Devi",
};

const DEMO_MOTHER_PRIYA = {
  email: "priya@safemom.com",
  password: "priya123",
  name: "Priya Sharma",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = sessionStorage.getItem("safemom_user");
      if (stored) return JSON.parse(stored) as AuthUser;
    } catch {
      // ignore
    }
    return null;
  });

  const login = useCallback((email: string, password: string, role: UserRole): boolean => {
    if (role === "doctor") {
      if (email === DEMO_DOCTOR.email && password === DEMO_DOCTOR.password) {
        const authUser: AuthUser = {
          id: "doc-1",
          email: DEMO_DOCTOR.email,
          name: DEMO_DOCTOR.name,
          role: "doctor",
        };
        setUser(authUser);
        sessionStorage.setItem("safemom_user", JSON.stringify(authUser));
        return true;
      }
      return false;
    }
    if (role === "asha") {
      if (email === DEMO_ASHA.email && password === DEMO_ASHA.password) {
        const authUser: AuthUser = {
          id: "asha-1",
          email: DEMO_ASHA.email,
          name: DEMO_ASHA.name,
          role: "asha",
        };
        setUser(authUser);
        sessionStorage.setItem("safemom_user", JSON.stringify(authUser));
        return true;
      }
      return false;
    }
    // For mother: Priya demo or stored sign-up profile
    if (email === DEMO_MOTHER_PRIYA.email && password === DEMO_MOTHER_PRIYA.password) {
      const authUser: AuthUser = {
        id: "p1",
        email: DEMO_MOTHER_PRIYA.email,
        name: DEMO_MOTHER_PRIYA.name,
        role: "mother",
      };
      setUser(authUser);
      sessionStorage.setItem("safemom_user", JSON.stringify(authUser));
      return true;
    }
    if (verifyMotherPassword(email, password)) {
      const profile = getMotherProfileByEmail(email)!;
      const authUser: AuthUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: "mother",
      };
      setUser(authUser);
      sessionStorage.setItem("safemom_user", JSON.stringify(authUser));
      return true;
    }
    return false;
  }, []);

  const signUpMother = useCallback((profile: MotherSignupProfile): boolean => {
    const authUser: AuthUser = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: "mother",
    };
    setUser(authUser);
    sessionStorage.setItem("safemom_user", JSON.stringify(authUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("safemom_user");
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isDoctor: user?.role === "doctor",
    isAsha: user?.role === "asha",
    isMother: user?.role === "mother",
    login,
    signUpMother,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
