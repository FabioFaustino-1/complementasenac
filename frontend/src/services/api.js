import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

function waitForFirebaseUser() {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      resolve(null);
    }, 1200);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      clearTimeout(timeout);
      unsubscribe();
      resolve(user);
    });
  });
}

async function resolveToken(fallbackToken, forceRefresh = false) {
  const user = await waitForFirebaseUser();
  if (user) {
    return user.getIdToken(forceRefresh);
  }
  return fallbackToken;
}

export async function apiRequest(path, { token, method = "GET", body } = {}) {
  const makeRequest = async (forceRefresh = false) => {
    const headers = { "Content-Type": "application/json" };
    const activeToken = await resolveToken(token, forceRefresh);
    if (activeToken) headers.Authorization = `Bearer ${activeToken}`;

    return fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  let response;
  try {
    response = await makeRequest();
    if (response.status === 401 && auth.currentUser) {
      response = await makeRequest(true);
    }
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
