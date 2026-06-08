import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Menu,
  MoreHorizontal,
  Plus,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { useAuth } from "../../../assets/contexts/AuthContext";
import { buildGreeting, deriveDisplayName, formatCourseName } from "../../../utils/userDisplay";
import {
  listarAlunosAdmin,
  listarCoordenadoresAdmin,
  listarCursosAdmin,
} from "../../../services/admin";
import "./Admin.css";

const Admin = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const nomeUsuario = deriveDisplayName({
    name: user?.name,
    email: user?.email,
    fallback: "Administrador",
  });

  const itensMenuAdmin = [
    { id: "painel", name: "Painel", icon: <BarChart3 size={20} />, onClick: () => navigate("/admin") },
    { id: "alunos", name: "Alunos", icon: <ClipboardCheck size={20} />, onClick: () => navigate("/gestaoalunos") },
    { id: "coordenadores", name: "Coordenação", icon: <Users size={20} />, onClick: () => navigate("/gestaocoord") },
    { id: "cursos", name: "Cursos", icon: <BookOpen size={20} />, onClick: () => navigate("/gestaocursos") },
    { id: "solicitacoes", name: "Solicitações", icon: <Trash2 size={20} />, onClick: () => navigate("/admin/solicitacoes-exclusao") },
  ];

  const [stats, setStats] = useState([
    { label: "Coordenadores ativos", value: "...", delta: "Equipe atual", tone: "violet", accent: "bars" },
    { label: "Alunos cadastrados", value: "...", delta: "Base institucional", tone: "green", accent: "line" },
    { label: "Cursos ativos", value: "...", delta: "Catalogo", tone: "amber", accent: "dots" },
  ]);
  const [coordinators, setCoordinators] = useState([]);
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

  const totalAlunos = parseInt(stats[1]?.value || "0");
  const totalCursos = parseInt(stats[2]?.value || "0");
  const totalCoords = parseInt(stats[0]?.value || "0");
  const porcentagemSaude = (totalAlunos > 0 && totalCursos > 0 && totalCoords > 0)
    ? Math.min(100, Math.round(
        ((totalAlunos + totalCursos + totalCoords) /
        (totalAlunos + totalCursos + totalCoords + 1)) * 100
      ))
    : (totalAlunos > 0 || totalCursos > 0 || totalCoords > 0) ? 50 : 0;

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const [coords, alunos, cursos] = await Promise.all([
          listarCoordenadoresAdmin(token),
          listarAlunosAdmin(token),
          listarCursosAdmin(token),
        ]);
        setCoordinators(coords);
        setStats([
          { label: "Coordenadores ativos", value: String(coords.length), delta: "Equipe atual", tone: "violet", accent: "bars" },
          { label: "Alunos cadastrados", value: String(alunos.length), delta: "Base institucional", tone: "green", accent: "line" },
          { label: "Cursos ativos", value: String(cursos.length), delta: "Catalogo", tone: "amber", accent: "dots" },
        ]);
      } catch {
        // Mantem o painel renderizado com placeholders
      }
    };
    load();
  }, [token]);

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
                    <div className="admin-menu-header-nome">{nomeUsuario || "Administrador"}</div>
                    <div className="admin-menu-header-email">{user?.email || ""}</div>
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
              <button type="button" className="active">Painel</button>
              <button type="button" onClick={() => navigate("/gestaoalunos")}>Alunos</button>
              <button type="button" onClick={() => navigate("/gestaocoord")}>Coordenadores</button>
              <button type="button" onClick={() => navigate("/gestaocursos")}>Cursos</button>
              <button
                type="button"
                onClick={() => navigate("/admin/solicitacoes-exclusao")}
              >
                Solicitações de exclusão
              </button>
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
                    {porcentagemSaude}<span>% saudavel</span>
                  </h2>
                </div>
                <span className="admin-hero-card__badge">Monitoramento ativo</span>
              </div>

              <div className="admin-hero-card__progress">
                <div className="admin-hero-card__progress-meta">
                    <span>{stats[1]?.value} alunos vinculados</span>
                  <span>{stats[2]?.value} cursos ativos</span>
                </div>
                <div className="admin-hero-card__track">
                  <div className="admin-hero-card__fill" style={{ width: `${porcentagemSaude}%` }} />
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
                  <article key={coord.id || coord.email} className="admin-coordinator-item">
                    <div className="admin-coordinator-item__meta">
                      <span>{coord.departamento || "Sem departamento"}</span>
                      <div className="admin-course-badges">
                        {(coord.cursos || []).map((course, index) => (
                          <span key={formatCourseName(course) || index}>{formatCourseName(course, "Curso sem nome")}</span>
                        ))}
                      </div>
                    </div>

                    <div className="admin-coordinator-item__body">
                      <div>
                        <h4>{coord.nome}</h4>
                        <p>{coord.email}</p>
                        <div className="admin-coordinator-item__tags">
                          <span className={`admin-status-chip admin-status-chip--${(coord.status || "Ativo").toLowerCase()}`}>
                            {coord.status || "Ativo"}
                          </span>
                          <span className="admin-soft-chip">{(coord.cursos || []).length} cursos</span>
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
                  <strong>{stats[0]?.value}</strong>
                </div>
                <div className="admin-side-stat">
                  <span>Cursos ativos</span>
                  <strong>{stats[2]?.value}</strong>
                </div>
                <div className="admin-side-stat">
                  <span>Atividades</span>
                  <strong>{stats[1]?.value}</strong>
                </div>
              </div>
            </section>
          </aside>
        </section>


      </main>
    </div>
  );
};

export default Admin;
