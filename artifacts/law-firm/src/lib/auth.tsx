import { createContext, useContext, ReactNode } from "react";
import { useGetMe, Lawyer, useLogout } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AuthContextType {
  user: Lawyer | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, refetch } = useGetMe({
    query: {
      queryKey: ["me"],
      retry: false,
    },
  });

  const logoutMutation = useLogout();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    await refetch();
    setLocation("/admin/login");
  };

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}