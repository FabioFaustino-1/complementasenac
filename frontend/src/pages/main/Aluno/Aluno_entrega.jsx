
import React from 'react';
import './Aluno_entrega.css';
import logoSenac from './assets/logo_senac.png'; // Importando a imagem da sua pasta assets

export default function AlunoEntrega() {
  return (
    <div className="entrega-container">
      {/* ... restante do código acima ... */}
<header className="entrega-header">
  <div className="logo-group">
    
    {/* Contêiner da Logo com Borda */}
    <div className="logo-container">
      <img src={logoSenac} alt="Senac Logo" className="logo-img" />
    </div>
    
    {/* Contêiner dos Textos ao lado da logo */}
    <div className="logo-text-wrapper">
      <span className="senac-text">Senac</span>
      <span className="complementares-text">Complementares</span>
    </div>

  </div>
  
  <nav className="header-nav">
    <button className="nav-link">Minhas Horas</button>
    <button className="nav-link active">Nova Submissão</button>
    <button className="nav-link">Histórico</button>
  </nav>
  
  <div className="user-badge">
    <span>Aluno</span>
  </div>
</header>
{/* ... restante do código abaixo ... */}

      <main className="entrega-main">
        <section className="intro-text">
          <h1>Nova Submissão</h1>
          <p>Preencha os dados da atividade e anexe o comprovante.</p>
        </section>

        <div className="form-wrapper">
          <div className="upload-section">
            <label className="field-label">Comprovante</label>
            <div className="drop-area">
              <input type="file" id="file-input" hidden />
              <label htmlFor="file-input" className="drop-label">
                <strong>Arraste o arquivo aqui</strong>
                <span>PDF ou imagem (máx. 10MB)</span>
              </label>
            </div>
          </div>

          <div className="fields-section">
            <div className="input-block">
              <label className="field-label">Nome da Atividade</label>
              <input type="text" className="full-input" />
            </div>

            <div className="input-block">
              <label className="field-label">Tipo de Atividade</label>
              <input type="text" className="full-input" />
            </div>

            <div className="row-inputs">
              <div className="input-block">
                <label className="field-label">Horas</label>
                <input type="text" className="short-input" />
              </div>
              <div className="input-block">
                <label className="field-label">Data do Evento</label>
                <input type="text" className="short-input" />
              </div>
            </div>

            <button className="submit-button">Enviar para Validação</button>
            
          </div>
        </div>
      </main>
    </div>
  );
}
// REMOVIDO: export default AlunoEntrega; (Já está no topo)
