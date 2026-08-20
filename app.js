import createBodyHighlighter from 'https://esm.sh/body-highlighter';
import { EXERCISES, GROUPS } from './exercises.js';

/* =========================================================
   DADOS — perfis e fichas de treino vêm do Firestore (ver
   carregarDadosIniciais() lá embaixo); os arrays/objetos abaixo são
   só os valores padrão usados na primeira vez que o app roda (quando
   ainda não existe nada salvo no banco) e também o "formato" que o
   resto do código espera.
   (o catálogo de exercícios continua fixo, em exercises.js)
   ========================================================= */

const backMuscles = ["trapezius", "upper-back", "lower-back", "triceps", "back-deltoids", "gluteal", "hamstring"];

const muscleLabels = {
  chest: "Peitoral", "front-deltoids": "Ombro", "back-deltoids": "Ombro (post.)",
  triceps: "Tríceps", biceps: "Bíceps", "upper-back": "Costas", "lower-back": "Lombar",
  trapezius: "Trapézio", quadriceps: "Quadríceps", gluteal: "Glúteo", hamstring: "Posterior",
  calves: "Panturrilha", abs: "Abdômen", forearm: "Antebraço", obliques: "Oblíquo",
  adductors: "Adutor", abductors: "Abdutor"
};

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];
const WEEKDAY_FULL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

// cada exercício de uma ficha agora carrega sua própria configuração de
// séries/repetições/descanso — não é mais só o id do exercício.
// reps pode ser um número (mesma rep em todas as séries) ou um array
// (uma rep diferente por série, ex: [12, 10, 8])
function exCfg(id, series, reps, descanso) {
  return { id, series, reps, descanso };
}

// reps aceita tanto um número (mesma rep em todas as séries) quanto um
// array (uma rep por série, ex: "12+10+8"). essas funções convertem entre
// o texto que o usuário digita no editor e esse formato de dado.
function parseRepsInput(str) {
  const parts = String(str).split("+").map(s => s.trim()).filter(Boolean).map(Number).filter(n => !isNaN(n) && n >= 0);
  if (parts.length === 0) return 10;
  if (parts.length === 1) return parts[0];
  return parts;
}
function repsToInputValue(reps) {
  return Array.isArray(reps) ? reps.join("+") : String(reps);
}
function repsResumo(series, reps) {
  return Array.isArray(reps) ? `${reps.join("+")} reps` : `${series}× ${reps} reps`;
}

const DEFAULT_TEMPLATES = [
  { id: "a", nome: "Peito e Tríceps", ficha: "Ficha A", tags: ["Peitoral", "Tríceps", "Ombros"], dias: [1, 4], exercicios: [
    exCfg("supino_reto_barra", 4, 10, 60),
    exCfg("supino_inclinado_halteres", 3, 10, 60),
    exCfg("crucifixo_reto_halteres", 3, 12, 45),
    exCfg("desenvolvimento_halteres", 3, 10, 60),
    exCfg("triceps_corda", 3, 12, 45),
    exCfg("mergulho_banco", 3, 12, 45)
  ] },
  { id: "b", nome: "Costas e Bíceps", ficha: "Ficha B", tags: ["Dorsais", "Bíceps", "Antebraço"], dias: [2, 5], exercicios: [
    exCfg("puxada_frente", 4, 10, 60),
    exCfg("remada_curvada_barra", 3, 10, 60),
    exCfg("remada_baixa_cabo", 3, 12, 45),
    exCfg("rosca_direta_barra", 3, 10, 45),
    exCfg("rosca_martelo", 3, 12, 45),
    exCfg("rosca_scott", 3, 12, 45)
  ] },
  { id: "c", nome: "Pernas e Glúteos", ficha: "Ficha C", tags: ["Quadríceps", "Posterior", "Glúteos"], dias: [3, 6], exercicios: [
    exCfg("agachamento_livre", 4, 10, 90),
    exCfg("leg_press", 4, 12, 60),
    exCfg("cadeira_extensora", 3, 12, 45),
    exCfg("cadeira_flexora", 3, 12, 45),
    exCfg("elevacao_pelvica", 3, 12, 60),
    exCfg("panturrilha_em_pe", 4, 15, 30)
  ] }
];

// cópia "profunda o suficiente" (ficha + cada exercício) — usada pra
// semear cada perfil sem que os dois acabem compartilhando o mesmo
// objeto/array na memória (o que faria uma edição vazar pro outro perfil
// mesmo antes de qualquer salvamento no Firestore)
function cloneTemplates(list) {
  return list.map(t => ({ ...t, dias: [...(t.dias || [])], tags: [...(t.tags || [])], exercicios: (t.exercicios || []).map(e => ({ ...e })) }));
}

// cada perfil (Você / Sua parceira) tem sua PRÓPRIA lista de fichas de
// treino — criar, editar dias/exercícios ou excluir uma ficha num perfil
// nunca deve afetar o outro. No Firestore isso vira uma subcoleção por
// perfil: profiles/{perfilId}/templates/{fichaId} (ver carregarDadosIniciais).
// Os valores abaixo são só o padrão usado antes de carregar do Firestore.
const TEMPLATES_BY_PROFILE = {
  voce: cloneTemplates(DEFAULT_TEMPLATES),
  parceira: cloneTemplates(DEFAULT_TEMPLATES)
};

// retorna sempre a lista de fichas do perfil selecionado no momento — todo
// o resto do código usa essa função (em vez de um array fixo único) pra
// garantir que treinos criados/editados/excluídos num perfil não vazem
// pro outro
function treinosDoPerfilAtual() {
  return TEMPLATES_BY_PROFILE[state.perfilAtual];
}

const PROFILES = {
  voce: {
    nome: "Você",
    diasTreinados: [], // datas reais no formato "AAAA-MM-DD"
    cardioLog: [],
    historicoLog: [],
    concluidosPorDia: {}, // { "AAAA-MM-DD": ["a", "b"] } — quais fichas foram concluídas em cada dia
    hojeTemplateIds: [], // todas as fichas (A/B/C...) que esse perfil escolheu (ou o app sugeriu) como treinos de hoje
    hojeAutoIds: [], // subconjunto de hojeTemplateIds que veio da sugestão automática (por dia da semana) — usado só pra saber o que pode ser removido sozinho se a programação mudar
    hojeTemplateDia: null, // "AAAA-MM-DD" do dia em que hojeTemplateIds foi definido — vira a chave pra saber se precisa reavaliar a sugestão do dia
    execucao: null // treino em andamento desse perfil (independente do outro perfil)
  },
  parceira: {
    nome: "Sua parceira",
    diasTreinados: [],
    cardioLog: [],
    historicoLog: [],
    concluidosPorDia: {},
    hojeTemplateIds: [],
    hojeAutoIds: [],
    hojeTemplateDia: null,
    execucao: null
  }
};

/* =========================================================
   DATAS — o app usa sempre a data real do aparelho. "diasTreinados"
   guarda datas completas ("AAAA-MM-DD"), não só o dia do mês, pra não
   misturar dias de meses/anos diferentes.
   ========================================================= */
