import React, { useState } from 'react';
import './NovaSubmissao.css';
import Sidebar from '../../../assets/Sidebar';
// Importando ícones para a navegação da Sidebar
import { User, Clock, UploadCloud, FileText, ClipboardList, Users, BarChart, PlusCircle } from 'lucide-react';

const NovaSubmissao = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Configuração dos itens do menu para a sua Sidebar dinâmica
  const menuItems = [
  { 
    id: 'perfil', 
    name: 'Meu Perfil', 
    icon: <User size={20} />, 
    onClick: () => console.log('Navegar para Perfil') 
  },
  { 
    id: 'horas', 
    name: 'Minhas Horas', 
    icon: <Clock size={20} />, 
    onClick: () => console.log('Navegar para Minhas Horas') 
  },
  { 
    id: 'submissao', 
    name: 'Nova Submissão', 
    icon: <UploadCloud size={20} />, 
    onClick: () => console.log('Já estou aqui') 
  },
  { 
    id: 'historico', 
    name: 'Histórico', 
    icon: <FileText size={20} />, 
    onClick: () => console.log('Navegar para Histórico') 
  },
];

  return (
    <div className="submission-root-container">
      
      {/* Chamada da sua Sidebar com as Props que ela espera */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        activePage="submissao"
        menuItems={menuItems}
        userName="Fabio Faustão"
        userEmail="fabio.faustao@edu.pe.senac.br"
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
              <p className="submission-subtitle">Preencha os dados da atividade e anexe o comprovante.</p>
            </div>

            <div className="submission-card">
              <div className="submission-grid">
                <div className="upload-section">
                  <label className="input-label">Comprovante</label>
                  <div className="upload-dropzone">
                    <div className="upload-placeholder-circle">↑</div>
                    <p className="upload-text">Arraste o arquivo aqui</p>
                    <span className="upload-subtext">PDF ou imagem (max. 10MB)</span>
                  </div>
                </div>

                <div className="form-section">
                  <div className="input-group">
                    <label className="input-label">Nome da Atividade</label>
                    <input type="text" placeholder="Ex: Workshop de React Avançado" />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Tipo de Atividade</label>
                    <select defaultValue="">
                      <option value="" disabled>Selecione o tipo</option>
                      <option value="curso">Curso Online</option>
                      <option value="palestra">Palestra / Workshop</option>
                      <option value="voluntariado">Trabalho Voluntário</option>
                    </select>
                  </div>

                  <div className="form-row-double">
                    <div className="input-group">
                      <label className="input-label">Horas</label>
                      <input type="number" placeholder="20" />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Data do Evento</label>
                      <input type="text" placeholder="dd/mm/aaaa" />
                    </div>
                  </div>

                  <button className="submit-btn">Enviar para Validação</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NovaSubmissao;
