import { useState } from "react";
import { cadastrarUsuario } from "../../services/auth.js";
import { Mail, Lock, ArrowRight, GraduationCap } from 'lucide-react';
import './App.css';

function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

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
    <div className="min-h-screen bg-[#00337C] flex items-center justify-center p-4 relative overflow-hidden font-sans text-white">
      
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white/5 rounded-full" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] border border-white/10 rounded-full" />

      <div className="container max-w-6xl grid lg:grid-cols-2 gap-12 items-center z-10">
        
        {/* Lado Esquerdo: Texto */}
        <div className="space-y-6">
          <div className="bg-[#F7941D] w-12 h-12 rounded-lg flex items-center justify-center shadow-lg">
            <GraduationCap size={28} />
          </div>
          <h1 className="text-5xl font-bold leading-tight">
            Atividades <br /> Complementares
          </h1>
          <p className="text-blue-100 text-lg max-w-md leading-relaxed">
            Sua evolução acadêmica, simplificada. Envie, acompanhe e valide suas horas em um único lugar.
          </p>
        </div>

        {/* Lado Direito: Card de Login */}
        <div className="flex justify-center lg:justify-end">
          <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl text-slate-800">
            <h2 className="text-3xl font-bold text-[#00337C]">Entrar</h2>
            <p className="text-slate-500 mt-2 mb-8">Acesse sua conta para continuar.</p>

            <form className="space-y-6">
              {/* Seletor de Perfil */}
              <div>
                <label className="text-sm font-semibold text-[#00337C] block mb-3">Perfil de Acesso</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" className="border-2 border-[#00337C] bg-blue-50 rounded-xl p-3 text-center flex flex-col items-center justify-center transition-all">
                    <span className="font-bold text-[#00337C] text-sm">Aluno <br /></span>
                    <span className="text-[10px] text-slate-500 leading-tight mt-1">Submeter atividades</span>
                  </button>
                  <button type="button" className="border border-slate-200 rounded-xl p-3 text-center flex flex-col items-center justify-center hover:bg-slate-50 transition-all">
                    <span className="font-bold text-slate-600 text-sm">Coordenador <br /></span>
                    <span className="text-[10px] text-slate-400 leading-tight mt-1">Validar atividades</span>
                  </button>
                  <button type="button" className="border border-slate-200 rounded-xl p-3 text-center flex flex-col items-center justify-center hover:bg-slate-50 transition-all">
                    <span className="font-bold text-slate-600 text-sm">Administrador <br /></span>
                    <span className="text-[10px] text-slate-400 leading-tight mt-1">Gerenciar cursos</span>
                  </button>
                </div>
              </div>

              {/* Input E-mail */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#00337C]">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    placeholder="demo@senac.pe"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Input Senha */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#00337C]">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Botão Entrar */}
              <button
                type="button"
                onClick={handleCadastro}
                className="w-full bg-[#154284] hover:bg-[#00337C] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg">
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