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

const TEMPLATES = [
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

const PROFILES = {
  voce: {
    nome: "Você",
    streak: 0,
    diasTreinados: [],
    cardioLog: [],
    historicoLog: [],
    concluidosHoje: [],
    hojeTemplateId: null, // qual ficha (A/B/C) esse perfil escolheu como treino de hoje
    execucao: null // treino em andamento desse perfil (independente do outro perfil)
  },
  parceira: {
    nome: "Sua parceira",
    streak: 0,
    diasTreinados: [],
    cardioLog: [],
    historicoLog: [],
    concluidosHoje: [],
    hojeTemplateId: null,
    execucao: null
  }
};

const HOJE_DIA = 16; // dia fake usado como "hoje" nos dados de exemplo

/* =========================================================
   FIRESTORE — perfis (voce/parceira) ficam em profiles/{id},
   fichas de treino ficam em templates/{id}
   ========================================================= */

import { db } from './firebase-config.js';
import {
  doc, getDoc, setDoc, getDocs, deleteDoc, collection, writeBatch
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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
async function saveTemplate(t) {
  try {
    await setDoc(doc(db, "templates", t.id), t);
  } catch (err) {
    console.error("Não foi possível salvar a ficha no Firestore:", err);
    showToast("Sem conexão — treino não foi salvo");
  }
}

async function deleteTemplateRemote(id) {
  try {
    await deleteDoc(doc(db, "templates", id));
  } catch (err) {
    console.error("Não foi possível excluir a ficha no Firestore:", err);
  }
}

// roda uma única vez, no carregamento do app: busca tudo que já existe no
// Firestore. Se for a primeira vez (banco vazio), semeia com os dados
// padrão acima para não começar com o app em branco.
async function carregarDadosIniciais() {
  try {
    const templatesSnap = await getDocs(collection(db, "templates"));
    if (templatesSnap.empty) {
      const batch = writeBatch(db);
      TEMPLATES.forEach(t => batch.set(doc(db, "templates", t.id), t));
      await batch.commit();
    } else {
      TEMPLATES.length = 0;
      templatesSnap.forEach(docSnap => TEMPLATES.push(docSnap.data()));
    }

    for (const profileId of Object.keys(PROFILES)) {
      const ref = doc(db, "profiles", profileId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        Object.assign(PROFILES[profileId], snap.data());
      } else {
        await setDoc(ref, PROFILES[profileId]);
      }
    }
  } catch (err) {
    console.error("Não foi possível conectar ao Firestore — usando dados padrão localmente:", err);
    showToast("Sem conexão com o banco — usando dados locais");
  }
}

/* =========================================================
   ESTADO
   ========================================================= */

let state = {
  perfilAtual: "voce",
  calMonth: 7, // agosto = index 7 (0-based)
  calYear: 2026,
  calSelectedDay: null,
  cardioTipo: "esteira",
  cardioIntensidade: "leve"
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
  btn.addEventListener("click", () => showScreen(btn.dataset.nav));
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
  renderAll();
});

/* =========================================================
   TELA "HOJE"
   ========================================================= */

function renderHoje() {
  const p = currentProfile();
  document.getElementById("streakCount").textContent = p.streak;

  const strip = document.getElementById("weekStrip");
  strip.innerHTML = "";
  // semana fixa de segunda a domingo (não é "últimos 7 dias" rolando — ela
  // reinicia toda segunda-feira, ancorada no dia de hoje)
  const hojeWeekday = HOJE_DIA % 7; // 0=Dom, 1=Seg, ... 6=Sáb
  const diasDesdeSegunda = (hojeWeekday + 6) % 7; // Seg=0, Ter=1, ... Dom=6
  const segundaDia = HOJE_DIA - diasDesdeSegunda;
  for (let offset = 0; offset <= 6; offset++) {
    const dayNum = segundaDia + offset;
    const trained = p.diasTreinados.includes(dayNum);
    const isToday = dayNum === HOJE_DIA;
    const highlight = trained || isToday;
    const el = document.createElement("div");
    el.className = "flex flex-col items-center gap-2";
    el.innerHTML = `
      <span class="text-[10px] font-bold uppercase ${isToday ? "text-clay" : "text-gray-500"}">${WEEKDAY_LABELS[dayNum % 7]}</span>
      <div class="weekday-pill ${highlight ? "trained" : ""} rounded-full flex items-start justify-center pt-1.5 transition-all" style="width:32px;height:${isToday ? "72px" : "58px"};">
        <div class="rounded-full flex-shrink-0" style="width:18px;height:18px;background:${highlight ? "#fff" : "#3A3A3C"};"></div>
      </div>
    `;
    strip.appendChild(el);
  }

  renderTodayWorkout();
}

function renderTodayWorkout() {
  const p = currentProfile();
  const container = document.getElementById("todayWorkoutCard");

  // ainda não escolheu qual ficha é o treino de hoje: mostra o seletor
  if (!p.hojeTemplateId) {
    container.innerHTML = `<div class="flex flex-col gap-3" id="hojeTemplatePicker"></div>`;
    const picker = document.getElementById("hojeTemplatePicker");
    TEMPLATES.forEach((t, idx) => {
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
        p.hojeTemplateId = t.id;
        renderTodayWorkout();
        saveProfile(state.perfilAtual);
      });
      picker.appendChild(btn);
    });
    refreshIcons();
    return;
  }

  const t = TEMPLATES.find(x => x.id === p.hojeTemplateId);

  // a ficha escolhida foi excluída no editor: volta pro seletor
  if (!t) {
    p.hojeTemplateId = null;
    renderTodayWorkout();
    return;
  }

  const concluido = p.concluidosHoje.includes(t.id);
  const emAndamento = p.execucao && p.execucao.templateId === t.id;

  if (concluido) {
    container.innerHTML = `
      <button id="reabrirTreinoBtn" class="w-full rounded-2xl p-4 flex items-center gap-3 text-left transition-all active:scale-[0.98]" style="background:#101913;border:1px solid #234032;">
        <div class="w-9 h-9 bg-emerald rounded-full flex items-center justify-center text-white flex-shrink-0">
          <i data-lucide="check" class="text-xs"></i>
        </div>
        <div class="min-w-0 flex-1">
          <span class="text-[10px] font-bold text-emerald uppercase tracking-[0.15em]">${t.ficha} · Concluído</span>
          <h3 class="text-base font-extrabold text-white truncate">${t.nome}</h3>
        </div>
        <i data-lucide="rotate-ccw" class="text-emerald text-sm flex-shrink-0"></i>
      </button>
      <button id="trocarTreinoBtn" class="mt-3 text-xs font-bold text-clay uppercase tracking-widest">Escolher outro treino</button>
    `;
    document.getElementById("reabrirTreinoBtn").addEventListener("click", () => reabrirTreino(t));
    document.getElementById("trocarTreinoBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      p.hojeTemplateId = null;
      renderTodayWorkout();
      saveProfile(state.perfilAtual);
    });
    refreshIcons();
    return;
  }

  container.innerHTML = `
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
      <button id="trocarTreinoBtn" class="mt-2 w-full text-xs font-bold text-gray-500 uppercase tracking-widest py-1">Escolher outro treino</button>
    </div>
  `;

  container.querySelector(".start-today-btn").addEventListener("click", () => startExecution(t.id));
  document.getElementById("trocarTreinoBtn").addEventListener("click", () => {
    p.hojeTemplateId = null;
    renderTodayWorkout();
    saveProfile(state.perfilAtual);
  });
  refreshIcons();
}

