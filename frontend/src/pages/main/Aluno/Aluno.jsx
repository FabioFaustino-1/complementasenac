// App.jsx
import React from 'react';
import './Aluno.css';

// IMPORTANTE: Importe o logotipo que você salvou na pasta assets.
// O caminho é relativo de 'pages/login' para 'assets'
import logoSenac from '../src/assets/logo_senac.png';

function Aluno() {
  const atividades = [
    { id: 1, titulo: 'Workshop de React Avançado', tipo: 'Workshop', data: '12/03/2026', horas: '8h', status: 'Aprovado' },
    { id: 2, titulo: 'Palestra sobre IA Generativa', tipo: 'Palestra', data: '08/03/2026', horas: '8h', status: 'Aprovado' },
    { id: 3, titulo: 'Hackathon Senac 2026', tipo: 'Congresso', data: '01/03/2026', horas: '8h', status: 'Aprovado' },
    { id: 4, titulo: 'Curso de Python para Dados', tipo: 'Curso Online', data: '15/02/2026', horas: '8h', status: 'Aprovado' },
    { id: 5, titulo: 'Monitoria de Banco de Dados', tipo: 'Monitoria', data: '10/02/2026', horas: '8h', status: 'Aprovado' },
  ];

  return (
    <div className="portal-container">
      {/* Cabeçalho */}
      <header className="header">
        <div className="logo-section">
          {/* --- ANTES: <div className="logo-icon"></div> --- */}
          {/* --- AGORA: Tag img com a imagem importada --- */}
          <img src={logoSenac} alt="Logotipo Senac" className="logo-image" />
          
          <div className="logo-text">
            <strong>Senac</strong>
            <span>Complementares</span>
          </div>
        </div>
        
        <nav className="nav-menu">
          <button className="nav-item active">Minhas Horas</button>
          <button className="nav-item">Nova Submissão</button>
          <button className="nav-item">Histórico</button>
        </nav>

        <div className="user-profile">
          <button className="user-btn">Aluno</button>
        </div>
      </header>

      {/* Área Principal (sem alterações aqui) */}
      <main className="main-content">
        
        {/* Cards Superiores */}
        <section className="dashboard-cards">
          {/* Card Azul de Progresso */}
          <div className="card blue-card">
            <div className="blue-card-header">
              <h3>Análise e Desenvolvimento de Sistemas</h3>
              <span className="badge-warning">Próximo do limite</span>
            </div>
            
            <div className="hours-display">
              <h1>32<span>/40h</span></h1>
              <p>Carga Horária Complementar</p>
            </div>

            <div className="progress-section">
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: '80%' }}></div>
              </div>
              <div className="progress-labels">
                <span>80% concluído</span>
                <span>Máx.20h por tipo de atividade</span>
              </div>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="stats-container">
            <div className="card stat-card">
              <div className="stat-icon"></div>
              <h2>2</h2>
              <p>Aprovados</p>
            </div>
            <div className="card stat-card">
              <div className="stat-icon"></div>
              <h2>2</h2>
              <p>Pendentes</p>
            </div>
          </div>
        </section>

        {/* Lista de Atividades */}
        <section className="activities-list">
          {atividades.map((atividade) => (
            <div className="activity-item" key={atividade.id}>
              <div className="activity-info-group">
                <div className="activity-icon"></div>
                <div className="activity-details">
                  <h4>{atividade.titulo}</h4>
                  <p>{atividade.tipo} · {atividade.data}</p>
                </div>
              </div>
              <div className="activity-status-group">
                <span className="activity-hours">{atividade.horas}</span>
                <span className="activity-status">{atividade.status}</span>
              </div>
            </div>
          ))}
        </section>

      </main>
    </div>
  );
}

export default Aluno;
