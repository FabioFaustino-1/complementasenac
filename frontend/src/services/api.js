const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export async function apiRequest(path, { token, method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15000);

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Tempo esgotado ao carregar dados do backend.");
    }
    if (error instanceof TypeError) {
      throw new Error(
        `Nao foi possivel conectar ao backend em ${API_BASE}. Verifique se a API esta em execucao.`
      );
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
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
