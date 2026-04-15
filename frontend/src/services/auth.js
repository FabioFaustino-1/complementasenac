import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import app from "./firebase";

const auth = getAuth(app);
const API_BASE = "http://localhost:8080";

export function cadastrarUsuario(email, senha) {
  return createUserWithEmailAndPassword(auth, email, senha);
}

export async function autenticarUsuario(email, senha) {
  const credential = await signInWithEmailAndPassword(auth, email, senha);
  const token = await credential.user.getIdToken();

  const response = await fetch(`${API_BASE}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel validar o usuario no backend.");
  }

  const perfil = await response.json();
  return { credential, token, perfil };
}