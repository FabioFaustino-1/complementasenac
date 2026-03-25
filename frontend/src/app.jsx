import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login/App";
import Aluno from "./pages/aluno/Aluno";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/aluno" element={<Aluno />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;