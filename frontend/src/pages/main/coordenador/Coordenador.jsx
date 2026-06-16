import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCheck,
  ClipboardCheck,
  Clock3,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import Sidebar from "../../../assets/Sidebar";
import { createCoordenadorMenu } from "../menuConfig";
import PerfilCoordenador from "./components/PerfilCoordenador";
import ListaAlunosCoordenador from "./components/ListaAlunosCoordenador";
import RelatoriosCoordenador from "./components/RelatoriosCoordenador";
import { useAuth } from "../../../assets/contexts/AuthContext";
import {
  decidirAtividadeCoordenador,
  obterPendentes,
  obterResumoCoordenador,
} from "../../../services/coordenador";
import { buildGreeting, deriveDisplayName, formatDisplayText } from "../../../utils/userDisplay";
import "./Coordenador.css";
import { MAX_HORAS_POR_ATIVIDADE, validarHorasAtividade } from "../../../constants/hoursLimits";

const ActivityCard = ({
  id,
  title,
  student,
  hours,
  date,
  type,
  comprovanteUrl,
  onApprove,
  onReject,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleAction = (status) => {
    setIsExiting(true);
    setTimeout(() => {
      if (status === "APROVADO") onApprove(id);
      else onReject(id);
    }, 400);
  };

  return (
    <div className={`coordenador-activity-card ${isExiting ? "coordenador-exit-animation" : ""}`}>
      <div className="coordenador-activity-card__icon">
        <ClipboardCheck size={18} />
      </div>

      <div className="coordenador-activity-card__body">
        <div className="coordenador-activity-card__title-row">
          <h3>{title}</h3>
        </div>

        <div className="coordenador-activity-card__meta-row">
          <span>{formatDisplayText(student, "Aluno")} • {formatDisplayText(type)} • {formatDisplayText(date)}</span>
          <span className="coordenador-activity-card__hours">{hours}h</span>
        </div>

        <div className="coordenador-activity-card__footer">
          <span className="coordenador-soft-pill">
            <Clock3 size={14} />
            Em validacao
          </span>
        </div>
      </div>

      <div className="coordenador-activity-card__actions">
        <button className="coordenador-btn-secondary" onClick={() => handleAction("INDEFERIDO")}>
          Indeferir
        </button>
        {comprovanteUrl ? (
          <a
            className="coordenador-pdf-link"
            href={comprovanteUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visualizar PDF
          </a>
        ) : null}
        <button className="coordenador-btn-primary" onClick={() => handleAction("APROVADO")}>
          Aprovar
        </button>
      </div>
    </div>
  );
};

const Coordenador = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("validacao");
  const [activities, setActivities] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [error, setError] = useState(null);
  const [decisionModal, setDecisionModal] = useState(null);
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        setError(null);
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
            type: item.tipo,
            comprovanteUrl: item.comprovanteUrl,
          }))
        );
        setResumo(resumoApi);
      } catch (loadError) {
        setError(loadError.message || "Nao foi possivel carregar o painel do coordenador.");
      }
    };

    load();
  }, [token]);

  const abrirModalDecisao = (id, status) => {
    setDecisionModal({
      id,
      status,
      horasAprovadas: "",
      justificativa: "",
    });
  };

  const fecharModalDecisao = () => {
    setDecisionModal(null);
  };

  const confirmarDecisao = async () => {
    if (!decisionModal) return;

    const { id, status, horasAprovadas, justificativa } = decisionModal;
    try {
      setError(null);
      const extras = {};
      if (status === "APROVADO") {
        const validacaoHoras = validarHorasAtividade(horasAprovadas);
        if (!validacaoHoras.valido) {
          throw new Error(validacaoHoras.mensagem || "Informe um numero valido de horas aprovadas.");
        }
        extras.horasAprovadas = validacaoHoras.horas;
      } else {
        if (!justificativa.trim()) {
          throw new Error("A justificativa da rejeicao e obrigatoria.");
        }
        extras.justificativa = justificativa.trim();
      }

      await decidirAtividadeCoordenador(token, id, status, extras);
      setActivities((prev) => prev.filter((act) => act.id !== id));
      fecharModalDecisao();
      if (resumo) {
        setResumo((prev) => ({
          ...prev,
          pendentes: Math.max(0, prev.pendentes - 1),
          aprovadasNoMes: status === "APROVADO" ? prev.aprovadasNoMes + 1 : prev.aprovadasNoMes,
          rejeitadasNoMes: status === "INDEFERIDO" ? prev.rejeitadasNoMes + 1 : prev.rejeitadasNoMes,
        }));
      }
    } catch (decisionError) {
      setError(decisionError.message || "Nao foi possivel concluir a decisao.");
    }
  };

  const stats = useMemo(
    () => ({
      aprovadas: resumo?.aprovadasNoMes ?? 0,
      rejeitadas: resumo?.rejeitadasNoMes ?? 0,
      totalHistorico: (resumo?.aprovadasNoMes ?? 0) + (resumo?.rejeitadasNoMes ?? 0),
      alunosAtivos: resumo?.alunosAtivos ?? 0,
    }),
    [resumo]
  );

  const taxa = resumo?.taxaAprovacao ?? 0;
  const nomeUsuario = deriveDisplayName({
    name: user?.name,
    email: user?.email,
    fallback: "Coordenador",
  });
  const menuItems = createCoordenadorMenu(setActiveTab);
  const statCards = [
    {
      label: "Pendentes",
      value: `${activities.length}`,
      tone: "blue",
      delta: `${resumo?.pendentes ?? activities.length} na fila`,
      accent: "bars",
    },
    {
      label: "Aprovadas no mes",
      value: `${stats.aprovadas}`,
      tone: "green",
      delta: `${taxa}% de taxa`,
      accent: "line",
    },
    {
      label: "Indeferidas no mes",
      value: `${stats.rejeitadas}`,
      tone: "red",
      delta: "Revisoes manuais",
      accent: "dots",
    },
    {
      label: "Alunos ativos",
      value: `${stats.alunosAtivos}`,
      tone: "amber",
      delta: `${stats.totalHistorico} decisoes`,
      accent: "dots",
    },
  ];

  const renderContent = () => {
    if (activeTab === "perfil") return <PerfilCoordenador />;
    if (activeTab === "alunos") return <ListaAlunosCoordenador />;
    if (activeTab === "relatorios") {
      return (
        <RelatoriosCoordenador
          stats={stats}
          activities={activities}
          taxa={taxa}
          nomeUsuario={nomeUsuario}
        />
      );
    }

    return (
      <>
        <section className="coordenador-overview">
          {statCards.map((card) => (
            <article key={card.label} className={`coordenador-metric-card coordenador-metric-card--${card.tone}`}>
              <div className="coordenador-metric-card__top">
                <span>{card.label}</span>
                <strong>{card.delta}</strong>
              </div>

              <div className="coordenador-metric-card__value-row">
                <h2>{card.value}</h2>
                <div className={`coordenador-metric-card__accent coordenador-metric-card__accent--${card.accent}`}>
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="coordenador-content-grid">
          <div className="coordenador-primary">
            <section className="coordenador-panel">
              <div className="coordenador-panel__header">
                <div>
                  <h2>Fila de validacao</h2>
                  <p>{activities.length} atividades aguardando analise.</p>
                </div>

                <div className="coordenador-panel__pill">
                  <CheckCheck size={15} />
                  <span>Fluxo de aprovacao</span>
                </div>
              </div>

              <div className="coordenador-list">
                {activities.length === 0 ? (
                  <p className="coordenador-empty-msg">Nenhuma atividade pendente.</p>
                ) : null}

                {activities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    {...activity}
                    onApprove={(itemId) => abrirModalDecisao(itemId, "APROVADO")}
                    onReject={(itemId) => abrirModalDecisao(itemId, "INDEFERIDO")}
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="coordenador-secondary">
            <section className="coordenador-summary-card">
              <h3>Resumo operacional</h3>
              <p>Visao consolidada da fila atual e do desempenho de aprovacao.</p>

              <div className="coordenador-summary-card__stat-list">
                <div className="coordenador-summary-card__stat">
                  <span>Pendentes</span>
                  <strong>{resumo?.pendentes ?? activities.length}</strong>
                </div>
                <div className="coordenador-summary-card__stat">
                  <span>Aprovadas</span>
                  <strong>{stats.aprovadas}</strong>
                </div>
                <div className="coordenador-summary-card__stat">
                  <span>Rejeitadas</span>
                  <strong>{stats.rejeitadas}</strong>
                </div>
                <div className="coordenador-summary-card__stat">
                  <span>Alunos ativos</span>
                  <strong>{stats.alunosAtivos}</strong>
                </div>
              </div>

              <div className="coordenador-summary-card__progress">
                <div className="coordenador-summary-card__progress-meta">
                  <span>Taxa de aprovacao</span>
                  <strong>{taxa}%</strong>
                </div>
                <div className="coordenador-summary-card__track">
                  <div
                    className="coordenador-summary-card__fill"
                    style={{ width: `${Math.min(taxa, 100)}%` }}
                  />
                </div>
              </div>
            </section>
          </aside>
        </section>
      </>
    );
  };

  return (
    <div className="coordenador-page">
      <Sidebar
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        activePage={activeTab}
        menuItems={menuItems}
        userName={nomeUsuario}
        userEmail={user?.email ?? "coordenador@senac.pe.br"}
        variant="student-dark"
      />

      <div className="coordenador-shell">
        <main className="coordenador-main">
          <header className="coordenador-topbar">
            <button
              type="button"
              className="coordenador-menu-toggle"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={18} />
            </button>

            <div className="coordenador-topbar__content">
              <span className="coordenador-eyebrow">
                <Sparkles size={14} />
                Seu painel
              </span>
              <h1>{buildGreeting(nomeUsuario)}</h1>
              <p>
                Acompanhe a fila de atividades, aprove pendencias e acesse os modulos
                de alunos, relatorios e perfil no mesmo design system do painel do aluno.
              </p>

              <div className="coordenador-tabs">
                <button
                  type="button"
                  className={activeTab === "validacao" ? "active" : ""}
                  onClick={() => setActiveTab("validacao")}
                >
                  Validacao
                </button>
                <button
                  type="button"
                  className={activeTab === "alunos" ? "active" : ""}
                  onClick={() => setActiveTab("alunos")}
                >
                  Alunos
                </button>
                <button
                  type="button"
                  className={activeTab === "relatorios" ? "active" : ""}
                  onClick={() => setActiveTab("relatorios")}
                >
                  Relatorios
                </button>
                <button
                  type="button"
                  className={activeTab === "perfil" ? "active" : ""}
                  onClick={() => setActiveTab("perfil")}
                >
                  Perfil
                </button>
              </div>
            </div>
          </header>

          {error ? (
            <div className="coordenador-alert">
              <span>{error}</span>
              <button type="button" onClick={() => window.location.reload()}>
                Recarregar
              </button>
            </div>
          ) : null}

          {renderContent()}
        </main>
      </div>

      {decisionModal ? (
        <div className="coordenador-modal-overlay" onClick={fecharModalDecisao}>
          <div
            className="coordenador-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="coordenador-modal__close"
              aria-label="Fechar modal"
              onClick={fecharModalDecisao}
            >
              <X size={16} />
            </button>

            <span className="coordenador-modal__eyebrow">Validacao da atividade</span>
            <h2>{decisionModal.status === "APROVADO" ? "Aprovar atividade" : "Reprovar atividade"}</h2>

            {decisionModal.status === "APROVADO" ? (
              <>
                <p>Informe quantas horas serao creditadas para esta submissao (max. {MAX_HORAS_POR_ATIVIDADE}h).</p>
                <input
                  className="coordenador-modal__input"
                  type="number"
                  min={0}
                  max={MAX_HORAS_POR_ATIVIDADE}
                  value={decisionModal.horasAprovadas}
                  onChange={(event) =>
                    setDecisionModal((prev) => ({ ...prev, horasAprovadas: event.target.value }))
                  }
                  placeholder="Horas aprovadas"
                />
              </>
            ) : (
              <>
                <p>Descreva o motivo da recusa. Essa informacao sera mostrada para o aluno.</p>
                <textarea
                  className="coordenador-modal__textarea"
                  value={decisionModal.justificativa}
                  onChange={(event) =>
                    setDecisionModal((prev) => ({ ...prev, justificativa: event.target.value }))
                  }
                  placeholder="Motivo da recusa"
                />
              </>
            )}

            <div className="coordenador-modal__actions">
              <button type="button" className="coordenador-btn-neutral" onClick={fecharModalDecisao}>
                Cancelar
              </button>
              <button type="button" className="coordenador-btn-primary" onClick={confirmarDecisao}>
                <Check size={15} />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Coordenador;
