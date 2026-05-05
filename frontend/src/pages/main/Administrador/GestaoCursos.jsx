import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Menu,
  Plus,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../../../assets/contexts/AuthContext";
import { buildGreeting, deriveDisplayName } from "../../../utils/userDisplay";
import "./Admin.css";
import "./GestaoAlunos.css";
import "./GestaoCoord.css";
import "./GestaoCursos.css";

const GestaoCursos = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const nomeUsuario = deriveDisplayName({
    name: user?.name,
    email: user?.email,
    fallback: "Administrador",
  });

  const [cursos, setCursos] = useState([
    { id: 1, nome: "Analise e Desenvolvimento de Sistemas", departamento: "Tecnologia da Informacao", alunos: 45, carga: "40h" },
    { id: 2, nome: "Redes de Computadores", departamento: "Tecnologia da Informacao", alunos: 32, carga: "40h" },
    { id: 3, nome: "Administracao", departamento: "Gestao", alunos: 60, carga: "50h" },
    { id: 4, nome: "Contabilidade", departamento: "Gestao", alunos: 38, carga: "50h" },
    { id: 5, nome: "Enfermagem", departamento: "Saude", alunos: 55, carga: "60h" },
    { id: 6, nome: "Design Grafico", departamento: "Design", alunos: 28, carga: "40h" },
  ]);

  const itensMenuAdmin = [
    { id: "painel", name: "Painel Admin", icon: <BarChart3 size={20} />, onClick: () => navigate("/admin") },
    { id: "coordenadores", name: "Gestao de Coordenadores", icon: <Users size={20} />, onClick: () => navigate("/GestaoCoord") },
    { id: "alunos", name: "Adicionar Aluno", icon: <ClipboardCheck size={20} />, onClick: () => navigate("/gestaoAlunos") },
    { id: "cursos", name: "Gerenciamento de Cursos", icon: <BookOpen size={20} />, onClick: () => navigate("/GestaoCursos") },
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

  const handleAddCurso = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const novoCurso = {
      id: Date.now(),
      nome: formData.get("nome"),
      departamento: formData.get("departamento"),
      alunos: 0,
      carga: `${formData.get("carga")}h`,
    };
    setCursos([...cursos, novoCurso]);
    setIsModalOpen(false);
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
                  {itensMenuAdmin.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`admin-menu-popover__item ${item.id === "cursos" ? "active" : ""}`}
                      onClick={() => {
                        item.onClick?.();
                        setMenuOpen(false);
                      }}
                    >
                      <span className="admin-menu-popover__icon">{item.icon}</span>
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>

                <button type="button" className="admin-menu-popover__logout" onClick={handleLogout}>
                  Sair da conta
                </button>
              </div>
            )}
          </div>

          <div className="admin-topbar__content">
            <div>
              <span className="admin-eyebrow">
                <Sparkles size={14} />
                Gestao de cursos
              </span>
              <h1>{buildGreeting(nomeUsuario)}</h1>
              <p>Gerencie cursos e parametros de horas complementares.</p>
            </div>

            <div className="admin-tabs">
              <button type="button" onClick={() => navigate("/admin")}>Overview</button>
              <button type="button" onClick={() => navigate("/gestaoAlunos")}>Alunos</button>
              <button type="button" onClick={() => navigate("/GestaoCoord")}>Coordenadores</button>
              <button type="button" className="active">Cursos</button>
            </div>
          </div>
        </header>

        <section className="admin-page-layout">
          <section className="admin-agenda-card admin-page-card">
            <div className="admin-section-heading">
              <div>
                <h3>Cursos ativos</h3>
                <p>{cursos.length} cursos configurados para atividades complementares.</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(true)}>
                <Plus size={16} />
                Novo curso
              </button>
            </div>

            <div className="admin-courses-grid">
              {cursos.map((curso) => (
                <article key={curso.id} className="admin-course-card">
                  <div className="admin-course-card__header">
                    <div className="admin-course-card__icon">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h4>{curso.nome}</h4>
                      <p>{curso.departamento}</p>
                    </div>
                  </div>

                  <div className="admin-course-card__stats">
                    <div>
                      <strong>{curso.alunos}</strong>
                      <span>Alunos</span>
                    </div>
                    <div>
                      <strong>{curso.carga}</strong>
                      <span>Carga max.</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" role="dialog" aria-modal="true">
            <button type="button" className="admin-modal__close" onClick={() => setIsModalOpen(false)} aria-label="Fechar modal">
              <X size={16} />
            </button>
            <span className="admin-modal__eyebrow">Curso</span>
            <h2>Cadastrar novo curso</h2>

            <form className="admin-modal__form" onSubmit={handleAddCurso}>
              <input name="nome" type="text" placeholder="Nome do curso" required />
              <input name="departamento" type="text" placeholder="Departamento" required />
              <input name="carga" type="number" placeholder="Carga horaria maxima" required />
              <div className="admin-form-actions">
                <button type="button" className="admin-secondary-button" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="admin-primary-button">Salvar curso</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestaoCursos;
