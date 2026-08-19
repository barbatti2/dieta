// Configuração do Firebase / Firestore do projeto "treinos-b6a37"
// Este arquivo só inicializa a conexão — a leitura/escrita dos dados
// (perfis e fichas de treino) acontece no app.js.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDsqKoYh6fjvhA2P6J7JsFTPqAr_WRP238",
  authDomain: "treinos-b6a37.firebaseapp.com",
  projectId: "treinos-b6a37",
  storageBucket: "treinos-b6a37.firebasestorage.app",
  messagingSenderId: "234553622606",
  appId: "1:234553622606:web:50712a37a45c5e53b9031f",
  measurementId: "G-KT62TYC65J"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
