// mock-data.js
// Fonte única de dados mockados. Nada de lógica de agregação aqui além da
// geração determinística do histórico de sessões — quem interpreta os
// dados para as telas é o data-service.js.
// Quando o backend real (Firestore) existir, este arquivo é o único que
// precisa ser substituído; data-service.js mantém a mesma assinatura.

// ---------------------------------------------------------------------
// Catálogo de exercícios (inspirado em free-exercise-db / exercicios-bd-ptbr)
// ---------------------------------------------------------------------
export const exercises = [
  { id: "supino-reto", nome: "Supino reto", grupoPrincipal: "Peito", gruposSecundarios: ["Tríceps", "Ombros"], equipamento: "Barra", instrucoes: "Deite no banco, desça a barra até o peito controlando o movimento e empurre até a extensão dos cotovelos.", muscles: { primary: ["chest"], secondary: ["triceps", "front-deltoids"] } },
  { id: "supino-inclinado-halteres", nome: "Supino inclinado com halteres", grupoPrincipal: "Peito", gruposSecundarios: ["Ombros", "Tríceps"], equipamento: "Halteres", instrucoes: "Banco a 30-45°, desça os halteres ao lado do peito e empurre para cima sem travar o cotovelo.", muscles: { primary: ["chest"], secondary: ["front-deltoids", "triceps"] } },
  { id: "crucifixo", nome: "Crucifixo", grupoPrincipal: "Peito", gruposSecundarios: [], equipamento: "Halteres", instrucoes: "Braços levemente flexionados, abra e feche como um abraço controlando a descida.", muscles: { primary: ["chest"], secondary: [] } },
  { id: "crossover", nome: "Crossover no cabo", grupoPrincipal: "Peito", gruposSecundarios: ["Ombros"], equipamento: "Cabo", instrucoes: "Puxe os cabos à frente do corpo em movimento de arco, contraindo o peito no final.", muscles: { primary: ["chest"], secondary: ["front-deltoids"] } },
  { id: "flexao", nome: "Flexão de braço", grupoPrincipal: "Peito", gruposSecundarios: ["Tríceps", "Core"], equipamento: "Peso do corpo", instrucoes: "Corpo alinhado, desça até quase tocar o chão e empurre de volta.", muscles: { primary: ["chest"], secondary: ["triceps", "abs"] } },
  { id: "triceps-corda", nome: "Tríceps corda", grupoPrincipal: "Tríceps", gruposSecundarios: [], equipamento: "Cabo", instrucoes: "Cotovelos fixos ao lado do corpo, estenda a corda para baixo e separe no final.", muscles: { primary: ["triceps"], secondary: [] } },
  { id: "triceps-testa", nome: "Tríceps testa", grupoPrincipal: "Tríceps", gruposSecundarios: [], equipamento: "Barra W", instrucoes: "Deitado, desça a barra em direção à testa flexionando só o cotovelo.", muscles: { primary: ["triceps"], secondary: [] } },
  { id: "triceps-frances", nome: "Tríceps francês", grupoPrincipal: "Tríceps", gruposSecundarios: ["Ombros"], equipamento: "Halter", instrucoes: "Halter atrás da cabeça, estenda o cotovelo mantendo o braço próximo à orelha.", muscles: { primary: ["triceps"], secondary: ["back-deltoids"] } },
  { id: "remada-baixa", nome: "Remada baixa", grupoPrincipal: "Costas", gruposSecundarios: ["Bíceps"], equipamento: "Cabo", instrucoes: "Tronco ereto, puxe o cabo em direção ao abdômen apertando as escápulas.", muscles: { primary: ["upper-back"], secondary: ["biceps"] } },
  { id: "puxada-frente", nome: "Puxada frente", grupoPrincipal: "Costas", gruposSecundarios: ["Bíceps"], equipamento: "Polia", instrucoes: "Puxe a barra até a altura do queixo levando os cotovelos para baixo.", muscles: { primary: ["upper-back"], secondary: ["biceps"] } },
  { id: "remada-curvada", nome: "Remada curvada", grupoPrincipal: "Costas", gruposSecundarios: ["Bíceps", "Trapézio"], equipamento: "Barra", instrucoes: "Tronco a 45°, puxe a barra em direção ao umbigo.", muscles: { primary: ["upper-back"], secondary: ["biceps", "trapezius"] } },
  { id: "pulldown", nome: "Pull-down unilateral", grupoPrincipal: "Costas", gruposSecundarios: ["Bíceps"], equipamento: "Cabo", instrucoes: "Puxe o cabo unilateralmente mantendo o tronco estável.", muscles: { primary: ["upper-back"], secondary: ["biceps"] } },
  { id: "levantamento-terra", nome: "Levantamento terra", grupoPrincipal: "Costas", gruposSecundarios: ["Posterior de coxa", "Glúteos"], equipamento: "Barra", instrucoes: "Costas retas, empurre o chão com os pés levantando a barra rente ao corpo.", muscles: { primary: ["lower-back"], secondary: ["hamstring", "gluteal"] } },
  { id: "rosca-direta", nome: "Rosca direta", grupoPrincipal: "Bíceps", gruposSecundarios: [], equipamento: "Barra", instrucoes: "Cotovelos fixos, flexione a barra até a altura do ombro.", muscles: { primary: ["biceps"], secondary: [] } },
  { id: "rosca-alternada", nome: "Rosca alternada", grupoPrincipal: "Bíceps", gruposSecundarios: ["Antebraço"], equipamento: "Halteres", instrucoes: "Alterne os braços girando o punho ao final do movimento.", muscles: { primary: ["biceps"], secondary: ["forearm"] } },
  { id: "rosca-martelo", nome: "Rosca martelo", grupoPrincipal: "Bíceps", gruposSecundarios: ["Antebraço"], equipamento: "Halteres", instrucoes: "Pegada neutra, flexione mantendo o punho fixo.", muscles: { primary: ["biceps"], secondary: ["forearm"] } },
  { id: "desenvolvimento-ombro", nome: "Desenvolvimento de ombro", grupoPrincipal: "Ombros", gruposSecundarios: ["Tríceps"], equipamento: "Halteres", instrucoes: "Empurre os halteres para cima até quase estender o cotovelo.", muscles: { primary: ["front-deltoids"], secondary: ["triceps"] } },
  { id: "elevacao-lateral", nome: "Elevação lateral", grupoPrincipal: "Ombros", gruposSecundarios: [], equipamento: "Halteres", instrucoes: "Eleve os braços até a linha dos ombros com leve flexão no cotovelo.", muscles: { primary: ["front-deltoids"], secondary: [] } },
  { id: "elevacao-frontal", nome: "Elevação frontal", grupoPrincipal: "Ombros", gruposSecundarios: [], equipamento: "Halteres", instrucoes: "Eleve os halteres à frente até a altura dos ombros.", muscles: { primary: ["front-deltoids"], secondary: [] } },
  { id: "remada-alta", nome: "Remada alta", grupoPrincipal: "Ombros", gruposSecundarios: ["Trapézio"], equipamento: "Barra", instrucoes: "Puxe a barra rente ao corpo até a altura do peito, cotovelos acima dos punhos.", muscles: { primary: ["front-deltoids"], secondary: ["trapezius"] } },
  { id: "agachamento-livre", nome: "Agachamento livre", grupoPrincipal: "Pernas", gruposSecundarios: ["Glúteos", "Core"], equipamento: "Barra", instrucoes: "Desça controlando o quadril para trás até coxas paralelas ao chão.", muscles: { primary: ["quadriceps"], secondary: ["gluteal", "abs"] } },
  { id: "leg-press", nome: "Leg press", grupoPrincipal: "Pernas", gruposSecundarios: ["Glúteos"], equipamento: "Máquina", instrucoes: "Empurre a plataforma sem travar os joelhos no topo.", muscles: { primary: ["quadriceps"], secondary: ["gluteal"] } },
  { id: "cadeira-extensora", nome: "Cadeira extensora", grupoPrincipal: "Pernas", gruposSecundarios: [], equipamento: "Máquina", instrucoes: "Estenda os joelhos controlando a descida.", muscles: { primary: ["quadriceps"], secondary: [] } },
  { id: "cadeira-flexora", nome: "Cadeira flexora", grupoPrincipal: "Pernas", gruposSecundarios: [], equipamento: "Máquina", instrucoes: "Flexione os joelhos trazendo o calcanhar em direção ao glúteo.", muscles: { primary: ["hamstring"], secondary: [] } },
  { id: "stiff", nome: "Stiff", grupoPrincipal: "Pernas", gruposSecundarios: ["Glúteos"], equipamento: "Barra", instrucoes: "Pernas quase retas, desça a barra rente às pernas sentindo o alongamento posterior.", muscles: { primary: ["hamstring"], secondary: ["gluteal"] } },
  { id: "avanco", nome: "Avanço", grupoPrincipal: "Pernas", gruposSecundarios: ["Glúteos"], equipamento: "Halteres", instrucoes: "Passo à frente descendo o joelho de trás quase ao chão.", muscles: { primary: ["quadriceps"], secondary: ["gluteal"] } },
  { id: "elevacao-pelvica", nome: "Elevação pélvica", grupoPrincipal: "Pernas", gruposSecundarios: ["Core"], equipamento: "Barra", instrucoes: "Apoie as costas no banco e eleve o quadril contraindo o glúteo no topo.", muscles: { primary: ["gluteal"], secondary: ["abs"] } },
  { id: "panturrilha-em-pe", nome: "Panturrilha em pé", grupoPrincipal: "Pernas", gruposSecundarios: [], equipamento: "Máquina", instrucoes: "Suba na ponta dos pés e desça controlando o alongamento.", muscles: { primary: ["calves"], secondary: [] } },
  { id: "abducao-quadril", nome: "Abdução de quadril", grupoPrincipal: "Pernas", gruposSecundarios: [], equipamento: "Máquina", instrucoes: "Afaste as pernas contra a resistência da máquina.", muscles: { primary: ["abductors"], secondary: [] } },
  { id: "prancha", nome: "Prancha", grupoPrincipal: "Abdômen", gruposSecundarios: [], equipamento: "Peso do corpo", instrucoes: "Corpo alinhado apoiado nos antebraços, mantenha o abdômen contraído.", muscles: { primary: ["abs"], secondary: [] } },
  { id: "abdominal-supra", nome: "Abdominal supra", grupoPrincipal: "Abdômen", gruposSecundarios: [], equipamento: "Peso do corpo", instrucoes: "Flexione o tronco em direção aos joelhos sem puxar o pescoço.", muscles: { primary: ["abs"], secondary: [] } },
  { id: "abdominal-obliquo", nome: "Abdominal oblíquo", grupoPrincipal: "Abdômen", gruposSecundarios: [], equipamento: "Peso do corpo", instrucoes: "Gire o tronco levando o cotovelo em direção ao joelho oposto.", muscles: { primary: ["obliques"], secondary: [] } },
];

