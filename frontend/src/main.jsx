import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Login from './pages/login/Login'
import Aluno from "./pages/main/Aluno/Aluno_entrega";
import Coordenador from "./pages/main/coordenador/Coordenador";
import { BrowserRouter, Routes, Route } from "react-router-dom";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/aluno" element={<Aluno />} />
        <Route path="/coordenador" element={<Coordenador />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
