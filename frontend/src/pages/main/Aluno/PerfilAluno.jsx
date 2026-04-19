import React, { useState, useEffect, useCallback } from 'react';
import './PerfilAluno.css';
import { Menu, Pencil, BookOpen } from 'lucide-react';
import Sidebar from '../../../assets/Sidebar';
import { useNavigate } from 'react-router-dom';
import { createAlunoMenu } from '../menuConfig';
import { useAuth } from '../../../assets/contexts/AuthContext';
import { fetchPerfilAluno, fetchResumoAluno } from '../../../services/aluno';

function iniciais(nome) {
  if (!nome || !nome.trim()) return 'AL';
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const PerfilAluno = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();
  const menuItems = createAlunoMenu(navigate);

  const [perfil, setPerfil] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [p, r] = await Promise.all([fetchPerfilAluno(token), fetchResumoAluno(token)]);
      setPerfil(p);
      setResumo(r);
    } catch (e) {
      setError(e.message || 'Não foi possível carregar o perfil.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const pct = resumo?.percentualConcluido ?? 0;
  const horasOk = resumo?.horasConcluidas ?? 0;
  const horasNec = resumo?.horasNecessarias ?? 40;

  return (
    <div className="perfil-root-container">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activePage="perfil"
        menuItems={menuItems}
        userName={perfil?.nome || 'Aluno'}
        userEmail={perfil?.email || ''}
      />
      <div className="perfil-page-wrapper">
        <header className="perfil-top-header">
          <div className="header-inner">
            <Menu className="hamburguer-icon" onClick={() => setIsSidebarOpen(true)} />
            <div className="header-right-group">
              <div className="text-right-aligned">
                <span className="senac-txt">Senac</span>
                <span className="complementares-txt">Complementares</span>
              </div>
              <div className="s-plus-box">S+</div>
            </div>
          </div>
        </header>

        {error && (
          <p style={{ padding: '0 24px', color: '#b91c1c' }}>
            {error}{' '}
            <button type="button" onClick={load} style={{ fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Tentar novamente
            </button>
          </p>
        )}

        <main className="perfil-main-content">
          <div className="perfil-grid-layout">
            <aside className="left-profile-column">
              <div className="white-card text-center">
                <div className="big-avatar">{loading ? '…' : iniciais(perfil?.nome)}</div>
                <h2 className="dark-blue-title">{loading ? '…' : perfil?.nome}</h2>
                <p className="gray-sub">{loading ? '…' : perfil?.email}</p>
                <div className="aluno-badge">
                  <BookOpen size={12} /> ALUNO
                </div>

                <div className="progresso-container">
                  <div className="labels">
                    <span>PROGRESSO DE HORAS</span>
                    <span>
                      {loading ? '—' : `${horasOk}/${horasNec}H`}
                    </span>
                  </div>
                  <div className="bar-bg">
                    <div className="bar-fill" style={{ width: `${Math.min(100, pct)}%` }}></div>
                  </div>
                </div>

                <div className="stats-row">
                  <div className="stat-item">
                    <strong>{loading ? '—' : resumo?.totalAtividades ?? 0}</strong>
                    <small>ATIVIDADES</small>
                  </div>
                  <div className="stat-item">
                    <strong className="green">{loading ? '—' : resumo?.aprovadas ?? 0}</strong>
                    <small>APROVADAS</small>
                  </div>
                </div>
              </div>
            </aside>

            <section className="right-info-column">
              <div className="white-card">
                <div className="card-header">
                  <h3>INFORMAÇÕES PESSOAIS</h3>
                  <button type="button" className="edit-btn" disabled title="Edição em breve">
                    <Pencil /> Editar
                  </button>
                </div>

                <div className="form-grid">
                  <div className="field">
                    <label>Nome Completo</label>
                    <input type="text" value={perfil?.nome || ''} readOnly disabled />
                  </div>
                  <div className="field">
                    <label>E-mail</label>
                    <input type="text" value={perfil?.email || ''} readOnly disabled />
                  </div>
                  <div className="field">
                    <label>Telefone</label>
                    <input type="text" value={perfil?.telefone || ''} readOnly disabled />
                  </div>
                  <div className="field">
                    <label>Ingresso</label>
                    <input type="text" value={perfil?.ingresso || ''} readOnly disabled />
                  </div>
                  <div className="field">
                    <label>Curso</label>
                    <input type="text" value={perfil?.curso || ''} readOnly disabled />
                  </div>
                  <div className="field">
                    <label>Departamento</label>
                    <input type="text" value={perfil?.departamento || ''} readOnly disabled />
                  </div>
                  <div className="field full">
                    <label>Matrícula / Registro</label>
                    <input type="text" value={perfil?.matricula || ''} readOnly disabled />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PerfilAluno;
