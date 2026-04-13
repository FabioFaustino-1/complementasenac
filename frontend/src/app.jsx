import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import Aluno from "./pages/main/Aluno/Aluno_entrega";
import Coordenador from "./pages/main/coordenador/Coordenador";
import GestaoAlunos from "./pages/main/Administrador/Gestaoalunos";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/aluno" element={<Aluno />} />
        <Route path="/coordenador" element={<Coordenador />} />
        <Route path="/GestaoAlunos" element={<GestaoAlunos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 