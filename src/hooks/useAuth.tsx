import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  apiClient,
  clearAuth,
  getStoredToken,
  getStoredUser,
  type DjangoUser,
} from "@/integrations/api/client";

interface AuthContextType {
  user: DjangoUser | null;
  token: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  signOut: async () => {},
  refreshUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<DjangoUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(() => {
    const t = getStoredToken();
    const u = getStoredUser();
    setToken(t);
    setUser(u);
  }, []);

  useEffect(() => {
    refreshUser();
    setLoading(false);
  }, [refreshUser]);

  const signOut = async () => {
    const t = getStoredToken();
    if (t) {
      try {
        await apiClient.logout();
      } catch {
        clearAuth();
      }
    } else {
      clearAuth();
    }
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
