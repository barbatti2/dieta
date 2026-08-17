// data-service.js
// Camada de acesso a dados. Hoje lê de mock-data.js; no futuro, as mesmas
// assinaturas de função podem passar a consultar o Firestore sem que
// nenhuma tela ou componente precise mudar.

import { profiles, exercises, exercisesById, workoutTemplates, history } from "./mock-data.js";

const MS_DIA = 1000 * 60 * 60 * 24;
const NOMES_DIA = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const NOMES_DIA_LONGO = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
const NOMES_MES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function hoje() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
function toISO(d) { return d.toISOString().slice(0, 10); }
function fromISO(iso) { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); }

// ---------------------------------------------------------------------
export function getProfiles() {
  return Object.values(profiles);
}

export function getProfile(profileId) {
  return profiles[profileId];
}

export function getExercise(id) {
  return exercisesById[id];
}

export function getExercises() {
  return exercises;
}

export function getWorkouts(profileId) {
  return workoutTemplates[profileId];
}

export function getWorkout(profileId, workoutId) {
  return workoutTemplates[profileId].find(w => w.id === workoutId);
}

export function getWorkoutHistory(profileId) {
  return [...history[profileId].sessions].sort((a, b) => b.date.localeCompare(a.date));
}

export function getCardioHistory(profileId) {
  return [...history[profileId].cardio].sort((a, b) => b.date.localeCompare(a.date));
}

export function getSessionByDate(profileId, iso) {
  return history[profileId].sessions.find(s => s.date === iso);
}

export function getCardioByDate(profileId, iso) {
  return history[profileId].cardio.find(c => c.date === iso);
}

// Treino do dia: se hoje é dia programado, retorna o próximo template da
// rotação (o que viria depois da última sessão registrada). Caso hoje
// seja dia de descanso, retorna null (a tela mostra estado de descanso).
export function getTodayWorkout(profileId) {
  const profile = profiles[profileId];
  const t = hoje();
  const isTrainDay = profile.trainDays.includes(t.getDay());
  if (!isTrainDay) return null;

  const templates = workoutTemplates[profileId];
  const sessions = getWorkoutHistory(profileId); // desc
  if (sessions.length === 0) return templates[0];
  const lastTemplateId = sessions[0].workoutTemplateId;
  const lastIndex = templates.findIndex(w => w.id === lastTemplateId);
  const nextIndex = (lastIndex + 1) % templates.length;
  return templates[nextIndex];
}

// Sequência atual: conta, a partir de ontem para trás, quantos dias
// programados consecutivos tiveram sessão registrada.
export function getStreak(profileId) {
  const profile = profiles[profileId];
  const sessionDates = new Set(history[profileId].sessions.map(s => s.date));
  let count = 0;
  const cursor = hoje();
  cursor.setDate(cursor.getDate() - 1); // começa ontem; hoje ainda está em aberto
  for (let guard = 0; guard < 400; guard++) {
    if (profile.trainDays.includes(cursor.getDay())) {
      const iso = toISO(cursor);
      if (sessionDates.has(iso)) { count++; }
      else break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

// Últimos 7 dias corridos (incluindo hoje), do mais antigo ao mais recente.
export function getLast7Days(profileId) {
  const profile = profiles[profileId];
  const sessionDates = new Set(history[profileId].sessions.map(s => s.date));
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = hoje();
    d.setDate(d.getDate() - i);
    const iso = toISO(d);
    const isTrainDay = profile.trainDays.includes(d.getDay());
    days.push({
      date: iso,
      label: NOMES_DIA[d.getDay()],
      treinou: sessionDates.has(iso),
      programado: isTrainDay,
      isHoje: i === 0,
    });
  }
  return days;
}

export function getProgress(profileId, exerciseId) {
  const sessions = getWorkoutHistory(profileId).slice().reverse(); // asc por data
  const pontos = [];
  sessions.forEach(s => {
    const found = s.exercicios.find(e => e.exercicioId === exerciseId);
    if (!found || found.series.length === 0) return;
    const maxCarga = Math.max(...found.series.map(x => x.peso));
    pontos.push({ date: s.date, carga: maxCarga });
  });
  if (pontos.length === 0) {
    return { exerciseId, pontos: [], ultimaCarga: 0, maiorCarga: 0, sessoes: 0 };
  }
  const ultimaCarga = pontos[pontos.length - 1].carga;
  const maiorCarga = Math.max(...pontos.map(p => p.carga));
  return { exerciseId, pontos, ultimaCarga, maiorCarga, sessoes: pontos.length };
}

// Lista de exercícios com dados de progresso suficientes para o seletor.
export function getExercisesWithProgress(profileId) {
  const sessions = history[profileId].sessions;
  const idsUsados = new Set();
  sessions.forEach(s => s.exercicios.forEach(e => idsUsados.add(e.exercicioId)));
  return [...idsUsados].map(id => exercisesById[id]).filter(Boolean);
}

// Dados do mês para o calendário: mapa "YYYY-MM-DD" -> {treinou, cardio}
export function getCalendarMonth(profileId, year, month) {
  const sessionsByDate = new Map(history[profileId].sessions.map(s => [s.date, s]));
  const cardioByDate = new Map(history[profileId].cardio.map(c => [c.date, c]));
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const dias = [];
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    const iso = toISO(date);
    dias.push({
      date: iso,
      dia: d,
      treino: sessionsByDate.get(iso) || null,
      cardio: cardioByDate.get(iso) || null,
      isFuturo: date > hoje(),
    });
  }
  // deslocamento para semana começar na segunda-feira
  const offset = (firstDay.getDay() + 6) % 7;
  return { year, month, nomeMes: NOMES_MES[month], dias, offset };
}

export function getDayDetail(profileId, iso) {
  const session = getSessionByDate(profileId, iso);
  const cardio = getCardioByDate(profileId, iso);
  const date = fromISO(iso);
  let treinoInfo = null;
  if (session) {
    const template = workoutTemplates[profileId].find(w => w.id === session.workoutTemplateId);
    treinoInfo = { nome: template?.nome, grupo: template?.grupo, exercicios: session.exercicios.length, series: session.totalSeries };
  }
  return {
    date: iso,
    diaSemanaLongo: NOMES_DIA_LONGO[date.getDay()],
    diaMes: date.getDate(),
    mes: NOMES_MES[date.getMonth()],
    treino: treinoInfo,
    cardio: cardio ? { tipo: cardio.tipo, duracao: cardio.duracao } : null,
  };
}

export function formatMonthTitle(year, month) {
  return `${NOMES_MES[month][0].toUpperCase()}${NOMES_MES[month].slice(1)} ${year}`;
}

// -- Escrita em memória (o protótipo não persiste; troca de tela reseta) --
export function registrarCardio(profileId, tipo, duracao) {
  const iso = toISO(hoje());
  const existente = history[profileId].cardio.find(c => c.date === iso);
  if (existente) { existente.tipo = tipo; existente.duracao = duracao; }
  else { history[profileId].cardio.push({ date: iso, tipo, duracao }); }
  return { date: iso, tipo, duracao };
}

export function registrarSessao(profileId, workoutTemplateId, exercicios) {
  const iso = toISO(hoje());
  const totalSeries = exercicios.reduce((acc, e) => acc + e.series.length, 0);
  const existenteIdx = history[profileId].sessions.findIndex(s => s.date === iso);
  const sessao = { date: iso, workoutTemplateId, exercicios, totalSeries };
  if (existenteIdx >= 0) history[profileId].sessions[existenteIdx] = sessao;
  else history[profileId].sessions.push(sessao);
  return sessao;
}
