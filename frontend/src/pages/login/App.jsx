import { useState } from "react";
import { cadastrarUsuario } from "../../services/auth.js";
import { Mail, Lock, ArrowRight, GraduationCap } from 'lucide-react';
import './App.css';

function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfilAtivo, setPerfilAtivo] = useState("aluno");
  const handleCadastro = async () => {
    if (!email || !senha) {
        alert("Preencha todos os campos!");
        return;
      }
    try {
      await cadastrarUsuario(email, senha);
      alert("Usuário cadastrado com sucesso!");
    } catch (erro) {
      alert("Erro: " + erro.message);
    }
  };

  return (
    <div className="body-wrapper">
      
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
                onClick={handleCadastro}
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

export default App;