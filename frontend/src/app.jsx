import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import Aluno from "./pages/main/Aluno/Aluno_entrega";
import PerfilAluno from "./pages/main/Aluno/PerfilAluno";
import NovaSubmissao from "./pages/main/Aluno/NovaSubmissao";
import Historico from "./pages/main/Aluno/Historico";
import Coordenador from "./pages/main/coordenador/Coordenador";
import GestaoAlunos from "./pages/main/Administrador/Gestaoalunos";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/aluno" element={<Aluno />} />
        <Route path="/aluno/perfil" element={<PerfilAluno />} />
        <Route path="/aluno/submissao" element={<NovaSubmissao />} />
        <Route path="/aluno/historico" element={<Historico />} />
        <Route path="/coordenador" element={<Coordenador />} />
        <Route path="/gestaoAlunos" element={<GestaoAlunos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 