// reabre um treino já concluído hoje, com confirmação — volta pro último
// exercício da ficha, saindo da lista de concluídos
function reabrirTreino(t) {
  const p = currentProfile();
  const ok = window.confirm(`Reabrir "${t.nome}"? Ele vai sair da lista de treinos concluídos de hoje.`);
  if (!ok) return;
  const idx = p.concluidosHoje.indexOf(t.id);
  if (idx >= 0) p.concluidosHoje.splice(idx, 1);
  p.execucao = {
    templateId: t.id,
    exercicioIndex: Math.max(0, t.exercicios.length - 1),
    weight: 40,
    reps: 10,
    log: []
  };
  p.hojeTemplateId = t.id;
  showScreen("execucao");
  renderExecucao();
  saveProfile(state.perfilAtual);
}

function marcarDiaTreinado() {
  const p = currentProfile();
  if (!p.diasTreinados.includes(HOJE_DIA)) {
    p.diasTreinados.push(HOJE_DIA);
    p.streak++;
  }
}

const DATA_HORA_FORMAT = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function registrarNoHistorico(entry) {
  const p = currentProfile();
  p.historicoLog.unshift({ ...entry, quando: DATA_HORA_FORMAT.format(new Date()) });
}

/* =========================================================
   TELA "TREINOS"
   ========================================================= */

