import React from 'react';
import './PerfilAluno.css';
import { FiMenu, FiEdit3, FiBookOpen } from 'react-icons/fi';

const PerfilAluno = ({ toggleSidebar }) => {
  return (
    <div className="perfil-root-container">
      <div className="perfil-page-wrapper">
        
        {/* HEADER */}
        <header className="perfil-top-header">
          <div className="header-inner">
            {/* O clique aqui vai abrir a sidebar que você criar separada */}
            <FiMenu className="hamburguer-icon" onClick={toggleSidebar} />
            <div className="header-right-group">
                <div className="text-right-aligned">
                    <span className="senac-txt">Senac</span>
                    <span className="complementares-txt">Complementares</span>
                </div>
                <div className="s-plus-box">S+</div>
            </div>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="perfil-main-content">
          <div className="perfil-grid-layout">
            
            {/* COLUNA ESQUERDA (PERFIL) */}
            <aside className="left-profile-column">
              <div className="white-card text-center">
                <div className="big-avatar">FF</div>
                <h2 className="dark-blue-title">Fabio Faustão</h2>
                <p className="gray-sub">fabio.faustao@edu.pe.senac.br</p>
                <div className="aluno-badge"><FiBookOpen size={12}/> ALUNO</div>
                
                <div className="progresso-container">
                  <div className="labels">
                    <span>PROGRESSO DE HORAS</span>
                    <span>32/40H</span>
                  </div>
                  <div className="bar-bg">
                    <div className="bar-fill" style={{width: '80%'}}></div>
                  </div>
                </div>

                <div className="stats-row">
                  <div className="stat-item"><strong>5</strong><small>ATIVIDADES</small></div>
                  <div className="stat-item"><strong className="green">3</strong><small>APROVADAS</small></div>
                </div>
              </div>
            </aside>

            {/* COLUNA DIREITA (FORMULÁRIO) */}
            <section className="right-info-column">
              <div className="white-card">
                <div className="card-header">
                  <h3>INFORMAÇÕES PESSOAIS</h3>
                  <button className="edit-btn">
                    <FiEdit3 /> Editar
                  </button>
                </div>

                <div className="form-grid">
                  <div className="field">
                    <label>Nome Completo</label>
                    <input type="text" value="Fabio Faustão" disabled />
                  </div>
                  <div className="field">
                    <label>E-mail</label>
                    <input type="text" value="fabio.faustao@edu.pe.senac.br" disabled />
                  </div>
                  <div className="field">
                    <label>Telefone</label>
                    <input type="text" value="(81) 99728-1233" disabled />
                  </div>
                  <div className="field">
                    <label>Ingresso</label>
                    <input type="text" value="Fevereiro 2024" disabled />
                  </div>
                  <div className="field">
                    <label>Curso</label>
                    <input type="text" value="Análise e Desenvolvimento de Sistemas" disabled />
                  </div>
                  <div className="field">
                    <label>Departamento</label>
                    <input type="text" value="Tecnologia da Informação" disabled />
                  </div>
                  <div className="field full">
                    <label>Matrícula / Registro</label>
                    <input type="text" value="2024.1.12.12345" disabled />
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
