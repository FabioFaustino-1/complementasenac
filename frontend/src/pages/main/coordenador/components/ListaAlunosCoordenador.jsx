import React, { useEffect, useState } from "react";
import "./ListaAlunosCoordenador.css";
import { useAuth } from "../../../../assets/contexts/AuthContext";
import { obterAlunosCoordenador } from "../../../../services/coordenador";

const ListaAlunosCoordenador = () => {
  const { token } = useAuth();
  const [alunos, setAlunos] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await obterAlunosCoordenador(token);
        setAlunos(data);
      } catch (error) {
        alert(`Erro ao carregar lista de alunos: ${error.message}`);
      }
    };
    load();
  }, [token]);

  return (
    <div className="rep-main-viewport">
      <div className="students-container">
        <header className="students-header">
          <h2>Lista de Alunos</h2>
          <p>Gerenciamento de usuarios e matriculas da instituicao</p>
        </header>

        <div className="students-card">
          <table className="students-table">
            <thead>
              <tr>
                <th>NOME COMPLETO</th>
                <th>CURSO</th>
                <th>MATRICULA</th>
                <th className="text-center">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => (
                <tr key={aluno.id}>
                  <td className="student-name">{aluno.nome}</td>
                  <td>{aluno.curso}</td>
                  <td className="text-mono">{aluno.matricula}</td>
                  <td className="text-center">
                    <span className="status-badge ativo">Ativo</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListaAlunosCoordenador;
