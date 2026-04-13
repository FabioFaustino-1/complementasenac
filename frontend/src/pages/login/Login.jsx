import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import { Mail, Lock, ArrowRight, GraduationCap } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import './Login.css';

const testarBackend = async () => {
  try {
    const resposta = await fetch("http://localhost:8080/api/usuario");
    const texto = await resposta.text();
    alert(texto);
  } catch (erro) {
    alert("Erro ao conectar com backend");
  }
};

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfilAtivo, setPerfilAtivo] = useState("aluno");
  const navigate = useNavigate(); 
  
const handleLogin = async () => {
    try {
      // mock momentaneo
    /*const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;
    
    const token = await user.getIdToken();
    
    const resposta = await fetch("http://localhost:8080/api/usuario", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("TOKEN:", token);
    const dados = await resposta.json();
    console.log("DADOS BACKEND:", dados);
    console.log(dados); 
    
    
    // ✅ REDIRECIONAMENTO CERTO
    if (dados.perfil === "aluno") {
      navigate("/aluno");
    }
    console.log("TOKEN:", token);
*/
  console.log("Login simulado");
  if (perfilAtivo === "aluno") {
  navigate("/aluno");
  }else if (perfilAtivo === "Coordenador") {
    navigate ("/Coordenador");
    alert("Login para coordenador ainda não implementado");
  }else if (perfilAtivo === "admin") {
    navigate ("/admin");
    alert("Login para administrador ainda não implementado");
  }
  } catch (erro) {
    alert("Erro: " + erro.message);
  }
};

const enviarParaBackend = async (token) => {
  const resposta = await fetch("http://localhost:8080/api/usuario", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const texto = await resposta.text();
  console.log(texto);
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
              className={`profile-btn ${perfilAtivo === 'Coordenador' ? 'active' : ''}`}
              onClick={() => setPerfilAtivo('Coordenador')}
            >
              <div className="icon-placeholder">👤</div> {/* Use ícone de usuários aqui */}
              <div className="btn-text">
                <strong>Coordenador</strong>
                <span>Validar atividades dos alunos</span>
              </div>
            </button>

            <button 
              className={`profile-btn ${perfilAtivo === 'admin' ? 'active' : ''}`}
              onClick={() => setPerfilAtivo('admin')}
            >
              <div className="icon-placeholder">⚙️</div> {/* Use ícone de engrenagem aqui */}
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

        <button onClick={handleLogin} className="main-submit-btn">
          Entrar →
        </button>
      </div>
    </div>
  </div>
  );
}

export default Login;