import React, { createContext, useContext, useState } from "react";
const AuthContext = createContext(undefined);
const mockUsers = {
    aluno: {
        id: "1",
        name: "Fabio Faustão",
        email: "fabio.faustao@edu.pe.senac.br",
        role: "aluno",
        course: "Análise e Desenvolvimento de Sistemas",
        department: "Tecnologia da Informação",
        phone: "(81) 99728-1233",
        matricula: "2024.1.12.12345",
        ingresso: "Fevereiro 2024",
    },
    coordenador: {
        id: "2",
        name: "Maria Silva",
        email: "maria.silva@senac.pe.br",
        role: "coordenador",
        department: "Tecnologia da Informação",
    },
    admin: {
        id: "3",
        name: "Super Admin",
        email: "admin@senac.pe.br",
        role: "admin",
    },
};
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const login = (email, _password, role) => {
        if (email && _password) {
            setUser(mockUsers[role]);
            return true;
        }
        return false;
    };
    const logout = () => setUser(null);
    return (<AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used within AuthProvider");
    return context;
}