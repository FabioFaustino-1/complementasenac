import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../../assets/Sidebar";
import { createCoordenadorMenu } from "../menuConfig";
import PerfilCoordenador from "./components/PerfilCoordenador";
import ListaAlunosCoordenador from "./components/ListaAlunosCoordenador";
import RelatoriosCoordenador from "./components/RelatoriosCoordenador";
import { useAuth } from "../../../assets/contexts/AuthContext";
import { decidirAtividadeCoordenador, obterPendentes, obterResumoCoordenador } from "../../../services/coordenador";
import "./Coordenador.css";

const ActivityCard = ({ id, title, student, hours, date, confidence, type, onApprove, onReject }) => {
  const [isExiting, setIsExiting] = useState(false);
  const isDivergent = confidence < 50;

  const handleAction = (status) => {
    setIsExiting(true);
    setTimeout(() => {
      if (status === "APROVADO") onApprove(id);
      else onReject(id);
    }, 400);
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
        <button className="coordenador-btn-secondary" onClick={() => handleAction("INDEFERIDO")}>Indeferir</button>
        <button className="coordenador-btn-primary" onClick={() => handleAction("APROVADO")}>Aprovar</button>
      </div>
    </div>
  );
};

const Coordenador = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("validacao");
  const [activities, setActivities] = useState([]);
  const [resumo, setResumo] = useState(null);
  const { token, user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const [pendentes, resumoApi] = await Promise.all([
          obterPendentes(token),
          obterResumoCoordenador(token),
        ]);
        setActivities(
          pendentes.map((item) => ({
            id: item.id,
            title: item.titulo,
            student: item.aluno,
            hours: String(item.horas),
            date: item.data,
            confidence: item.confiancaIa,
            type: item.tipo,
          }))
        );
        setResumo(resumoApi);
      } catch (error) {
        alert(`Erro ao carregar painel do coordenador: ${error.message}`);
      }
    };
    load();
  }, [token]);

  const decidir = async (id, status) => {
    try {
      await decidirAtividadeCoordenador(token, id, status);
      setActivities((prev) => prev.filter((act) => act.id !== id));
      if (resumo) {
        setResumo((prev) => ({
          ...prev,
          pendentes: Math.max(0, prev.pendentes - 1),
          aprovadasNoMes: status === "APROVADO" ? prev.aprovadasNoMes + 1 : prev.aprovadasNoMes,
          rejeitadasNoMes: status === "INDEFERIDO" ? prev.rejeitadasNoMes + 1 : prev.rejeitadasNoMes,
        }));
      }
    } catch (error) {
      alert(`Erro ao decidir atividade: ${error.message}`);
    }
  };

  const stats = useMemo(() => ({
    aprovadas: resumo?.aprovadasNoMes ?? 0,
    rejeitadas: resumo?.rejeitadasNoMes ?? 0,
    totalHistorico: (resumo?.aprovadasNoMes ?? 0) + (resumo?.rejeitadasNoMes ?? 0),
    alunosAtivos: resumo?.alunosAtivos ?? 0,
  }), [resumo]);
  const taxa = resumo?.taxaAprovacao ?? 0;
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
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              {...activity}
              onApprove={(id) => decidir(id, "APROVADO")}
              onReject={(id) => decidir(id, "INDEFERIDO")}
            />
          ))}
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
        userName={user?.email?.split("@")[0] ?? "Coordenador"}
        userEmail={user?.email ?? "coordenador@senac.pe.br"}
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