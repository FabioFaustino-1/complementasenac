import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Menu,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../../../assets/contexts/AuthContext";
import { buildGreeting, deriveDisplayName, formatCourseName } from "../../../utils/userDisplay";
import {
  atualizarCoordenadorAdmin,
  criarCoordenadorAdmin,
  listarCoordenadoresAdmin,
  removerCoordenadorAdmin,
} from "../../../services/admin";
import "./Admin.css";
import "./GestaoAlunos.css";
import "./GestaoCoord.css";

const GestaoCoord = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const nomeUsuario = deriveDisplayName({
    name: user?.name,
    email: user?.email,
    fallback: "Administrador",
  });

  const [coordenadores, setCoordenadores] = useState([]);
  const [loading, setLoading] = useState(false);

  const [busca, setBusca] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({ nome: "", email: "", depto: "", status: "Ativo" });

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

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await listarCoordenadoresAdmin(token);
        setCoordenadores(data);
      } catch (error) {
        alert(`Erro ao carregar coordenadores: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const dadosFiltrados = coordenadores.filter((coord) =>
    (coord?.nome || "").toLowerCase().includes(busca.toLowerCase()) ||
    (coord?.email || "").toLowerCase().includes(busca.toLowerCase())
  );

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleExcluir = (id) => {
    if (!window.confirm("Deseja realmente excluir este coordenador?")) return;
    removerCoordenadorAdmin(token, id)
      .then(() => setCoordenadores((prev) => prev.filter((coord) => coord.id !== id)))
      .catch((error) => alert(`Erro ao excluir coordenador: ${error.message}`));
  };

  const handleEditar = (coord) => {
    setEditandoId(coord.id);
    setFormData({
      nome: coord.nome || "",
      email: coord.email || "",
      depto: coord.departamento || "",
      status: coord.status || "Ativo",
    });
    setIsModalOpen(true);
  };

  const handleNovo = () => {
    setEditandoId(null);
    setFormData({ nome: "", email: "", depto: "", status: "Ativo" });
    setIsModalOpen(true);
  };

  const handleSalvar = async (event) => {
    event.preventDefault();
    const payload = {
      nome: formData.nome,
      email: formData.email,
      departamento: formData.depto,
      status: formData.status,
      cursos: [],
    };
    try {
      if (editandoId) {
        const atualizado = await atualizarCoordenadorAdmin(token, editandoId, payload);
        setCoordenadores((prev) => prev.map((coord) => (coord.id === editandoId ? atualizado : coord)));
      } else {
        const novo = await criarCoordenadorAdmin(token, payload);
        setCoordenadores((prev) => [...prev, novo]);
      }
      fecharModal();
    } catch (error) {
      alert(`Erro ao salvar coordenador: ${error.message}`);
    }
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setEditandoId(null);
    setFormData({ nome: "", email: "", depto: "", status: "Ativo" });
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
                      className={`admin-menu-popover__item ${item.id === "coordenadores" ? "active" : ""}`}
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
                Gestao de coordenadores
              </span>
              <h1>{buildGreeting(nomeUsuario)}</h1>
              <p>Cadastre e gerencie os coordenadores do sistema.</p>
            </div>

            <div className="admin-tabs">
              <button type="button" onClick={() => navigate("/admin")}>Overview</button>
              <button type="button" onClick={() => navigate("/gestaoAlunos")}>Alunos</button>
              <button type="button" className="active">Coordenadores</button>
              <button type="button" onClick={() => navigate("/GestaoCursos")}>Cursos</button>
            </div>
          </div>
        </header>

        <section className="admin-page-layout">
          <section className="admin-agenda-card admin-page-card">
            <div className="admin-section-heading">
              <div>
                <h3>Coordenadores</h3>
                <p>{loading ? "Carregando..." : `${dadosFiltrados.length} registros encontrados.`}</p>
              </div>
              <button type="button" onClick={handleNovo}>
                <Plus size={16} />
                Novo coordenador
              </button>
            </div>

            <div className="admin-search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar coordenador..."
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
              />
            </div>

            <div className="admin-record-list">
              {dadosFiltrados.map((coord) => (
                <article key={coord.id} className="admin-record-item">
                  <div>
                    <h4>{coord.nome}</h4>
                    <p>{coord.email}</p>
                    <div className="admin-record-tags">
                      <span className="admin-soft-chip">{coord.departamento || "Sem departamento"}</span>
                      {coord.cursos?.map((curso, index) => (
                        <span key={formatCourseName(curso) || index} className="admin-soft-chip">{formatCourseName(curso, "Curso sem nome")}</span>
                      ))}
                      <span className={`admin-status-chip admin-status-chip--${(coord.status || "Ativo").toLowerCase()}`}>
                        {coord.status || "Ativo"}
                      </span>
                    </div>
                  </div>
                  <div className="admin-record-actions">
                    <button type="button" className="admin-ghost-action" onClick={() => handleEditar(coord)} aria-label="Editar coordenador">
                      <Pencil size={17} />
                    </button>
                    <button type="button" className="admin-ghost-action admin-ghost-action--danger" onClick={() => handleExcluir(coord.id)} aria-label="Excluir coordenador">
                      <Trash2 size={17} />
                    </button>
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
            <button type="button" className="admin-modal__close" onClick={fecharModal} aria-label="Fechar modal">
              <X size={16} />
            </button>
            <span className="admin-modal__eyebrow">Coordenador</span>
            <h2>{editandoId ? "Editar coordenador" : "Novo coordenador"}</h2>

            <form className="admin-modal__form" onSubmit={handleSalvar}>
              <input type="text" placeholder="Nome" required value={formData.nome} onChange={(event) => setFormData({ ...formData, nome: event.target.value })} />
              <input type="email" placeholder="E-mail" required value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} />
              <input type="text" placeholder="Departamento" required value={formData.depto} onChange={(event) => setFormData({ ...formData, depto: event.target.value })} />
              <select value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value })}>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
              <div className="admin-form-actions">
                <button type="button" className="admin-secondary-button" onClick={fecharModal}>Cancelar</button>
                <button type="submit" className="admin-primary-button">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestaoCoord;
