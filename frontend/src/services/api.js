const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:8080").replace(/\/+$/, "");

export function apiUrl(path) {
  return `${API_BASE}/${String(path).replace(/^\/+/, "")}`;
}

export async function apiRequest(path, { token, method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(apiUrl(path), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Nao foi possivel conectar ao backend em ${API_BASE}. Verifique se a API esta em execucao.`
      );
    }
    throw error;
  }

  if (!response.ok) {
    let message = "Erro na requisicao";
    try {
      const data = await response.json();
      message = data.message || data.error || message;
    } catch {
      // no-op
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export { API_BASE };
