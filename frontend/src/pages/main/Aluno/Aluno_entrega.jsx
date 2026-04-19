import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../../assets/Sidebar';
import './Aluno_entrega.css';
import { useNavigate } from 'react-router-dom';
import { createAlunoMenu } from '../menuConfig';
import { useAuth } from '../../../assets/contexts/AuthContext';
import {
  fetchPerfilAluno,
  fetchResumoAluno,
  fetchAtividadesRecentes,
  uiStatus,
} from '../../../services/aluno';

const IconPlus = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const Aluno_entrega = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();
  const menuItems = createAlunoMenu(navigate);

  const [perfil, setPerfil] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [recentes, setRecentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [p, r, rec] = await Promise.all([
        fetchPerfilAluno(token),
        fetchResumoAluno(token),
        fetchAtividadesRecentes(token),
      ]);
      setPerfil(p);
      setResumo(r);
      setRecentes(rec);
    } catch (e) {
      setError(e.message || 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFabClick = () => navigate('/aluno/submissao');

  const pct = resumo?.percentualConcluido ?? 0;
  const horasOk = resumo?.horasConcluidas ?? 0;
  const horasNec = resumo?.horasNecessarias ?? 40;
  const badgeText =
    pct >= 100 ? 'Concluído' : pct >= 75 ? 'Próximo do limite' : 'Em andamento';

  return (
    <div className="container-aluno">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        activePage="horas"
        menuItems={menuItems}
        userName={perfil?.nome || 'Aluno'}
        userEmail={perfil?.email || ''}
      />

      <main className="main-content">
        <header className="top-header">
          <button type="button" className="menu-toggle" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="header-right-group">
            <div className="text-right-aligned">
              <span className="senac-txt">Senac</span>
              <span className="complementares-txt">Complementares</span>
            </div>
            <div className="s-plus-box">S+</div>
          </div>
        </header>

        {error && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', color: '#b91c1c', borderRadius: 8, marginBottom: 16 }}>
            {error}
            <button type="button" onClick={load} style={{ marginLeft: 12, fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Tentar novamente
            </button>
          </div>
        )}

        <div className="dashboard-content">
          <div className="dashboard-top">
            <div className="course-card">
              <div className="course-info">
                <h3>{loading ? '…' : resumo?.curso || 'Curso'}</h3>
                <span className="badge-limit">{badgeText}</span>
              </div>
              <div className="hours-main">
                <h1>
                  {loading ? '—' : horasOk}
                  <span>/{horasNec}h</span>
                </h1>
                <p>Carga Horária Complementar</p>
              </div>
              <div className="progress-section">
                <span>{loading ? '—' : `${pct}% concluído`}</span>
                <span className="max-info">Máx. 20h por tipo de atividade</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, pct)}%` }}></div>
                </div>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card approved">
                <div className="icon-circle">
                  <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="8 12 11 15 16 9"></polyline>
                  </svg>
                </div>
                <h2>{loading ? '—' : resumo?.aprovadas ?? 0}</h2>
                <p>Aprovados</p>
              </div>

              <div className="stat-card pending">
                <div className="icon-circle">
                  <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#f39c12" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <h2>{loading ? '—' : resumo?.pendentes ?? 0}</h2>
                <p>Pendentes</p>
              </div>

              <div className="stat-card denied">
                <div className="icon-circle">
                  <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </div>
                <h2>{loading ? '—' : resumo?.indeferidas ?? 0}</h2>
                <p>Negados</p>
              </div>
            </div>
          </div>

          <section className="activities-section">
            <div className="section-header">
              <h3>Atividades Recentes</h3>
              <button type="button" className="ver-todas" onClick={() => navigate('/aluno/historico')}>
                Ver todas
              </button>
            </div>
            <div className="activities-list">
              {loading && <p style={{ color: '#64748b' }}>Carregando atividades…</p>}
              {!loading && recentes.length === 0 && (
                <p style={{ color: '#64748b' }}>Nenhuma atividade ainda. Use o botão + para enviar.</p>
              )}
              {!loading &&
                recentes.map((act) => {
                  const st = uiStatus(act.status);
                  return (
                    <div key={act.id} className="activity-item">
                      <div className="activity-info">
                        <span className="doc-icon">📄</span>
                        <div>
                          <h4>{act.titulo}</h4>
                          <p>
                            {act.tipo} • {act.data}
                          </p>
                        </div>
                      </div>
                      <div className="activity-meta">
                        <span className="hours-tag">{act.horas}h</span>
                        <span className={`status-pill ${st.pillClass}`}>{st.label}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        </div>

        <button type="button" className="fab-plus" onClick={handleFabClick} title="Nova Submissão">
          <IconPlus />
        </button>
      </main>
    </div>
  );
};

export default Aluno_entrega;
