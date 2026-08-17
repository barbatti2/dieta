import createBodyHighlighter from 'https://esm.sh/body-highlighter';
import { EXERCISES, GROUPS } from './exercises.js';

/* =========================================================
   DADOS FAKE — isso tudo depois vira leitura/escrita no Firestore
   (o catálogo de exercícios agora mora em exercises.js)
   ========================================================= */

const backMuscles = ["trapezius", "upper-back", "lower-back", "triceps", "back-deltoids", "gluteal", "hamstring"];

const muscleLabels = {
  chest: "Peitoral", "front-deltoids": "Ombro", "back-deltoids": "Ombro (post.)",
  triceps: "Tríceps", biceps: "Bíceps", "upper-back": "Costas", "lower-back": "Lombar",
  trapezius: "Trapézio", quadriceps: "Quadríceps", gluteal: "Glúteo", hamstring: "Posterior",
  calves: "Panturrilha", abs: "Abdômen", forearm: "Antebraço", obliques: "Oblíquo",
  adductors: "Adutor", abductors: "Abdutor"
};

const TEMPLATES = [
  { id: "a", nome: "Peito e Tríceps", ficha: "Ficha A", tags: ["Peitoral", "Tríceps", "Ombros"], exercicios: ["supino_reto_barra", "supino_inclinado_halteres", "crucifixo_reto_halteres", "desenvolvimento_halteres", "triceps_corda", "mergulho_banco"] },
  { id: "b", nome: "Costas e Bíceps", ficha: "Ficha B", tags: ["Dorsais", "Bíceps", "Antebraço"], exercicios: ["puxada_frente", "remada_curvada_barra", "remada_baixa_cabo", "rosca_direta_barra", "rosca_martelo", "rosca_scott"] },
  { id: "c", nome: "Pernas e Glúteos", ficha: "Ficha C", tags: ["Quadríceps", "Posterior", "Glúteos"], exercicios: ["agachamento_livre", "leg_press", "cadeira_extensora", "cadeira_flexora", "elevacao_pelvica", "panturrilha_em_pe"] }
];

const AVATARS = {
  voce: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg",
  parceira: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg"
};

const PROFILES = {
  voce: {
    nome: "Você",
    streak: 12,
    diasTreinados: [2, 4, 6, 9, 11, 12, 13, 15, 16],
    cardioLog: []
  },
  parceira: {
    nome: "Sua parceira",
    streak: 7,
    diasTreinados: [3, 5, 8, 10, 13, 14, 16],
    cardioLog: []
  }
};

const HOJE_DIA = 16; // dia fake usado como "hoje" nos dados de exemplo

/* =========================================================
   ESTADO
   ========================================================= */

let state = {
  perfilAtual: "voce",
  calMonth: 7, // agosto = index 7 (0-based)
  calYear: 2026,
  execucao: null,
  cardioTipo: "esteira",
  cardioIntensidade: "leve"
};

function currentProfile() {
  return PROFILES[state.perfilAtual];
}

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

function showScreen(name) {
  document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.dataset.screen === name));
  document.querySelectorAll(".nav-item").forEach(b => {
    const active = b.dataset.nav === name;
    b.classList.toggle("text-clay", active);
    b.classList.toggle("text-muted", !active);
  });
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
  const dayLabels = ["D", "S", "T", "Q", "Q", "S", "S"];
  for (let i = 6; i >= 0; i--) {
    const dayNum = HOJE_DIA - i;
    const trained = p.diasTreinados.includes(dayNum);
    const el = document.createElement("div");
    el.className = "flex flex-col items-center gap-2";
    el.innerHTML = `
      <span class="text-[9px] font-bold text-muted uppercase">${dayLabels[dayNum % 7]}</span>
      <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-sm ${
        trained ? "bg-clay text-white" : "border border-hairline bg-paper text-hairline"
      }">${trained ? '<i class="fa-solid fa-check"></i>' : ""}</div>
    `;
    strip.appendChild(el);
  }
}

function marcarDiaTreinado() {
  const p = currentProfile();
  if (!p.diasTreinados.includes(HOJE_DIA)) {
    p.diasTreinados.push(HOJE_DIA);
    p.streak++;
  }
}

/* =========================================================
   TELA "TREINOS"
   ========================================================= */

