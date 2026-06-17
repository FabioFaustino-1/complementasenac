import { apiRequest } from "./api";

export function obterPendentes(token) {
  return apiRequest("/api/coordenador/atividades", { token });
}

export function obterResumoCoordenador(token) {
  return apiRequest("/api/coordenador/resumo", { token });
}

export function obterPerfilCoordenador(token) {
  return apiRequest("/api/coordenador/perfil", { token });
}

export function obterAlunosCoordenador(token) {
  return apiRequest("/api/coordenador/alunos", { token });
}

export function decidirAtividadeCoordenador(token, id, status, extras = {}) {
  return apiRequest(`/api/coordenador/atividades/${id}/decisao`, {
    token,
    method: "POST",
    body: { status, ...extras },
  });
}
