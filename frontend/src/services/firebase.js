import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY || "AIzaSyB4oWuOGDjJmsBXdy9WGWEB_Q_vapH0h4I",
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN || "pi-3-286ed.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID || "pi-3-286ed",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET || "pi-3-286ed.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID || "808575862472",
  appId: import.meta.env.VITE_FIREBASE_APPID || "1:808575862472:web:0159933b1aaad7069e07fd",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
export default app;
