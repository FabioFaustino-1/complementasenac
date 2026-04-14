import React, { useState } from 'react';
import './Historico.css';
import Sidebar from '../../../assets/Sidebar';
import { User, Clock, UploadCloud, FileText } from 'lucide-react';

const Historico = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Itens da Sidebar conforme a ordem do seu print anterior
  const menuItems = [
    { id: 'perfil', name: 'Meu Perfil', icon: <User size={20} />, onClick: () => console.log('Perfil') },
    { id: 'horas', name: 'Minhas Horas', icon: <Clock size={20} />, onClick: () => console.log('Horas') },
    { id: 'submissao', name: 'Nova Submissão', icon: <UploadCloud size={20} />, onClick: () => console.log('Submissão') },
    { id: 'historico', name: 'Histórico', icon: <FileText size={20} />, onClick: () => console.log('Já estou aqui') },
  ];

  // Dados mockados para simular a sua imagem
  const atividades = [
    { id: 1, nome: "Semana da Tecnologia 2024", tipo: "Seminário", data: "20/12/2024", horas: "9h", status: "Aprovado" },
    { id: 2, nome: "Voluntariado ONG Digital", tipo: "Trabalho Voluntário", data: "06/12/2021", horas: "12h", status: "Aprovado" },
    { id: 3, nome: "Workshop de React Avançado", tipo: "Workshop", data: "12/03/2026", horas: "8h", status: "Aprovado" },
    { id: 4, nome: "Palestra sobre IA Generativa", tipo: "Palestra", data: "08/03/2026", horas: "12h", status: "Indeferida" },
    { id: 5, nome: "Hackathon Senac 2026", tipo: "Congresso", data: "01/03/2026", horas: "15h", status: "Indeferida" },
    { id: 6, nome: "Curso de Python para Dados", tipo: "Curso Online", data: "15/02/2026", horas: "8h", status: "Aprovado" },
    { id: 7, nome: "Monitoria de Banco de Dados", tipo: "Monitoria", data: "10/02/2026", horas: "10h", status: "Aprovado" },
  ];

  return (
    <div className="history-root-container">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        activePage="historico"
        menuItems={menuItems}
        userName="Fabio Faustão"
        userEmail="fabio.faustao@edu.pe.senac.br"
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

            <div className="history-card">
              <div className="activities-list">
                {atividades.map((atv) => (
                  <div key={atv.id} className="activity-item">
                    <div className="activity-left">
                      <div className="doc-icon-box">📄</div>
                      <div className="activity-info">
                        <span className="activity-name">{atv.nome}</span>
                        <span className="activity-details">{atv.tipo} • {atv.data}</span>
                      </div>
                    </div>
                    
                    <div className="activity-right">
                      <span className="activity-hours">{atv.horas}</span>
                      <div className={`status-badge ${atv.status.toLowerCase()}`}>
                        {atv.status === 'Aprovado' ? '✓' : '✕'} {atv.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Historico;