function pad2(n) { return String(n).padStart(2, "0"); }
function dateStr(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function todayStr() { return dateStr(new Date()); }

// sequência atual de dias treinados seguidos, terminando hoje (ou ontem,
// se hoje ainda não treinou — assim a sequência não "zera" só por ainda
// não ter treinado no dia de hoje)
function computeStreak(diasTreinados) {
  const set = new Set(diasTreinados);
  const cursor = new Date();
  if (!set.has(dateStr(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (set.has(dateStr(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/* =========================================================
   FIRESTORE — perfis (voce/parceira) ficam em profiles/{id},
   fichas de treino ficam em templates/{id}
   ========================================================= */

import { db, app } from './firebase-config.js';
import {
  doc, getDoc, setDoc, getDocs, deleteDoc, collection, writeBatch
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut,
  setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// login do app é só por senha (sem e-mail/Google) — por baixo dos panos
// isso usa um único usuário fixo no Firebase Authentication, com um
// e-mail interno que o usuário nunca vê nem digita.
const APP_LOGIN_EMAIL = "acesso@treinos-b6a37.internal";
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {});

// salva o perfil inteiro (streak, dias treinados, execução em andamento, etc)
async function saveProfile(profileId) {
  try {
    await setDoc(doc(db, "profiles", profileId), PROFILES[profileId]);
  } catch (err) {
    console.error("Não foi possível salvar o perfil no Firestore:", err);
    showToast("Sem conexão — alteração não foi salva");
  }
}

// salva uma ficha de treino inteira (nome, dias, exercícios com séries/reps/descanso)
// — sempre na subcoleção do perfil dono da ficha, nunca na coleção antiga
// compartilhada, pra manter os perfis independentes
async function saveTemplate(profileId, t) {
  try {
    await setDoc(doc(db, "profiles", profileId, "templates", t.id), t);
  } catch (err) {
    console.error("Não foi possível salvar a ficha no Firestore:", err);
    showToast("Sem conexão — treino não foi salvo");
  }
}

async function deleteTemplateRemote(profileId, id) {
  try {
    await deleteDoc(doc(db, "profiles", profileId, "templates", id));
  } catch (err) {
    console.error("Não foi possível excluir a ficha no Firestore:", err);
  }
}

// corrige formatos antigos vindos do Firestore (versão anterior guardava só
// o "dia do mês" fixo, sem mês/ano, e um "concluidosHoje" que nunca zerava)
function normalizeProfile(p) {
  p.diasTreinados = Array.isArray(p.diasTreinados)
    ? p.diasTreinados.filter(d => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d))
    : [];
  if (!p.concluidosPorDia || typeof p.concluidosPorDia !== "object" || Array.isArray(p.concluidosPorDia)) {
    p.concluidosPorDia = {};
  }
  if (!Array.isArray(p.historicoLog)) p.historicoLog = [];
  if (!Array.isArray(p.cardioLog)) p.cardioLog = [];
  if (typeof p.hojeTemplateDia !== "string") p.hojeTemplateDia = null;
  // formato antigo guardava só uma ficha (hojeTemplateId, string); migra pro
  // novo formato em lista, que suporta várias fichas marcadas pro mesmo dia
  if (typeof p.hojeTemplateId === "string" && p.hojeTemplateId) {
    p.hojeTemplateIds = [p.hojeTemplateId];
  }
  if (!Array.isArray(p.hojeTemplateIds)) p.hojeTemplateIds = [];
  if (!Array.isArray(p.hojeAutoIds)) p.hojeAutoIds = [];
  delete p.hojeTemplateId;
  delete p.concluidosHoje;
  delete p.streak;
}

// todas as fichas cuja programação de dias da semana (definida na ficha, em
// "treinos") inclui o dia de hoje — uma ficha pode ter vários dias marcados,
// e mais de uma ficha pode estar marcada pro mesmo dia.
function getTreinosDoDiaAtual() {
  const diaSemana = new Date().getDay();
  return treinosDoPerfilAtual().filter(t => Array.isArray(t.dias) && t.dias.includes(diaSemana));
}

// roda uma única vez, no carregamento do app: busca tudo que já existe no
// Firestore, por perfil. Se a subcoleção de um perfil ainda estiver vazia
// (primeira vez desse perfil), semeia a partir do que já existir na coleção
// antiga e compartilhada "templates" (pra não perder fichas já criadas
// antes dessa separação por perfil); se nem isso existir, usa os padrões.
async function carregarDadosIniciais() {
  try {
    let legacySnap = null; // busca a coleção antiga só se algum perfil precisar dela

    for (const profileId of Object.keys(PROFILES)) {
      const templatesSnap = await getDocs(collection(db, "profiles", profileId, "templates"));
      if (templatesSnap.empty) {
        if (!legacySnap) legacySnap = await getDocs(collection(db, "templates"));
        const seed = !legacySnap.empty ? legacySnap.docs.map(d => d.data()) : DEFAULT_TEMPLATES;
        const batch = writeBatch(db);
        seed.forEach(t => batch.set(doc(db, "profiles", profileId, "templates", t.id), t));
        await batch.commit();
        TEMPLATES_BY_PROFILE[profileId] = cloneTemplates(seed);
      } else {
        TEMPLATES_BY_PROFILE[profileId] = templatesSnap.docs.map(d => d.data());
      }

      const ref = doc(db, "profiles", profileId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        Object.assign(PROFILES[profileId], snap.data());
      } else {
        await setDoc(ref, PROFILES[profileId]);
      }
      normalizeProfile(PROFILES[profileId]);
    }
  } catch (err) {
    console.error("Não foi possível conectar ao Firestore — usando dados padrão localmente:", err);
    showToast("Sem conexão com o banco — usando dados locais");
  }
}

/* =========================================================
   ESTADO
   ========================================================= */

const AGORA = new Date();
let state = {
  perfilAtual: "voce",
  calMonth: AGORA.getMonth(), // mês atual real (0-based)
  calYear: AGORA.getFullYear(),
  calSelectedDay: null,
  cardioTipo: "esteira",
  cardioIntensidade: "leve",
  escolhaManual: false, // true enquanto o usuário está vendo a lista de todas as fichas pra trocar/adicionar um treino de hoje
  escolhaManualSlot: null // id da ficha sendo substituída (trocar), ou null se é uma adição nova
};

function currentProfile() {
  return PROFILES[state.perfilAtual];
}

// reprocessa os ícones lucide depois de qualquer innerHTML dinâmico
// (o lucide só troca <i data-lucide="..."> por svg quando isso é chamado)
function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

// evita disparar um save no Firestore a cada clique rápido nos steppers
function debounce(fn, wait) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
const saveProfileDebounced = debounce((profileId) => saveProfile(profileId), 600);

/* =========================================================
   TOAST (confirmação rápida)
   ========================================================= */

let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
}

/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

const TAB_SCREENS = ["hoje", "treinos", "cardio", "historico", "calendario"];

function showScreen(name) {
  document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.dataset.screen === name));
  document.querySelectorAll(".nav-item").forEach(b => {
    const active = b.dataset.nav === name;
    b.classList.toggle("text-clay", active);
    b.classList.toggle("bg-clay/10", active);
    b.classList.toggle("text-gray-500", !active);
    b.classList.toggle("nav-item-active", active);
  });
  // esconde o menu inferior em telas de "fluxo" (execução, editor) — só aparece nas 5 abas principais
  document.getElementById("bottomNav").style.display = TAB_SCREENS.includes(name) ? "flex" : "none";
  // sempre volta pro topo da tela ao trocar de aba/tela
  const activeMain = document.querySelector(`.screen[data-screen="${name}"] main`);
  if (activeMain) activeMain.scrollTop = 0;
}

document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.dataset.nav === "hoje") renderHoje();
    showScreen(btn.dataset.nav);
  });
});

/* =========================================================
   PERFIL — troca instantânea, sem dropdown
   ========================================================= */

function renderProfileToggles() {
  document.querySelectorAll(".profile-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.profile === state.perfilAtual);
  });
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".profile-btn");
  if (!btn) return;
  if (btn.dataset.profile === state.perfilAtual) return;
  state.perfilAtual = btn.dataset.profile;
  state.escolhaManual = false;
  renderAll();
});

/* =========================================================
   TELA "HOJE"
   ========================================================= */

function renderHoje() {
  const p = currentProfile();
  document.getElementById("streakCount").textContent = computeStreak(p.diasTreinados);

  const hoje = new Date();
  const hojeKey = dateStr(hoje);
  document.getElementById("todayDate").textContent =
    `${WEEKDAY_FULL[hoje.getDay()]}, ${hoje.getDate()} ${MONTH_NAMES[hoje.getMonth()].slice(0, 3)}`;

  const strip = document.getElementById("weekStrip");
  strip.innerHTML = "";
  // semana fixa de segunda a domingo (não é "últimos 7 dias" rolando — ela
  // reinicia toda segunda-feira, ancorada no dia de hoje de verdade)
  const diasDesdeSegunda = (hoje.getDay() + 6) % 7; // Seg=0, Ter=1, ... Dom=6
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() - diasDesdeSegunda);

  for (let offset = 0; offset <= 6; offset++) {
    const dia = new Date(segunda);
    dia.setDate(segunda.getDate() + offset);
    const diaKey = dateStr(dia);
    const trained = p.diasTreinados.includes(diaKey);
    const isToday = diaKey === hojeKey;
    const el = document.createElement("div");
    el.className = "flex flex-col items-center gap-2";
    el.innerHTML = `
      <span class="text-[10px] font-bold uppercase ${isToday ? "text-clay" : "text-gray-500"}">${WEEKDAY_LABELS[dia.getDay()]}</span>
      <div class="weekday-pill ${trained ? "trained" : (isToday ? "today-pending" : "")} rounded-full flex items-start justify-center pt-1.5 transition-all" style="width:32px;height:${isToday ? "72px" : "58px"};">
        <div class="rounded-full flex-shrink-0" style="width:18px;height:18px;background:${trained ? "#fff" : (isToday ? "#C9482F" : "#3A3A3C")};"></div>
      </div>
    `;
    strip.appendChild(el);
  }

  renderTodayWorkout();
}

