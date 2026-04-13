import React, { useState, useRef } from 'react';
import Sidebar from '../../../assets/Sidebar'; // Certifique-se que o arquivo Sidebar.jsx está nesta pasta
import logoSenac from '../../../assets/logo-senac.png'; 
import './Aluno_entrega.css';

// Ícone do botão flutuante (Plus)
const IconPlus = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const Aluno_entrega = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef(null);

  const activities = [
    { id: 1, title: 'Workshop de React Avançado', type: 'Workshop', date: '12/03/2026', hours: '8h', status: 'Aprovado' },
    { id: 2, title: 'Palestra sobre IA Generativa', type: 'Palestra', date: '08/03/2026', hours: '8h', status: 'Pendente' },
    { id: 3, title: 'Curso de Python para Dados', type: 'Curso Online', date: '15/02/2026', hours: '8h', status: 'Aprovado' },
  ];

  const handleFabClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      alert(`Arquivo selecionado: ${file.name}`);
    }
  };

  return (
    <div className="container-aluno">
      {/* Input de Arquivo Oculto */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".pdf,image/*" 
        onChange={handleFileChange}
      />

      {/* COMPONENTE DE SIDEBAR UNIFICADO */}
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        activePage="horas" 
      />

      <main className="main-content">
        {/* Cabeçalho Superior */}
        <header className="top-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="header-right">
            <div className="header-labels">
              <strong>Senac</strong>
              <span>Complementares</span>
            </div>
            {logoSenac && <img src={logoSenac} alt="Logo" className="mini-logo" />}
          </div>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-top">
            {/* Card de Progresso */}
            <div className="course-card">
              <div className="course-info">
                <h3>Análise e Desenvolvimento de Sistemas</h3>
                <span className="badge-limit">Próximo do limite</span>
              </div>
              <div className="hours-main">
                <h1>32<span>/40h</span></h1>
                <p>Carga Horária Complementar</p>
              </div>
              <div className="progress-section">
                <span>80% concluído</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '80%' }}></div>
                </div>
                <span className="max-info">Máx. 20h por tipo de atividade</span>
              </div>
            </div>

            {/* Grid de Estatísticas */}
            <div className="stats-grid">
              <div className="stat-card approved">
                <div className="icon-circle">
                  <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="8 12 11 15 16 9"></polyline>
                  </svg>
                </div>
                <h2>3</h2>
                <p>Aprovados</p>
              </div>
              
              <div className="stat-card pending">
                <div className="icon-circle">
                  <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#f39c12" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <h2>2</h2>
                <p>Pendentes</p>
              </div>

              <div className="stat-card denied">
                <div className="icon-circle">
                  <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </div>
                <h2>0</h2>
                <p>Negados</p>
              </div>
            </div>
          </div>

          {/* Seção de Atividades */}
          <section className="activities-section">
            <div className="section-header">
              <h3>Atividades Recentes</h3>
              <a href="#" className="ver-todas">Ver todas</a>
            </div>
            <div className="activities-list">
              {activities.map((act) => (
                <div key={act.id} className="activity-item">
                  <div className="activity-info">
                    <span className="doc-icon">📄</span>
                    <div>
                      <h4>{act.title}</h4>
                      <p>{act.type} • {act.date}</p>
                    </div>
                  </div>
                  <div className="activity-meta">
                    <span className="hours-tag">{act.hours}</span>
                    <span className={`status-pill ${act.status.toLowerCase()}`}>
                      {act.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Botão de Ação Flutuante */}
        <button className="fab-plus" onClick={handleFabClick} title="Nova Submissão">
          <IconPlus />
        </button>
      </main>
    </div>
  );
};

export default Aluno_entrega;