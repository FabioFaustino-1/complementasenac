const API_BASE = "http://localhost:8080";

export async function apiRequest(path, { token, method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

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