// tira um treino extra da lista de hoje (usado pelo botão "Remover", pra
// desfazer uma adição feita sem querer). Não mexe em treinos programados
// de verdade pra hoje — esses continuam voltando pela sugestão automática.
function removerTreinoHoje(templateId) {
  const p = currentProfile();
  const i = p.hojeTemplateIds.indexOf(templateId);
  if (i >= 0) p.hojeTemplateIds.splice(i, 1);
  const j = p.hojeAutoIds.indexOf(templateId);
  if (j >= 0) p.hojeAutoIds.splice(j, 1);
  renderTodayWorkout();
  saveProfile(state.perfilAtual);
}

function renderTodayWorkout() {
  const p = currentProfile();
  const container = document.getElementById("todayWorkoutCard");
  const titleEl = document.getElementById("todayWorkoutTitle");

  // virou o dia desde a última vez que os treinos foram definidos/sugeridos:
  // esquece a escolha antiga pra reavaliar do zero com base na programação de hoje
  if (p.hojeTemplateIds.length && p.hojeTemplateDia !== todayStr()) {
    p.hojeTemplateIds = [];
    p.hojeAutoIds = [];
    p.hojeTemplateDia = null;
  }
  if (!Array.isArray(p.hojeAutoIds)) p.hojeAutoIds = [];

  // reavalia a programação de hoje a cada render (não só quando a lista
  // está vazia): assim, se o usuário marcar/desmarcar o dia de hoje em
  // alguma ficha lá no menu Treinos, a tela "Hoje" acompanha na hora, sem
  // ficar "grudada" na primeira sugestão do dia. Só entra aqui fora do modo
  // de troca manual, pra não atrapalhar o usuário no meio de uma escolha.
  if (!state.escolhaManual) {
    const sugestoes = getTreinosDoDiaAtual().map(t => t.id);
    const concluidosHoje = p.concluidosPorDia[todayStr()] || [];
    let mudou = false;

    // soma fichas recém-programadas pra hoje que ainda não estão na lista
    sugestoes.forEach(id => {
      if (!p.hojeTemplateIds.includes(id)) {
        p.hojeTemplateIds.push(id);
        p.hojeAutoIds.push(id);
        mudou = true;
      }
    });

    // tira da lista as fichas que eram sugestão automática, deixaram de
    // estar programadas pra hoje, e ainda não foram concluídas nem estão
    // em andamento (essas nunca são removidas automaticamente); fichas
    // que o usuário escolheu manualmente também não são removidas aqui,
    // só se ele quiser trocar/tirar pela própria tela
    p.hojeTemplateIds = p.hojeTemplateIds.filter(id => {
      const eraAuto = p.hojeAutoIds.includes(id);
      const aindaProgramada = sugestoes.includes(id);
      const concluida = concluidosHoje.includes(id);
      const emAndamento = p.execucao && p.execucao.templateId === id;
      if (eraAuto && !aindaProgramada && !concluida && !emAndamento) {
        mudou = true;
        return false;
      }
      return true;
    });
    p.hojeAutoIds = p.hojeAutoIds.filter(id => p.hojeTemplateIds.includes(id));

    if (mudou) {
      p.hojeTemplateDia = todayStr();
      saveProfile(state.perfilAtual);
    } else if (p.hojeTemplateIds.length && !p.hojeTemplateDia) {
      p.hojeTemplateDia = todayStr();
    }
  }

  // usuário clicou em "Deseja alterar?" (troca uma ficha específica) ou em
  // "Adicionar outro treino" (soma uma nova): mostra a lista de fichas ainda
  // não escolhidas pra hoje. Não mexe em p.hojeTemplateIds aqui — assim, se
  // ele desistir, dá pra voltar exatamente pros treinos que já estavam
  // definidos pra hoje, sem cair de novo na sugestão automática do dia.
  if (state.escolhaManual) {
    const slotId = state.escolhaManualSlot;
    if (titleEl) titleEl.textContent = slotId ? "Trocar por qual treino?" : "Adicionar qual treino?";
    container.innerHTML = `<div class="flex flex-col gap-3" id="hojeTemplatePicker"></div>`;
    const picker = document.getElementById("hojeTemplatePicker");
    const disponiveis = treinosDoPerfilAtual().filter(t => t.id === slotId || !p.hojeTemplateIds.includes(t.id));
    disponiveis.forEach((t, idx) => {
      const btn = document.createElement("button");
      btn.className = "today-pick-btn ficha-card w-full flex items-center gap-4 rounded-2xl p-4 text-left transition-all active:scale-[0.98]";
      btn.innerHTML = `
        <span class="font-serif text-2xl text-gray-600" style="min-width:30px;">${String(idx + 1).padStart(2, "0")}</span>
        <div class="min-w-0 flex-1">
          <p class="text-[10px] font-bold text-clay uppercase tracking-[0.15em] mb-0.5">${t.ficha}</p>
          <h3 class="text-sm font-extrabold text-white uppercase tracking-tight truncate">${t.nome}</h3>
        </div>
        <i data-lucide="chevron-right" class="text-clay flex-shrink-0"></i>
      `;
      btn.addEventListener("click", () => {
        if (slotId) {
          const i = p.hojeTemplateIds.indexOf(slotId);
          if (i >= 0) p.hojeTemplateIds.splice(i, 1, t.id);
          else p.hojeTemplateIds.push(t.id);
        } else {
          p.hojeTemplateIds.push(t.id);
        }
        p.hojeTemplateDia = todayStr();
        state.escolhaManual = false;
        state.escolhaManualSlot = null;
        renderTodayWorkout();
        saveProfile(state.perfilAtual);
      });
      picker.appendChild(btn);
    });

    // só faz sentido "voltar" se já havia algum treino definido pra hoje
    if (p.hojeTemplateIds.length) {
      const backBtn = document.createElement("button");
      backBtn.id = "cancelarTrocaBtn";
      backBtn.className = "w-full text-xs font-bold text-gray-500 uppercase tracking-widest py-2 text-center";
      backBtn.textContent = "Voltar pros treinos de hoje";
      backBtn.addEventListener("click", () => {
        state.escolhaManual = false;
        state.escolhaManualSlot = null;
        renderTodayWorkout();
      });
      picker.appendChild(backBtn);
    }

    refreshIcons();
    return;
  }

  // nenhuma ficha programada pra hoje e nada adicionado manualmente ainda:
  // mostra o aviso de "sem treinos", em vez de forçar a escolha
  if (!p.hojeTemplateIds.length) {
    if (titleEl) titleEl.textContent = "Sem treinos para hoje";
    container.innerHTML = `
      <div class="ficha-card rounded-2xl p-6 flex flex-col items-center text-center gap-3">
        <div class="w-11 h-11 rounded-full flex items-center justify-center text-muted flex-shrink-0" style="background:#1C1C1E;">
          <i data-lucide="calendar-x"></i>
        </div>
        <p class="text-sm text-gray-400">Nenhum treino programado pra hoje no menu Treinos.</p>
        <button id="semTreinoAlterarBtn" class="text-xs font-bold text-clay uppercase tracking-widest mt-1">Deseja alterar?</button>
      </div>
    `;
    document.getElementById("semTreinoAlterarBtn").addEventListener("click", () => {
      state.escolhaManual = true;
      state.escolhaManualSlot = null;
      renderTodayWorkout();
    });
    refreshIcons();
    return;
  }

  // alguma ficha escolhida foi excluída no editor desde então: tira da lista
  const validos = p.hojeTemplateIds.filter(id => treinosDoPerfilAtual().some(t => t.id === id));
  if (validos.length !== p.hojeTemplateIds.length) {
    p.hojeTemplateIds = validos;
    p.hojeAutoIds = (p.hojeAutoIds || []).filter(id => validos.includes(id));
    saveProfile(state.perfilAtual);
    if (!validos.length) {
      renderTodayWorkout();
      return;
    }
  }

  if (titleEl) {
    titleEl.textContent = p.hojeTemplateIds.length > 1 ? "Seus treinos de hoje" : "Seu treino de hoje";
  }

  container.innerHTML = "";
  const concluidosHoje = p.concluidosPorDia[todayStr()] || [];
  // fichas realmente programadas pra hoje (dia marcado no menu Treinos) —
  // qualquer outra coisa na lista é um treino extra, somado manualmente
  // via "Deseja alterar?" / "Adicionar outro treino", e pode ser removida
  const sugestoesHojeIds = getTreinosDoDiaAtual().map(t => t.id);

  p.hojeTemplateIds.forEach(id => {
    const t = treinosDoPerfilAtual().find(x => x.id === id);
    if (!t) return;

    const concluido = concluidosHoje.includes(t.id);
    const emAndamento = p.execucao && p.execucao.templateId === t.id;
    const isExtra = !sugestoesHojeIds.includes(t.id);
    const card = document.createElement("div");
    card.className = "mb-3";

    if (concluido) {
      card.innerHTML = `
        <button class="reabrirTreinoBtn w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all active:scale-[0.98]" style="background:#101913;border:1px solid #234032;">
          <div class="w-9 h-9 bg-emerald rounded-full flex items-center justify-center text-white flex-shrink-0">
            <i data-lucide="check" class="text-xs"></i>
          </div>
          <div class="min-w-0 flex-1">
            <span class="text-[10px] font-bold text-emerald uppercase tracking-[0.15em] mb-0.5 block">${t.ficha} · Concluído</span>
            <h3 class="text-sm font-extrabold text-white uppercase tracking-tight truncate">${t.nome}</h3>
          </div>
          <i data-lucide="rotate-ccw" class="text-emerald text-sm flex-shrink-0"></i>
        </button>
        <div class="flex items-center gap-4 mt-3">
          <button class="trocarTreinoBtn text-xs font-bold text-clay uppercase tracking-widest">Deseja alterar?</button>
          ${isExtra ? `<button class="removerTreinoBtn text-xs font-bold text-gray-500 uppercase tracking-widest">Remover</button>` : ""}
        </div>
      `;
      card.querySelector(".reabrirTreinoBtn").addEventListener("click", () => reabrirTreino(t));
      card.querySelector(".trocarTreinoBtn").addEventListener("click", (e) => {
        e.stopPropagation();
        state.escolhaManual = true;
        state.escolhaManualSlot = t.id;
        renderTodayWorkout();
      });
      if (isExtra) {
        card.querySelector(".removerTreinoBtn").addEventListener("click", (e) => {
          e.stopPropagation();
          removerTreinoHoje(t.id);
        });
      }
    } else {
      card.innerHTML = `
        <div class="ficha-card rounded-2xl p-4">
          <div class="flex items-center justify-between mb-3">
            <div>
              <span class="text-[10px] font-bold text-clay uppercase tracking-[0.2em]">${t.ficha}</span>
              <h3 class="text-lg font-extrabold text-white uppercase tracking-tight">${t.nome}</h3>
              ${emAndamento ? `<p class="text-[11px] text-gray-500 mt-0.5">Exercício ${p.execucao.exercicioIndex + 1} de ${t.exercicios.length}</p>` : ""}
            </div>
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-clay flex-shrink-0" style="background:#1C1C1E;">
              <i data-lucide="dumbbell"></i>
            </div>
          </div>
          <button class="start-today-btn w-full bg-clay text-white font-bold py-2.5 rounded-xl text-sm active:scale-[0.98] transition-all" data-template-id="${t.id}">
            ${emAndamento ? "Continuar Treino" : "Iniciar Treino"}
          </button>
          <div class="flex items-center gap-4 mt-2">
            <button class="trocarTreinoBtn flex-1 text-xs font-bold text-gray-500 uppercase tracking-widest py-1">Deseja alterar?</button>
            ${isExtra ? `<button class="removerTreinoBtn text-xs font-bold text-gray-500 uppercase tracking-widest py-1">Remover</button>` : ""}
          </div>
        </div>
      `;
      card.querySelector(".start-today-btn").addEventListener("click", () => startExecution(t.id));
      card.querySelector(".trocarTreinoBtn").addEventListener("click", () => {
        state.escolhaManual = true;
        state.escolhaManualSlot = t.id;
        renderTodayWorkout();
      });
      if (isExtra) {
        card.querySelector(".removerTreinoBtn").addEventListener("click", () => {
          removerTreinoHoje(t.id);
        });
      }
    }

    container.appendChild(card);
  });

  // permite somar mais uma ficha além das já programadas/escolhidas pra hoje
  if (p.hojeTemplateIds.length < treinosDoPerfilAtual().length) {
    const addBtn = document.createElement("button");
    addBtn.className = "w-full text-xs font-bold text-clay uppercase tracking-widest py-2 text-center";
    addBtn.textContent = "+ Adicionar outro treino";
    addBtn.addEventListener("click", () => {
      state.escolhaManual = true;
      state.escolhaManualSlot = null;
      renderTodayWorkout();
    });
    container.appendChild(addBtn);
  }

  refreshIcons();
}

