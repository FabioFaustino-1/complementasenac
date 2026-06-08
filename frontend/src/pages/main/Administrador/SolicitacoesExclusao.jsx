import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  CheckCircle,
  ClipboardCheck,
  Menu,
  Sparkles,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { useAuth } from "../../../assets/contexts/AuthContext";
import { buildGreeting, deriveDisplayName } from "../../../utils/userDisplay";
import { listarSolicitacoesExclusao, decidirSolicitacaoExclusao } from "../../../services/admin";
import "./Admin.css";
import "./GestaoAlunos.css";

const SolicitacoesExclusao = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalDecisao, setModalDecisao] = useState(null);

  const nomeUsuario = deriveDisplayName({
    name: user?.name,
    email: user?.email,
    fallback: "Administrador",
  });

  const itensMenuAdmin = [
    { id: "painel", name: "Painel", icon: <BarChart3 size={20} />, onClick: () => navigate("/admin") },
    { id: "alunos", name: "Adicionar Aluno", icon: <ClipboardCheck size={20} />, onClick: () => navigate("/gestaoalunos") },
    { id: "coordenadores", name: "Gestao de Coordenadores", icon: <Users size={20} />, onClick: () => navigate("/gestaocoord") },
    { id: "cursos", name: "Gerenciamento de Cursos", icon: <BookOpen size={20} />, onClick: () => navigate("/gestaocursos") },
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

  const carregar = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await listarSolicitacoesExclusao(token);
      setSolicitacoes(data);
    } catch (error) {
      alert("Erro ao carregar solicitações: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, [token]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const abrirModal = (solicitacao, decisao) => {
    setModalDecisao({ ...solicitacao, decisao });
  };

  const confirmarDecisao = async () => {
    try {
      await decidirSolicitacaoExclusao(token, modalDecisao.id, modalDecisao.decisao);
      setModalDecisao(null);
      await carregar();
    } catch (error) {
      alert("Erro ao processar decisão: " + error.message);
      setModalDecisao(null);
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
                      className="admin-menu-popover__item"
                      onClick={() => { if (item.onClick) item.onClick(); setMenuOpen(false); }}
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
                Solicitações de exclusão
              </span>
              <h1>{buildGreeting(nomeUsuario)}</h1>
              <p>Gerencie os pedidos de exclusão de alunos enviados pelos coordenadores.</p>
            </div>

            <div className="admin-tabs">
              <button type="button" onClick={() => navigate("/admin")}>Painel</button>
              <button type="button" onClick={() => navigate("/gestaoalunos")}>Alunos</button>
              <button type="button" onClick={() => navigate("/gestaocoord")}>Coordenadores</button>
              <button type="button" onClick={() => navigate("/gestaocursos")}>Cursos</button>
              <button type="button" className="active">Solicitações de exclusão</button>
            </div>
          </div>
        </header>

        <section className="admin-page-layout">
          <section className="admin-agenda-card admin-page-card">
            <div className="admin-section-heading">
              <div>
                <h3>Solicitações pendentes</h3>
                <p>
                  {loading
                    ? "Carregando..."
                    : `${solicitacoes.length} solicitação(ões) encontrada(s).`}
                </p>
              </div>
            </div>

            {loading ? (
              <p style={{ padding: "1.5rem", color: "#6b7280" }}>Carregando solicitações...</p>
            ) : solicitacoes.length === 0 ? (
              <p style={{ padding: "1.5rem", color: "#6b7280" }}>Nenhuma solicitação pendente.</p>
            ) : (
              <div className="admin-coordinator-list">
                {solicitacoes.map((s) => (
                  <article key={s.id} className="admin-coordinator-item">
                    <div className="admin-coordinator-item__meta">
                      <span>Solicitado em {s.criadoEm ? new Date(s.criadoEm).toLocaleDateString("pt-BR") : "—"}</span>
                    </div>
                    <div className="admin-coordinator-item__body">
                      <div>
                        <h4>{s.nomeAluno}</h4>
                        <p>{s.emailCoordenador || "Coordenador não identificado"}</p>
                        <div className="admin-coordinator-item__tags">
                          <span className="admin-status-chip admin-status-chip--ativo">
                            {s.status || "PENDENTE"}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          type="button"
                          className="admin-ghost-action"
                          title="Aprovar exclusão"
                          style={{ color: "#b91c1c", borderColor: "#fee2e2", background: "#fff5f5" }}
                          onClick={() => abrirModal(s, "APROVADO")}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          type="button"
                          className="admin-ghost-action"
                          title="Recusar solicitação"
                          onClick={() => abrirModal(s, "RECUSADO")}
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>

        {modalDecisao && (
          <div className="modal-overlay-exclusao">
            <div className="modal-exclusao">
              <h3>
                {modalDecisao.decisao === "APROVADO"
                  ? "Aprovar exclusão"
                  : "Recusar solicitação"}
              </h3>
              <p>
                {modalDecisao.decisao === "APROVADO"
                  ? <>Confirma a exclusão permanente do aluno <strong>{modalDecisao.nomeAluno}</strong>? Esta ação não pode ser desfeita.</>
                  : <>Confirma a recusa da solicitação de exclusão do aluno <strong>{modalDecisao.nomeAluno}</strong>?</>}
              </p>
              <div className="modal-exclusao-actions">
                <button className="btn-confirmar-solicitacao" onClick={confirmarDecisao}>
                  {modalDecisao.decisao === "APROVADO" ? "Confirmar exclusão" : "Confirmar recusa"}
                </button>
                <button className="btn-cancelar-modal" onClick={() => setModalDecisao(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SolicitacoesExclusao;
