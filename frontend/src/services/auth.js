import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import app from "./firebase";
import { API_BASE } from "./api";

const auth = getAuth(app);

export function cadastrarUsuario(email, senha) {
  return createUserWithEmailAndPassword(auth, email, senha);
}

export async function autenticarUsuario(email, senha, perfilSelecionado) {
  const credential = await signInWithEmailAndPassword(auth, email, senha);
  const token = await credential.user.getIdToken();
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15000);

  let response;
  try {
    response = await fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Perfil-Selecionado": perfilSelecionado || "",
      },
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      await signOut(auth);
      throw new Error("Tempo esgotado ao validar o usuario no backend.");
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
    let message = "Nao foi possivel validar o usuario no backend.";
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {
      // no-op
    }
    await signOut(auth);
    throw new Error(message);
  }

  const perfil = await response.json();
  return { credential, token, perfil };
}
