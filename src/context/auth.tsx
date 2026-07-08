import { createContext, useContext, useMemo, useState } from "react";

import {
  clearSession,
  loadSession,
  login as apiLogin,
  saveSession,
} from "@/lib/api";
import type { Role, Session } from "@/lib/types";

interface AuthState {
  session: Session | null;
  login: (role: Role, username: string, password: string) => Promise<Session>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => loadSession());

  const value = useMemo<AuthState>(
    () => ({
      session,
      async login(role, username, password) {
        const s = await apiLogin(role, username, password);
        saveSession(s);
        setSession(s);
        return s;
      },
      logout() {
        clearSession();
        setSession(null);
      },
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
