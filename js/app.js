import { hasValidSession, wireLogin } from './auth.js';
import { autoConnectFirestore, firebaseConfigProvided } from './firebase-config.js';
import { loadProfile, store } from './state.js';
import { render, setupDateStripDrag, setupProfileSlider } from './ui-core.js';
import { icons, showToast } from './utils.js';

/* Ponto de entrada: liga a navegação por abas e inicia o app após o login. */
document.getElementById('tabNav').addEventListener('click', (e)=>{
  const btn = e.target.closest('.tab-btn');
  if(!btn) return;
  store.currentTab = btn.dataset.tab;
  render();
});

/* ============================================================
   APP START (runs after successful login)
   ============================================================ */
export async function startApp(){
  document.getElementById('loadingScreen').style.display = 'flex';
  await autoConnectFirestore();
  await loadProfile('gabriel');
  document.getElementById('loadingScreen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  setupProfileSlider();
  setupDateStripDrag();
  icons();
  // DIAGNÓSTICO TEMPORÁRIO — remover depois de descobrir o problema de sincronização.
  const d = window.__debugDocData;
  const diag = d
    ? 'Chaves: ' + Object.keys(d).join(', ') +
      '\nmeals: ' + (Array.isArray(d.meals) ? d.meals.length + ' itens' : typeof d.meals) +
      '\nweight.history: ' + (d.weight && Array.isArray(d.weight.history) ? d.weight.history.length + ' itens' : typeof d.weight) +
      '\ngoals: ' + JSON.stringify(d.goals) +
      '\n1o item de meals: ' + (Array.isArray(d.meals) && d.meals[0] ? JSON.stringify(d.meals[0]).slice(0,200) : '(nenhum)')
    : '(sem dados carregados)';
  alert('DIAGNÓSTICO\nFirestore conectado: ' + window.__firestoreReady + '\nStatus do documento: ' + (window.__debugDocStatus || 'não chegou a verificar') + '\n\n' + diag);
  if(firebaseConfigProvided() && !window.__firestoreReady){
    showToast('Não conectou ao Firestore — os dados ficam salvos só nesta sessão. Veja o console (F12) para o motivo.');
  }
}

wireLogin();
icons();
if(hasValidSession()){
  document.getElementById('loginScreen').style.display = 'none';
  startApp();
}
