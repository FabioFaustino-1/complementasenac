import React, { useEffect, useState } from "react";
import { Edit2, Save, X } from "lucide-react";
import "./PerfilCoordenador.css";
import { useAuth } from "../../../../assets/contexts/AuthContext";
import { obterPerfilCoordenador } from "../../../../services/coordenador";

const PerfilCoordenador = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState({
    nome: "Fabio Faustino",
    email: "fabio.faustino@senac.pe.br",
    cpf: "000.000.000-00",
    telefone: "(81) 99999-9999",
    ingresso: "15 de Marco de 2024",
    matricula: "2024.1.00042",
    departamento: "Tecnologia da Informacao (ADS)",
  });

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const perfil = await obterPerfilCoordenador(token);
        setUserData({
          nome: perfil.nome || "",
          email: perfil.email || "",
          cpf: perfil.cpf || "",
          telefone: perfil.telefone || "",
          ingresso: perfil.ingresso || "",
          matricula: perfil.matricula || "",
          departamento: perfil.departamento || "",
        });
      } catch (error) {
        setError(error.message || "Erro ao carregar perfil do coordenador.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="rep-main-viewport">
      <div className="rep-content-wrapper">
        <div className="profile-layout-horizontal">
          <aside className="profile-sidebar-left-refined">
            <div className="profile-avatar-xl-refined">FF</div>
            <div className="profile-sidebar-meta">
              <h2>{loading ? "Carregando..." : userData.nome || "Coordenador"}</h2>
              <p>{loading ? "..." : userData.email || "Sem e-mail cadastrado"}</p>
              <span className="role-tag-premium">COORDENADOR</span>
            </div>
          </aside>

          <main className="profile-info-card-refined">
            <div className="profile-card-header">
              <h3>INFORMACOES PESSOAIS</h3>
              {!isEditing ? (
                <button className="btn-edit-refined" onClick={() => setIsEditing(true)}>
                  <Edit2 size={13} /> Editar
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="btn-save-refined" onClick={() => setIsEditing(false)}>
                    <Save size={13} /> Salvar
                  </button>
                  <button className="btn-cancel-refined" onClick={() => setIsEditing(false)}>
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
            {error ? <p style={{ color: "#b24d61", margin: "0 0 12px" }}>{error}</p> : null}

            <div className="profile-details-grid-refined">
              {[
                { label: "Nome Completo", name: "nome" },
                { label: "E-mail Institucional", name: "email" },
                { label: "CPF", name: "cpf" },
                { label: "Telefone", name: "telefone" },
                { label: "Data de Ingresso", name: "ingresso" },
                { label: "Matricula / Registro", name: "matricula" },
              ].map((field) => (
                <div className="detail-field" key={field.name}>
                  <label>{field.label}</label>
                  {isEditing ? (
                    <input className="edit-input-field" name={field.name} value={userData[field.name]} onChange={handleChange} />
                  ) : (
                    <div className="value-box-refined">{userData[field.name]}</div>
                  )}
                </div>
              ))}

              <div className="detail-field full-row">
                <label>Departamento</label>
                {isEditing ? (
                  <input className="edit-input-field" name="departamento" value={userData.departamento} onChange={handleChange} />
                ) : (
                  <div className="value-box-refined">{userData.departamento}</div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PerfilCoordenador;