// desfaz o registro de uma entrada do histórico: tira do histórico, tira
// da lista de "concluídos" daquele dia (se for treino) e, se não sobrar
// mais nada registrado naquele dia, desmarca o dia como treinado
function removerDoHistorico(p, idx) {
  const item = p.historicoLog[idx];
  const diaDoItem = item.dia;
  p.historicoLog.splice(idx, 1);

  if (item.tipo === "treino" && item.templateId && p.concluidosPorDia[diaDoItem]) {
    const i2 = p.concluidosPorDia[diaDoItem].indexOf(item.templateId);
    if (i2 >= 0) p.concluidosPorDia[diaDoItem].splice(i2, 1);
  }

  if (diaDoItem) {
    const aindaTemNesseDia = p.historicoLog.some(x => x.dia === diaDoItem);
    if (!aindaTemNesseDia) {
      const di = p.diasTreinados.indexOf(diaDoItem);
      if (di >= 0) p.diasTreinados.splice(di, 1);
    }
  }
}

// reabre um treino já concluído hoje, com confirmação — volta pro último
// exercício da ficha, saindo da lista de concluídos. Também remove o
// registro de conclusão de hoje do histórico: senão, ao concluir de novo,
// ficaria contando como um segundo treino separado (duplicado)
function reabrirTreino(t) {
  const p = currentProfile();
  const ok = window.confirm(`Reabrir "${t.nome}"? Isso remove o registro de conclusão de hoje desse treino do histórico — ele volta a valer só quando você concluir de novo.`);
  if (!ok) return;

  const dia = todayStr();
  const idxHist = p.historicoLog.findIndex(x => x.tipo === "treino" && x.templateId === t.id && x.dia === dia);
  if (idxHist >= 0) removerDoHistorico(p, idxHist);

  p.execucao = {
    templateId: t.id,
    exercicioIndex: Math.max(0, t.exercicios.length - 1),
    pesosPorExercicio: {},
    log: []
  };
  if (!p.hojeTemplateIds.includes(t.id)) p.hojeTemplateIds.push(t.id);
  showScreen("execucao");
  renderExecucao();
  renderHistorico();
  renderCalendario();
  saveProfile(state.perfilAtual);
}

function marcarDiaTreinado(dia) {
  const p = currentProfile();
  if (!p.diasTreinados.includes(dia)) p.diasTreinados.push(dia);
}

const HORA_FORMAT = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

// "dia" (AAAA-MM-DD) é guardado à parte pra permitir agrupar o histórico
// por dia/mês/ano e pra saber, se o item for excluído, se ainda sobra
// algo registrado naquele dia (pra não deixar o dia marcado como
// treinado incorretamente)
function registrarNoHistorico(entry) {
  const p = currentProfile();
  const agora = new Date();
  p.historicoLog.unshift({ ...entry, dia: dateStr(agora), quando: HORA_FORMAT.format(agora) });
}

/* =========================================================
   TELA "TREINOS"
   ========================================================= */

