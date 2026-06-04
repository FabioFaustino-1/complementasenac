import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Menu,
  Pencil,
  Search,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useAuth } from "../../../assets/contexts/AuthContext";
import { buildGreeting, deriveDisplayName, formatCourseName } from "../../../utils/userDisplay";
import {
  atualizarAlunoAdmin,
  criarAlunoAdmin,
  listarAlunosAdmin,
  removerAlunoAdmin,
} from "../../../services/admin";
import "./Admin.css";
import "./GestaoAlunos.css";

const GestaoAlunos = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [busca, setBusca] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    matricula: "",
    curso: "",
  });
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
    { id: "painel", name: "Painel Admin", icon: <BarChart3 size={20} />, onClick: () => navigate("/admin") },
    { id: "coordenadores", name: "Gestao de Coordenadores", icon: <Users size={20} />, onClick: () => navigate("/GestaoCoord") },
    { id: "alunos", name: "Adicionar Aluno", icon: <ClipboardCheck size={20} />, onClick: () => navigate("/gestaoAlunos") },
    { id: "cursos", name: "Gerenciamento de Cursos", icon: <BookOpen size={20} />, onClick: () => navigate("/GestaoCursos") },
  ];

  const carregarAlunos = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await listarAlunosAdmin(token);
      setStudents(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    carregarAlunos();
  }, [carregarAlunos]);

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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalvarAluno = async () => {
    if (!formData.nome || !formData.email || !formData.matricula || !formData.curso) {
      alert("Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      if (editandoId) {
        const atualizado = await atualizarAlunoAdmin(token, editandoId, formData);
        setStudents((prev) => prev.map((student) => (student.id === editandoId ? atualizado : student)));
      } else {
        const novo = await criarAlunoAdmin(token, formData);
        setStudents((prev) => [...prev, novo]);
      }
      setShowForm(false);
      setEditandoId(null);
      setFormData({ nome: "", email: "", matricula: "", curso: "" });
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditarAluno = (student) => {
    setEditandoId(student.id);
    setFormData({
      nome: student.nome || "",
      email: student.email || "",
      matricula: student.matricula || "",
      curso: formatCourseName(student.curso),
    });
    setShowForm(true);
  };

  const handleExcluirAluno = async (id) => {
    if (!window.confirm("Deseja realmente excluir este aluno?")) return;
    try {
      await removerAlunoAdmin(token, id);
      setStudents((prev) => prev.filter((student) => student.id !== id));
    } catch (error) {
      alert(error.message || "Falha ao excluir aluno.");
    }
  };

  const resetFormulario = () => {
    setShowForm(false);
    setEditandoId(null);
    setFormData({ nome: "", email: "", matricula: "", curso: "" });
  };

  const studentsFiltrados = students.filter((student) => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return true;
    const nome = (student.nome || "").toLowerCase();
    const matricula = (student.matricula || "").toLowerCase();
    const email = (student.email || "").toLowerCase();
    return nome.includes(termo) || matricula.includes(termo) || email.includes(termo);
  });

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
                      className={`admin-menu-popover__item ${item.id === "alunos" ? "active" : ""}`}
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
                Gestao de alunos
              </span>
              <h1>{buildGreeting(nomeUsuario)}</h1>
              <p>Cadastre estudantes e acompanhe os registros academicos.</p>
            </div>

            <div className="admin-tabs">
              <button type="button" onClick={() => navigate("/admin")}>Overview</button>
              <button type="button" className="active">Alunos</button>
              <button type="button" onClick={() => navigate("/GestaoCoord")}>Coordenadores</button>
              <button type="button" onClick={() => navigate("/GestaoCursos")}>Cursos</button>
            </div>
          </div>
        </header>

        <section className="admin-page-layout">
          <section className="admin-agenda-card admin-page-card">
            <div className="admin-section-heading">
              <div>
                <h3>Alunos cadastrados</h3>
                <p>{loading ? "Carregando alunos..." : `${studentsFiltrados.length} registros encontrados.`}</p>
              </div>
              {!showForm && (
                <button type="button" onClick={() => setShowForm(true)}>
                  <UserPlus size={16} />
                  Adicionar aluno
                </button>
              )}
            </div>

            {showForm && (
              <div className="admin-form-card">
                <h3>Novo aluno</h3>
                <div className="admin-form-grid">
                  <input type="text" name="nome" value={formData.nome} onChange={handleInputChange} placeholder="Nome completo" />
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="E-mail institucional" />
                  <input type="text" name="matricula" value={formData.matricula} onChange={handleInputChange} placeholder="Matricula" />
                  <input type="text" name="curso" value={formData.curso} onChange={handleInputChange} placeholder="Curso" />
                </div>
                <div className="admin-form-actions">
                  <button type="button" className="admin-secondary-button" onClick={resetFormulario}>Cancelar</button>
                  <button type="button" className="admin-primary-button" onClick={handleSalvarAluno} disabled={loading}>
                    {editandoId ? "Atualizar aluno" : "Salvar aluno"}
                  </button>
                </div>
              </div>
            )}

            <div className="admin-search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou matricula..."
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
              />
            </div>

            <div className="admin-record-list">
              {studentsFiltrados.map((student) => (
                <article key={student.id} className="admin-record-item">
                  <div>
                    <h4>{student.nome}</h4>
                    <p>{student.email}</p>
                    <div className="admin-record-tags">
                      <span className="admin-soft-chip">{student.matricula}</span>
                      <span className="admin-soft-chip">{formatCourseName(student.curso, "Curso nao informado")}</span>
                    </div>
                  </div>
                  <div className="admin-record-actions">
                    <button
                      type="button"
                      className="admin-ghost-action"
                      aria-label="Editar aluno"
                      onClick={() => handleEditarAluno(student)}
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      type="button"
                      className="admin-ghost-action admin-ghost-action--danger"
                      aria-label="Excluir aluno"
                      onClick={() => handleExcluirAluno(student.id)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}

              {!loading && studentsFiltrados.length === 0 && (
                <p className="admin-empty-state">Nenhum aluno cadastrado.</p>
              )}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
};

export default GestaoAlunos;
