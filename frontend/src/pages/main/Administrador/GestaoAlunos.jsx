import React, { useState } from 'react';
import Sidebar from '../../../assets/Sidebar';

import { 
  UserPlus, 
  Pencil, 
  Trash2, 
  Search, 
  User, 
  ClipboardCheck, 
  Users, 
  BarChart3, 
  LogOut 
} from 'lucide-react';
import './GestaoAlunos.css';

const GestaoAlunos = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const students = [
    { id: 1, name: "Fabio Faustão", email: "fabio.faustao@edu.pe.senac.br", registration: "2024.1.12.12345", course: "Análise e Desenvolvimento de Sistemas" },
    { id: 2, name: "Ana Oliveira", email: "ana.oliveira@edu.pe.senac.br", registration: "2024.1.12.12346", course: "Design Gráfico" },
    { id: 3, name: "Carlos Santos", email: "carlos.santos@edu.pe.senac.br", registration: "2024.1.12.12347", course: "Enfermagem" },
  ];

  const itensMenuAdmin = [
  { id: 'coordenadores', name: 'Gestão de Coordenadores', icon: <User size={20} color="white" /> },
  { id: 'alunos', name: 'Adicionar Aluno', icon: <ClipboardCheck size={20} color="white" /> },
  { id: 'cursos', name: 'Gerenciamento de Cursos', icon: <Users size={20} color="white" /> },
  { id: 'logs', name: 'Logs', icon: <BarChart3 size={20} color="white" /> },
];


  return (
    <div className="app-viewport">
      <Sidebar 
       isOpen={sidebarOpen} 
      setIsOpen={setSidebarOpen} 
      activePage="alunos" 
      menuItems={itensMenuAdmin}
      userName="Fabio Faustino"
      userEmail="fabio.faustino@edu.pe.senac.br"
      />

      <main className="main-content-gestao">
        <header className="gestao-header">
          <button className="burger-menu" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="header-right-logo">
            <div className="logo-badge">S+</div>
            <div className="text-group">
              <span className="senac-bold">Senac</span>
              <span className="comp-orange">Complementares</span>
            </div>
          </div>
        </header>

        <section className="gestao-container">
          <div className="title-row">
            <h1>Gestão de Alunos</h1>
            {!showForm && (
              <button className="btn-add-student" onClick={() => setShowForm(true)}>
                <UserPlus size={18} /> Adicionar Aluno
              </button>
            )}
          </div>

          {showForm && (
            <div className="add-student-card">
              <h3>Novo Aluno</h3>
              <div className="form-grid">
                <input type="text" placeholder="Nome completo" />
                <input type="email" placeholder="E-mail institucional" />
                <input type="text" placeholder="Matrícula" />
                <input type="text" placeholder="Curso" />
              </div>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancelar</button>
                <button className="btn-save">Salvar Aluno</button>
              </div>
            </div>
          )}

          <div className="search-bar-container">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Buscar por nome ou matrícula..." />
          </div>

          <div className="students-list">
            {students.map(student => (
              <div key={student.id} className="student-item-card">
                <div className="student-info">
                  <h4>{student.name}</h4>
                  <p className="student-email">{student.email}</p>
                  <p className="student-details">{student.registration} • {student.course}</p>
                </div>
                <div className="student-actions">
                  <button className="btn-icon edit"><Pencil size={18} /></button>
                  <button className="btn-icon delete"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default GestaoAlunos;