import React, { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  FileUp,
  Menu,
  Plus,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Aluno_entrega.css";
import { createAlunoMenu } from "../menuConfig";
import { useAuth } from "../../../assets/contexts/AuthContext";
import { buildGreeting, deriveDisplayName } from "../../../utils/userDisplay";
import {
  fetchAtividadesRecentes,
  fetchPerfilAluno,
  fetchResumoAluno,
  formatDateBrFromInput,
  submeterNovaAtividade,
  uiStatus,
} from "../../../services/aluno";

const MAX_FILE_BYTES = 800 * 1024;
const tipoOptions = [
  "Curso Online",
  "Palestra / Workshop",
  "Trabalho Voluntario",
  "Congresso / Seminario",
  "Monitoria",
  "Outro",
];

function renderMetricValue(value) {
  if (typeof value !== "string") return value;

  const match = value.match(/^(\d+)(h)$/i);
  if (!match) return value;

  return (
    <>
      {match[1]}
      <span className="metric-card__unit">{match[2]}</span>
    </>
  );
}

const AlunoEntrega = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [recentes, setRecentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("");
  const [horas, setHoras] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [comprovanteUrl, setComprovanteUrl] = useState("");
  const [arquivoNome, setArquivoNome] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { token, logout, user } = useAuth();
  const menuItems = createAlunoMenu(navigate);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [perfilData, resumoData, recentesData] = await Promise.all([
          fetchPerfilAluno(token),
          fetchResumoAluno(token),
          fetchAtividadesRecentes(token),
        ]);

        if (!active) return;
        setPerfil(perfilData);
        setResumo(resumoData);
        setRecentes(recentesData);
      } catch (e) {
        if (!active) return;
        setError(e.message || "Nao foi possivel carregar os dados.");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
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

  const horasConcluidas = resumo?.horasConcluidas ?? 0;
  const horasNecessarias = resumo?.horasNecessarias ?? 40;
  const percentual = resumo?.percentualConcluido ?? 0;
  const aprovadas = resumo?.aprovadas ?? 0;
  const pendentes = resumo?.pendentes ?? 0;
  const indeferidas = resumo?.indeferidas ?? 0;
  const curso = resumo?.curso || perfil?.curso || "Acompanhe seu progresso em atividades complementares";
  const nomeUsuario = deriveDisplayName({
    name: perfil?.nome || user?.name,
    email: perfil?.email || user?.email,
    fallback: "Aluno",
  });
  const saudacao = buildGreeting(nomeUsuario);
  const badgeText =
    percentual >= 100 ? "Meta concluida" : percentual >= 75 ? "Reta final" : "Em progresso";

  const statCards = [
    {
      label: "Horas concluidas",
      value: loading ? "..." : `${horasConcluidas}h`,
      tone: "violet",
      delta: `${percentual}%`,
      accent: "bars",
    },
    {
      label: "Taxa de conclusao",
      value: loading ? "..." : `${percentual}%`,
      tone: "green",
      delta: `${horasNecessarias}h alvo`,
      accent: "line",
    },
    {
      label: "Pendencias abertas",
      value: loading ? "..." : `${pendentes}`,
      tone: "amber",
      delta: `${indeferidas} indeferidas`,
      accent: "dots",
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const resetSubmissionForm = () => {
    setTitulo("");
    setTipo("");
    setHoras("");
    setDataEvento("");
    setComprovanteUrl("");
    setArquivoNome("");
    setSubmissionError("");
  };

  const handleFile = (file) => {
    if (!file) {
      setComprovanteUrl("");
      setArquivoNome("");
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setSubmissionError(`Arquivo muito grande (max. ${MAX_FILE_BYTES / 1024} KB).`);
      setComprovanteUrl("");
      setArquivoNome("");
      return;
    }

    setSubmissionError("");
    setArquivoNome(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setComprovanteUrl(typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
  };

  const handleQuickSubmission = async (event) => {
    event.preventDefault();
    setSubmissionError("");

    const horasInt = parseInt(horas, 10);
    if (!titulo.trim() || !tipo || !dataEvento || Number.isNaN(horasInt) || horasInt <= 0) {
      setSubmissionError("Preencha titulo, tipo, data e horas validas.");
      return;
    }

    setSubmitting(true);
    try {
      await submeterNovaAtividade(token, {
        titulo: titulo.trim(),
        tipo,
        data: formatDateBrFromInput(dataEvento),
        horas: horasInt,
        comprovanteUrl: comprovanteUrl || undefined,
      });

      const [resumoData, recentesData] = await Promise.all([
        fetchResumoAluno(token),
        fetchAtividadesRecentes(token),
      ]);
      setResumo(resumoData);
      setRecentes(recentesData);
      resetSubmissionForm();
      setSubmissionModalOpen(false);
    } catch (err) {
      setSubmissionError(err.message || "Nao foi possivel enviar a atividade.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="student-shell">
      {submissionModalOpen && (
        <div
          className="submission-modal-overlay"
          onClick={() => {
            if (submitting) return;
            setSubmissionModalOpen(false);
          }}
        >
          <div
            className="submission-modal submission-modal--form"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="submission-modal-title"
          >
            <button
              type="button"
              className="submission-modal__close"
              onClick={() => setSubmissionModalOpen(false)}
              aria-label="Fechar modal"
              disabled={submitting}
            >
              <X size={16} />
            </button>

            <span className="submission-modal__eyebrow">Nova submissao</span>
            <h2 id="submission-modal-title">Enviar atividade complementar</h2>
            <p>
              Preencha os dados principais e envie a atividade sem sair do dashboard.
            </p>

            {submissionError ? (
              <div className="submission-modal__error">{submissionError}</div>
            ) : null}

            <form className="submission-modal__form" onSubmit={handleQuickSubmission}>
              <div className="submission-modal__upload-block">
                <label className="submission-modal__label">Comprovante</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="submission-modal__hidden-input"
                  onChange={(event) => handleFile(event.target.files?.[0])}
                />
                <div
                  className="submission-modal__dropzone"
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(event) => event.key === "Enter" && fileInputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleFile(event.dataTransfer.files?.[0]);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="submission-modal__dropzone-icon">
                    <UploadCloud size={20} />
                  </div>
                  <strong>{arquivoNome || "Clique ou arraste o arquivo aqui"}</strong>
                  <span>PDF ou imagem com ate {MAX_FILE_BYTES / 1024} KB</span>
                </div>
              </div>

              <div className="submission-modal__field-grid">
                <div className="submission-modal__field">
                  <label className="submission-modal__label">Nome da atividade</label>
                  <div className="submission-modal__input-shell">
                    <input
                      type="text"
                      placeholder="Ex: Workshop de React Avancado"
                      value={titulo}
                      onChange={(event) => setTitulo(event.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="submission-modal__field">
                  <label className="submission-modal__label">Tipo de atividade</label>
                  <div className="submission-modal__input-shell">
                    <select
                      value={tipo}
                      onChange={(event) => setTipo(event.target.value)}
                      disabled={submitting}
                    >
                      <option value="">Selecione o tipo</option>
                      {tipoOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="submission-modal__field">
                  <label className="submission-modal__label">
                    <Clock3 size={14} />
                    Horas
                  </label>
                  <div className="submission-modal__input-shell">
                    <input
                      type="number"
                      min={1}
                      placeholder="8"
                      value={horas}
                      onChange={(event) => setHoras(event.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="submission-modal__field">
                  <label className="submission-modal__label">
                    <CalendarDays size={14} />
                    Data do evento
                  </label>
                  <div className="submission-modal__input-shell">
                    <input
                      type="date"
                      value={dataEvento}
                      onChange={(event) => setDataEvento(event.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              <div className="submission-modal__hint">
                <FileUp size={14} />
                O envio vai direto para validacao e a lista recente sera atualizada aqui no dashboard.
              </div>

              <div className="submission-modal__actions">
                <button
                  type="button"
                  className="submission-modal__secondary"
                  onClick={() => {
                    resetSubmissionForm();
                    setSubmissionModalOpen(false);
                  }}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button type="submit" className="submission-modal__primary" disabled={submitting}>
                  {submitting ? "Enviando..." : "Enviar submissao"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="student-main student-main--full">
        <header className="student-topbar">
          <div className="student-topbar__menu-area">
            <button
              ref={menuButtonRef}
              type="button"
              className="student-menu-toggle"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Abrir menu"
            >
              <Menu size={18} />
            </button>

            {menuOpen && (
              <div ref={menuRef} className="student-menu-popover">
                <div className="student-menu-popover__header">
                  <div>
                    <strong>{perfil?.nome || "Aluno"}</strong>
                    <span>{perfil?.email || "sem email cadastrado"}</span>
                  </div>
                </div>

                <div className="student-menu-popover__list">
                  {menuItems.map((item) => {
                    const isSelected = item.id === "horas";
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`student-menu-popover__item ${isSelected ? "active" : ""}`}
                        onClick={() => {
                          if (item.onClick) item.onClick();
                          setMenuOpen(false);
                        }}
                      >
                        <span className="student-menu-popover__icon">{item.icon}</span>
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="student-menu-popover__logout"
                  onClick={handleLogout}
                >
                  Sair da conta
                </button>
              </div>
            )}
          </div>

          <div className="student-topbar__content">
            <div>
              <span className="student-eyebrow">
                <Sparkles size={14} />
                Seu painel
              </span>
              <h1>{loading ? "Carregando..." : saudacao}</h1>
              <p>{loading ? "Carregando informacoes..." : curso}</p>
            </div>

            <div className="student-tabs">
              <button type="button" className="active">Overview</button>
              <button type="button" onClick={() => navigate("/aluno/historico")}>Historico</button>
              <button type="button" onClick={() => navigate("/aluno/perfil")}>Perfil</button>
            </div>
          </div>
        </header>

        {error && (
          <div className="student-alert">
            <span>{error}</span>
            <button type="button" onClick={() => window.location.reload()}>
              Recarregar
            </button>
          </div>
        )}

        <section className="student-overview">
          {statCards.map((card) => (
            <article key={card.label} className={`metric-card metric-card--${card.tone}`}>
              <div className="metric-card__top">
                <span>{card.label}</span>
                <strong>{card.delta}</strong>
              </div>
              <div className="metric-card__value-row">
                <h2>{renderMetricValue(card.value)}</h2>
                <div className={`metric-card__accent metric-card__accent--${card.accent}`}>
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

        <section className="student-layout">
          <div className="student-primary">
            <section className="hero-course-card">
              <div className="hero-course-card__content">
                <div>
                  <span className="hero-course-card__label">Carga complementar</span>
                  <h2>
                    {loading ? "..." : horasConcluidas}
                    <span> / {horasNecessarias}h</span>
                  </h2>
                </div>
                <span className="hero-course-card__badge">{badgeText}</span>
              </div>

              <div className="hero-course-card__progress">
                <div className="hero-course-card__progress-meta">
                  <span>{loading ? "..." : `${percentual}% concluido`}</span>
                  <span>{loading ? "..." : `${aprovadas} atividades aprovadas`}</span>
                </div>
                <div className="hero-course-card__track">
                  <div
                    className="hero-course-card__fill"
                    style={{ width: `${Math.min(percentual, 100)}%` }}
                  />
                </div>
              </div>
            </section>

            <section className="agenda-card">
              <div className="section-heading">
                <div>
                  <h3>Minha fila recente</h3>
                  <p>Acompanhe o status das ultimas submissões enviadas.</p>
                </div>
                <button type="button" onClick={() => navigate("/aluno/historico")}>
                  Ver todas
                </button>
              </div>

              <div className="agenda-list">
                {loading && <p className="agenda-empty">Carregando atividades...</p>}

                {!loading && recentes.length === 0 && (
                  <p className="agenda-empty">
                    Nenhuma atividade recente. Use o botao de nova submissao para começar.
                  </p>
                )}

                {!loading &&
                  recentes.map((atividade) => {
                    const status = uiStatus(atividade.status);

                    return (
                      <article key={atividade.id} className="agenda-item">
                        <div className="agenda-item__meta">
                          <span className="agenda-item__time">
                            <Clock3 size={14} />
                            {atividade.data}
                          </span>
                          <div className="agenda-item__counts">
                            <span>{atividade.horas}h</span>
                            <span>{atividade.tipo}</span>
                          </div>
                        </div>

                        <div className="agenda-item__body">
                          <div>
                            <h4>{atividade.titulo}</h4>
                            <div className="agenda-item__tags">
                              <span className={`status-chip status-chip--${status.pillClass}`}>
                                {status.label}
                              </span>
                              <span className="soft-chip">{atividade.tipo}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="ghost-action"
                            onClick={() => navigate("/aluno/historico")}
                          >
                            <ArrowUpRight size={16} />
                          </button>
                        </div>
                      </article>
                    );
                  })}
              </div>
            </section>
          </div>

          <aside className="student-secondary">
            <section className="side-card">
              <div className="section-heading section-heading--stack">
                <div>
                  <h3>Status do aluno</h3>
                  <p>Resumo rapido do seu ciclo atual.</p>
                </div>
              </div>

              <div className="profile-mini">
                <div className="profile-mini__avatar">
                  {(perfil?.nome || "A").slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <strong>{perfil?.nome || "Aluno Senac"}</strong>
                  <span>{perfil?.email || "sem email cadastrado"}</span>
                </div>
              </div>

              <div className="side-stat-list">
                <div className="side-stat">
                  <span>Aprovadas</span>
                  <strong>{loading ? "..." : aprovadas}</strong>
                </div>
                <div className="side-stat">
                  <span>Pendentes</span>
                  <strong>{loading ? "..." : pendentes}</strong>
                </div>
                <div className="side-stat">
                  <span>Indeferidas</span>
                  <strong>{loading ? "..." : indeferidas}</strong>
                </div>
              </div>
            </section>
          </aside>
        </section>

        <button
          type="button"
          className="student-floating-submit"
          onClick={() => setSubmissionModalOpen(true)}
        >
          <Plus size={18} />
          <span>Enviar submissao</span>
        </button>
      </main>
    </div>
  );
};

export default AlunoEntrega;