function renderTemplateList() {
  const list = document.getElementById("templateList");
  list.innerHTML = "";
  treinosDoPerfilAtual().forEach(t => {
    const card = document.createElement("article");
    card.className = "bg-card border border-hairline rounded-xl p-3 shadow-sm group hover:border-clay/30 transition-all";
    const diasTexto = (t.dias || []).length
      ? t.dias.slice().sort().map(d => WEEKDAY_LABELS[d]).join(" · ")
      : "Sem dia definido";
    card.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0 flex-1 cursor-pointer template-open">
          <span class="text-[9px] font-bold text-clay uppercase tracking-[0.15em]">${t.ficha}</span>
          <h3 class="text-base font-extrabold text-white uppercase tracking-tight truncate">${t.nome}</h3>
          <p class="text-[11px] text-muted mt-0.5">${t.exercicios.length} exercícios · ${diasTexto}</p>
        </div>
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <div class="template-open w-8 h-8 bg-paper rounded-lg flex items-center justify-center text-ink group-hover:bg-clay group-hover:text-white transition-all cursor-pointer">
            <i data-lucide="chevron-right" class="text-[11px]"></i>
          </div>
        </div>
      </div>
    `;
    card.querySelectorAll(".template-open").forEach(el => {
      el.addEventListener("click", () => openEditor(t.id));
    });
    list.appendChild(card);
  });
  refreshIcons();
}

/* =========================================================
   EDITOR DE EXERCÍCIOS DO TREINO
   ========================================================= */

let editorTemplateId = null;
let editorExpandedGroups = new Set();

function openEditor(templateId) {
  editorTemplateId = templateId;
  const t = treinosDoPerfilAtual().find(x => x.id === templateId);
  document.getElementById("editorFicha").textContent = t.ficha;
  const input = document.getElementById("editorTitleInput");
  input.value = t.nome;
  input.oninput = () => { t.nome = input.value; };
  renderEditorWeekdays();

  // categorias começam recolhidas — só abrem automaticamente aquelas que já
  // têm exercício incluído, pra facilitar ver o que já está montado na ficha
  editorExpandedGroups = new Set(
    GROUPS
      .filter(group => t.exercicios.some(cfg => EXERCISES[cfg.id]?.grupo === group.id))
      .map(group => group.id)
  );

  renderEditorList();
  showScreen("editor");
}

function renderEditorWeekdays() {
  const t = treinosDoPerfilAtual().find(x => x.id === editorTemplateId);
  const wrap = document.getElementById("editorWeekdays");
  wrap.innerHTML = "";
  WEEKDAY_LABELS.forEach((label, idx) => {
    const active = (t.dias || []).includes(idx);
    const btn = document.createElement("button");
    btn.className = `weekday-btn flex-1 py-2.5 rounded-lg border border-hairline text-xs font-bold transition-all ${active ? "active" : "bg-card text-ink"}`;
    btn.textContent = label;
    btn.title = WEEKDAY_FULL[idx];
    btn.addEventListener("click", () => {
      if (!t.dias) t.dias = [];
      const i = t.dias.indexOf(idx);
      if (i >= 0) t.dias.splice(i, 1);
      else t.dias.push(idx);
      renderEditorWeekdays();
    });
    wrap.appendChild(btn);
  });
}

function createNewTemplate() {
  const nextLetter = String.fromCharCode(65 + treinosDoPerfilAtual().length); // A, B, C, D...
  const novo = {
    id: "custom-" + Date.now(),
    nome: "Novo Treino",
    ficha: "Ficha " + nextLetter,
    tags: [],
    dias: [],
    exercicios: []
  };
  treinosDoPerfilAtual().push(novo);
  saveTemplate(state.perfilAtual, novo);
  openEditor(novo.id);
}
document.getElementById("createTemplateBtn").addEventListener("click", createNewTemplate);

function renderEditorList() {
  const t = treinosDoPerfilAtual().find(x => x.id === editorTemplateId);
  const list = document.getElementById("editorExerciseList");
  list.innerHTML = "";

  GROUPS.forEach(group => {
    const idsDoGrupo = Object.entries(EXERCISES).filter(([, ex]) => ex.grupo === group.id);
    if (idsDoGrupo.length === 0) return;

    const includedCount = idsDoGrupo.filter(([id]) => t.exercicios.some(e => e.id === id)).length;
    const expanded = editorExpandedGroups.has(group.id);

    // cabeçalho da categoria vira um botão de acordeão: recolhido por padrão,
    // mostra quantos exercícios já estão incluídos e some com os cards até
    // o usuário tocar pra expandir
    const header = document.createElement("button");
    header.type = "button";
    header.className = "w-full flex items-center justify-between gap-2 px-2 pt-4 pb-1 first:pt-0";
    header.innerHTML = `
      <span class="flex items-center gap-2">
        <span class="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">${group.nome}</span>
        ${includedCount > 0 ? `<span class="text-[9px] font-bold text-clay bg-claySoft/10 border border-clay/30 rounded-full px-2 py-0.5">${includedCount}</span>` : ""}
      </span>
      <i data-lucide="chevron-down" class="text-muted text-sm transition-transform ${expanded ? "rotate-180" : ""}"></i>
    `;
    header.addEventListener("click", () => {
      if (editorExpandedGroups.has(group.id)) editorExpandedGroups.delete(group.id);
      else editorExpandedGroups.add(group.id);
      renderEditorList();
    });
    list.appendChild(header);

    if (!expanded) return;

    idsDoGrupo.forEach(([id, ex]) => {
      const cfg = t.exercicios.find(e => e.id === id);
      const included = !!cfg;

      const wrap = document.createElement("div");
      wrap.className = "mb-2";

      const row = document.createElement("button");
      row.className = `w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all text-left ${
        included ? "border-clay bg-claySoft/10 rounded-b-none border-b-0" : "border-hairline bg-card"
      }`;
      const musclesText = [...ex.primary, ...ex.secondary].map(m => muscleLabels[m] || m).join(", ");
      row.innerHTML = `
        <div class="w-11 h-11 rounded-lg overflow-hidden bg-paper border border-hairline flex-shrink-0">
          <img src="${ex.imagem || ""}" alt="" class="w-full h-full object-cover">
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-extrabold uppercase tracking-tight truncate">${ex.nome}</p>
          <p class="text-[11px] text-muted truncate">${musclesText} · ${ex.equipamento}</p>
        </div>
        <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
          included ? "bg-clay text-white" : "border border-hairline text-transparent"
        }">
          <i data-lucide="check" class="text-[10px]"></i>
        </div>
      `;
      row.addEventListener("click", () => {
        const idx = t.exercicios.findIndex(e => e.id === id);
        if (idx >= 0) t.exercicios.splice(idx, 1);
        else t.exercicios.push(exCfg(id, 3, 10, 60));
        renderEditorList();
      });
      wrap.appendChild(row);

      // painel de séries / repetições / descanso — só aparece quando o
      // exercício está incluído na ficha
      if (included) {
        const panel = document.createElement("div");
        panel.className = "border border-t-0 border-clay bg-claySoft/10 rounded-b-xl px-3.5 py-3 flex flex-wrap items-center gap-x-5 gap-y-2";
        panel.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Séries</span>
            <button type="button" class="cfg-series-dir w-6 h-6 rounded-full bg-[#1C1C1E] border border-hairline text-white flex items-center justify-center text-xs" data-dir="-1">−</button>
            <span class="w-4 text-center text-sm font-extrabold text-white cfg-series-val">${cfg.series}</span>
            <button type="button" class="cfg-series-dir w-6 h-6 rounded-full bg-[#1C1C1E] border border-hairline text-white flex items-center justify-center text-xs" data-dir="1">+</button>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Reps</span>
            <input type="text" class="cfg-reps-input w-20 bg-[#1C1C1E] border border-hairline rounded-md px-2 py-1 text-center text-sm font-extrabold text-white outline-none focus:border-clay" value="${repsToInputValue(cfg.reps)}" placeholder="10 ou 12+10+8">
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Descanso</span>
            <button type="button" class="cfg-rest-dir w-6 h-6 rounded-full bg-[#1C1C1E] border border-hairline text-white flex items-center justify-center text-xs" data-dir="-1">−</button>
            <span class="w-9 text-center text-sm font-extrabold text-white cfg-rest-val">${cfg.descanso}s</span>
            <button type="button" class="cfg-rest-dir w-6 h-6 rounded-full bg-[#1C1C1E] border border-hairline text-white flex items-center justify-center text-xs" data-dir="1">+</button>
          </div>
        `;

        panel.querySelectorAll(".cfg-series-dir").forEach(b => {
          b.addEventListener("click", () => {
            const dir = parseInt(b.dataset.dir, 10);
            cfg.series = Math.max(1, cfg.series + dir);
            // se as reps já são customizadas por série, mantém o array do
            // mesmo tamanho que o número de séries
            if (Array.isArray(cfg.reps)) {
              const last = cfg.reps[cfg.reps.length - 1] ?? 10;
              while (cfg.reps.length < cfg.series) cfg.reps.push(last);
              while (cfg.reps.length > cfg.series) cfg.reps.pop();
            }
            renderEditorList();
          });
        });

        panel.querySelectorAll(".cfg-rest-dir").forEach(b => {
          b.addEventListener("click", () => {
            const dir = parseInt(b.dataset.dir, 10);
            cfg.descanso = Math.max(0, cfg.descanso + dir * 15);
            renderEditorList();
          });
        });

        const repsInput = panel.querySelector(".cfg-reps-input");
        repsInput.addEventListener("change", () => {
          cfg.reps = parseRepsInput(repsInput.value);
          if (Array.isArray(cfg.reps)) cfg.series = cfg.reps.length;
          renderEditorList();
        });

        wrap.appendChild(panel);
      }

      list.appendChild(wrap);
    });
  });
  refreshIcons();
}

