import React, { useState, useEffect, useCallback, useRef } from 'react';
import './NovaSubmissao.css';
import Sidebar from '../../../assets/Sidebar';
import { useNavigate } from 'react-router-dom';
import { createAlunoMenu } from '../menuConfig';
import { useAuth } from '../../../assets/contexts/AuthContext';
import {
  fetchPerfilAluno,
  formatDateBrFromInput,
  submeterNovaAtividade,
} from '../../../services/aluno';

const MAX_FILE_BYTES = 800 * 1024;

const NovaSubmissao = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();
  const menuItems = createAlunoMenu(navigate);
  const fileInputRef = useRef(null);

  const [perfil, setPerfil] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('');
  const [horas, setHoras] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [comprovanteUrl, setComprovanteUrl] = useState('');
  const [arquivoNome, setArquivoNome] = useState('');
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState(null);

  const loadPerfil = useCallback(async () => {
    if (!token) return;
    setLoadingPerfil(true);
    try {
      const p = await fetchPerfilAluno(token);
      setPerfil(p);
    } catch {
      setPerfil(null);
    } finally {
      setLoadingPerfil(false);
    }
  }, [token]);

  useEffect(() => {
    loadPerfil();
  }, [loadPerfil]);

  const handleFile = (file) => {
    if (!file) {
      setComprovanteUrl('');
      setArquivoNome('');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setErro(`Arquivo muito grande (máx. ${MAX_FILE_BYTES / 1024} KB para envio direto).`);
      setComprovanteUrl('');
      setArquivoNome('');
      return;
    }
    setErro(null);
    setArquivoNome(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setComprovanteUrl(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    const h = parseInt(horas, 10);
    if (!titulo.trim() || !tipo || !dataEvento || Number.isNaN(h) || h <= 0) {
      setErro('Preencha título, tipo, data e horas válidas.');
      return;
    }
    const dataBr = formatDateBrFromInput(dataEvento);
    setSubmitting(true);
    try {
      await submeterNovaAtividade(token, {
        titulo: titulo.trim(),
        tipo,
        data: dataBr,
        horas: h,
        comprovanteUrl: comprovanteUrl || undefined,
      });
      navigate('/aluno');
    } catch (err) {
      setErro(err.message || 'Não foi possível enviar a atividade.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="submission-root-container">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activePage="submissao"
        menuItems={menuItems}
        userName={perfil?.nome || 'Aluno'}
        userEmail={perfil?.email || ''}
      />

      <div className="submission-page-wrapper">
        <header className="submission-top-header">
          <div className="header-inner">
            <div className="hamburguer-manual" onClick={() => setIsSidebarOpen(true)}>
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>

            <div className="header-right-group">
              <div className="text-right-aligned">
                <span className="senac-txt">Senac</span>
                <span className="complementares-txt">Complementares</span>
              </div>
              <div className="s-plus-box">S+</div>
            </div>
          </div>
        </header>

        <main className="submission-main-content">
          <div className="submission-container">
            <div className="submission-title-section">
              <h1 className="submission-title">Nova Submissão</h1>
              <p className="submission-subtitle">
                Preencha os dados da atividade e anexe o comprovante (opcional). O coordenador ou administrador irá analisar.
              </p>
            </div>

            {erro && (
              <div style={{ marginBottom: 16, padding: 12, background: '#fef2f2', color: '#991b1b', borderRadius: 8 }}>
                {erro}
              </div>
            )}

            <form className="submission-card" onSubmit={handleSubmit}>
              <div className="submission-grid">
                <div className="upload-section">
                  <label className="input-label">Comprovante (opcional)</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,image/*"
                    style={{ display: 'none' }}
                    onChange={(ev) => handleFile(ev.target.files?.[0])}
                  />
                  <div
                    className="upload-dropzone"
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(k) => k.key === 'Enter' && fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFile(e.dataTransfer.files?.[0]);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="upload-placeholder-circle">↑</div>
                    <p className="upload-text">{arquivoNome || 'Clique ou arraste o arquivo aqui'}</p>
                    <span className="upload-subtext">PDF ou imagem (máx. {MAX_FILE_BYTES / 1024} KB)</span>
                  </div>
                </div>

                <div className="form-section">
                  <div className="input-group">
                    <label className="input-label">Nome da Atividade</label>
                    <input
                      type="text"
                      placeholder="Ex: Workshop de React Avançado"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      disabled={loadingPerfil}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Tipo de Atividade</label>
                    <select value={tipo} onChange={(e) => setTipo(e.target.value)} disabled={loadingPerfil}>
                      <option value="">Selecione o tipo</option>
                      <option value="Curso Online">Curso Online</option>
                      <option value="Palestra / Workshop">Palestra / Workshop</option>
                      <option value="Trabalho Voluntário">Trabalho Voluntário</option>
                      <option value="Congresso / Seminário">Congresso / Seminário</option>
                      <option value="Monitoria">Monitoria</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div className="form-row-double">
                    <div className="input-group">
                      <label className="input-label">Horas</label>
                      <input
                        type="number"
                        min={1}
                        placeholder="8"
                        value={horas}
                        onChange={(e) => setHoras(e.target.value)}
                        disabled={loadingPerfil}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Data do Evento</label>
                      <input
                        type="date"
                        value={dataEvento}
                        onChange={(e) => setDataEvento(e.target.value)}
                        disabled={loadingPerfil}
                      />
                    </div>
                  </div>

                  <button type="submit" className="submit-btn" disabled={submitting || loadingPerfil}>
                    {submitting ? 'Enviando…' : 'Enviar para Validação'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NovaSubmissao;
