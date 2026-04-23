import React, { useState } from 'react';
import { Users, ClipboardCheck, BarChart3, BookOpen, Plus } from 'lucide-react';
import Sidebar from '../../../assets/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../assets/contexts/AuthContext';
import { buildGreeting, deriveDisplayName } from '../../../utils/userDisplay';
import './GestaoCursos.css';

const GestaoCursos = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate()
  const { user } = useAuth();
  const nomeUsuario = deriveDisplayName({
    name: user?.name,
    email: user?.email,
    fallback: 'Administrador',
  });


  // Estado para a lista de cursos (exemplo inicial baseado na imagem)
  const [cursos, setCursos] = useState([
    { id: 1, nome: 'Análise e Desenvolvimento de Sistemas', departamento: 'Tecnologia da Informação', alunos: 45, carga: '40h' },
    { id: 2, nome: 'Redes de Computadores', departamento: 'Tecnologia da Informação', alunos: 32, carga: '40h' },
    { id: 3, nome: 'Administração', departamento: 'Gestão', alunos: 60, carga: '50h' },
    { id: 4, nome: 'Contabilidade', departamento: 'Gestão', alunos: 38, carga: '50h' },
    { id: 5, nome: 'Enfermagem', departamento: 'Saúde', alunos: 55, carga: '60h' },
    { id: 6, nome: 'Design Gráfico', departamento: 'Design', alunos: 28, carga: '40h' },
  ]);

  const itensMenuAdmin = [
    { id: 'coordenadores', name: 'Gestão de Coordenadores', icon: <Users size={20} color="white" />, onClick: () => navigate('/GestaoCoord') },
    { id: 'alunos', name: 'Adicionar Aluno', icon: <ClipboardCheck size={20} color="white" />,  onClick: () => navigate('/gestaoalunos') },
    { id: 'cursos', name: 'Gerenciamento de Cursos', icon: <BookOpen size={20} color="white" /> },
    { id: 'logs', name: 'Logs', icon: <BarChart3 size={20} color="white" />, onClick: () => navigate('/Admin') },
  ];

  const handleAddCurso = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const novoCurso = {
      id: Date.now(),
      nome: formData.get('nome'),
      departamento: formData.get('departamento'),
      alunos: 0,
      carga: `${formData.get('carga')}h`
    };
    setCursos([...cursos, novoCurso]);
    setIsModalOpen(false);
  };

  return (
    <div className="container-cursos">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        activePage="cursos" 
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
            <p>Gerencie os cursos e parâmetros de horas complementares</p>
          </div>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Novo Curso
          </button>
        </section>

        <div className="cursos-grid">
          {cursos.map((curso) => (
            <div key={curso.id} className="curso-card">
              <div className="curso-header">
                <div className="curso-icon">
                  <BookOpen size={20} color="#003a70" />
                </div>
                <div className="curso-title-area">
                  <h3>{curso.nome}</h3>
                  <span>{curso.departamento}</span>
                </div>
              </div>
              
              <div className="curso-stats">
                <div className="stat-box">
                  <span className="stat-num">{curso.alunos}</span>
                  <span className="stat-label">ALUNOS</span>
                </div>
                <div className="stat-box">
                  <span className="stat-num">{curso.carga}</span>
                  <span className="stat-label">CARGA MÁX.</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Cadastrar Novo Curso</h2>
            <form onSubmit={handleAddCurso}>
              <div className="form-group">
                <label>Nome do Curso</label>
                <input name="nome" type="text" placeholder="Ex: Engenharia de Software" required />
              </div>
              <div className="form-group">
                <label>Departamento</label>
                <input name="departamento" type="text" placeholder="Ex: Tecnologia" required />
              </div>
              <div className="form-group">
                <label>Carga Horária Máxima (Horas)</label>
                <input name="carga" type="number" placeholder="Ex: 40" required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Curso</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestaoCursos;