export const exercisesById = Object.fromEntries(exercises.map(e => [e.id, e]));

// ---------------------------------------------------------------------
// Templates de treino por perfil
// ---------------------------------------------------------------------
export const workoutTemplates = {
  voce: [
    {
      id: "voce-a", nome: "Treino A", grupo: "Peito · Tríceps",
      exercicios: [
        { exercicioId: "supino-reto", series: 4, repsAlvo: 10, cargaBase: 45 },
        { exercicioId: "supino-inclinado-halteres", series: 3, repsAlvo: 10, cargaBase: 18 },
        { exercicioId: "crucifixo", series: 3, repsAlvo: 12, cargaBase: 12 },
        { exercicioId: "crossover", series: 3, repsAlvo: 12, cargaBase: 15 },
        { exercicioId: "triceps-corda", series: 3, repsAlvo: 12, cargaBase: 20 },
        { exercicioId: "triceps-testa", series: 3, repsAlvo: 10, cargaBase: 15 },
      ],
    },
    {
      id: "voce-b", nome: "Treino B", grupo: "Costas · Bíceps",
      exercicios: [
        { exercicioId: "remada-baixa", series: 4, repsAlvo: 10, cargaBase: 45 },
        { exercicioId: "puxada-frente", series: 4, repsAlvo: 10, cargaBase: 50 },
        { exercicioId: "remada-curvada", series: 3, repsAlvo: 10, cargaBase: 40 },
        { exercicioId: "pulldown", series: 3, repsAlvo: 12, cargaBase: 18 },
        { exercicioId: "levantamento-terra", series: 3, repsAlvo: 8, cargaBase: 60 },
        { exercicioId: "rosca-direta", series: 3, repsAlvo: 10, cargaBase: 20 },
        { exercicioId: "rosca-martelo", series: 3, repsAlvo: 12, cargaBase: 14 },
      ],
    },
    {
      id: "voce-c", nome: "Treino C", grupo: "Pernas",
      exercicios: [
        { exercicioId: "agachamento-livre", series: 4, repsAlvo: 8, cargaBase: 70 },
        { exercicioId: "leg-press", series: 4, repsAlvo: 10, cargaBase: 120 },
        { exercicioId: "cadeira-extensora", series: 3, repsAlvo: 12, cargaBase: 35 },
        { exercicioId: "cadeira-flexora", series: 3, repsAlvo: 12, cargaBase: 30 },
        { exercicioId: "stiff", series: 3, repsAlvo: 10, cargaBase: 50 },
        { exercicioId: "avanco", series: 3, repsAlvo: 10, cargaBase: 16 },
        { exercicioId: "elevacao-pelvica", series: 3, repsAlvo: 12, cargaBase: 55 },
        { exercicioId: "panturrilha-em-pe", series: 4, repsAlvo: 15, cargaBase: 45 },
      ],
    },
  ],
  parceira: [
    {
      id: "parceira-a", nome: "Treino A", grupo: "Pernas · Glúteos",
      exercicios: [
        { exercicioId: "agachamento-livre", series: 4, repsAlvo: 10, cargaBase: 35 },
        { exercicioId: "elevacao-pelvica", series: 4, repsAlvo: 12, cargaBase: 45 },
        { exercicioId: "leg-press", series: 3, repsAlvo: 12, cargaBase: 80 },
        { exercicioId: "cadeira-flexora", series: 3, repsAlvo: 12, cargaBase: 22 },
        { exercicioId: "avanco", series: 3, repsAlvo: 10, cargaBase: 10 },
        { exercicioId: "abducao-quadril", series: 3, repsAlvo: 15, cargaBase: 25 },
        { exercicioId: "panturrilha-em-pe", series: 4, repsAlvo: 15, cargaBase: 30 },
      ],
    },
    {
      id: "parceira-b", nome: "Treino B", grupo: "Costas · Ombros",
      exercicios: [
        { exercicioId: "puxada-frente", series: 4, repsAlvo: 10, cargaBase: 30 },
        { exercicioId: "remada-baixa", series: 3, repsAlvo: 10, cargaBase: 28 },
        { exercicioId: "pulldown", series: 3, repsAlvo: 12, cargaBase: 10 },
        { exercicioId: "desenvolvimento-ombro", series: 3, repsAlvo: 10, cargaBase: 10 },
        { exercicioId: "elevacao-lateral", series: 3, repsAlvo: 12, cargaBase: 6 },
        { exercicioId: "remada-alta", series: 3, repsAlvo: 12, cargaBase: 18 },
      ],
    },
    {
      id: "parceira-c", nome: "Treino C", grupo: "Peito · Core",
      exercicios: [
        { exercicioId: "supino-reto", series: 3, repsAlvo: 10, cargaBase: 20 },
        { exercicioId: "crucifixo", series: 3, repsAlvo: 12, cargaBase: 8 },
        { exercicioId: "flexao", series: 3, repsAlvo: 12, cargaBase: 0 },
        { exercicioId: "prancha", series: 3, repsAlvo: 40, cargaBase: 0 },
        { exercicioId: "abdominal-supra", series: 3, repsAlvo: 15, cargaBase: 0 },
        { exercicioId: "abdominal-obliquo", series: 3, repsAlvo: 15, cargaBase: 0 },
      ],
    },
  ],
};

