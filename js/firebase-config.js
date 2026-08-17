// ⚠️ Preencha com as credenciais do SEU projeto Firebase.
// Console: https://console.firebase.google.com  →  Configurações do projeto → Seus apps → SDK setup.
// Essas chaves não são "secretas" (ficam públicas em qualquer app web), a segurança real
// vem das Regras do Firestore — veja o README.md para o texto das regras recomendadas.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: "COLE_AQUI_SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxx"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Autenticação anônima: garante que só quem abre o app (com as regras do Firestore
// exigindo request.auth != null) consiga ler/gravar os dados. Não pede login nem senha.
export function garantirLogin() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
      } else {
        signInAnonymously(auth).then((cred) => resolve(cred.user)).catch(reject);
      }
    });
  });
}
