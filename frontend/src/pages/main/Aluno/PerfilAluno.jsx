import React, { useEffect, useState } from "react";
import { BookOpen, Menu, Sparkles } from "lucide-react";


import { useNavigate } from "react-router-dom";
import "./PerfilAluno.css";
import Sidebar from "../../../assets/Sidebar";
import { createAlunoMenu } from "../menuConfig";
import { useAuth } from "../../../assets/contexts/AuthContext";
import { fetchPerfilAluno, fetchResumoAluno } from "../../../services/aluno";
import { formatCourseName } from "../../../utils/userDisplay";

function iniciais(nome) {
  if (!nome || !nome.trim()) return "AL";
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const PerfilAluno = () => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  const navigate = useNavigate();
  const { token } = useAuth();
  const menuItems = createAlunoMenu(navigate);

  useEffect(() => {
    if (!token) return;

    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [perfilData, resumoData] = await Promise.all([
          fetchPerfilAluno(token),
          fetchResumoAluno(token),
        ]);

        if (!active) return;
        setPerfil(perfilData);
        setResumo(resumoData);
      } catch (e) {
        if (!active) return;
        setError(e.message || "Nao foi possivel carregar o perfil.");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [token]);

  const percentual = resumo?.percentualConcluido ?? 0;
  const horasConcluidas = resumo?.horasConcluidas ?? 0;
  const horasNecessarias = resumo?.horasNecessarias ?? 40;

  return (
    <div className="profile-shell">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activePage="perfil"
        menuItems={menuItems}
        userName={perfil?.nome || "Aluno"}
        userEmail={perfil?.email || ""}
        variant="student-dark"
      />

      <main className="profile-main">
        <header className="profile-topbar">
          <button
            type="button"
            className="profile-menu-toggle"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </button>

          <div className="profile-topbar__content">
            <span className="profile-eyebrow">
              <Sparkles size={14} />
              Area pessoal do aluno
            </span>
            <h1>Meu perfil</h1>
            <p>Identidade, progresso academico e dados institucionais em uma interface unificada.</p>

            <div className="profile-tabs">
              <button type="button" onClick={() => navigate("/aluno")}>Minhas horas</button>
              <button type="button" onClick={() => navigate("/aluno/submissao")}>Nova Submissao</button>
              <button type="button" onClick={() => navigate("/aluno/historico")}>Historico</button>
              <button type="button" className="active">Perfil</button>
            </div>
          </div>
        </header>

        {error && (
          <div className="profile-alert">
            <span>{error}</span>
            <button type="button" onClick={() => window.location.reload()}>
              Recarregar
            </button>
          </div>
        )}

        <section className="profile-layout">
          <aside className="profile-sidebar-column">
            <article className="profile-card">
              <div className="profile-avatar">{loading ? "..." : iniciais(perfil?.nome)}</div>
              <h2>{loading ? "Carregando..." : perfil?.nome || "Aluno Senac"}</h2>
              <p>{loading ? "..." : perfil?.email || "Sem email cadastrado"}</p>

              <div className="profile-role-chip">
                <BookOpen size={14} />
                Aluno
              </div>

              <div className="profile-progress">
                <div className="profile-progress__meta">
                  <span>Progresso de horas</span>
                  <strong>{loading ? "..." : `${horasConcluidas}/${horasNecessarias}h`}</strong>
                </div>
                <div className="profile-progress__track">
                  <div
                    className="profile-progress__fill"
                    style={{ width: `${Math.min(percentual, 100)}%` }}
                  />
                </div>
              </div>

              <div className="profile-mini-stats">
                <div>
                  <strong>{loading ? "..." : resumo?.totalAtividades ?? 0}</strong>
                  <span>Atividades</span>
                </div>
                <div>
                  <strong>{loading ? "..." : resumo?.aprovadas ?? 0}</strong>
                  <span>Aprovadas</span>
                </div>
              </div>
            </article>
          </aside>

          <section className="profile-content-column">
            <article className="profile-form-card">
              <div className="profile-form-card__header">
                <div>
                  <h3>Informacoes pessoais</h3>
                  <p>Dados institucionais exibidos no mesmo design system do dashboard.</p>
                </div>
              </div>


              <div className="profile-form-grid">
                <div className="profile-field">
                  <label>Nome completo</label>
                  <div className="profile-input-shell">
                    <input type="text" value={perfil?.nome || ""} readOnly disabled />
                  </div>
                </div>

                <div className="profile-field">
                  <label>E-mail</label>
                  <div className="profile-input-shell">
                    <input type="text" value={perfil?.email || ""} readOnly disabled />
                  </div>
                </div>

                <div className="profile-field">
                  <label>Telefone</label>
                  <div className="profile-input-shell">
                    <input
                      type="text"
                      value={perfil?.telefone || ""}
                      readOnly
                      disabled
                    />

                  </div>
                </div>

                <div className="profile-field">
                  <label>Ingresso</label>
                  <div className="profile-input-shell">
                    <input
                      type="text"
                      value={perfil?.ingresso || ""}
                      readOnly
                      disabled
                    />
                  </div>
                </div>



                <div className="profile-field">
                  <label>Curso</label>
                  <div className="profile-input-shell">
                    <input
                      type="text"
                      value={formatCourseName(perfil?.curso)}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label>Departamento</label>
                  <div className="profile-input-shell">
                    <input
                      type="text"
                      value={perfil?.departamento || ""}
                      readOnly
                      disabled
                    />

                  </div>
                </div>


                <div className="profile-field profile-field--full">
                  <label>Matricula / Registro</label>
                  <div className="profile-input-shell">
                    <input type="text" value={perfil?.matricula || ""} readOnly disabled />
                  </div>
                </div>
              </div>
            </article>


          </section>
        </section>
      </main>
    </div>
  );
};

export default PerfilAluno;
