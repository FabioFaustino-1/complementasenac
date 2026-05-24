import React, { createContext, useContext, useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { auth as firebaseAuth } from "../../services/firebase";

const AuthContext = createContext(undefined);

const STORAGE_KEY = "complementa.auth";

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStorage(payload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }) {
  const initial = readStorage();
  const [session, setSession] = useState(
    initial ?? { user: null, role: null, token: null }
  );

  const loginWithBackend = ({ token, perfil, email }) => {
    const role = perfil?.perfil ?? "aluno";
    const user = {
      uid: perfil?.uid ?? null,
      name: perfil?.nome ?? null,
      email: perfil?.email ?? email ?? null,
      role,
    };
    const next = { user, role, token };
    setSession(next);
    writeStorage(next);
  };

  const logout = async () => {
    try {
      await signOut(firebaseAuth);
    } catch {
      // sessao local ainda e limpa
    }
    setSession({ user: null, role: null, token: null });
    clearStorage();
  };

  const value = useMemo(
    () => ({
      user: session.user,
      role: session.role,
      token: session.token,
      isAuthenticated: !!session.token,
      loginWithBackend,
      logout,
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
