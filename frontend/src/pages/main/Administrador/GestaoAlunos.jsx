import React, { useState } from 'react';
import Sidebar from '../../../assets/Sidebar';
import { useNavigate } from 'react-router-dom';

import { 
  UserPlus, 
  Pencil, 
  Trash2, 
  Search, 
  ClipboardCheck, 
  Users, 
  BarChart3
} from 'lucide-react';
import './GestaoAlunos.css';

const GestaoAlunos = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    matricula: "",
    curso: "",
  });
  const navigate = useNavigate();
  const API_URL = "http://localhost:8080/api/admin/alunos";

  React.useEffect(() => {
    carregarAlunos();
  }, []);

  const carregarAlunos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Falha ao carregar alunos");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalvarAluno = async () => {
    if (!formData.nome || !formData.email || !formData.matricula || !formData.curso) {
      alert("Preencha todos os campos.");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Falha ao salvar aluno");
      setShowForm(false);
      setFormData({ nome: "", email: "", matricula: "", curso: "" });
      await carregarAlunos();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const itensMenuAdmin = [
  { id: 'coordenadores', name: 'Gestao de Coordenadores', icon: <Users size={20} color="white" />, onClick: () => navigate('/coordenador') },
  { id: 'alunos', name: 'Adicionar Aluno', icon: <ClipboardCheck size={20} color="white" /> },
  { id: 'cursos', name: 'Gerenciamento de Cursos', icon: <Users size={20} color="white" />, onClick: () => navigate('/gestao-alunos') },
  { id: 'logs', name: 'Logs', icon: <BarChart3 size={20} color="white" />, onClick: () => navigate('/gestao-alunos') },
];


  return (
    <div className="app-viewport">
      <Sidebar 
       isOpen={sidebarOpen} 
      setIsOpen={setSidebarOpen} 
      activePage="alunos" 
      menuItems={itensMenuAdmin}
      userName="Fabio Faustino"
      userEmail="fabio.faustino@edu.pe.senac.br"
      />

      <main className="main-content-gestao">
        <header className="gestao-header">
          <button className="burger-menu" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="header-right-group">
            <div className="text-right-aligned">
              <span className="senac-txt">Senac</span>
              <span className="complementares-txt">Complementares</span>
            </div>
            <div className="s-plus-box">S+</div>
          </div>
        </header>

        <section className="gestao-container">
          <div className="title-row">
            <h1>Gestão de Alunos</h1>
            {!showForm && (
              <button className="btn-add-student" onClick={() => setShowForm(true)}>
                <UserPlus size={18} /> Adicionar Aluno
              </button>
            )}
          </div>

          {showForm && (
            <div className="add-student-card">
              <h3>Novo Aluno</h3>
              <div className="gestao-form-grid">
                <input type="text" name="nome" value={formData.nome} onChange={handleInputChange} placeholder="Nome completo" />
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="E-mail institucional" />
                <input type="text" name="matricula" value={formData.matricula} onChange={handleInputChange} placeholder="Matrícula" />
                <input type="text" name="curso" value={formData.curso} onChange={handleInputChange} placeholder="Curso" />
              </div>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancelar</button>
                <button className="btn-save" onClick={handleSalvarAluno} disabled={loading}>Salvar Aluno</button>
              </div>
            </div>
          )}

          <div className="search-bar-container">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Buscar por nome ou matrícula..." />
          </div>

          <div className="students-list">
            {students.map(student => (
              <div key={student.id} className="student-item-card">
                <div className="student-info">
                  <h4>{student.nome}</h4>
                  <p className="student-email">{student.email}</p>
                  <p className="student-details">{student.matricula} • {student.curso}</p>
                </div>
                <div className="student-actions">
                  <button className="btn-icon edit"><Pencil size={18} /></button>
                  <button className="btn-icon delete"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
            {!loading && students.length === 0 && <p>Nenhum aluno cadastrado.</p>}
          </div>
        </section>
      </main>
    </div>
  );
};

export default GestaoAlunos;