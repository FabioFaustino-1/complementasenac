import React, { useState } from "react";
import { FileText, Users, Search, User } from "lucide-react";
import "./RelatoriosCoordenador.css";

const RelatoriosCoordenador = ({ stats, activities, taxa }) => {
  const [busca, setBusca] = useState("");
  const termoBusca = busca.trim().toLowerCase();
  const atividadesFiltradas = termoBusca
    ? activities.filter((atividade) => atividade.student.toLowerCase().includes(termoBusca))
    : activities;

  return (
    <div className="rep-main-viewport">
      <div className="rep-content-wrapper">
        <div className="rep-stats-container">
          <div className="rep-card rep-card-active">
            <div className="rep-card-icon-frame"><FileText size={20} /></div>
            <div className="rep-card-data"><span className="rep-card-number">{activities.length}</span><span className="rep-card-label">Pendentes</span></div>
          </div>
          <div className="rep-card rep-card-passive">
            <div className="rep-card-icon-frame cp-success"><FileText size={20} color="#22c55e" /></div>
            <div className="rep-card-data"><span className="rep-card-number">{stats.aprovadas}</span><span className="rep-card-label">Aprovadas no mes</span></div>
          </div>
          <div className="rep-card rep-card-passive">
            <div className="rep-card-icon-frame cp-danger"><FileText size={20} color="#ef4444" /></div>
            <div className="rep-card-data"><span className="rep-card-number">{stats.rejeitadas}</span><span className="rep-card-label">Rejeitadas no mes</span></div>
          </div>
          <div className="rep-card rep-card-passive">
            <div className="rep-card-icon-frame cp-warning"><Users size={20} color="#f97316" /></div>
            <div className="rep-card-data"><span className="rep-card-number">{stats.alunosAtivos ?? 0}</span><span className="rep-card-label">Alunos Ativos</span></div>
          </div>
        </div>

        <div className="rep-details-grid">
          <div className="rep-panel rep-panel-table">
            <div className="rep-panel-header">
              <h3>ATIVIDADES PENDENTES</h3>
              <p>Sincronizado com a fila de validacao</p>
              <div className="rep-search-container">
                <Search size={18} className="rep-search-icon" />
                <input
                  type="text"
                  placeholder="Buscar aluno..."
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                />
              </div>
            </div>
            <div className="rep-table-body">
              {termoBusca && atividadesFiltradas.length === 0 ? (
                <p className="rep-empty-search">Aluno não encontrado.</p>
              ) : null}

              {atividadesFiltradas.map((student) => (
                <div key={student.id} className="rep-student-row">
                  <div className="rep-avatar">
                    {student.student.split(" ").map((item) => item[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="rep-student-main-info">
                    <span className="rep-student-name">{student.student}</span>
                    <span className="rep-student-course">{student.title}</span>
                  </div>
                  <div className="rep-type-tag rep-type-tag--fixed">{student.type}</div>
                  <div className="rep-action-icon"><User size={16} /></div>


                </div>
              ))}
            </div>
          </div>

          <div className="rep-panel rep-panel-charts">
            <h3>RESUMO SEMANAL</h3>
            <div className="rep-approval-panel">
              <h3>TAXA DE APROVACAO</h3>
              <div className="rep-approval-metric">{taxa}%</div>
              <div className="rep-bar-background"><div className="rep-bar-fill" style={{ width: `${taxa}%` }} /></div>
              <p className="rep-comparison-text">Calculado com base no historico</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatoriosCoordenador;
