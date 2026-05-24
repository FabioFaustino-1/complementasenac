import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import app from "./firebase";
import { API_BASE, apiUrl } from "./api";

const auth = getAuth(app);

export function cadastrarUsuario(email, senha) {
  return createUserWithEmailAndPassword(auth, email, senha);
}

export async function autenticarUsuario(email, senha) {
  const credential = await signInWithEmailAndPassword(auth, email, senha);
  const token = await credential.user.getIdToken();

  let response;
  try {
    response = await fetch(apiUrl("/api/auth/me"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
