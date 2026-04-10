import { useState } from "react";
import './Coordenador.css';

const ActivityCard = ({ title, student, hours, date, confidence, type }) => {
  const isDivergent = confidence < 50;
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '8px',
      boxShadow: '0 1px 2px hsl(0, 0%, 100%)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: '1px solid #E2E8F0',
      width: '100%'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ margin: 0, color: '#003366', fontSize: '13px', fontWeight: 'bold' }}>{title}</h3>
          {isDivergent && (
            <span style={{ backgroundColor: '#FFEBEB', color: '#FF4D4D', padding: '1px 5px', borderRadius: '3px', fontSize: '8px', fontWeight: 'bold' }}>
              DIVERGÊNCIA IA
            </span>
          )}
        </div>
        <p style={{ margin: '2px 0', color: '#64748B', fontSize: '10px' }}>
          {student} • ADS • {type} • {date}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
          <span style={{ fontWeight: 'bold', color: '#1E293B', fontSize: '13px' }}>{hours}h</span>
          <span style={{ 
            backgroundColor: isDivergent ? '#FFF4E5' : '#E6F7F0', 
            color: isDivergent ? '#FF9900' : '#10B981', 
            padding: '2px 8px', borderRadius: '12px', fontSize: '9px', fontWeight: '600'
          }}>
            IA: {confidence}% confiança
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button style={{ padding: '6px 14px', border: '1px solid #FF4D4D', borderRadius: '5px', backgroundColor: 'transparent', color: '#FF4D4D', cursor: 'pointer', fontWeight: '600', fontSize: '11px' }}>✕ Indeferir</button>
        <button style={{ padding: '6px 14px', border: 'none', borderRadius: '5px', backgroundColor: '#004587', color: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '11px' }}>✓ Aprovar</button>
      </div>
    </div>
  );
};

const Coordenador = () => {
  const [activeTab, setActiveTab] = useState("queue");

  return (
    /* CORREÇÃO: Envolvendo tudo na div container-coord */
    <div className="container-coord">
      <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
        {/* Header Compacto */}
        <header style={{ 
          padding: '0 5%', height: '55px', display: 'flex', justifyContent: 'space-between', 
          alignItems: 'center', borderBottom: '1px solid #F1F5F9', flexShrink: 0 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '25px', height: '25px', backgroundColor: '#004587', borderRadius: '5px' }}></div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#003366', fontSize: '15px' }}>Senac</div>
                <div style={{ fontSize: '8px', color: '#94A3B8', marginTop: '-3px' }}>Complementares</div>
              </div>
            </div>
            <nav style={{ display: 'flex', gap: '5px' }}>
              {["queue", "history"].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)} 
                  style={{ 
                    padding: '6px 15px', borderRadius: '15px', border: 'none', 
                    backgroundColor: activeTab === tab ? '#004587' : 'transparent', 
                    color: activeTab === tab ? 'white' : '#64748B', 
                    cursor: 'pointer', fontWeight: '600', fontSize: '11px'
                  }}>
                  {tab === "queue" ? "Fila de Validação" : "Histórico"}
                </button>
              ))}
            </nav>
          </div>
          <div style={{ backgroundColor: '#F1F5F9', padding: '5px 12px', borderRadius: '15px', color: '#475569', fontSize: '11px', fontWeight: '600' }}>
            👤 Coordenador
          </div>
        </header>

        {/* Área de Conteúdo */}
        <main style={{ padding: '20px 5%', flexGrow: 1, overflow: 'hidden' }}>
          <h1 style={{ color: '#003366', fontSize: '24px', fontWeight: '800', marginBottom: '2px' }}>Fila de Validação</h1>
          <p style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '20px' }}>4 atividades aguardando análise.</p>

          <div style={{ width: '100%', maxWidth: '1100px' }}>
            <ActivityCard title="Workshop de React Avançado" student="Maria Silva" hours="8" date="12/03/2026" confidence={95} type="Workshop" />
            <ActivityCard title="Palestra sobre IA Generativa" student="João Santos" hours="4" date="08/03/2026" confidence={88} type="Palestra" />
            <ActivityCard title="Curso de Excel Avançado" student="Ana Costa" hours="20" date="01/03/2026" confidence={42} type="Curso Online" />
            <ActivityCard title="Hackathon Senac 2026" student="Pedro Lima" hours="12" date="28/02/2026" confidence={91} type="Congresso" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Coordenador;