document.getElementById("editorBackBtn").addEventListener("click", () => {
  const t = treinosDoPerfilAtual().find(x => x.id === editorTemplateId);
  if (t) saveTemplate(state.perfilAtual, t);
  renderTemplateList();
  renderHoje();
  showScreen("treinos");
});
document.getElementById("editorSaveBtn").addEventListener("click", () => {
  const t = treinosDoPerfilAtual().find(x => x.id === editorTemplateId);
  renderTemplateList();
  renderHoje();
  showToast("Treino salvo!");
  showScreen("treinos");
  saveTemplate(state.perfilAtual, t);
});
document.getElementById("editorDeleteBtn").addEventListener("click", () => {
  if (!confirm("Excluir esta ficha de treino?")) return;
  const idToDelete = editorTemplateId;
  const perfilDaFicha = state.perfilAtual;
  const idx = treinosDoPerfilAtual().findIndex(t => t.id === idToDelete);
  if (idx >= 0) treinosDoPerfilAtual().splice(idx, 1);
  renderTemplateList();
  renderHoje();
  showScreen("treinos");
  deleteTemplateRemote(perfilDaFicha, idToDelete);
});

/* =========================================================
   TELA "EXECUÇÃO"
   ========================================================= */

let highlighter = null;

function startExecution(templateId) {
  const cp = currentProfile();
  if (!cp.hojeTemplateIds.includes(templateId)) cp.hojeTemplateIds.push(templateId);
  cp.hojeTemplateDia = todayStr();
  // se já tem um treino dessa mesma ficha em andamento, retoma de onde parou;
  // só começa do zero se for uma ficha diferente ou não houver nada rolando
  if (!currentProfile().execucao || currentProfile().execucao.templateId !== templateId) {
    currentProfile().execucao = {
      templateId,
      exercicioIndex: 0,
      pesosPorExercicio: {}, // { [exercicioIndex]: [pesoSerie1, pesoSerie2, ...] }
      log: [] // registra as cargas de cada exercício conforme vai concluindo
    };
  }
  showScreen("execucao");
  renderExecucao();
  saveProfile(state.perfilAtual);
}

function currentTemplate() {
  return treinosDoPerfilAtual().find(t => t.id === currentProfile().execucao.templateId);
}
function currentExercicioCfg() {
  return currentTemplate().exercicios[currentProfile().execucao.exercicioIndex];
}
function currentExercise() {
  const cfg = currentExercicioCfg();
  return { id: cfg.id, ...EXERCISES[cfg.id] };
}

// pesos digitados por série do exercício atual (guarda um array por índice
// de exercício, pra não perder o que já foi digitado ao voltar/avançar)
function getPesosArray(ec, cfg, exercicioIndex) {
  if (!ec.pesosPorExercicio) ec.pesosPorExercicio = {};
  const antigo = ec.pesosPorExercicio[exercicioIndex] || [];
  if (antigo.length !== cfg.series) {
    const arr = [];
    for (let i = 0; i < cfg.series; i++) arr.push(antigo[i] ?? null);
    ec.pesosPorExercicio[exercicioIndex] = arr;
  }
  return ec.pesosPorExercicio[exercicioIndex];
}

// enquanto uma carga já preenchida está sendo re-editada (clicou em cima do
// número), ela some da lista, e volta a virar campo de digitar
let execEditingSeries = new Set();

function renderExecucao() {
  const t = currentTemplate();
  const ex = currentExercise();
  const ec = currentProfile().execucao;
  const isLast = ec.exercicioIndex === t.exercicios.length - 1;

  document.getElementById("execIndex").textContent = `${ec.exercicioIndex + 1} / ${t.exercicios.length}`;
  document.getElementById("execProgressBar").style.width = `${((ec.exercicioIndex) / t.exercicios.length) * 100}%`;
  document.getElementById("execName").textContent = ex.nome;

  const focusText = [...ex.primary, ...ex.secondary].map(m => muscleLabels[m] || m).join(", ");
  document.getElementById("execFocus").textContent = focusText || "—";

  const grupo = GROUPS.find(g => g.id === ex.grupo);
  document.getElementById("execGroupTag").textContent = grupo ? grupo.nome : "";

  const img = document.getElementById("execImage");
  img.src = ex.imagem || "";
  img.alt = ex.nome;

  document.getElementById("mainExecBtnLabel").textContent = isLast ? "Concluir Treino" : "Próximo";
  document.getElementById("prevExBtn").disabled = ec.exercicioIndex === 0;

  execEditingSeries = new Set();
  renderExecSeries();
  renderMuscleModel(ex);
  refreshIcons();
}

function renderExecSeries() {
  const t = currentTemplate();
  const ex = currentExercise();
  const cfg = currentExercicioCfg();
  const ec = currentProfile().execucao;
  const pesos = getPesosArray(ec, cfg, ec.exercicioIndex);
  const grupo = GROUPS.find(g => g.id === ex.grupo);

  const container = document.getElementById("execSeriesCard");
  container.innerHTML = `
    <div class="grid grid-cols-3 divide-x divide-hairline text-center mb-2.5">
      <div class="px-1">
        <i data-lucide="target" class="text-clay mx-auto mb-0.5" style="width:15px;height:15px;"></i>
        <p class="text-[8px] font-bold text-gray-500 uppercase tracking-wide">Meta</p>
        <p class="text-xs font-extrabold text-white leading-tight">${repsResumo(cfg.series, cfg.reps)}</p>
      </div>
      <div class="px-1">
        <i data-lucide="clock" class="text-clay mx-auto mb-0.5" style="width:15px;height:15px;"></i>
        <p class="text-[8px] font-bold text-gray-500 uppercase tracking-wide">Descanso</p>
        <p class="text-xs font-extrabold text-white leading-tight">${cfg.descanso}s</p>
      </div>
      <div class="px-1">
        <i data-lucide="dumbbell" class="text-clay mx-auto mb-0.5" style="width:15px;height:15px;"></i>
        <p class="text-[8px] font-bold text-gray-500 uppercase tracking-wide">Foco</p>
        <p class="text-xs font-extrabold text-white leading-tight truncate">${grupo ? grupo.nome : "—"}</p>
      </div>
    </div>
    <div class="h-px bg-hairline mb-2.5"></div>
    <div class="flex items-center gap-1.5 mb-1.5">
      <i data-lucide="weight" class="text-clay" style="width:12px;height:12px;"></i>
      <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Carga (kg)</span>
    </div>
    <div class="grid gap-1.5" style="grid-template-columns: repeat(${Math.min(pesos.length, 6)}, minmax(0, 1fr));">
      ${pesos.map((peso, i) => {
        const mostrarInput = peso == null || execEditingSeries.has(i);
        return mostrarInput
          ? `<input type="number" inputmode="decimal" step="0.5" class="serie-peso-input w-full bg-[#1C1C1E] border border-hairline rounded-xl py-2 text-center text-white font-bold outline-none focus:border-clay" placeholder="Ex.: 40" value="${peso != null ? peso : ""}" data-idx="${i}">`
          : `<button type="button" class="serie-peso-display w-full bg-[#1C1C1E] border border-clay rounded-xl py-2 text-center active:scale-[0.97] transition-all flex items-center justify-center gap-1" data-idx="${i}">
               <i data-lucide="check" class="text-clay" style="width:11px;height:11px;"></i>
               <span class="text-sm font-extrabold text-white">${peso}</span><span class="text-[10px] text-gray-500">kg</span>
             </button>`;
      }).join("")}
    </div>
  `;

  container.querySelectorAll(".serie-peso-input").forEach(input => {
    if (execEditingSeries.has(parseInt(input.dataset.idx, 10))) input.focus();
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") input.blur(); });
    input.addEventListener("blur", () => {
      const i = parseInt(input.dataset.idx, 10);
      const val = parseFloat(input.value.replace(",", "."));
      pesos[i] = (!isNaN(val) && val >= 0) ? val : null;
      execEditingSeries.delete(i);
      renderExecSeries();
      saveProfileDebounced(state.perfilAtual);
    });
  });
  container.querySelectorAll(".serie-peso-display").forEach(btn => {
    btn.addEventListener("click", () => {
      execEditingSeries.add(parseInt(btn.dataset.idx, 10));
      renderExecSeries();
    });
  });

  refreshIcons();
}

