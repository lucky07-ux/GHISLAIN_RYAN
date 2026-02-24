import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ⬇️ TU REMPLACERAS CES VALEURS
const firebaseConfig = {
 apiKey: "AIzaSyCMYvLNciDn2RLDr5N5hHS55MOBGiDKV00",
  authDomain: "lunch-up-682fe.firebaseapp.com",
  projectId: "lunch-up-682fe",
  storageBucket: "lunch-up-682fe.firebasestorage.app",
  messagingSenderId: "377253542323",
  appId: "1:377253542323:web:aaefa9025215d7ef5133c6",
  measurementId: "G-GE36GL1WMN"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
