import React, { useMemo, useState } from "react";
import Sidebar from "../../../assets/Sidebar";
import { createCoordenadorMenu } from "../menuConfig";
import PerfilCoordenador from "./components/PerfilCoordenador";
import ListaAlunosCoordenador from "./components/ListaAlunosCoordenador";
import RelatoriosCoordenador from "./components/RelatoriosCoordenador";
import "./Coordenador.css";

const ActivityCard = ({ id, title, student, hours, date, confidence, type, onAction }) => {
  const [isExiting, setIsExiting] = useState(false);
  const isDivergent = confidence < 50;

  const handleAction = () => {
    setIsExiting(true);
    // Tempo para a animação de saída completar antes de remover do estado
    setTimeout(() => onAction(id), 400);
  };

  return (
    <div className={`coordenador-activity-card ${isExiting ? "coordenador-exit-animation" : ""}`}>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '15px', fontWeight: '600' }}>{title}</h3>
          {isDivergent && <span className="coordenador-badge-divergence">DIVERGÊNCIA IA</span>}
        </div>
        <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>{student} • ADS • {type} • {date}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
          <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{hours}h</span>
          <span className={isDivergent ? "coordenador-badge-ia-warning" : "coordenador-badge-ia-success"}>
            IA: {confidence}% confiança
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="coordenador-btn-secondary" onClick={handleAction}>Indeferir</button>
        <button className="coordenador-btn-primary" onClick={handleAction}>Aprovar</button>
      </div>
    </div>
  );
};

const Coordenador = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("validacao");
  
  const [activities, setActivities] = useState([
    { id: 1, title: "Workshop de React Avancado", student: "Maria Silva", hours: "8", date: "12/03/2026", confidence: 95, type: "Workshop", avatar: "MS", color: "#dbeafe", textColor: "#1e40af" },
    { id: 2, title: "Palestra sobre IA Generativa", student: "Joao Santos", hours: "4", date: "08/03/2026", confidence: 88, type: "Palestra", avatar: "JS", color: "#fee2e2", textColor: "#991b1b" },
    { id: 3, title: "Curso de Excel Avancado", student: "Ana Costa", hours: "20", date: "01/03/2026", confidence: 42, type: "Curso Online", avatar: "AC", color: "#d1fae5", textColor: "#065f46" },
    { id: 4, title: "Hackathon Senac 2026", student: "Pedro Lima", hours: "12", date: "28/02/2026", confidence: 91, type: "Congresso", avatar: "PL", color: "#fef3c7", textColor: "#92400e" },
  ]);

  const removeActivity = (id) => {
    setActivities(prev => prev.filter(act => act.id !== id));
  };

  const stats = useMemo(
    () => ({ aprovadas: 25, rejeitadas: 5, totalHistorico: 30 }),
    []
  );
  const taxa = Math.round((stats.aprovadas / stats.totalHistorico) * 100);
  const menuItems = createCoordenadorMenu(setActiveTab);

  const renderContent = () => {
    if (activeTab === "perfil") return <PerfilCoordenador />;
    if (activeTab === "alunos") return <ListaAlunosCoordenador />;
    if (activeTab === "relatorios") return <RelatoriosCoordenador stats={stats} activities={activities} taxa={taxa} />;
    return (
      <main className="coordenador-main-content">
        <div className="page-title-section">
          <h1>Fila de Validacao</h1>
          <p className="coordenador-subtitle-small">{activities.length} atividades aguardando analise.</p>
        </div>
        <div className="list-wrapper">
          {activities.map((activity) => <ActivityCard key={activity.id} {...activity} onAction={removeActivity} />)}
          {activities.length === 0 && <p className="empty-msg">Nenhuma atividade pendente.</p>}
        </div>
      </main>
    );
  };

  return (
    <div className="coordenador-page">
      <Sidebar
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        activePage={activeTab}
        menuItems={menuItems}
        userName="Fabio Faustino"
        userEmail="fabio.faustino@senac.pe.br"
      />
      <div className="coordenador-header-container">
        <header className="coordenador-header-bar">
          <button onClick={() => setIsMenuOpen(true)} className="coordenador-burger-menu">☰</button>
          <div className="coordenador-header-right-group">
            <div className="coordenador-text-right-aligned">
              <div className="coordenador-senac-bold">Senac</div>
              <div className="coordenador-comp-bold-orange">Complementares</div>
            </div>
            <div className="coordenador-s-plus-box">S+</div>
          </div>
        </header>
      </div>
      {renderContent()}
    </div>
  );
};

export default Coordenador;