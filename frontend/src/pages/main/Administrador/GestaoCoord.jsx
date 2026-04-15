import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importação necessária para navegação
import './GestaoCoord.css';
import Sidebar from '../../../assets/Sidebar';
import { 
  Pencil, 
  Trash2, 
  ClipboardCheck, 
  Users, 
  BarChart3
} from 'lucide-react';

const GestaoCoord = () => {
  // Inicializa o navigate
  const navigate = useNavigate();

  // ESTADOS DA LISTA
  const [coordenadores, setCoordenadores] = useState([
    { id: 1, nome: "Maria Silva", email: "maria.silva@senac.pe.br", depto: "Tecnologia da Informação", cursos: ["ADS", "Redes"], status: "Ativo" },
    { id: 2, nome: "Carlos Mendes", email: "carlos.mendes@senac.pe.br", depto: "Gestão", cursos: ["Administração", "Contabilidade"], status: "Ativo" },
    { id: 3, nome: "Ana Oliveira", email: "ana.oliveira@senac.pe.br", depto: "Saúde", cursos: ["Enfermagem", "Nutrição"], status: "Inativo" },
    { id: 4, nome: "Roberto Santos", email: "roberto.santos@senac.pe.br", depto: "Design", cursos: ["Design Gráfico"], status: "Ativo" },
  ]);

  // ESTADOS DE CONTROLE
  const [busca, setBusca] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Controle unificado da sidebar

  // ESTADO DO FORMULÁRIO
  const [formData, setFormData] = useState({ nome: "", email: "", depto: "", status: "Ativo" });

  // FUNÇÕES DE MANIPULAÇÃO
  const dadosFiltrados = coordenadores.filter(c => 
    c.nome.toLowerCase().includes(busca.toLowerCase()) || 
    c.email.toLowerCase().includes(busca.toLowerCase())
  );

  const handleExcluir = (id) => {
    if(window.confirm("Deseja realmente excluir este coordenador?")) {
      setCoordenadores(coordenadores.filter(c => c.id !== id));
    }
  };

  const handleEditar = (coord) => {
    setEditandoId(coord.id);
    setFormData({ nome: coord.nome, email: coord.email, depto: coord.depto, status: coord.status });
    setIsModalOpen(true);
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    if (editandoId) {
      setCoordenadores(coordenadores.map(c => c.id === editandoId ? { ...c, ...formData } : c));
    } else {
      const novoCoord = { ...formData, id: Date.now(), cursos: ["Geral"] };
      setCoordenadores([...coordenadores, novoCoord]);
    }
    fecharModal();
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setEditandoId(null);
    setFormData({ nome: "", email: "", depto: "", status: "Ativo" });
  };

  // CONFIGURAÇÃO DA SIDEBAR ADMIN
  const itensMenuAdmin = [
    { id: 'coordenadores', name: 'Gestão de Coordenadores', icon: <Users size={20} />, onClick: () => navigate('/Administrador') },
    { id: 'alunos', name: 'Adicionar Aluno', icon: <ClipboardCheck size={20} />, onClick: () => navigate('/gestao-alunos') },
    { id: 'cursos', name: 'Gerenciamento de Cursos', icon: <Users size={20} />, onClick: () => navigate('/gestao-cursos') },
    { id: 'logs', name: 'Logs', icon: <BarChart3 size={20} />, onClick: () => console.log('Logs') },
  ];

  return (
    <div className="coord-root-container">
      {/* SIDEBAR */}
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        activePage="coordenadores" 
        menuItems={itensMenuAdmin}
        userName="Fabio Faustino"
        userEmail="fabio.faustino@edu.pe.senac.br"
      />

      <div className="coord-page-wrapper">
        <header className="coord-top-header">
          <div className="header-inner">
            {/* O clique aqui agora abre a sidebar corretamente */}
            <div className="hamburguer-manual" onClick={() => setSidebarOpen(true)}>
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

        <main className="coord-main-content">
          <div className="coord-container">
            <div className="coord-header-action">
              <div className="title-info">
                <h1 className="coord-title">Coordenadores</h1>
                <p className="coord-subtitle">Cadastre e gerencie os coordenadores do sistema</p>
              </div>
              <button className="new-coord-btn" onClick={() => setIsModalOpen(true)}>
                <span className="plus-icon">+</span> Novo Coordenador
              </button>
            </div>

            <div className="search-bar-container">
              <div className="search-input-wrapper">
                <svg className="search-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  type="text" 
                  placeholder="Buscar coordenador..." 
                  className="search-input" 
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>

            <div className="table-card">
              <table className="coord-table">
                <thead>
                  <tr>
                    <th>NOME</th><th>E-MAIL</th><th>DEPARTAMENTO</th><th>CURSOS</th><th>STATUS</th><th>AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosFiltrados.map((coord) => (
                    <tr key={coord.id}>
                      <td className="coord-name">{coord.nome}</td>
                      <td>{coord.email}</td>
                      <td>{coord.depto}</td>
                      <td>
                        <div className="badge-group">
                          {coord.cursos?.map((curso, index) => (
                            <span key={index} className="course-badge">{curso}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`status-label ${coord.status.toLowerCase()}`}>{coord.status}</span>
                      </td>
                      <td className="actions-cell">
                        <button className="icon-btn-svg" onClick={() => handleEditar(coord)}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                          </svg>
                        </button>
                        <button className="icon-btn-svg" onClick={() => handleExcluir(coord.id)}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editandoId ? "Editar Coordenador" : "Novo Coordenador"}</h2>
            <form onSubmit={handleSalvar}>
              <input type="text" placeholder="Nome" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              <input type="email" placeholder="E-mail" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input type="text" placeholder="Departamento" required value={formData.depto} onChange={e => setFormData({...formData, depto: e.target.value})} />
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
              <div className="modal-btns">
                <button type="button" onClick={fecharModal}>Cancelar</button>
                <button type="submit" className="btn-save">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestaoCoord;
