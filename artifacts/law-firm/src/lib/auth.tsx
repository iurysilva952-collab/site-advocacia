import { createContext, useContext, ReactNode, useMemo } from "react";
import { Lawyer } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AuthContextType {
  user: Lawyer | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const demoAdminUser: Lawyer = {
  id: 1,
  name: "Administrador",
  email: "admin@silva.com",
  role: "admin",
} as Lawyer;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();

  const isLocalAdmin =
    typeof window !== "undefined" &&
    localStorage.getItem("admin-auth") === "true";

  const value = useMemo<AuthContextType>(
    () => ({
      user: isLocalAdmin ? demoAdminUser : null,
      isLoading: false,
      logout: () => {
        localStorage.removeItem("admin-auth");
        setLocation("/admin/login");
      },
    }),
    [isLocalAdmin, setLocation]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}