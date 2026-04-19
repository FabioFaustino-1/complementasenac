import React, { useState, useEffect, useCallback } from 'react';
import './Historico.css';
import Sidebar from '../../../assets/Sidebar';
import { useNavigate } from 'react-router-dom';
import { createAlunoMenu } from '../menuConfig';
import { useAuth } from '../../../assets/contexts/AuthContext';
import { fetchHistoricoAtividades, fetchPerfilAluno, uiStatus } from '../../../services/aluno';

const Historico = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();
  const menuItems = createAlunoMenu(navigate);

  const [perfil, setPerfil] = useState(null);
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [p, list] = await Promise.all([fetchPerfilAluno(token), fetchHistoricoAtividades(token)]);
      setPerfil(p);
      setAtividades(list);
    } catch (e) {
      setError(e.message || 'Não foi possível carregar o histórico.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="history-root-container">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activePage="historico"
        menuItems={menuItems}
        userName={perfil?.nome || 'Aluno'}
        userEmail={perfil?.email || ''}
      />

      <div className="history-page-wrapper">
        <header className="history-top-header">
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

        <main className="history-main-content">
          <div className="history-container">
            <div className="history-title-section">
              <div className="title-with-icon">
                <h1 className="history-title">Histórico Completo</h1>
              </div>
              <p className="history-subtitle">Todas as atividades submetidas</p>
            </div>

            {error && (
              <p style={{ color: '#b91c1c', marginBottom: 16 }}>
                {error}{' '}
                <button type="button" onClick={load} style={{ fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Tentar novamente
                </button>
              </p>
            )}

            <div className="history-card">
              <div className="activities-list">
                {loading && <p style={{ color: '#6b7280' }}>Carregando…</p>}
                {!loading && atividades.length === 0 && (
                  <p style={{ color: '#6b7280' }}>Nenhuma atividade registrada.</p>
                )}
                {!loading &&
                  atividades.map((atv) => {
                    const st = uiStatus(atv.status);
                    return (
                      <div key={atv.id} className="activity-item">
                        <div className="activity-left">
                          <div className="doc-icon-box">📄</div>
                          <div className="activity-info">
                            <span className="activity-name">{atv.titulo}</span>
                            <span className="activity-details">
                              {atv.tipo} • {atv.data}
                            </span>
                          </div>
                        </div>

                        <div className="activity-right">
                          <span className="activity-hours">{atv.horas}h</span>
                          <div className={`status-badge ${st.badgeClass}`}>
                            {st.label === 'Aprovado' ? '✓' : st.label === 'Indeferida' ? '✕' : '◷'}{' '}
                            {st.label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Historico;
