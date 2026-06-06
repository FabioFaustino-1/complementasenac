import React, { useEffect, useState } from "react";
import "./ListaAlunosCoordenador.css";
import { useAuth } from "../../../../assets/contexts/AuthContext";
import { obterAlunosCoordenador, solicitarExclusaoAluno } from "../../../../services/coordenador";
import { formatCourseName } from "../../../../utils/userDisplay";

const ListaAlunosCoordenador = () => {
  const { token } = useAuth();
  const [alunos, setAlunos] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [modalExclusao, setModalExclusao] = useState(null);


  useEffect(() => {
    const load = async () => {
      try {
        const data = await obterAlunosCoordenador(token);
        setAlunos(data);

        const mapa = {};
        data.forEach((a) => {
          mapa[a.id] = "Ativo";
        });
        setStatusMap(mapa);
      } catch (error) {
        alert(`Erro ao carregar lista de alunos: ${error.message}`);
      }
    };
    load();
  }, [token]);

  const toggleStatus = (id) => {
    setStatusMap((prev) => ({
      ...prev,
      [id]: prev[id] === "Inativo" ? "Ativo" : "Inativo",
    }));
  };

  const confirmarSolicitacaoExclusao = async () => {
    if (!modalExclusao) return;
    try {
      await solicitarExclusaoAluno(token, modalExclusao.id, modalExclusao.nome);
      alert(`Solicitação de exclusão enviada para o administrador.`);
      setModalExclusao(null);
    } catch (err) {
      alert(`Erro ao enviar solicitação: ${err.message}`);
    }
  };

  return (
    <div className="rep-main-viewport">
      <div className="students-container">
        <div className="students-card">
          <table className="students-table">
            <thead>
              <tr>
                <th>NOME COMPLETO</th>
                <th>CURSO</th>
                <th>MATRICULA</th>
                <th className="text-center">STATUS</th>
                <th className="text-center">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => {
                const statusAtual = statusMap[aluno.id] || "Ativo";

                return (
                  <tr key={aluno.id}>
                    <td className="student-name">{aluno.nome}</td>
                    <td>{formatCourseName(aluno.curso, "Curso nao informado")}</td>
                    <td className="text-mono">{aluno.matricula}</td>
                    <td className="text-center">
                      <span
                        className={`status-badge ${statusAtual.toLowerCase()}`}
                      >
                        {statusAtual}
                      </span>
                    </td>
                    <td className="text-center acoes-cell">
                      <button
                        className={`btn-toggle-status ${statusAtual === "Inativo" ? "btn-ativar" : "btn-inativar"}`}
                        title={statusAtual === "Inativo" ? "Reativar aluno" : "Inativar aluno"}
                        onClick={() => toggleStatus(aluno.id)}
                        type="button"
                      >
                        {statusAtual === "Inativo" ? "Ativar" : "Inativar"}
                      </button>
                      <button
                        className="btn-solicitar-exclusao"
                        title="Solicitar exclusão ao Administrador"
                        onClick={() => setModalExclusao({ id: aluno.id, nome: aluno.nome })}
                        type="button"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalExclusao && (
        <div className="modal-overlay-exclusao">
          <div className="modal-exclusao">
            <h3>Solicitar exclusão</h3>
            <p>
              Deseja enviar uma solicitação ao Administrador para excluir o aluno{" "}
              <strong>{modalExclusao.nome}</strong>?
            </p>
            <p className="modal-aviso">
              Esta ação não exclui o aluno imediatamente. O Administrador precisará aprovar a solicitação.
            </p>
            <div className="modal-exclusao-actions">
              <button className="btn-confirmar-solicitacao" onClick={confirmarSolicitacaoExclusao} type="button">
                Enviar solicitação
              </button>
              <button className="btn-cancelar-modal" onClick={() => setModalExclusao(null)} type="button">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaAlunosCoordenador;
