import React from "react";
import { FileText, Users, Search, User } from "lucide-react";
import "./RelatoriosCoordenador.css";

const RelatoriosCoordenador = ({ stats, activities, taxa }) => (
  <div className="rep-main-viewport">
    <div className="rep-content-wrapper">
      <div className="rep-page-header">
        <h1>Painel do Coordenador</h1>
        <p>Gerencie e valide as atividades complementares dos alunos</p>
      </div>

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
          <div className="rep-card-data"><span className="rep-card-number">40</span><span className="rep-card-label">Alunos Ativos</span></div>
        </div>
      </div>

      <div className="rep-details-grid">
        <div className="rep-panel rep-panel-table">
          <div className="rep-panel-header">
            <h3>ATIVIDADES PENDENTES</h3>
            <p>Sincronizado com a fila de validacao</p>
            <div className="rep-search-container">
              <Search size={18} className="rep-search-icon" />
              <input type="text" placeholder="Buscar aluno..." />
            </div>
          </div>
          <div className="rep-table-body">
            {activities.map((student) => (
              <div key={student.id} className="rep-student-row">
                <div className="rep-avatar" style={{ backgroundColor: student.color, color: student.textColor }}>{student.avatar}</div>
                <div className="rep-student-main-info">
                  <span className="rep-student-name">{student.student}</span>
                  <span className="rep-student-course">{student.title}</span>
                </div>
                <div className="rep-type-tag">{student.type}</div>
                <div className="rep-hours-display">{student.hours}h</div>
                <button className="rep-action-btn"><User size={16} /></button>
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

export default RelatoriosCoordenador;
