import { apiRequest } from "./api";

export function formatDateBrFromInput(isoDate) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

/** Converte status do backend para label e classe CSS (minúscula) */
export function uiStatus(status) {
  const s = (status || "").toUpperCase();
  if (s === "APROVADO") return { label: "Aprovado", pillClass: "aprovado", badgeClass: "aprovado" };
  if (s === "PENDENTE") return { label: "Pendente", pillClass: "pendente", badgeClass: "pendente" };
  if (s === "INDEFERIDO") return { label: "Indeferida", pillClass: "indeferido", badgeClass: "indeferida" };
  return { label: status || "—", pillClass: "pendente", badgeClass: "pendente" };
}

export function fetchPerfilAluno(token) {
  return apiRequest("/api/aluno/perfil", { token });
}

export function fetchResumoAluno(token) {
  return apiRequest("/api/aluno/resumo", { token });
}

export function fetchAtividadesRecentes(token) {
  return apiRequest("/api/aluno/atividades/recentes", { token });
}

export function fetchHistoricoAtividades(token) {
  return apiRequest("/api/aluno/atividades", { token });
}

export function submeterNovaAtividade(token, payload) {
  return apiRequest("/api/aluno/atividades", {
    token,
    method: "POST",
    body: payload,
  });
}