function renderTemplateList() {
  const list = document.getElementById("templateList");
  list.innerHTML = "";
  TEMPLATES.forEach(t => {
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

function openEditor(templateId) {
  editorTemplateId = templateId;
  const t = TEMPLATES.find(x => x.id === templateId);
  document.getElementById("editorFicha").textContent = t.ficha;
  const input = document.getElementById("editorTitleInput");
  input.value = t.nome;
  input.oninput = () => { t.nome = input.value; };
  renderEditorWeekdays();
  renderEditorList();
  showScreen("editor");
}

function renderEditorWeekdays() {
  const t = TEMPLATES.find(x => x.id === editorTemplateId);
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
  const nextLetter = String.fromCharCode(65 + TEMPLATES.length); // A, B, C, D...
  const novo = {
    id: "custom-" + Date.now(),
    nome: "Novo Treino",
    ficha: "Ficha " + nextLetter,
    tags: [],
    dias: [],
    exercicios: []
  };
  TEMPLATES.push(novo);
  saveTemplate(novo);
  openEditor(novo.id);
}
document.getElementById("createTemplateBtn").addEventListener("click", createNewTemplate);

function renderEditorList() {
  const t = TEMPLATES.find(x => x.id === editorTemplateId);
  const list = document.getElementById("editorExerciseList");
  list.innerHTML = "";

  GROUPS.forEach(group => {
    const idsDoGrupo = Object.entries(EXERCISES).filter(([, ex]) => ex.grupo === group.id);
    if (idsDoGrupo.length === 0) return;

    const header = document.createElement("p");
    header.className = "text-[10px] font-bold text-muted uppercase tracking-[0.2em] px-2 pt-4 pb-1 first:pt-0";
    header.textContent = group.nome;
    list.appendChild(header);

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

document.getElementById("editorBackBtn").addEventListener("click", () => showScreen("treinos"));
document.getElementById("editorSaveBtn").addEventListener("click", () => {
  const t = TEMPLATES.find(x => x.id === editorTemplateId);
  renderTemplateList();
  renderHoje();
  showToast("Treino salvo!");
  showScreen("treinos");
  saveTemplate(t);
});
document.getElementById("editorDeleteBtn").addEventListener("click", () => {
  if (!confirm("Excluir esta ficha de treino?")) return;
  const idToDelete = editorTemplateId;
  const idx = TEMPLATES.findIndex(t => t.id === idToDelete);
  if (idx >= 0) TEMPLATES.splice(idx, 1);
  renderTemplateList();
  renderHoje();
  showScreen("treinos");
  deleteTemplateRemote(idToDelete);
});

/* =========================================================
   TELA "EXECUÇÃO"
   ========================================================= */

let highlighter = null;

function startExecution(templateId) {
  currentProfile().hojeTemplateId = templateId;
  // se já tem um treino dessa mesma ficha em andamento, retoma de onde parou;
  // só começa do zero se for uma ficha diferente ou não houver nada rolando
  if (!currentProfile().execucao || currentProfile().execucao.templateId !== templateId) {
    currentProfile().execucao = {
      templateId,
      exercicioIndex: 0,
      weight: 40,
      reps: 10,
      log: [] // registra peso/reps de cada exercício conforme vai concluindo
    };
  }
  showScreen("execucao");
  renderExecucao();
  saveProfile(state.perfilAtual);
}

function currentTemplate() {
  return TEMPLATES.find(t => t.id === currentProfile().execucao.templateId);
}
function currentExercicioCfg() {
  return currentTemplate().exercicios[currentProfile().execucao.exercicioIndex];
}
function currentExercise() {
  const cfg = currentExercicioCfg();
  return { id: cfg.id, ...EXERCISES[cfg.id] };
}

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

  const cfg = currentExercicioCfg();
  document.getElementById("execMeta").textContent = `Meta: ${repsResumo(cfg.series, cfg.reps)} · Descanso ${cfg.descanso}s`;

  const img = document.getElementById("execImage");
  img.src = ex.imagem || "";
  img.alt = ex.nome;

  document.getElementById("weightValue").textContent = ec.weight;
  document.getElementById("repsValue").textContent = ec.reps;

  document.getElementById("mainExecBtnLabel").textContent = isLast ? "Concluir Treino" : "Próximo";
  document.getElementById("prevExBtn").disabled = ec.exercicioIndex === 0;

  renderMuscleModel(ex);
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
      return;
    }
    const ec = currentProfile().execucao;
    if (!ec) return;
    if (target === "weight") ec.weight = Math.max(0, ec.weight + dir * 2.5);
    if (target === "reps") ec.reps = Math.max(0, ec.reps + dir);
    document.getElementById("weightValue").textContent = ec.weight;
    document.getElementById("repsValue").textContent = ec.reps;
    saveProfileDebounced(state.perfilAtual);
  });
});

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
  const isLast = ec.exercicioIndex === t.exercicios.length - 1;

  // guarda o peso/reps usados neste exercício antes de avançar
  ec.log.push({ nome: ex.nome, peso: ec.weight, reps: ec.reps });

  if (!isLast) {
    ec.exercicioIndex++;
    renderExecucao();
    saveProfile(state.perfilAtual);
    return;
  }

  const p = currentProfile();
  if (!p.concluidosHoje.includes(t.id)) p.concluidosHoje.push(t.id);
  registrarNoHistorico({
    tipo: "treino",
    nome: t.nome,
    ficha: t.ficha,
    detalhe: `${t.exercicios.length} exercícios`,
    exercicios: ec.log
  });
  marcarDiaTreinado();
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
      b.classList.remove("border-2", "border-clay");
      b.classList.add("border", "border-hairline");
      b.querySelector("i").classList.remove("text-clay");
      b.querySelector("i").classList.add("text-muted");
      b.querySelector("span").classList.remove("text-ink");
      b.querySelector("span").classList.add("text-muted");
    });
    btn.classList.remove("border", "border-hairline");
    btn.classList.add("border-2", "border-clay");
    btn.querySelector("i").classList.remove("text-muted");
    btn.querySelector("i").classList.add("text-clay");
    btn.querySelector("span").classList.remove("text-muted");
    btn.querySelector("span").classList.add("text-ink");
  });
});

