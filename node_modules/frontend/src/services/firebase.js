import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB4oWuOGDjJmsBXdy9WGWEB_Q_vapH0h4I",
  authDomain: "pi-3-286ed.firebaseapp.com",
  projectId: "pi-3-286ed",
  storageBucket: "pi-3-286ed.firebasestorage.app",
  messagingSenderId: "808575862472",
  appId: "1:808575862472:web:0159933b1aaad7069e07fd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export{ auth }

export default app;