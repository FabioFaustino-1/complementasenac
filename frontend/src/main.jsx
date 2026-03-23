import React from "react";
import ReactDOM from "react-dom/client";
// Olha como o caminho ficou limpo agora, só com o ponto e barra:
import Aluno from "./Aluno.jsx"; 
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Aluno />
  </React.StrictMode>
);
