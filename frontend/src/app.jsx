import React, { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import { useAuth } from "./assets/contexts/AuthContext";

// Lazy loading para reduzir o bundle inicial (Critical Path)
const Aluno = lazy(() => import("./pages/main/Aluno/Aluno_entrega"));
const PerfilAluno = lazy(() => import("./pages/main/Aluno/PerfilAluno"));
const NovaSubmissao = lazy(() => import("./pages/main/Aluno/NovaSubmissao"));
const Historico = lazy(() => import("./pages/main/Aluno/Historico"));
const Coordenador = lazy(() => import("./pages/main/coordenador/Coordenador"));
const Admin = lazy(() => import("./pages/main/Administrador/Admin"));
const GestaoAlunos = lazy(() => import("./pages/main/Administrador/GestaoAlunos"));
const GestaoCoord = lazy(() => import("./pages/main/Administrador/GestaoCoord"));
const GestaoCursos = lazy(() => import("./pages/main/Administrador/GestaoCursos"));

function PrivateRoute({ children, allowedRoles }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="loading-fallback">Carregando...</div>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/aluno" element={<PrivateRoute allowedRoles={["aluno"]}><Aluno /></PrivateRoute>} />
          <Route path="/aluno/perfil" element={<PrivateRoute allowedRoles={["aluno"]}><PerfilAluno /></PrivateRoute>} />
          <Route path="/aluno/submissao" element={<PrivateRoute allowedRoles={["aluno"]}><NovaSubmissao /></PrivateRoute>} />
          <Route path="/aluno/historico" element={<PrivateRoute allowedRoles={["aluno"]}><Historico /></PrivateRoute>} />
          <Route path="/coordenador" element={<PrivateRoute allowedRoles={["coordenador"]}><Coordenador /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute allowedRoles={["admin"]}><Admin /></PrivateRoute>} />
          <Route path="/gestaoalunos" element={<PrivateRoute allowedRoles={["admin"]}><GestaoAlunos /></PrivateRoute>} />
          <Route path="/gestaocoord" element={<PrivateRoute allowedRoles={["admin"]}><GestaoCoord /></PrivateRoute>} />
          <Route path="/gestaocursos" element={<PrivateRoute allowedRoles={["admin"]}><GestaoCursos /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App; 
