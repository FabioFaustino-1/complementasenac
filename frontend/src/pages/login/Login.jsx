import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import { Mail, Lock, ArrowRight, GraduationCap } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import './Login.css';

const testarBackend = async () => {
  try {
    const resposta = await fetch("http://localhost:8080/api/teste");
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
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
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

  } catch (erro) {
    alert("Erro: " + erro.message);
  }
};

const enviarParaBackend = async (token) => {
  const resposta = await fetch("http://localhost:8080/api/teste", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const texto = await resposta.text();
  console.log(texto);
};

  return (
    <div className="body-wrapper">
      
      <button 
        onClick={testarBackend}
        className="w-full bg-[#154284] hover:bg-[#00337C] text-white font-bold py-4 rounded-xl"
      >
        Testar Backend
      </button>
      {/* Elementos Decorativos de Fundo */}
      <div className="bg-circle-1" />
      <div className="bg-circle-2" />

      <div className="main-container">
        
        {/* Lado Esquerdo: Texto */}
        <div className="hero-section">
          <div className="icon-box">
            <GraduationCap size={28} />
          </div>
          <h1>
            Atividades <br /> Complementares
          </h1>
          <p>
            Sua evolução acadêmica, simplificada. Envie, acompanhe e valide suas horas em um único lugar.
          </p>
        </div>

        {/* Lado Direito: Card de Login */}
        <div className="login-card">
          <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl text-slate-800">
            <h2>Entrar</h2>
            <p className="subtitle">Acesse sua conta para continuar.</p>

            <form className="space-y-6">
              {/* Seletor de Perfil */}
              <div>
                <label className="profile-label">Perfil de Acesso</label>
                <div className="profile-grid">
                  <button type="button"
                    className={`profile-option ${perfilAtivo === 'aluno' ? 'active' : ''}`}
                    onClick={() => setPerfilAtivo('aluno')}
                    >
                    <span>Aluno <br /></span>
                    <span>Submeter atividades</span>
                    
                  </button>
                  <button type="button"
                    className={`profile-option ${perfilAtivo === 'coord' ? 'active' : ''}`}
                    onClick={() => setPerfilAtivo('coord')}>
                    <span>Coordenador <br /></span>
                    <span>Validar atividades</span>
                  </button>
                  <button type="button"
                    className={`profile-option ${perfilAtivo === 'admin' ? 'active' : ''}`}
                    onClick={() => setPerfilAtivo('admin')}>
                    <span>Administrador <br /></span>
                    <span>Gerenciar cursos</span>
                  </button>
                </div>
              </div>

              {/* Input E-mail */}
              <div className="form-group">
                <label>E-mail</label>
                <div className="input-wrapper">
                  <Mail className="icon" size={18} />
                  <input 
                    type="email" 
                    placeholder="demo@edu.pe.senac.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}            
                  />
                </div>
              </div>

              {/* Input Senha */}
              <div className="form-group">
                <label>Senha</label>
                <div className="input-wrapper">
                  <Lock className="icon" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                </div>
              </div>

              {/* Botão Entrar */}
              <button
                type="button"
                onClick={handleLogin}
                className="btn-submit">
                Entrar <ArrowRight size={18} />
              </button>
              
            </form>
          </div>  
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-10 text-white/40 text-sm">
        © 2026 Senac Pernambuco
      </div>
    </div>
  );
}

export default Login;