function renderMuscleModel(ex) {
  const container = document.getElementById("execModel");
  if (highlighter) highlighter.destroy();
  container.innerHTML = "";

  const hasBack = ex.primary.some(m => backMuscles.includes(m));
  const data = [
    { name: ex.nome + " (principal)", muscles: ex.primary, frequency: 2 },
    { name: ex.nome + " (secundário)", muscles: ex.secondary, frequency: 1 }
  ];

  highlighter = createBodyHighlighter({
    container,
    data,
    type: hasBack ? "posterior" : "anterior",
    bodyColor: "#3A3A3D",
    highlightedColors: ["#E2896F", "#C9482F"],
    style: { width: "100%", height: "100%" }
  });

  // a lib gera um SVG com proporção retangular (corpo inteiro); sem isso,
  // ele "vaza" pra fora do quadradinho de 40x40 e invade a foto acima.
  // Escalamos o SVG pra caber inteiro dentro do container, sem cortar nem vazar.
  requestAnimationFrame(() => {
    const svg = container.querySelector("svg");
    if (!svg) return;
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.display = "block";
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");

    // "zoom" na região destacada: em vez de mostrar o corpo inteiro minúsculo,
    // recorta o viewBox pra região que está colorida (o músculo trabalhado),
    // deixando ela bem maior e mais visível dentro do quadradinho.
    //
    // OBS: a lib pinta os músculos via style.fill (inline), não via atributo
    // fill — por isso não dá pra usar seletor [fill="..."]. Em vez de comparar
    // strings de cor (que o navegador pode normalizar pra rgb()), comparamos
    // a cor computada de cada forma com a cor computada do "bodyColor" (cor
    // neutra dos músculos não trabalhados): tudo que for diferente disso é
    // músculo destacado.
    try {
      const probe = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      probe.style.fill = "#3A3A3D"; // precisa bater com o bodyColor passado acima
      svg.appendChild(probe);
      const neutralFill = getComputedStyle(probe).fill;
      probe.remove();

      const shapes = svg.querySelectorAll("polygon, path, circle, ellipse, rect");
      const highlighted = Array.from(shapes).filter(el => {
        const fill = getComputedStyle(el).fill;
        return fill && fill !== "none" && fill !== neutralFill;
      });

      if (highlighted.length > 0) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        highlighted.forEach(el => {
          const b = el.getBBox();
          minX = Math.min(minX, b.x);
          minY = Math.min(minY, b.y);
          maxX = Math.max(maxX, b.x + b.width);
          maxY = Math.max(maxY, b.y + b.height);
        });
        const bw = maxX - minX;
        const bh = maxY - minY;
        // padding maior = zoom mais suave; menor = zoom mais forte
        const padX = bw * 0.75;
        const padY = bh * 0.55;
        svg.setAttribute("viewBox", `${minX - padX} ${minY - padY} ${bw + padX * 2} ${bh + padY * 2}`);
      }
    } catch (e) {
      // se o navegador não suportar getBBox/getComputedStyle por algum motivo, mantém o corpo inteiro
    }
  });
}

document.querySelectorAll(".stepper").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    const dir = parseInt(btn.dataset.dir, 10);
    if (target === "cardioMin") {
      const el = document.getElementById("cardioMinValue");
      el.textContent = Math.max(0, parseInt(el.textContent, 10) + dir * 5);
      syncCardioPresetActive();
    }
  });
});

// mantém o preset (15/30/60) destacado só enquanto o valor bater com ele —
// se o usuário mexer no +/- e sair desses valores, nenhum preset fica marcado
function syncCardioPresetActive() {
  const atual = document.getElementById("cardioMinValue").textContent;
  document.querySelectorAll(".cardio-preset").forEach(b => {
    b.classList.toggle("active", b.dataset.min === atual);
  });
}

document.getElementById("prevExBtn").addEventListener("click", () => {
  const ec = currentProfile().execucao;
  if (ec.exercicioIndex > 0) {
    ec.exercicioIndex--;
    renderExecucao();
    saveProfile(state.perfilAtual);
  }
});

document.getElementById("mainExecBtn").addEventListener("click", () => {
  const ec = currentProfile().execucao;
  if (!ec) return; // segurança: evita clique duplicado depois de já ter concluído
  const t = currentTemplate();
  const ex = currentExercise();
  const cfg = currentExercicioCfg();
  const isLast = ec.exercicioIndex === t.exercicios.length - 1;

  // guarda as cargas de cada série deste exercício antes de avançar
  const pesos = getPesosArray(ec, cfg, ec.exercicioIndex);
  ec.log.push({ nome: ex.nome, series: cfg.series, reps: cfg.reps, pesos: pesos.slice() });

  if (!isLast) {
    ec.exercicioIndex++;
    renderExecucao();
    saveProfile(state.perfilAtual);
    return;
  }

  const p = currentProfile();
  const dia = todayStr();
  if (!p.concluidosPorDia[dia]) p.concluidosPorDia[dia] = [];
  if (!p.concluidosPorDia[dia].includes(t.id)) p.concluidosPorDia[dia].push(t.id);
  registrarNoHistorico({
    tipo: "treino",
    nome: t.nome,
    ficha: t.ficha,
    templateId: t.id,
    detalhe: `${t.exercicios.length} exercícios`,
    exercicios: ec.log
  });
  marcarDiaTreinado(dia);
  currentProfile().execucao = null;
  renderHoje();
  renderCalendario();
  renderHistorico();
  showToast("Treino concluído!");
  showScreen("hoje");
  saveProfile(state.perfilAtual);
});

document.getElementById("execCloseBtn").addEventListener("click", () => {
  renderTodayWorkout();
  showScreen("hoje");
});

/* =========================================================
   TELA "CARDIO"
   ========================================================= */

document.querySelectorAll(".cardio-type-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    state.cardioTipo = btn.dataset.type;
    document.querySelectorAll(".cardio-type-btn").forEach(b => {
      const isActive = b === btn;
      // usa "i, svg" porque o lucide já trocou os <i data-lucide> originais
      // por <svg> assim que a tela carregou — buscar só "i" não encontrava
      // mais nada e a cor do ícone nunca era atualizada
      const icon = b.querySelector("i, svg");
      const label = b.querySelector("span");
      b.classList.toggle("border-2", isActive);
      b.classList.toggle("border-clay", isActive);
      b.classList.toggle("border", !isActive);
      b.classList.toggle("border-hairline", !isActive);
      // o hover sutil só faz sentido no botão ainda não selecionado — no
      // selecionado ele brigava com a borda sólida e "piscava" ao tocar,
      // dando a impressão de que a cor certa só "voltava" quando o dedo/
      // mouse saía do botão. Normaliza isso em todos os botões a cada clique.
      b.classList.toggle("hover:border-clay/30", !isActive);
      if (icon) {
        icon.classList.toggle("text-clay", isActive);
        icon.classList.toggle("text-muted", !isActive);
      }
      if (label) {
        label.classList.toggle("text-ink", isActive);
        label.classList.toggle("text-muted", !isActive);
      }
    });
  });
});

document.querySelectorAll(".cardio-preset").forEach(btn => {
  btn.addEventListener("click", () => {
    document.getElementById("cardioMinValue").textContent = btn.dataset.min;
    syncCardioPresetActive();
  });
});

document.querySelectorAll(".intensity-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    state.cardioIntensidade = btn.dataset.intensity;
    document.querySelectorAll(".intensity-btn").forEach(b => {
      const isActive = b === btn;
      b.classList.toggle("bg-paper", isActive);
      b.classList.toggle("text-ink", isActive);
      b.classList.toggle("text-muted", !isActive);
      // mesma correção do card de tipo de cardio: só o botão não-selecionado
      // deve ter o hover, senão a cor "briga" com o estado ativo ao tocar
      b.classList.toggle("hover:text-ink", !isActive);
    });
  });
});

document.getElementById("confirmCardioBtn").addEventListener("click", () => {
  const p = currentProfile();
  const minutos = document.getElementById("cardioMinValue").textContent;
  const cardioLabels = { esteira: "Esteira", bike: "Bike", eliptico: "Elíptico", escada: "Escada" };
  const intensidadeLabels = { leve: "Leve", moderado: "Moderado", forte: "Forte" };
  const dia = todayStr();
  p.cardioLog.push({ tipo: state.cardioTipo, minutos, intensidade: state.cardioIntensidade, dia });
  registrarNoHistorico({
    tipo: "cardio",
    nome: cardioLabels[state.cardioTipo] || "Cardio",
    detalhe: `${minutos} min · ${intensidadeLabels[state.cardioIntensidade] || ""}`
  });
  marcarDiaTreinado(dia);
  renderHoje();
  renderCalendario();
  renderHistorico();
  showToast("Cardio salvo!");
  showScreen("hoje");
  saveProfile(state.perfilAtual);
});

/* =========================================================
   TELA "CALENDÁRIO"
   ========================================================= */

const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

document.getElementById("calPrevBtn").addEventListener("click", () => {
  state.calMonth--;
  if (state.calMonth < 0) { state.calMonth = 11; state.calYear--; }
  state.calSelectedDay = null;
  document.getElementById("dayDetailWrap").style.display = "none";
  renderCalendario();
});
document.getElementById("calNextBtn").addEventListener("click", () => {
  state.calMonth++;
  if (state.calMonth > 11) { state.calMonth = 0; state.calYear++; }
  state.calSelectedDay = null;
  document.getElementById("dayDetailWrap").style.display = "none";
  renderCalendario();
});

