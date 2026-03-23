import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import app from "./firebase";

const auth = getAuth(app);

export function cadastrarUsuario(email, senha) {
  return createUserWithEmailAndPassword(auth, email, senha);
}