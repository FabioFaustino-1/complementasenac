import { apiRequest } from "./api";

export function listarAlunosAdmin(token) {
  return apiRequest("/api/admin/alunos", { token });
}

export function criarAlunoAdmin(token, payload) {
  return apiRequest("/api/admin/alunos", { token, method: "POST", body: payload });
}

export function listarCoordenadoresAdmin(token) {
  return apiRequest("/api/admin/coordenadores", { token });
}

export function criarCoordenadorAdmin(token, payload) {
  return apiRequest("/api/admin/coordenadores", { token, method: "POST", body: payload });
}

export function atualizarCoordenadorAdmin(token, id, payload) {
  return apiRequest(`/api/admin/coordenadores/${id}`, { token, method: "PUT", body: payload });
}

export function removerCoordenadorAdmin(token, id) {
  return apiRequest(`/api/admin/coordenadores/${id}`, { token, method: "DELETE" });
}

export function listarCursosAdmin(token) {
  return apiRequest("/api/admin/cursos", { token });
}

export function criarCursoAdmin(token, payload) {
  return apiRequest("/api/admin/cursos", { token, method: "POST", body: payload });
}
