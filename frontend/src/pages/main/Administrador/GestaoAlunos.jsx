import React, { useEffect, useRef, useState } from "react";
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
import { buildGreeting, deriveDisplayName } from "../../../utils/userDisplay";
import "./Admin.css";
import "./GestaoAlunos.css";

const GestaoAlunos = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [busca, setBusca] = useState("");
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
  const API_URL = "http://localhost:8080/api/admin/alunos";

  const itensMenuAdmin = [
    { id: "painel", name: "Painel Admin", icon: <BarChart3 size={20} />, onClick: () => navigate("/admin") },
    { id: "coordenadores", name: "Gestao de Coordenadores", icon: <Users size={20} />, onClick: () => navigate("/GestaoCoord") },
    { id: "alunos", name: "Adicionar Aluno", icon: <ClipboardCheck size={20} />, onClick: () => navigate("/gestaoAlunos") },
    { id: "cursos", name: "Gerenciamento de Cursos", icon: <BookOpen size={20} />, onClick: () => navigate("/GestaoCursos") },
  ];

  useEffect(() => {
    if (token) {
      carregarAlunos();
    }
  }, [token]);

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

  const carregarAlunos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Falha ao carregar alunos");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const alunosFiltrados = students.filter((student) =>
    (student.nome || "").toLowerCase().includes(busca.toLowerCase()) ||
    (student.matricula || "").toLowerCase().includes(busca.toLowerCase())
  );

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
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Falha ao salvar aluno");
      alert(`Aluno ${formData.nome} salvo com sucesso! Um e-mail de confirmação foi enviado para ${formData.email}.`);
      setFormData({ nome: "", email: "", matricula: "", curso: "" });
      await carregarAlunos();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
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
                <p>{loading ? "Carregando alunos..." : `${students.length} registros encontrados.`}</p>
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
                  <button type="button" className="admin-secondary-button" onClick={() => setShowForm(false)}>Cancelar</button>
                  <button type="button" className="admin-primary-button" onClick={handleSalvarAluno} disabled={loading}>Salvar aluno</button>
                </div>
              </div>
            )}

            <div className="admin-search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Buscar por nome ou matricula..." 
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div className="admin-record-list">
              {alunosFiltrados.map((student) => (
                <article key={student.id} className="admin-record-item">
                  <div>
                    <h4>{student.nome}</h4>
                    <p>{student.email}</p>
                    <div className="admin-record-tags">
                      <span className="admin-soft-chip">{student.matricula}</span>
                      <span className="admin-soft-chip">{student.curso}</span>
                    </div>
                  </div>
                  <div className="admin-record-actions">
                    <button type="button" className="admin-ghost-action" aria-label="Editar aluno"><Pencil size={17} /></button>
                    <button type="button" className="admin-ghost-action admin-ghost-action--danger" aria-label="Excluir aluno"><Trash2 size={17} /></button>
                  </div>
                </article>
              ))}

              {!loading && students.length === 0 && (
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