export const profiles = {
  voce: { id: "voce", nome: "Você", iniciais: "V", trainDays: [1, 2, 4, 5, 0], streakStartOverride: "2026-07-31" },
  parceira: { id: "parceira", nome: "Parceira", iniciais: "P", trainDays: [1, 3, 5, 6], streakStartOverride: "2026-08-11" },
};

// ---------------------------------------------------------------------
// Geração determinística do histórico (sessões de treino + cardio)
// Isso garante que streak, calendário, "últimos 7 dias" e progresso
// fiquem sempre coerentes entre si, pois vêm todos da mesma fonte.
// ---------------------------------------------------------------------
function seededRandom(seedStr) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) { h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0; }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 1 | h);
    h = (h + Math.imul(h ^ (h >>> 7), 61 | h)) ^ h;
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

function toISO(d) { return d.toISOString().slice(0, 10); }

function buildHistory(profileKey) {
  const profile = profiles[profileKey];
  const templates = workoutTemplates[profileKey];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysBack = 100;
  const sessions = [];
  const cardio = [];
  let templateCursor = 0;

  for (let i = daysBack; i >= 1; i--) { // até "ontem" — hoje ainda não foi treinado
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const weekday = d.getDay();
    if (!profile.trainDays.includes(weekday)) continue;

    const iso = toISO(d);
    // Pequena interrupção da sequência ~3 semanas antes do fim, para o streak
    // atual não remontar ao início dos dados (fica mais realista).
    const breakDate = new Date(profile.streakStartOverride);
    const dayBeforeBreak = new Date(breakDate);
    // encontra o "treino esperado" imediatamente anterior ao breakDate e o pula
    if (i > 1) {
      const prevScheduled = findPrevScheduled(breakDate, profile.trainDays);
      if (iso === toISO(prevScheduled)) continue;
    }

    const rand = seededRandom(profileKey + iso);
    const template = templates[templateCursor % templates.length];
    templateCursor++;

    const weeksElapsed = Math.floor((today - d) / (1000 * 60 * 60 * 24 * 7));
    const progressao = Math.max(0, (12 - weeksElapsed)) * 0.6; // progride ao longo do tempo

    const exerciciosSessao = template.exercicios.map(ex => {
      const nSeries = ex.series;
      const seriesArr = [];
      for (let s = 0; s < nSeries; s++) {
        const variacao = Math.round((rand() - 0.5) * 2);
        const peso = ex.cargaBase > 0 ? Math.max(0, Math.round((ex.cargaBase + progressao) / 0.5) * 0.5) : 0;
        const reps = Math.max(1, ex.repsAlvo + (s === nSeries - 1 ? -variacao : 0));
        seriesArr.push({ peso, reps });
      }
      return { exercicioId: ex.exercicioId, series: seriesArr };
    });

    const totalSeries = exerciciosSessao.reduce((acc, e) => acc + e.series.length, 0);
    sessions.push({ date: iso, workoutTemplateId: template.id, exercicios: exerciciosSessao, totalSeries });

    // cardio ocasional (~1 em cada 3 dias de treino)
    if (Math.floor(rand() * 3) === 0) {
      const tipos = ["Esteira", "Bike", "Elíptico"];
      const tipo = tipos[Math.floor(rand() * tipos.length)];
      const duracao = 15 + Math.floor(rand() * 4) * 5;
      cardio.push({ date: iso, tipo, duracao });
    }
  }

  return { sessions, cardio };
}

function findPrevScheduled(fromDate, trainDays) {
  const d = new Date(fromDate);
  do { d.setDate(d.getDate() - 1); } while (!trainDays.includes(d.getDay()));
  return d;
}

export const history = {
  voce: buildHistory("voce"),
  parceira: buildHistory("parceira"),
};
