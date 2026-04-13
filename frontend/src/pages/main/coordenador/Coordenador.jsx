import React, { useState } from "react";
import { ClipboardCheck, User, Users, BarChart3, LogOut } from "lucide-react";
import './Coordenador.css';

const ActivityCard = ({ id, title, student, hours, date, confidence, type, onAction }) => {
  const [isExiting, setIsExiting] = useState(false);
  const isDivergent = confidence < 50;

  const handleAction = () => {
    setIsExiting(true);
    // Tempo para a animação de saída completar antes de remover do estado
    setTimeout(() => onAction(id), 400);
  };

  return (
    <div className={`activity-card ${isExiting ? "exit-animation" : ""}`}>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '15px', fontWeight: '600' }}>{title}</h3>
          {isDivergent && <span className="badge-divergence">DIVERGÊNCIA IA</span>}
        </div>
        <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>{student} • ADS • {type} • {date}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
          <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{hours}h</span>
          <span className={isDivergent ? "badge-ia-warning" : "badge-ia-success"}>
            IA: {confidence}% confiança
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn-secondary" onClick={handleAction}>Indeferir</button>
        <button className="btn-primary" onClick={handleAction}>Aprovar</button>
      </div>
    </div>
  );
};

const Coordenador = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Painel de Validação");
  
  const [activities, setActivities] = useState([
    { id: 1, title: "Workshop de React Avançado", student: "Maria Silva", hours: "8", date: "12/03/2026", confidence: 95, type: "Workshop" },
    { id: 2, title: "Palestra sobre IA Generativa", student: "João Santos", hours: "4", date: "08/03/2026", confidence: 88, type: "Palestra" },
    { id: 3, title: "Curso de Excel Avançado", student: "Ana Costa", hours: "20", date: "01/03/2026", confidence: 42, type: "Curso Online" },
    { id: 4, title: "Hackathon Senac 2026", student: "Pedro Lima", hours: "12", date: "28/02/2026", confidence: 91, type: "Congresso" },
  ]);

  const removeActivity = (id) => {
    setActivities(prev => prev.filter(act => act.id !== id));
  };

  const navItems = [
    { name: "Meu Perfil", icon: <User size={20} color="white" /> },
    { name: "Painel de Validação", icon: <ClipboardCheck size={20} color="white" /> },
    { name: "Lista de Alunos", icon: <Users size={20} color="white" /> },
    { name: "Relatórios", icon: <BarChart3 size={20} color="white" /> },
  ];

  return (
    <div className="app-viewport">
      {/* Overlay para fechar o menu mobile ao clicar fora */}
      {isMenuOpen && <div className="overlay" onClick={() => setIsMenuOpen(false)} />}

      {/* Sidebar com classe dinâmica corrigida */}
      <div className={`sidebar ${isMenuOpen ? "open" : ""}`}>
        <div className="sidebar-content">
          <div className="sidebar-top">
            <div className="sidebar-logo-section">
              <div className="sidebar-logo-text">
                <div className="senac-txt">Senac</div>
                <div className="comp-txt">Complementares</div>
              </div>
            </div>

            <nav className="nav-list">
              {navItems.map((item) => {
                const isSelected = activeTab === item.name;
                return (
                  <div 
                    key={item.name} 
                    className={`nav-item ${isSelected ? "active" : ""}`} 
                    onClick={() => {
                      setActiveTab(item.name); 
                      setIsMenuOpen(false);
                    }}
                  >
                    <div className={`nav-icon-circle ${isSelected ? "active-border" : ""}`}>
                      {item.icon}
                    </div>
                    <span>{item.name}</span>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="sidebar-footer">
            <div className="btn-logout" onClick={() => setIsMenuOpen(false)}>
              <div className="nav-icon-circle">
                <LogOut size={20} color="white" />
              </div>
              <span>Sair da Conta</span>
            </div>
            <div className="footer-user-info">
              <div className="user-name-bold">Fabio Faustino</div>
              <div className="user-email">fabio.faustino@senac.pe.br</div>
            </div>
          </div>
        </div>
      </div>

      {/* Área Principal */}
      <div className="header-container">
        <header className="header-bar">
          <div onClick={() => setIsMenuOpen(true)} className="burger-menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </div>
          
          <div className="header-right-logo">
            <div className="logo-senac-container">
               <img src="/logo-senac.png" alt="Senac Logo" className="senac-icon-img" />
            </div>
            <div className="text-right">
              <div className="senac-bold">Senac</div>
              <div className="comp-bold-orange">Complementares</div>
            </div>
          </div>
        </header>
      </div>

      <main className="main-content">
        <div className="page-title-section">
          <h1>Fila de Validação</h1>
          <p className="subtitle-small">{activities.length} atividades aguardando análise.</p>
        </div>

        <div className="list-wrapper">
          {activities.map(activity => (
            <ActivityCard key={activity.id} {...activity} onAction={removeActivity} />
          ))}
          {activities.length === 0 && (
            <p className="empty-msg">Nenhuma atividade pendente.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Coordenador;