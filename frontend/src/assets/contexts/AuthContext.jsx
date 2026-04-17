import React, { createContext, useContext, useMemo, useState } from "react";

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
  const [auth, setAuth] = useState(
    initial ?? { user: null, role: null, token: null }
  );

  const loginWithBackend = ({ token, perfil, email }) => {
    const role = perfil?.perfil ?? "aluno";
    const user = {
      uid: perfil?.uid ?? null,
      email: perfil?.email ?? email ?? null,
      role,
    };
    const next = { user, role, token };
    setAuth(next);
    writeStorage(next);
  };

  const logout = () => {
    setAuth({ user: null, role: null, token: null });
    clearStorage();
  };

  const value = useMemo(
    () => ({
      user: auth.user,
      role: auth.role,
      token: auth.token,
      isAuthenticated: !!auth.token,
      loginWithBackend,
      logout,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}