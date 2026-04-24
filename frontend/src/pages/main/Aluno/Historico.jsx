import React, { useEffect, useMemo, useState } from "react";
import {
  Clock3,
  FileText,
  Filter,
  LayoutList,
  Menu,
  Search,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Historico.css";
import Sidebar from "../../../assets/Sidebar";
import { createAlunoMenu } from "../menuConfig";
import { useAuth } from "../../../assets/contexts/AuthContext";
import {
  fetchHistoricoAtividades,
  fetchPerfilAluno,
  uiStatus,
} from "../../../services/aluno";

const Historico = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { token } = useAuth();
  const menuItems = createAlunoMenu(navigate);

  useEffect(() => {
    if (!token) return;

    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [perfilData, list] = await Promise.all([
          fetchPerfilAluno(token),
          fetchHistoricoAtividades(token),
        ]);

        if (!active) return;
        setPerfil(perfilData);
        setAtividades(list);
      } catch (e) {
        if (!active) return;
        setError(e.message || "Nao foi possivel carregar o historico.");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [token]);

  const resumo = useMemo(() => {
    const counts = atividades.reduce(
      (acc, atividade) => {
        const status = uiStatus(atividade.status).pillClass;
        acc.total += 1;
        acc.horas += Number(atividade.horas || 0);
        if (status === "aprovado") acc.aprovado += 1;
        if (status === "pendente") acc.pendente += 1;
        if (status === "indeferido") acc.indeferido += 1;
        return acc;
      },
      { total: 0, horas: 0, aprovado: 0, pendente: 0, indeferido: 0 }
    );

    return counts;
  }, [atividades]);

  return (
    <div className="history-shell">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activePage="historico"
        menuItems={menuItems}
        userName={perfil?.nome || "Aluno"}
        userEmail={perfil?.email || ""}
        variant="student-dark"
      />

      <main className="history-main">
        <header className="history-topbar">
          <button
            type="button"
            className="history-menu-toggle"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </button>

          <div className="history-topbar__content">
            <span className="history-eyebrow">
              <Sparkles size={14} />
              Linha do tempo academica
            </span>
            <h1>Historico completo</h1>
            <p>Todas as atividades submetidas organizadas em um painel escuro e modular.</p>

            <div className="history-tabs">
              <button type="button" onClick={() => navigate("/aluno")}>Overview</button>
              <button type="button" className="active">Historico</button>
              <button type="button" onClick={() => navigate("/aluno/perfil")}>Perfil</button>
            </div>
          </div>
        </header>

        {error && (
          <div className="history-alert">
            <span>{error}</span>
            <button type="button" onClick={() => window.location.reload()}>
              Recarregar
            </button>
          </div>
        )}

        <section className="history-overview">
          <article className="history-stat-card">
            <div className="history-stat-card__meta">
              <span>Registros</span>
              <LayoutList size={18} />
            </div>
            <strong>{loading ? "..." : resumo.total}</strong>
          </article>

          <article className="history-stat-card">
            <div className="history-stat-card__meta">
              <span>Horas lancadas</span>
              <Clock3 size={18} />
            </div>
            <strong>{loading ? "..." : `${resumo.horas}h`}</strong>
          </article>

          <article className="history-stat-card">
            <div className="history-stat-card__meta">
              <span>Pendentes</span>
              <Filter size={18} />
            </div>
            <strong>{loading ? "..." : resumo.pendente}</strong>
          </article>
        </section>

        <section className="history-board">
          <div className="history-board__header">
            <div>
              <h2>Timeline de atividades</h2>
              <p>{loading ? "..." : `${resumo.aprovado} aprovadas e ${resumo.indeferido} indeferidas`}</p>
            </div>

            <div className="history-search-pill">
              <Search size={15} />
              <span>Historico do aluno</span>
            </div>
          </div>

          <div className="history-list">
            {loading && <p className="history-empty">Carregando atividades...</p>}

            {!loading && atividades.length === 0 && (
              <p className="history-empty">Nenhuma atividade registrada ate o momento.</p>
            )}

            {!loading &&
              atividades.map((atividade) => {
                const status = uiStatus(atividade.status);

                return (
                  <article key={atividade.id} className="history-item">
                    <div className="history-item__icon">
                      <FileText size={18} />
                    </div>

                    <div className="history-item__content">
                      <div className="history-item__top">
                        <div>
                          <h3>{atividade.titulo}</h3>
                          <p>{atividade.tipo}</p>
                        </div>

                        <div className="history-item__meta">
                          <span>{atividade.data}</span>
                          <strong>{atividade.horas}h</strong>
                        </div>
                      </div>

                      <div className="history-item__bottom">
                        <span className={`history-status history-status--${status.pillClass}`}>
                          {status.label}
                        </span>
                        <span className="history-soft-pill">{atividade.tipo}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Historico;
