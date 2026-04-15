import React from "react";
import "./ListaAlunosCoordenador.css";

const ListaAlunosCoordenador = () => {
  const alunos = [
    { id: 1, nome: "GABRIEL FELICIANO", curso: "Analise e Desenv. de Sistemas", matricula: "2024.1.00512", status: "Ativo" },
    { id: 2, nome: "RHUAN PIETRO", curso: "Analise e Desenv. de Sistemas", matricula: "2023.2.00890", status: "Ativo" },
    { id: 3, nome: "FABIO FAUSTAO", curso: "Analise e Desenv. de Sistemas", matricula: "2024.1.00042", status: "Ativo" },
    { id: 4, nome: "ANGELO MASCARENHAS", curso: "Analise e Desenv. de Sistemas", matricula: "2024.1.00977", status: "Pendente" },
  ];

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
                    <span className={`status-badge ${aluno.status.toLowerCase()}`}>{aluno.status}</span>
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
