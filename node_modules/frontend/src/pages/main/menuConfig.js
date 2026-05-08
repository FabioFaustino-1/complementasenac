import React from "react";
import { User, Clock, UploadCloud, FileText, ClipboardCheck, Users, BarChart3 } from "lucide-react";

const icon = (Component) => React.createElement(Component, { size: 20, color: "currentColor" });

export const createAlunoMenu = (navigate) => [
  { id: "perfil", name: "Meu Perfil", icon: icon(User), onClick: () => navigate("/aluno/perfil") },
  { id: "horas", name: "Minhas Horas", icon: icon(Clock), onClick: () => navigate("/aluno") },
  { id: "submissao", name: "Nova Submissao", icon: icon(UploadCloud), onClick: () => navigate("/aluno/submissao") },
  { id: "historico", name: "Historico", icon: icon(FileText), onClick: () => navigate("/aluno/historico") },
];

export const createCoordenadorMenu = (setActiveTab) => [
  { id: "perfil", name: "Meu Perfil", icon: icon(User), onClick: () => setActiveTab("perfil") },
  { id: "validacao", name: "Painel de Validacao", icon: icon(ClipboardCheck), onClick: () => setActiveTab("validacao") },
  { id: "alunos", name: "Lista de Alunos", icon: icon(Users), onClick: () => setActiveTab("alunos") },
  { id: "relatorios", name: "Relatorios", icon: icon(BarChart3), onClick: () => setActiveTab("relatorios") },
];