document.querySelectorAll(".cardio-preset").forEach(btn => {
  btn.addEventListener("click", () => {
    document.getElementById("cardioMinValue").textContent = btn.dataset.min;
  });
});

document.querySelectorAll(".intensity-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    state.cardioIntensidade = btn.dataset.intensity;
    document.querySelectorAll(".intensity-btn").forEach(b => {
      b.classList.remove("bg-paper", "text-ink");
      b.classList.add("text-muted");
    });
    btn.classList.add("bg-paper", "text-ink");
    btn.classList.remove("text-muted");
  });
});

document.getElementById("confirmCardioBtn").addEventListener("click", () => {
  const p = currentProfile();
  const minutos = document.getElementById("cardioMinValue").textContent;
  const cardioLabels = { esteira: "Esteira", bike: "Bike", eliptico: "Elíptico", outro: "Outra atividade" };
  const intensidadeLabels = { leve: "Leve", moderado: "Moderado", forte: "Forte" };
  p.cardioLog.push({ tipo: state.cardioTipo, minutos, intensidade: state.cardioIntensidade, dia: HOJE_DIA });
  registrarNoHistorico({
    tipo: "cardio",
    nome: cardioLabels[state.cardioTipo] || "Cardio",
    detalhe: `${minutos} min · ${intensidadeLabels[state.cardioIntensidade] || ""}`
  });
  marcarDiaTreinado();
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
  const isCurrentMonth = state.calMonth === 7 && state.calYear === 2026;

  for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement("span"));

  for (let day = 1; day <= daysInMonth; day++) {
    const trained = isCurrentMonth && p.diasTreinados.includes(day);
    const isToday = isCurrentMonth && day === HOJE_DIA;
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
    cell.addEventListener("click", () => showDayDetail(day, trained));
    grid.appendChild(cell);
  }
}

function showDayDetail(day, trained) {
  state.calSelectedDay = day;
  renderCalendario();

  const wrap = document.getElementById("dayDetailWrap");
  wrap.style.display = "block";
  document.getElementById("dayDetailTitle").textContent = `${day} de ${MONTH_NAMES[state.calMonth]}`;

  if (trained) {
    document.getElementById("dayDetailName").textContent = "Treino ou cardio concluído";
    document.getElementById("dayDetailMeta").textContent = "Detalhes completos virão do histórico salvo no Firestore.";
  } else {
    document.getElementById("dayDetailName").textContent = "Nenhuma atividade";
    document.getElementById("dayDetailMeta").textContent = "Não há treino registrado neste dia.";
  }

  wrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* =========================================================
   TELA "HISTÓRICO"
   ========================================================= */

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
  p.historicoLog.forEach((item, idx) => {
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
      details.innerHTML = item.exercicios.map(e => `
        <div class="flex items-center justify-between px-4 py-2.5">
          <span class="text-xs font-medium">${e.nome}</span>
          <span class="text-xs text-muted">${e.peso} kg × ${e.reps}</span>
        </div>
      `).join("");
      card.appendChild(details);

      header.querySelector(".historico-toggle").addEventListener("click", () => {
        details.classList.toggle("hidden");
        header.querySelector(".chevron-icon").classList.toggle("rotate-180");
      });
    }

    header.querySelector(".historico-delete").addEventListener("click", (e) => {
      e.stopPropagation();
      if (!confirm(`Excluir "${item.nome}" do histórico?`)) return;
      p.historicoLog.splice(idx, 1);
      renderHistorico();
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
   INICIALIZAÇÃO — busca tudo no Firestore antes da primeira
   renderização (com uma telinha de carregamento nesse meio tempo)
   ========================================================= */

(async () => {
  await carregarDadosIniciais();
  renderAll();
  const loader = document.getElementById("appLoader");
  if (loader) loader.remove();
})();
