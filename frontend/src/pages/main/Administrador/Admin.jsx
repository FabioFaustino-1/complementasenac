import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ClipboardCheck, BarChart3, MoreHorizontal } from 'lucide-react';
import Sidebar from '../../../assets/Sidebar'; // Ajuste o caminho conforme sua estrutura
import { useAuth } from '../../../assets/contexts/AuthContext';
import { buildGreeting, deriveDisplayName } from '../../../utils/userDisplay';
import './Admin.css';

const Admin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const nomeUsuario = deriveDisplayName({
    name: user?.name,
    email: user?.email,
    fallback: 'Administrador',
  });

  const itensMenuAdmin = [
    { id: 'coordenadores', name: 'Gestao de Coordenadores', icon: <Users size={20} color="white" />, onClick: () => navigate('/gestaocoord') },
    { id: 'alunos', name: 'Adicionar Aluno', icon: <ClipboardCheck size={20} color="white" />,  onClick: () => navigate('/gestaoalunos') },
    { id: 'cursos', name: 'Gerenciamento de Cursos', icon: <Users size={20} color="white" />, onClick: () => navigate('/gestaocursos') },
    { id: 'logs', name: 'Logs', icon: <BarChart3 size={20} color="white" /> },
  ];

  const stats = [
    { label: 'Coordenadores Ativos', value: '3', icon: '🛡️', type: 'highlight' },
    { label: 'Alunos Cadastrados', value: '245', icon: '🎓' },
    { label: 'Atividades no Sistema', value: '1280', icon: '📊' },
    { label: 'Cursos Ativos', value: '8', icon: '👥' },
  ];

  const coordinators = [
    { name: 'Maria Silva', email: 'maria.silva@senac.pe.br', dept: 'Tecnologia da Informação', courses: ['ADS', 'Redes'], status: 'Ativo' },
    { name: 'Carlos Mendes', email: 'carlos.mendes@senac.pe.br', dept: 'Gestão', courses: ['Administração', 'Contabilidade'], status: 'Ativo' },
    { name: 'Ana Oliveira', email: 'ana.oliveira@senac.pe.br', dept: 'Saúde', courses: ['Enfermagem', 'Nutrição'], status: 'Inativo' },
    { name: 'Roberto Santos', email: 'roberto.santos@senac.pe.br', dept: 'Design', courses: ['Design Gráfico'], status: 'Ativo' },
  ];

  return (
    <div className="container-admin">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        activePage="coordenadores" 
        menuItems={itensMenuAdmin}
        userName={nomeUsuario}
        userEmail={user?.email || 'admin@senac.pe.br'}
      />

      <main className="main-content">
        <header className="top-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="user-profile-nav">
             <div className="avatar">S+</div>
             <div className="header-labels">
                <strong>Senac</strong>
                <span>Complementares</span>
             </div>
          </div>
        </header>

        <section className="dashboard-intro">
          <div>
            <h1>{buildGreeting(nomeUsuario)}</h1>
            <p>Gerencie coordenadores, cursos e parâmetros do sistema</p>
          </div>
          <button className="btn-primary">+ Novo Coordenador</button>
        </section>

        <div className="stats-grid">
          {stats.map((item, idx) => (
            <div key={idx} className={`stat-card ${item.type || ''}`}>
              <span className="stat-icon">{item.icon}</span>
              <div className="stat-value">{item.value}</div>
              <div className="stat-label">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="content-card">
          <div className="card-header">
            <h3>Coordenadores</h3>
            <div className="search-box">
              <input type="text" placeholder="Buscar coordenador..." />
            </div>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>NOME</th>
                  <th>E-MAIL</th>
                  <th>DEPARTAMENTO</th>
                  <th>CURSOS</th>
                  <th>STATUS</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {coordinators.map((coord, idx) => (
                  <tr key={idx}>
                    <td className="font-bold">{coord.name}</td>
                    <td className="text-gray">{coord.email}</td>
                    <td className="text-gray">{coord.dept}</td>
                    <td>
                      <div className="course-badges">
                        {coord.courses.map(c => <span key={c} className="badge">{c}</span>)}
                      </div>
                    </td>
                    <td>
                      <span className={`status-tag ${coord.status.toLowerCase()}`}>
                        {coord.status}
                      </span>
                    </td>
                    <td><button className="btn-icon"><MoreHorizontal size={18} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
