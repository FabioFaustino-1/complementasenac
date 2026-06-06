import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import Sidebar from "../../../assets/Sidebar";
import "./SolicitacoesExclusao.css";
import { useAuth } from "../../../assets/contexts/AuthContext";
import { listarSolicitacoesExclusao, decidirSolicitacaoExclusao } from "../../../services/admin";
import { deriveDisplayName } from "../../../utils/userDisplay";

const SolicitacoesExclusao = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [pendingId, setPendingId] = useState(null);

  const { token, user } = useAuth();
  const nomeUsuario = deriveDisplayName({
    name: user?.name,
    email: user?.email,
    fallback: "Administrador",
  });

  useEffect(() => {
    if (!token) return;
    let active = true;

    const load = async () => {
      try {
        setError(null);
        setLoading(true);
        const docs = await listarSolicitacoesExclusao(token);
        const lista = (docs?.data || docs || []).map((d) => d);
        if (!active) return;
        setItems(lista);
      } catch (e) {
        if (!active) return;
        setError(e.message || "Nao foi possivel carregar solicitacoes de exclusao.");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [token]);

  const decidir = async (id, decisao) => {
    if (!token) return;
    setPendingId(id);
    setError(null);
    try {
      await decidirSolicitacaoExclusao(token, id, decisao);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      setError(e.message || "Erro ao processar decisao.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="sol-exc-shell">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activePage="admin"
        menuItems={[]}
        userName={nomeUsuario}
        userEmail={user?.email || ""}
        variant="student-dark"
      />

      <main className="sol-exc-main">
        <header className="sol-exc-topbar">
          <div className="sol-exc-title-row">
            <Trash2 size={18} />
            <h1>Solicitacoes de exclusao</h1>
          </div>
          <p>Decida sobre pedidos de exclusao feitos pelos coordenadores.</p>
        </header>

        {error ? (
          <div className="sol-exc-alert">
            <span>{error}</span>
            <button type="button" onClick={() => window.location.reload()}>
              Recarregar
            </button>
          </div>
        ) : null}

        <section className="sol-exc-card">
          <div className="sol-exc-card__header">
            <div>
              <h2>{loading ? "Carregando..." : `${items.length} pendentes`}</h2>
              <span className="sol-exc-subtle">Somente solicitacoes PENDENTE.</span>
            </div>
          </div>

          <div className="sol-exc-table">
            <div className="sol-exc-table__head">
              <span>Aluno</span>
              <span>Status</span>
              <span>Coordenador</span>
              <span>Acoes</span>
            </div>

            {loading ? (
              <div className="sol-exc-empty">Carregando...</div>
            ) : items.length === 0 ? (
              <div className="sol-exc-empty">Nenhuma solicitacao encontrada.</div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="sol-exc-table__row">
                  <span className="sol-exc-cell sol-exc-cell--strong">{item.nomeAluno || item.alunoId}</span>
                  <span className="sol-exc-cell">{item.status}</span>
                  <span className="sol-exc-cell">{item.emailCoordenador || item.uidCoordenador}</span>
                  <span className="sol-exc-cell sol-exc-cell--actions">
                    <button
                      type="button"
                      className="sol-exc-btn-approve"
                      disabled={pendingId === item.id}
                      onClick={() => decidir(item.id, "APROVADO")}
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      className="sol-exc-btn-reject"
                      disabled={pendingId === item.id}
                      onClick={() => decidir(item.id, "RECUSADO")}
                    >
                      Recusar
                    </button>
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default SolicitacoesExclusao;

