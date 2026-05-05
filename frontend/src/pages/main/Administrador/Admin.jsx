import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Menu,
  MoreHorizontal,
  Plus,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "../../../assets/contexts/AuthContext";
import { buildGreeting, deriveDisplayName } from "../../../utils/userDisplay";
import "./Admin.css";

const Admin = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const nomeUsuario = deriveDisplayName({
    name: user?.name,
    email: user?.email,
    fallback: "Administrador",
  });

  const itensMenuAdmin = [
    { id: "painel", name: "Painel Admin", icon: <BarChart3 size={20} />, onClick: () => navigate("/admin") },
    { id: "coordenadores", name: "Gestao de Coordenadores", icon: <Users size={20} />, onClick: () => navigate("/gestaocoord") },
    { id: "alunos", name: "Adicionar Aluno", icon: <ClipboardCheck size={20} />, onClick: () => navigate("/gestaoalunos") },
    { id: "cursos", name: "Gerenciamento de Cursos", icon: <BookOpen size={20} />, onClick: () => navigate("/gestaocursos") },
    { id: "logs", name: "Logs", icon: <Settings size={20} /> },
  ];

  const stats = [
    { label: "Coordenadores ativos", value: "3", delta: "Equipe atual", tone: "violet", accent: "bars" },
    { label: "Alunos cadastrados", value: "245", delta: "+18 este mes", tone: "green", accent: "line" },
    { label: "Atividades no sistema", value: "1280", delta: "128 pendentes", tone: "amber", accent: "dots" },
  ];

  const coordinators = [
    { name: "Maria Silva", email: "maria.silva@senac.pe.br", dept: "Tecnologia da Informacao", courses: ["ADS", "Redes"], status: "Ativo" },
    { name: "Carlos Mendes", email: "carlos.mendes@senac.pe.br", dept: "Gestao", courses: ["Administracao", "Contabilidade"], status: "Ativo" },
    { name: "Ana Oliveira", email: "ana.oliveira@senac.pe.br", dept: "Saude", courses: ["Enfermagem", "Nutricao"], status: "Inativo" },
    { name: "Roberto Santos", email: "roberto.santos@senac.pe.br", dept: "Design", courses: ["Design Grafico"], status: "Ativo" },
  ];

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="admin-shell">
      <main className="admin-main admin-main--full">
        <header className="admin-topbar">
          <div className="admin-topbar__menu-area">
            <button
              ref={menuButtonRef}
              type="button"
              className="admin-menu-toggle"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Abrir menu"
            >
              <Menu size={18} />
            </button>

            {menuOpen && (
              <div ref={menuRef} className="admin-menu-popover">
                <div className="admin-menu-popover__header">
                  <div>
                    <strong>{nomeUsuario}</strong>
                    <span>{user?.email || "admin@senac.pe.br"}</span>
                  </div>
                </div>

                <div className="admin-menu-popover__list">
                  {itensMenuAdmin.map((item) => {
                    const isSelected = item.id === "painel";

                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`admin-menu-popover__item ${isSelected ? "active" : ""}`}
                        onClick={() => {
                          if (item.onClick) item.onClick();
                          setMenuOpen(false);
                        }}
                      >
                        <span className="admin-menu-popover__icon">{item.icon}</span>
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="admin-menu-popover__logout"
                  onClick={handleLogout}
                >
                  Sair da conta
                </button>
              </div>
            )}
          </div>

          <div className="admin-topbar__content">
            <div>
              <span className="admin-eyebrow">
                <Sparkles size={14} />
                Painel administrativo
              </span>
              <h1>{buildGreeting(nomeUsuario)}</h1>
              <p>Gerencie coordenadores, cursos e parametros do sistema.</p>
            </div>

            <div className="admin-tabs">
              <button type="button" className="active">Overview</button>
              <button type="button" onClick={() => navigate("/gestaocoord")}>Coordenadores</button>
              <button type="button" onClick={() => navigate("/gestaocursos")}>Cursos</button>
            </div>
          </div>
        </header>

        <section className="admin-overview">
          {stats.map((card) => (
            <article key={card.label} className={`admin-metric-card admin-metric-card--${card.tone}`}>
              <div className="admin-metric-card__top">
                <span>{card.label}</span>
                <strong>{card.delta}</strong>
              </div>
              <div className="admin-metric-card__value-row">
                <h2>{card.value}</h2>
                <div className={`admin-metric-card__accent admin-metric-card__accent--${card.accent}`}>
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

        <section className="admin-layout">
          <div className="admin-primary">
            <section className="admin-hero-card">
              <div className="admin-hero-card__content">
                <div>
                  <span className="admin-hero-card__label">Operacao do sistema</span>
                  <h2>
                    87<span>% saudavel</span>
                  </h2>
                </div>
                <span className="admin-hero-card__badge">Monitoramento ativo</span>
              </div>

              <div className="admin-hero-card__progress">
                <div className="admin-hero-card__progress-meta">
                  <span>245 alunos vinculados</span>
                  <span>8 cursos ativos</span>
                </div>
                <div className="admin-hero-card__track">
                  <div className="admin-hero-card__fill" />
                </div>
              </div>
            </section>

            <section className="admin-agenda-card">
              <div className="admin-section-heading">
                <div>
                  <h3>Coordenadores</h3>
                  <p>Acompanhe a equipe responsavel pelos cursos.</p>
                </div>
                <button type="button" onClick={() => navigate("/gestaocoord")}>
                  Ver todos
                </button>
              </div>

              <div className="admin-coordinator-list">
                {coordinators.map((coord) => (
                  <article key={coord.email} className="admin-coordinator-item">
                    <div className="admin-coordinator-item__meta">
                      <span>{coord.dept}</span>
                      <div className="admin-course-badges">
                        {coord.courses.map((course) => (
                          <span key={course}>{course}</span>
                        ))}
                      </div>
                    </div>

                    <div className="admin-coordinator-item__body">
                      <div>
                        <h4>{coord.name}</h4>
                        <p>{coord.email}</p>
                        <div className="admin-coordinator-item__tags">
                          <span className={`admin-status-chip admin-status-chip--${coord.status.toLowerCase()}`}>
                            {coord.status}
                          </span>
                          <span className="admin-soft-chip">{coord.courses.length} cursos</span>
                        </div>
                      </div>

                      <button type="button" className="admin-ghost-action" aria-label="Abrir opcoes">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="admin-secondary">
            <section className="admin-side-card">
              <div className="admin-section-heading admin-section-heading--stack">
                <div>
                  <h3>Status administrativo</h3>
                  <p>Resumo rapido da operacao atual.</p>
                </div>
              </div>

              <div className="admin-profile-mini">
                <div className="admin-profile-mini__avatar">
                  {nomeUsuario.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <strong>{nomeUsuario}</strong>
                  <span>{user?.email || "admin@senac.pe.br"}</span>
                </div>
              </div>

              <div className="admin-side-stat-list">
                <div className="admin-side-stat">
                  <span>Coordenadores</span>
                  <strong>3</strong>
                </div>
                <div className="admin-side-stat">
                  <span>Cursos ativos</span>
                  <strong>8</strong>
                </div>
                <div className="admin-side-stat">
                  <span>Atividades</span>
                  <strong>1280</strong>
                </div>
              </div>
            </section>
          </aside>
        </section>

        <button
          type="button"
          className="admin-floating-submit"
          onClick={() => navigate("/gestaocoord")}
        >
          <Plus size={18} />
          <span>Novo coordenador</span>
        </button>
      </main>
    </div>
  );
};

export default Admin;
