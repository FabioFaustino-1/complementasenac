import React, { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Clock3,
  FileUp,
  Menu,
  Send,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./NovaSubmissao.css";
import Sidebar from "../../../assets/Sidebar";
import { createAlunoMenu } from "../menuConfig";
import { useAuth } from "../../../assets/contexts/AuthContext";
import {
  fetchPerfilAluno,
  formatDateBrFromInput,
  submeterNovaAtividade,
} from "../../../services/aluno";
import { MAX_HORAS_POR_ATIVIDADE, validarHorasAtividade } from "../../../constants/hoursLimits";

const MAX_FILE_BYTES = 800 * 1024;

const tipoOptions = [
  "Curso Online",
  "Palestra / Workshop",
  "Trabalho Voluntario",
  "Congresso / Seminario",
  "Monitoria",
  "Outro",
];

const NovaSubmissao = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("");
  const [horas, setHoras] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [comprovanteUrl, setComprovanteUrl] = useState("");
  const [arquivoNome, setArquivoNome] = useState("");
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState(null);

  const navigate = useNavigate();
  const { token } = useAuth();
  const menuItems = createAlunoMenu(navigate);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    let active = true;

    const loadPerfil = async () => {
      setLoadingPerfil(true);
      try {
        const perfilData = await fetchPerfilAluno(token);
        if (active) setPerfil(perfilData);
      } catch {
        if (active) setPerfil(null);
      } finally {
        if (active) setLoadingPerfil(false);
      }
    };

    loadPerfil();

    return () => {
      active = false;
    };
  }, [token]);

  const handleFile = (file) => {
    if (!file) {
      setComprovanteUrl("");
      setArquivoNome("");
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setErro(`Arquivo muito grande (max. ${MAX_FILE_BYTES / 1024} KB para envio direto).`);
      setComprovanteUrl("");
      setArquivoNome("");
      return;
    }

    setErro(null);
    setArquivoNome(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setComprovanteUrl(typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErro(null);

    const validacaoHoras = validarHorasAtividade(horas);
    if (!titulo.trim() || !tipo || !dataEvento || !validacaoHoras.valido) {
      setErro(validacaoHoras.mensagem || "Preencha titulo, tipo, data e horas validas.");
      return;
    }

    const horasInt = validacaoHoras.horas;

    const dataBr = formatDateBrFromInput(dataEvento);
    setSubmitting(true);

    try {
      await submeterNovaAtividade(token, {
        titulo: titulo.trim(),
        tipo,
        data: dataBr,
        horas: horasInt,
        comprovanteUrl: comprovanteUrl || undefined,
      });
      navigate("/aluno");
    } catch (err) {
      setErro(err.message || "Nao foi possivel enviar a atividade.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="submission-shell">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activePage="submissao"
        menuItems={menuItems}
        userName={perfil?.nome || "Aluno"}
        userEmail={perfil?.email || ""}
        variant="student-dark"
      />

      <main className="submission-main">
        <header className="submission-topbar">
          <button
            type="button"
            className="submission-menu-toggle"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </button>

          <div className="submission-topbar__content">
            <span className="submission-eyebrow">
              <Sparkles size={14} />
              Envio de atividade complementar
            </span>
            <h1>Nova submissao</h1>
            <p>
              Registre uma nova atividade em um fluxo mais claro, com upload destacado
              e formulario no mesmo design system das outras telas do aluno.
            </p>

            <div className="submission-tabs">
              <button type="button" onClick={() => navigate("/aluno")}>Minhas horas</button>
              <button type="button" className="active">Nova Submissao</button>
              <button type="button" onClick={() => navigate("/aluno/historico")}>Historico</button>
              <button type="button" onClick={() => navigate("/aluno/perfil")}>Perfil</button>
            </div>
          </div>
        </header>

        {erro && (
          <div className="submission-alert">
            <span>{erro}</span>
            <button type="button" onClick={() => setErro(null)}>
              Fechar
            </button>
          </div>
        )}

        <section className="submission-layout">
          <aside className="submission-side-card">
            <div className="submission-side-card__header">
              <h2>Checklist rapido</h2>
              <p>Antes de enviar, confirme se o comprovante e os dados estao corretos.</p>
            </div>

            <div className="submission-check-list">
              <div className="submission-check-item">
                <Clock3 size={16} />
                <span>Informe a carga horaria real da atividade.</span>
              </div>
              <div className="submission-check-item">
                <CalendarDays size={16} />
                <span>Use a data oficial do evento ou certificado.</span>
              </div>
              <div className="submission-check-item">
                <FileUp size={16} />
                <span>Anexe PDF ou imagem ate 800 KB para agilizar a validacao.</span>
              </div>
            </div>

            <div className="submission-side-highlight">
              <strong>{loadingPerfil ? "..." : perfil?.nome || "Aluno Senac"}</strong>
              <span>{loadingPerfil ? "..." : perfil?.email || "Sem email cadastrado"}</span>
            </div>
          </aside>

          <form className="submission-form-card" onSubmit={handleSubmit}>
            <div className="submission-form-card__header">
              <div>
                <h2>Dados da atividade</h2>
                <p>Preencha as informacoes principais e anexe o comprovante, se houver.</p>
              </div>
              <span className="submission-pill">Fluxo guiado</span>
            </div>

            <div className="submission-grid">
              <div className="upload-panel">
                <label className="submission-label">Comprovante</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="submission-hidden-input"
                  onChange={(event) => handleFile(event.target.files?.[0])}
                />

                <div
                  className="submission-dropzone"
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
                  <div className="submission-dropzone__icon">
                    <UploadCloud size={22} />
                  </div>
                  <strong>{arquivoNome || "Clique ou arraste o arquivo aqui"}</strong>
                  <span>PDF ou imagem com ate {MAX_FILE_BYTES / 1024} KB</span>
                </div>
              </div>

              <div className="submission-fields">
                <div className="submission-field">
                  <label className="submission-label">Nome da atividade</label>
                  <div className="submission-input-shell">
                    <input
                      type="text"
                      placeholder="Ex: Workshop de React Avancado"
                      value={titulo}
                      onChange={(event) => setTitulo(event.target.value)}
                      disabled={loadingPerfil}
                    />
                  </div>
                </div>

                <div className="submission-field">
                  <label className="submission-label">Tipo de atividade</label>
                  <div className="submission-input-shell">
                    <select
                      value={tipo}
                      onChange={(event) => setTipo(event.target.value)}
                      disabled={loadingPerfil}
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

                <div className="submission-row">
                  <div className="submission-field">
                    <label className="submission-label">Horas</label>
                    <div className="submission-input-shell">
                      <input
                        type="number"
                        min={1}
                        max={MAX_HORAS_POR_ATIVIDADE}
                        placeholder="8"
                        value={horas}
                        onChange={(event) => setHoras(event.target.value)}
                        disabled={loadingPerfil}
                      />
                    </div>
                    <small className="submission-hint">Maximo de {MAX_HORAS_POR_ATIVIDADE}h por atividade.</small>
                  </div>

                  <div className="submission-field">
                    <label className="submission-label">Data do evento</label>
                    <div className="submission-input-shell">
                      <input
                        type="date"
                        value={dataEvento}
                        onChange={(event) => setDataEvento(event.target.value)}
                        disabled={loadingPerfil}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="submission-submit-btn"
                  disabled={submitting || loadingPerfil}
                >
                  <span>{submitting ? "Enviando..." : "Enviar para validacao"}</span>
                  <Send size={16} />
                </button>
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default NovaSubmissao;
