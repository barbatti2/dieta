// state.js
// Estado global mínimo + um pub/sub simples. Sem framework: quem precisa
// re-renderizar ao mudar o perfil, escuta o evento "profile-changed".

const listeners = {};

export function on(event, cb) {
  (listeners[event] ||= []).push(cb);
  return () => { listeners[event] = listeners[event].filter(f => f !== cb); };
}

function emit(event, payload) {
  (listeners[event] || []).forEach(cb => cb(payload));
}

const STORAGE_KEY = "fit-a-dois-profile";

export const state = {
  currentProfile: localStorage_get() || "voce",
  // sessão de treino em andamento (tela de Execução)
  activeSession: null,
};

function localStorage_get() {
  // Sem persistência real neste protótipo (é apenas conveniência de sessão
  // de navegação); se indisponível, cai para o padrão "voce".
  try { return sessionStorage.getItem(STORAGE_KEY); } catch { return null; }
}

export function setProfile(profileId) {
  if (state.currentProfile === profileId) return;
  state.currentProfile = profileId;
  try { sessionStorage.setItem(STORAGE_KEY, profileId); } catch {}
  emit("profile-changed", profileId);
}

export function getCurrentProfile() {
  return state.currentProfile;
}

// ----- sessão de treino ativa (execução) -----
export function startWorkoutSession(workout) {
  state.activeSession = {
    workoutId: workout.id,
    workoutNome: workout.nome,
    workoutGrupo: workout.grupo,
    exercicioIndex: 0,
    exercicios: workout.exercicios.map(ex => ({
      exercicioId: ex.exercicioId,
      repsAlvo: ex.repsAlvo,
      metaSeries: ex.series,
      pesoAtual: ex.cargaBase,
      repsAtual: ex.repsAlvo,
      seriesConcluidas: [],
    })),
  };
  emit("session-started", state.activeSession);
  return state.activeSession;
}

export function getActiveSession() {
  return state.activeSession;
}

export function clearActiveSession() {
  state.activeSession = null;
  emit("session-cleared");
}

export function emitEvent(name, payload) { emit(name, payload); }
