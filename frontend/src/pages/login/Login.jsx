import { useEffect, useState } from "react";
import {
  ArrowRight,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserCog,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import loginScene from "../../assets/login-scene.png";
import { autenticarUsuario } from "../../services/auth";
import { useAuth } from "../../assets/contexts/AuthContext";



const perfis = [
  {
    id: "aluno",
    titulo: "Aluno",
    descricao: "Submeta atividades e acompanhe validacoes.",
    icon: GraduationCap,
  },
  {
    id: "coordenador",
    titulo: "Coordenador",
    descricao: "Analise horas, pendencias e aprovacoes.",
    icon: UserCog,
  },
  {
    id: "admin",
    titulo: "Administrador",
    descricao: "Gerencie cursos, regras e parametros.",
    icon: ShieldCheck,
  },
];

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfilAtivo, setPerfilAtivo] = useState("aluno");
  const [loading, setLoading] = useState(false);
  const [erroLogin, setErroLogin] = useState("");
  const navigate = useNavigate();
  const { loginWithBackend, isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (role === "aluno") navigate("/aluno", { replace: true });
    else if (role === "coordenador") navigate("/coordenador", { replace: true });
    else if (role === "admin") navigate("/admin", { replace: true });
  }, [isAuthenticated, role, navigate]);

  const perfilSelecionado =
    perfis.find((perfil) => perfil.id === perfilAtivo) ?? perfis[0];

  const handleLogin = async (event) => {
    event?.preventDefault();

    const emailNormalizado = email.trim();
    if (!emailNormalizado || !senha) {
      setErroLogin("Preencha e-mail e senha.");
      return;
    }

    try {
      setErroLogin("");
      setLoading(true);
      const { perfil, token } = await autenticarUsuario(emailNormalizado, senha);
      const perfilBackend = perfil?.perfil ?? perfilAtivo;

      loginWithBackend({ token, perfil, email: emailNormalizado });

      if (perfilBackend === "aluno") {
        navigate("/aluno");
      } else if (perfilBackend === "coordenador") {
        navigate("/coordenador");
      } else if (perfilBackend === "admin") {
        navigate("/admin");
      } else {
        setErroLogin("Perfil sem rota configurada.");
      }
    } catch (erro) {
      const mensagem = erro?.message || "";
      if (
        mensagem.includes("auth/invalid-credential") ||
        mensagem.includes("auth/invalid-login-credentials") ||
        mensagem.includes("auth/wrong-password") ||
        mensagem.includes("auth/user-not-found")
      ) {
        setErroLogin("Login ou senha incorretos.");
      } else {
        setErroLogin(mensagem ? `Erro no login: ${mensagem}` : "Nao foi possivel entrar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__glow login-page__glow--warm" />
      <div className="login-page__glow login-page__glow--soft" />

      <section className="hero-panel" aria-label="Apresentacao da plataforma">

        <div className="scene-card">
          <img
            className="scene-card__image"
            src={loginScene}
            alt="Estudantes do Senac em sala de aula"
          />
          <p className="scene-card__caption">
            Bem-vindo ao Complementa+, a plataforma de atividades complementares do
            Senac. Aqui, voce pode submeter atividades, acompanhar o progresso e
            garantir que suas horas sejam validadas com rapidez e seguranca.
          </p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-copy">
          <span className="auth-copy__eyebrow">
            <Sparkles size={14} />
            Plataforma Complementa+
          </span>
          <h1>Complementa +.</h1>
          <p>
            Sua evolucao academica comeca aqui. Acesse, submeta atividades e acompanhe
            seu progresso de forma simples e intuitiva. Temos as ferramentas certas
            para voce.
          </p>
        </div>

        <form className="auth-card" onSubmit={handleLogin}>
          <div className="auth-card__header">
            <div>
              <span className="auth-card__kicker">Acesso</span>
              <h2>Entre na sua conta</h2>
            </div>
            <div className="auth-card__status">
              <span className="auth-card__status-dot" />
              {perfilSelecionado.titulo}
            </div>
          </div>

          {erroLogin ? <p className="auth-card__error">{erroLogin}</p> : null}

          <div className="profile-grid" role="tablist" aria-label="Selecione o perfil">
            {perfis.map((perfil) => {
              const Icon = perfil.icon;
              const ativo = perfil.id === perfilAtivo;

              return (
                <button
                  key={perfil.id}
                  type="button"
                  className={`profile-btn ${ativo ? "active" : ""}`}
                  onClick={() => setPerfilAtivo(perfil.id)}
                  aria-pressed={ativo}
                >
                  <span className="profile-btn__icon">
                    <Icon size={18} />
                  </span>
                  <span className="btn-text">
                    <strong>{perfil.titulo}</strong>
                    <span>{perfil.descricao}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <div className="input-shell">
              <Mail size={16} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="styled-input"
                placeholder="email@edu.pe.senac.br"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="senha">Senha</label>
            <div className="input-shell">
              <LockKeyhole size={16} />
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="styled-input"
                placeholder="Digite sua senha"
              />
            </div>
          </div>

          <button
            type="submit"
            className="main-submit-btn"
            disabled={loading || !email.trim() || !senha}
          >
            <span>{loading ? "Entrando..." : `Continuar como ${perfilSelecionado.titulo}`}</span>
            <ArrowRight size={18} />
          </button>

          <p className="auth-card__terms">
            Ao continuar, voce confirma o uso seguro da plataforma Complementa+ e
            concorda com as diretrizes institucionais de acesso.
          </p>
        </form>
      </section>
    </div>
  );
}

export default Login;