function renderTemplateList() {
  const list = document.getElementById("templateList");
  list.innerHTML = "";
  TEMPLATES.forEach(t => {
    const card = document.createElement("article");
    card.className = "bg-card border border-hairline rounded-2xl p-4 shadow-sm group hover:border-clay/30 transition-all";
    card.innerHTML = `
      <div class="flex justify-between items-start mb-4">
        <div class="space-y-1 cursor-pointer flex-1 template-open">
          <span class="text-[10px] font-bold text-clay uppercase tracking-[0.2em]">${t.ficha}</span>
          <h3 class="font-serif text-xl font-medium">${t.nome}</h3>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <button class="template-edit w-9 h-9 bg-paper rounded-xl flex items-center justify-center text-muted hover:text-clay transition-all">
            <i class="fa-solid fa-pen text-xs"></i>
          </button>
          <div class="template-open w-9 h-9 bg-paper rounded-xl flex items-center justify-center text-ink group-hover:bg-clay group-hover:text-white transition-all cursor-pointer">
            <i class="fa-solid fa-chevron-right text-xs"></i>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 mb-4 template-open cursor-pointer">
        ${t.tags.map(tag => `<span class="text-[9px] font-bold text-muted uppercase tracking-widest border border-hairline px-2 py-1 rounded-full">${tag}</span>`).join("")}
      </div>
      <div class="flex items-center justify-between border-t border-hairline pt-3 template-open cursor-pointer">
        <div class="flex items-center gap-2">
          <i class="fa-regular fa-calendar text-muted text-xs"></i>
          <span class="text-[11px] text-muted">${t.exercicios.length} exercícios</span>
        </div>
      </div>
    `;
    card.querySelectorAll(".template-open").forEach(el => {
      el.addEventListener("click", () => startExecution(t.id));
    });
    card.querySelector(".template-edit").addEventListener("click", (e) => {
      e.stopPropagation();
      openEditor(t.id);
    });
    list.appendChild(card);
  });
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
  renderEditorList();
  showScreen("editor");
}

function createNewTemplate() {
  const nextLetter = String.fromCharCode(65 + TEMPLATES.length); // A, B, C, D...
  const novo = {
    id: "custom-" + Date.now(),
    nome: "Novo Treino",
    ficha: "Ficha " + nextLetter,
    tags: [],
    exercicios: []
  };
  TEMPLATES.push(novo);
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
      const included = t.exercicios.includes(id);
      const row = document.createElement("button");
      row.className = `w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all text-left mb-2 ${
        included ? "border-clay bg-claySoft/10" : "border-hairline bg-card"
      }`;
      const musclesText = [...ex.primary, ...ex.secondary].map(m => muscleLabels[m] || m).join(", ");
      row.innerHTML = `
        <div class="w-11 h-11 rounded-lg overflow-hidden bg-paper border border-hairline flex-shrink-0">
          <img src="${ex.imagem || ""}" alt="" class="w-full h-full object-cover">
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold truncate">${ex.nome}</p>
          <p class="text-[11px] text-muted truncate">${musclesText} · ${ex.equipamento}</p>
        </div>
        <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
          included ? "bg-clay text-white" : "border border-hairline text-transparent"
        }">
          <i class="fa-solid fa-check text-[10px]"></i>
        </div>
      `;
      row.addEventListener("click", () => {
        const idx = t.exercicios.indexOf(id);
        if (idx >= 0) t.exercicios.splice(idx, 1);
        else t.exercicios.push(id);
        renderEditorList();
      });
      list.appendChild(row);
    });
  });
}

document.getElementById("editorBackBtn").addEventListener("click", () => showScreen("treinos"));
document.getElementById("editorSaveBtn").addEventListener("click", () => {
  // aqui entraria o salvamento real (Firestore) do template atualizado
  renderTemplateList();
  showToast("Treino salvo!");
  showScreen("treinos");
});
document.getElementById("editorDeleteBtn").addEventListener("click", () => {
  if (!confirm("Excluir esta ficha de treino?")) return;
  const idx = TEMPLATES.findIndex(t => t.id === editorTemplateId);
  if (idx >= 0) TEMPLATES.splice(idx, 1);
  renderTemplateList();
  showScreen("treinos");
});

/* =========================================================
   TELA "EXECUÇÃO"
   ========================================================= */

let highlighter = null;

function startExecution(templateId) {
  state.execucao = {
    templateId,
    exercicioIndex: 0,
    weight: 40,
    reps: 10
  };
  showScreen("execucao");
  renderExecucao();
}

function currentTemplate() {
  return TEMPLATES.find(t => t.id === state.execucao.templateId);
}
function currentExercise() {
  const exId = currentTemplate().exercicios[state.execucao.exercicioIndex];
  return { id: exId, ...EXERCISES[exId] };
}

