import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import Aluno from "./pages/main/Aluno/Aluno_entrega";
import PerfilAluno from "./pages/main/Aluno/PerfilAluno";
import NovaSubmissao from "./pages/main/Aluno/NovaSubmissao";
import Historico from "./pages/main/Aluno/Historico";
import Coordenador from "./pages/main/coordenador/Coordenador";
import GestaoAlunos from "./pages/main/Administrador/GestaoAlunos";
import Admin from "./pages/main/Administrador/Admin"; 
import GestaoCoord from "./pages/main/Administrador/GestaoCoord"
import GestaoCursos from "./pages/main/Administrador/GestaoCursos";
import { useAuth } from "./assets/contexts/AuthContext";

function PrivateRoute({ children, allowedRoles }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/aluno" element={<PrivateRoute allowedRoles={["aluno"]}><Aluno /></PrivateRoute>} />
        <Route path="/aluno/perfil" element={<PrivateRoute allowedRoles={["aluno"]}><PerfilAluno /></PrivateRoute>} />
        <Route path="/aluno/submissao" element={<PrivateRoute allowedRoles={["aluno"]}><NovaSubmissao /></PrivateRoute>} />
        <Route path="/aluno/historico" element={<PrivateRoute allowedRoles={["aluno"]}><Historico /></PrivateRoute>} />
        <Route path="/coordenador" element={<PrivateRoute allowedRoles={["coordenador"]}><Coordenador /></PrivateRoute>} />
        <Route path="/gestaoAlunos" element={<PrivateRoute allowedRoles={["admin"]}><GestaoAlunos /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute allowedRoles={["admin"]}><Admin /></PrivateRoute>} />
        <Route path="/GestaoCoord" element={<PrivateRoute allowedRoles={["admin"]}><GestaoCoord /></PrivateRoute>} />
        <Route path="/GestaoCursos" element={<PrivateRoute allowedRoles={["admin"]}><GestaoCursos /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 