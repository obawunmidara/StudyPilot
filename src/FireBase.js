import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAnjX1qfT2J_eeW2C-lxOPhK_Pve6triCU",
  authDomain: "studypilot-ef539.firebaseapp.com",
  projectId: "studypilot-ef539",
  storageBucket: "studypilot-ef539.firebasestorage.app",
  messagingSenderId: "326645276577",
  appId: "1:326645276577:web:86b24010a2246c12ec75e0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();