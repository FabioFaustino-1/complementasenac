import { useState } from "react";
import { GraduationCap, UserCog, ShieldCheck } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import './Login.css';
import { autenticarUsuario } from "../../services/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfilAtivo, setPerfilAtivo] = useState("aluno");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 
  
const handleLogin = async () => {
  if (!email || !senha) {
    alert("Preencha e-mail e senha.");
    return;
  }

  try {
    setLoading(true);
    const { perfil } = await autenticarUsuario(email, senha);
    const perfilBackend = perfil?.perfil ?? perfilAtivo;

    if (perfilBackend === "aluno") {
      navigate("/aluno");
    } else if (perfilBackend === "coordenador") {
      navigate("/coordenador");
    } else if (perfilBackend === "admin") {
      navigate("/gestao-alunos");
    } else {
      alert("Perfil sem rota configurada.");
    }
  } catch (erro) {
    alert("Erro no login: " + erro.message);
  } finally {
    setLoading(false);
  }
};

  return (
<div className="login-page">
    {/* Lado Esquerdo - Hero */}
    <div className="hero-side">
      <div className="logo-box">S+</div>
      <div className="hero-content">
        <h1>Complementa+</h1>
        <p>
          Sua evolução acadêmica, simplificada. Envie, <br />
          acompanhe e valide suas horas em um único lugar.
        </p>
      </div>
      <div className="footer-text">2026 Senac Pernambuco</div>
    </div>

    {/* Lado Direito - Formulário */}
    <div className="form-side">
      <div className="login-card">
        <h2>Entrar</h2>
        <p className="subtitle">Acesse sua conta para continuar</p>

        <div className="profile-selection">
          <label>Perfil de Acesso</label>
          <div className="profile-grid">
            <button 
              className={`profile-btn ${perfilAtivo === 'aluno' ? 'active' : ''}`}
              onClick={() => setPerfilAtivo('aluno')}
            >
              <GraduationCap size={24} />
              <div className="btn-text">
                <strong>Aluno</strong>
                <span>Submeter atividades complementares</span>
              </div>
            </button>

            <button 
              className={`profile-btn ${perfilAtivo === 'coordenador' ? 'active' : ''}`}
              onClick={() => setPerfilAtivo('coordenador')}
            >
              <UserCog size={24} />
              <div className="btn-text">
                <strong>Coordenador</strong>
                <span>Validar atividades dos alunos</span>
              </div>
            </button>

            <button 
              className={`profile-btn ${perfilAtivo === 'admin' ? 'active' : ''}`}
              onClick={() => setPerfilAtivo('admin')}
            >
              <ShieldCheck size={24} />
              <div className="btn-text">
                <strong>Administrador</strong>
                <span>Gerenciar cursos e parâmetros</span>
              </div>
            </button>
          </div>
        </div>

        <div className="input-group">
          <label>E-mail</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="styled-input"
          />
        </div>

        <div className="input-group">
          <label>Senha</label>
          <input 
            type="password" 
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="styled-input"
          />
        </div>

        <button onClick={handleLogin} className="main-submit-btn" disabled={loading}>
          {loading ? "Entrando..." : "Entrar →"}
        </button>
      </div>
    </div>
  </div>
  );
}

export default Login;