import React, { useState, useRef } from 'react';
import './Aluno_entrega.css';
import logoSenac from '../../../assets/logo-senac.png'; 

const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const IconSubmit = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><polyline points="9 15 12 18 15 15"></polyline></svg>
);
const IconHistory = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const IconLogout = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);
const IconPlus = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
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
      // CORREÇÃO: Adicionado crases para o template literal
      alert(`Arquivo selecionado: ${file.name}`);
    }
  };

  return (
    <div className="container-aluno">
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".pdf,image/*" 
        onChange={handleFileChange}
      />

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* CORREÇÃO: Adicionado chaves e crases para a lógica de classe */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-text">Senac <span>Complementares</span></div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <a href="#">
            <div className="icon-wrap"><IconUser /></div>
            <span>Meu Perfil</span>
          </a>
          <a href="#" className="active">
            <div className="icon-wrap"><IconClock /></div>
            <span>Minhas Horas</span>
          </a>
          <a href="#">
            <div className="icon-wrap"><IconSubmit /></div>
            <span>Nova Submissão</span>
          </a>
          <a href="#">
            <div className="icon-wrap"><IconHistory /></div>
            <span>Histórico</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <a href="#" className="logout-button">
            <div className="icon-wrap"><IconLogout /></div>
            <span>Sair da Conta</span>
          </a>
          <div className="user-info">
            <p className="user-name">Fabio Faustão</p>
            <p className="user-email">fabio.faustao@edu.pe.senac.br</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
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
                    {/* CORREÇÃO: Adicionado chaves e crases para a lógica de classe */}
                    <span className={`status-pill ${act.status.toLowerCase()}`}>{act.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <button className="fab-plus" onClick={handleFabClick}>
          <IconPlus />
        </button>
      </main>
    </div>
  );
};

export default Aluno_entrega;