function renderExecucao() {
  const t = currentTemplate();
  const ex = currentExercise();
  const ec = state.execucao;
  const isLast = ec.exercicioIndex === t.exercicios.length - 1;

  document.getElementById("execIndex").textContent = `${ec.exercicioIndex + 1} / ${t.exercicios.length}`;
  document.getElementById("execProgressBar").style.width = `${((ec.exercicioIndex) / t.exercicios.length) * 100}%`;
  document.getElementById("execName").textContent = ex.nome;

  const focusText = [...ex.primary, ...ex.secondary].map(m => muscleLabels[m] || m).join(", ");
  document.getElementById("execFocus").textContent = focusText || "—";

  const img = document.getElementById("execImage");
  img.src = ex.imagem || "";
  img.alt = ex.nome;

  document.getElementById("weightValue").textContent = ec.weight;
  document.getElementById("repsValue").textContent = ec.reps;

  document.getElementById("nextExBtn").style.display = isLast ? "none" : "flex";
  document.getElementById("finishWorkoutBtn").style.display = isLast ? "flex" : "none";

  renderMuscleModel(ex);
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
    bodyColor: "#D8D3C8",
    highlightedColors: ["#E7B8A9", "#C9482F"],
    style: { width: "44px" }
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
    const ec = state.execucao;
    if (!ec) return;
    if (target === "weight") ec.weight = Math.max(0, ec.weight + dir * 2.5);
    if (target === "reps") ec.reps = Math.max(0, ec.reps + dir);
    document.getElementById("weightValue").textContent = ec.weight;
    document.getElementById("repsValue").textContent = ec.reps;
  });
});

document.getElementById("prevExBtn").addEventListener("click", () => {
  const ec = state.execucao;
  if (ec.exercicioIndex > 0) {
    ec.exercicioIndex--;
    renderExecucao();
  }
});

document.getElementById("nextExBtn").addEventListener("click", () => {
  const ec = state.execucao;
  const t = currentTemplate();
  if (ec.exercicioIndex < t.exercicios.length - 1) {
    ec.exercicioIndex++;
    renderExecucao();
  }
});

document.getElementById("finishWorkoutBtn").addEventListener("click", () => {
  // aqui entraria o salvamento real (Firestore) do treino concluído
  marcarDiaTreinado();
  renderHoje();
  renderCalendario();
  showToast("Treino concluído! 💪");
  showScreen("hoje");
});

document.getElementById("execCloseBtn").addEventListener("click", () => showScreen("treinos"));

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

document.getElementById("cardioCloseBtn").addEventListener("click", () => showScreen("hoje"));
document.getElementById("confirmCardioBtn").addEventListener("click", () => {
  const p = currentProfile();
  const minutos = document.getElementById("cardioMinValue").textContent;
  // aqui entraria o salvamento real (Firestore)
  p.cardioLog.push({ tipo: state.cardioTipo, minutos, intensidade: state.cardioIntensidade, dia: HOJE_DIA });
  marcarDiaTreinado();
  renderHoje();
  renderCalendario();
  showToast("Cardio salvo!");
  showScreen("hoje");
});

/* =========================================================
   TELA "CALENDÁRIO"
   ========================================================= */

const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

document.getElementById("calPrevBtn").addEventListener("click", () => {
  state.calMonth--;
  if (state.calMonth < 0) { state.calMonth = 11; state.calYear--; }
  renderCalendario();
});
document.getElementById("calNextBtn").addEventListener("click", () => {
  state.calMonth++;
  if (state.calMonth > 11) { state.calMonth = 0; state.calYear++; }
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
    const cell = document.createElement("span");
    cell.textContent = day;
    cell.className = "text-center py-3 text-xs font-medium rounded-full relative cursor-default " +
      (isToday ? "font-bold bg-clay text-white shadow-lg shadow-clay/20" :
       trained ? "bg-clay/5 text-clay" : "");
    if (trained) {
      cell.classList.add("cursor-pointer");
      cell.innerHTML += `<div class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 ${isToday ? "bg-white" : "bg-clay"} rounded-full"></div>`;
      cell.addEventListener("click", () => showDayDetail(day));
    }
    grid.appendChild(cell);
  }

  document.getElementById("dayDetailWrap").style.display = "none";
}

function showDayDetail(day) {
  document.getElementById("dayDetailWrap").style.display = "block";
  document.getElementById("dayDetailTitle").textContent = `Detalhes: ${day} de ${MONTH_NAMES[state.calMonth]}`;
  document.getElementById("dayDetailName").textContent = "Atividade registrada";
  document.getElementById("dayDetailMeta").textContent = "Detalhes completos virão do histórico salvo no Firestore.";
}

/* =========================================================
   RENDER GERAL
   ========================================================= */

function renderAll() {
  renderProfileToggles();
  renderHoje();
  renderTemplateList();
  renderCalendario();
}

renderAll();