function renderCalendario() {
  const p = currentProfile();
  document.getElementById("calMonthLabel").textContent = `${MONTH_NAMES[state.calMonth]} ${state.calYear}`;

  const grid = document.getElementById("calGrid");
  grid.innerHTML = "";

  const firstDay = new Date(state.calYear, state.calMonth, 1).getDay();
  const daysInMonth = new Date(state.calYear, state.calMonth + 1, 0).getDate();
  const hojeKey = todayStr();

  for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement("span"));

  for (let day = 1; day <= daysInMonth; day++) {
    const diaKey = `${state.calYear}-${pad2(state.calMonth + 1)}-${pad2(day)}`;
    const trained = p.diasTreinados.includes(diaKey);
    const isToday = diaKey === hojeKey;
    const isSelected = state.calSelectedDay === day;

    const cell = document.createElement("button");
    cell.textContent = day;
    cell.className = "cal-day text-center py-3 text-xs font-medium rounded-full relative transition-all " +
      (isSelected ? "bg-[#1C1C1E] border border-clay text-white scale-110 shadow-lg shadow-black/40" :
       isToday ? "font-bold bg-clay text-white shadow-lg shadow-clay/20" :
       trained ? "bg-clay/5 text-clay" : "text-ink hover:bg-hairline/40");
    if (trained && !isSelected) {
      cell.innerHTML += `<div class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 ${isToday ? "bg-white" : "bg-clay"} rounded-full"></div>`;
    }
    cell.addEventListener("click", () => showDayDetail(diaKey, day));
    grid.appendChild(cell);
  }
}

function showDayDetail(diaKey, day) {
  state.calSelectedDay = day;
  renderCalendario();

  const p = currentProfile();
  const entradas = p.historicoLog.filter(item => item.dia === diaKey);

  const wrap = document.getElementById("dayDetailWrap");
  wrap.style.display = "block";
  document.getElementById("dayDetailTitle").textContent = `${day} de ${MONTH_NAMES[state.calMonth]}`;

  const badge = document.getElementById("dayDetailBadge");
  if (entradas.length > 0) {
    badge.style.display = "";
    document.getElementById("dayDetailName").textContent = entradas.map(e => e.nome).join(" · ");
    document.getElementById("dayDetailMeta").textContent = entradas.map(e => e.detalhe || "").filter(Boolean).join(" · ");
  } else {
    badge.style.display = "none";
    document.getElementById("dayDetailName").textContent = "Nenhuma atividade";
    document.getElementById("dayDetailMeta").textContent = "Não há treino registrado neste dia.";
  }

  wrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* =========================================================
   TELA "HISTÓRICO"
   ========================================================= */

// texto do cabeçalho de cada grupo de dia no histórico ("Hoje", "Ontem" ou
// "19 de agosto de 2026")
function formatGroupLabel(diaKey) {
  if (!diaKey) return "Sem data";
  const hoje = todayStr();
  const ontem = dateStr(new Date(Date.now() - 86400000));
  if (diaKey === hoje) return "Hoje";
  if (diaKey === ontem) return "Ontem";
  const [ano, mes, dia] = diaKey.split("-").map(Number);
  return `${dia} de ${MONTH_NAMES[mes - 1]} de ${ano}`;
}

function renderHistorico() {
  const p = currentProfile();
  const list = document.getElementById("historicoList");

  if (p.historicoLog.length === 0) {
    list.innerHTML = `
      <div class="text-center py-12">
        <p class="text-sm text-muted">Nenhum treino ou cardio registrado ainda.</p>
        <p class="text-xs text-muted mt-1">Tudo que você concluir vai aparecer aqui.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = "";
  let ultimoDia = undefined;
  p.historicoLog.forEach((item, idx) => {
    // a lista já vem ordenada do mais recente pro mais antigo (unshift ao
    // registrar), então basta um novo cabeçalho toda vez que o dia muda
    if (item.dia !== ultimoDia) {
      ultimoDia = item.dia;
      const header = document.createElement("p");
      header.className = "text-[10px] font-bold text-muted uppercase tracking-[0.2em] px-1 pt-2 first:pt-0";
      header.textContent = formatGroupLabel(item.dia);
      list.appendChild(header);
    }

    const temExercicios = item.tipo === "treino" && item.exercicios && item.exercicios.length > 0;
    const card = document.createElement("div");
    card.className = "bg-card border border-hairline rounded-xl overflow-hidden";

    const header = document.createElement("div");
    header.className = "w-full p-3.5 flex items-center gap-3";
    header.innerHTML = `
      <button class="historico-toggle flex items-center gap-3 min-w-0 flex-1 text-left">
        <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          item.tipo === "treino" ? "bg-claySoft/20 text-clay" : "bg-emerald/10 text-emerald"
        }">
          <i data-lucide="${item.tipo === "treino" ? "dumbbell" : "footprints"}" class="text-xs"></i>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-extrabold uppercase tracking-tight truncate">${item.nome}</p>
          <p class="text-[11px] text-muted truncate">${item.detalhe || ""}</p>
        </div>
      </button>
      <span class="text-[10px] text-muted flex-shrink-0">${item.quando}</span>
      ${temExercicios ? '<i data-lucide="chevron-down" class="text-[10px] text-muted flex-shrink-0 chevron-icon transition-transform"></i>' : ""}
      <button class="historico-delete w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-clay hover:bg-claySoft/10 transition-all flex-shrink-0">
        <i data-lucide="trash-2" class="text-xs"></i>
      </button>
    `;
    card.appendChild(header);

    if (temExercicios) {
      const details = document.createElement("div");
      details.className = "hidden border-t border-hairline divide-y divide-hairline";
      details.innerHTML = item.exercicios.map(e => {
        const pesosTexto = (e.pesos && e.pesos.length)
          ? e.pesos.map(p => p != null ? `${p}kg` : "—").join(" · ")
          : "—";
        return `
        <div class="flex items-center justify-between px-4 py-2.5 gap-3">
          <span class="text-xs font-medium truncate">${e.nome}</span>
          <span class="text-xs text-muted text-right flex-shrink-0">${repsResumo(e.series, e.reps)}<br>${pesosTexto}</span>
        </div>
      `;
      }).join("");
      card.appendChild(details);

      header.querySelector(".historico-toggle").addEventListener("click", () => {
        details.classList.toggle("hidden");
        header.querySelector(".chevron-icon").classList.toggle("rotate-180");
      });
    }

    header.querySelector(".historico-delete").addEventListener("click", (e) => {
      e.stopPropagation();
      if (!confirm(`Excluir "${item.nome}" do histórico?`)) return;

      removerDoHistorico(p, idx);

      renderHistorico();
      renderHoje();
      renderCalendario();
      saveProfile(state.perfilAtual);
    });

    list.appendChild(card);
  });
  refreshIcons();
}

/* =========================================================
   RENDER GERAL
   ========================================================= */

function renderAll() {
  renderProfileToggles();
  renderHoje();
  renderTemplateList();
  renderHistorico();
  renderCalendario();
}

/* =========================================================
   LOGIN — senha única do app (Firebase Auth por baixo dos panos,
   com e-mail interno fixo que o usuário nunca vê)
   ========================================================= */

function showLoginScreen() {
  document.getElementById("appLoader").style.display = "none";
  const login = document.getElementById("loginScreen");
  login.style.display = "flex";
  document.getElementById("loginPassword").value = "";
  document.getElementById("loginError").classList.add("hidden");
  document.getElementById("loginPassword").focus();
  if (window.lucide) window.lucide.createIcons();
}

function hideLoginScreen() {
  document.getElementById("loginScreen").style.display = "none";
}

document.getElementById("togglePasswordBtn").addEventListener("click", () => {
  const input = document.getElementById("loginPassword");
  const icon = document.querySelector("#togglePasswordBtn i");
  const showing = input.type === "text";
  input.type = showing ? "password" : "text";
  icon.setAttribute("data-lucide", showing ? "eye" : "eye-off");
  if (window.lucide) lucide.createIcons();
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("loginSubmitBtn");
  const pass = document.getElementById("loginPassword").value;
  if (!pass) return;
  btn.disabled = true;
  btn.textContent = "Entrando...";
  try {
    await signInWithEmailAndPassword(auth, APP_LOGIN_EMAIL, pass);
    // o resto (carregar dados e mostrar o app) acontece no onAuthStateChanged
  } catch (err) {
    document.getElementById("loginError").classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.textContent = "Entrar";
  }
});

document.querySelectorAll(".logout-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (confirm("Sair do app?")) signOut(auth);
  });
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    hideLoginScreen();
    document.getElementById("appLoader").style.display = "flex";
    await carregarDadosIniciais();
    renderAll();
    document.getElementById("appLoader").style.display = "none";
  } else {
    showLoginScreen();
  }
});
