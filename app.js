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

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];
const WEEKDAY_FULL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const TEMPLATES = [
  { id: "a", nome: "Peito e Tríceps", ficha: "Ficha A", tags: ["Peitoral", "Tríceps", "Ombros"], dias: [1, 4], exercicios: ["supino_reto_barra", "supino_inclinado_halteres", "crucifixo_reto_halteres", "desenvolvimento_halteres", "triceps_corda", "mergulho_banco"] },
  { id: "b", nome: "Costas e Bíceps", ficha: "Ficha B", tags: ["Dorsais", "Bíceps", "Antebraço"], dias: [2, 5], exercicios: ["puxada_frente", "remada_curvada_barra", "remada_baixa_cabo", "rosca_direta_barra", "rosca_martelo", "rosca_scott"] },
  { id: "c", nome: "Pernas e Glúteos", ficha: "Ficha C", tags: ["Quadríceps", "Posterior", "Glúteos"], dias: [3, 6], exercicios: ["agachamento_livre", "leg_press", "cadeira_extensora", "cadeira_flexora", "elevacao_pelvica", "panturrilha_em_pe"] }
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
    cardioLog: [],
    historicoLog: [],
    concluidosHoje: []
  },
  parceira: {
    nome: "Sua parceira",
    streak: 7,
    diasTreinados: [3, 5, 8, 10, 13, 14, 16],
    cardioLog: [],
    historicoLog: [],
    concluidosHoje: []
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
  calSelectedDay: null,
  hojeTemplateId: null, // qual ficha (A/B/C) foi escolhida como treino de hoje
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
   DIÁLOGO DE CONFIRMAÇÃO
   ========================================================= */

function showConfirmDialog(titulo, mensagem, labelConfirm = "Confirmar", labelCancel = "Cancelar") {
  return new Promise((resolve) => {
    const dialog = document.createElement("div");
    dialog.className = "fixed inset-0 bg-black/50 flex items-end z-[100]";
    dialog.innerHTML = `
      <div class="w-full bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom">
        <h2 class="text-lg font-bold text-ink mb-2">${titulo}</h2>
        <p class="text-sm text-muted mb-6">${mensagem}</p>
        <div class="flex gap-3">
          <button class="flex-1 bg-paper border border-hairline text-ink font-medium py-3 rounded-xl hover:bg-hairline/10 transition-all active:scale-[0.98]">
            ${labelCancel}
          </button>
          <button class="flex-1 bg-ink text-white font-medium py-3 rounded-xl hover:bg-black transition-all active:scale-[0.98]">
            ${labelConfirm}
          </button>
        </div>
      </div>
    `;
    
    const buttons = dialog.querySelectorAll("button");
    buttons[0].addEventListener("click", () => {
      dialog.remove();
      resolve(false);
    });
    buttons[1].addEventListener("click", () => {
      dialog.remove();
      resolve(true);
    });
    
    document.body.appendChild(dialog);
  });
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
    b.classList.toggle("text-muted", !active);
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
  // Reset perfis separados: cada perfil tem seu próprio hojeTemplateId
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
  for (let i = 6; i >= 0; i--) {
    const dayNum = HOJE_DIA - i;
    const trained = p.diasTreinados.includes(dayNum);
    const el = document.createElement("div");
    el.className = "flex flex-col items-center gap-2";
    el.innerHTML = `
      <span class="text-[9px] font-bold text-muted uppercase">${WEEKDAY_LABELS[dayNum % 7]}</span>
      <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-sm ${
        trained ? "bg-clay text-white" : "border border-hairline bg-paper text-hairline"
      }">${trained ? '<i class="fa-solid fa-check"></i>' : ""}</div>
    `;
    strip.appendChild(el);
  }

  renderTodayWorkout();
}

function renderTodayWorkout() {
  const p = currentProfile();
  const container = document.getElementById("todayWorkoutCard");

  // ainda não escolheu qual ficha é o treino de hoje: mostra o seletor
  if (!state.hojeTemplateId) {
    container.innerHTML = `
      <div class="bg-card border border-hairline rounded-2xl p-4 shadow-sm">
        <p class="text-[10px] font-bold text-clay uppercase tracking-[0.2em] mb-3">Qual treino de hoje?</p>
        <div class="flex flex-col gap-2" id="hojeTemplatePicker"></div>
      </div>
    `;
    const picker = document.getElementById("hojeTemplatePicker");
    TEMPLATES.forEach(t => {
      const btn = document.createElement("button");
      btn.className = "today-pick-btn w-full flex items-center gap-3 bg-paper border border-hairline rounded-xl p-3 text-left hover:border-clay/40 transition-all active:scale-[0.98]";
      btn.innerHTML = `
        <div class="w-9 h-9 bg-card rounded-lg flex items-center justify-center text-clay flex-shrink-0"><i class="fa-solid fa-dumbbell text-xs"></i></div>
        <div class="min-w-0">
          <span class="text-[9px] font-bold text-clay uppercase tracking-[0.15em]">${t.ficha}</span>
          <h3 class="font-serif text-sm font-medium truncate">${t.nome}</h3>
        </div>
      `;
      btn.addEventListener("click", () => {
        state.hojeTemplateId = t.id;
        renderTodayWorkout();
      });
      picker.appendChild(btn);
    });
    return;
  }

  const t = TEMPLATES.find(x => x.id === state.hojeTemplateId);

  // a ficha escolhida foi excluída no editor: volta pro seletor
  if (!t) {
    state.hojeTemplateId = null;
    renderTodayWorkout();
    return;
  }

  const concluido = p.concluidosHoje.includes(t.id);
  const emAndamento = state.execucao && state.execucao.templateId === t.id;

  if (concluido) {
    container.innerHTML = `
      <div class="bg-emerald/5 border border-emerald/30 rounded-2xl p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center text-emerald flex-shrink-0">
          <i class="fa-solid fa-check text-lg"></i>
        </div>
        <div class="flex-1">
          <p class="text-sm font-bold text-emerald">Treino concluído!</p>
          <p class="text-[11px] text-emerald/70">${t.nome}</p>
        </div>
      </div>
      <button id="reopenTrainingBtn" class="w-full mt-3 bg-paper border border-hairline text-ink font-medium py-3 rounded-xl hover:border-clay/40 transition-all active:scale-[0.98]">
        <i class="fa-solid fa-rotate-left mr-2"></i>Reabrir Treino
      </button>
    `;
    document.getElementById("reopenTrainingBtn").addEventListener("click", async () => {
      const confirmed = await showConfirmDialog(
        "Reabrir treino?",
        `Tem certeza que deseja reabrir o treino "${t.nome}"?`,
        "Reabrir",
        "Cancelar"
      );
      if (confirmed) {
        p.concluidosHoje = p.concluidosHoje.filter(id => id !== t.id);
        state.execucao = { templateId: t.id, exercicios: t.exercicios.map(exId => ({ exId, peso: "0", reps: "0" })) };
        renderTodayWorkout();
        showToast("Treino reabierto!");
      }
    });
    return;
  }

  if (emAndamento) {
    container.innerHTML = `
      <div class="bg-card border border-hairline rounded-2xl p-4 shadow-sm space-y-3">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-lg bg-clay/10 flex items-center justify-center text-clay flex-shrink-0">
            <i class="fa-solid fa-dumbbell text-xs"></i>
          </div>
          <div class="min-w-0 flex-1">
            <span class="text-[9px] font-bold text-clay uppercase tracking-[0.15em]">${t.ficha}</span>
            <h3 class="font-serif text-sm font-medium">${t.nome}</h3>
          </div>
        </div>
        <button id="continueTrainingBtn" class="w-full bg-clay text-white font-medium py-3 rounded-lg hover:bg-clay/90 transition-all active:scale-[0.98]">
          Continuar Treino
        </button>
      </div>
    `;
    document.getElementById("continueTrainingBtn").addEventListener("click", () => {
      showScreen("treino-editor");
      renderTrainingEditor();
    });
    return;
  }

  container.innerHTML = `
    <div class="bg-card border border-hairline rounded-2xl p-4 shadow-sm space-y-3">
      <div class="flex items-start gap-3">
        <div class="w-9 h-9 rounded-lg bg-clay/10 flex items-center justify-center text-clay flex-shrink-0">
          <i class="fa-solid fa-dumbbell text-xs"></i>
        </div>
        <div class="min-w-0 flex-1">
          <span class="text-[9px] font-bold text-clay uppercase tracking-[0.15em]">${t.ficha}</span>
          <h3 class="font-serif text-sm font-medium">${t.nome}</h3>
          <p class="text-[11px] text-muted mt-1">${t.tags.join(", ")}</p>
        </div>
      </div>
      <button id="startTrainingBtn" class="w-full bg-clay text-white font-medium py-3 rounded-lg hover:bg-clay/90 transition-all active:scale-[0.98]">
        Iniciar Treino
      </button>
      <button id="changeTemplateBtn" class="w-full bg-paper border border-hairline text-ink font-medium py-3 rounded-lg hover:border-clay/40 transition-all active:scale-[0.98]">
        Escolher Outra Ficha
      </button>
    </div>
  `;

  document.getElementById("startTrainingBtn").addEventListener("click", () => {
    state.execucao = {
      templateId: t.id,
      exercicios: t.exercicios.map(exId => ({ exId, peso: "0", reps: "0" }))
    };
    showScreen("treino-editor");
    renderTrainingEditor();
  });

  document.getElementById("changeTemplateBtn").addEventListener("click", () => {
    state.hojeTemplateId = null;
    renderTodayWorkout();
  });
}

function renderTrainingEditor() {
  const template = TEMPLATES.find(x => x.id === state.execucao.templateId);
  if (!template) return;

  const screen = document.querySelector('.screen[data-screen="treino-editor"]');
  screen.innerHTML = `
    <header class="flex-shrink-0 px-6 pt-12 pb-4 flex justify-between items-center bg-paper">
      <button id="backTrainingBtn" class="text-muted hover:text-ink">
        <i class="fa-solid fa-chevron-left text-lg"></i>
      </button>
      <h1 class="font-serif text-2xl font-medium flex-1 text-center">${template.nome}</h1>
      <div class="w-6"></div>
    </header>

    <main class="flex-1 min-h-0 overflow-y-auto px-6 pb-8 space-y-4" id="exercisesContainer"></main>

    <div class="flex-shrink-0 px-6 py-4 bg-paper border-t border-hairline flex gap-3">
      <button id="cancelTrainingBtn" class="flex-1 bg-paper border border-hairline text-ink font-medium py-3 rounded-xl hover:border-clay/40 transition-all">
        Cancelar
      </button>
      <button id="finishTrainingBtn" class="flex-1 bg-clay text-white font-medium py-3 rounded-xl hover:bg-clay/90 transition-all">
        Concluir Treino
      </button>
    </div>
  `;

  const container = document.getElementById("exercisesContainer");
  state.execucao.exercicios.forEach((ex, idx) => {
    const exData = EXERCISES.find(x => x.id === ex.exId);
    if (!exData) return;

    const card = document.createElement("div");
    card.className = "bg-card border border-hairline rounded-2xl p-4 space-y-3";
    card.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-9 h-9 rounded-lg bg-clay/10 flex items-center justify-center text-clay flex-shrink-0">
          <i class="fa-solid fa-dumbbell text-xs"></i>
        </div>
        <div class="min-w-0 flex-1">
          <h4 class="font-bold text-sm">${exData.nome}</h4>
          <p class="text-[11px] text-muted">${exData.tags.join(", ")}</p>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-[10px] font-bold text-muted uppercase block mb-1">Peso (kg)</label>
          <input type="number" value="${ex.peso}" class="w-full border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-clay" data-idx="${idx}" data-field="peso">
        </div>
        <div>
          <label class="text-[10px] font-bold text-muted uppercase block mb-1">Repetições</label>
          <input type="number" value="${ex.reps}" class="w-full border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-clay" data-idx="${idx}" data-field="reps">
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll("#exercisesContainer input").forEach(input => {
    input.addEventListener("change", (e) => {
      const idx = parseInt(e.target.dataset.idx);
      const field = e.target.dataset.field;
      state.execucao.exercicios[idx][field] = e.target.value || "0";
    });
  });

  document.getElementById("backTrainingBtn").addEventListener("click", () => {
    showScreen("hoje");
  });

  document.getElementById("cancelTrainingBtn").addEventListener("click", () => {
    state.execucao = null;
    showScreen("hoje");
    renderTodayWorkout();
  });

  document.getElementById("finishTrainingBtn").addEventListener("click", () => {
    const p = currentProfile();
    if (!state.execucao.templateId) return;
    p.concluidosHoje.push(state.execucao.templateId);
    registrarNoHistorico({
      tipo: "treino",
      nome: template.nome,
      detalhe: `${state.execucao.exercicios.length} exercícios`,
      exercicios: state.execucao.exercicios.map(ex => {
        const exData = EXERCISES.find(x => x.id === ex.exId);
        return { nome: exData.nome, peso: ex.peso, reps: ex.reps };
      })
    });
    marcarDiaTreinado();
    state.execucao = null;
    renderHoje();
    renderCalendario();
    renderHistorico();
    showToast("Treino concluído!");
    showScreen("hoje");
  });
}

function marcarDiaTreinado() {
  const p = currentProfile();
  if (!p.diasTreinados.includes(HOJE_DIA)) {
    p.diasTreinados.push(HOJE_DIA);
    p.streak++;
  }
}

function registrarNoHistorico(item) {
  const p = currentProfile();
  const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  p.historicoLog.unshift({
    ...item,
    quando: hoje,
    id: Math.random().toString(36).substr(2, 9)
  });
}

/* =========================================================
   TELA "TREINOS" (lista de templates)
   ========================================================= */

function renderTemplateList() {
  const list = document.getElementById("templateList");
  list.innerHTML = "";
  TEMPLATES.forEach(t => {
    const card = document.createElement("div");
    card.className = "bg-card border border-hairline rounded-2xl p-4 shadow-sm";
    card.innerHTML = `
      <div class="flex items-start gap-3 mb-3">
        <div class="w-9 h-9 rounded-lg bg-clay/10 flex items-center justify-center text-clay flex-shrink-0">
          <i class="fa-solid fa-dumbbell text-xs"></i>
        </div>
        <div class="min-w-0 flex-1">
          <span class="text-[9px] font-bold text-clay uppercase tracking-[0.15em]">${t.ficha}</span>
          <h3 class="font-serif text-sm font-medium">${t.nome}</h3>
          <p class="text-[11px] text-muted mt-1">${t.tags.join(", ")}</p>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="flex-1 bg-paper border border-hairline text-ink text-sm font-medium py-2 rounded-lg hover:border-clay/40 transition-all view-template-btn" data-template-id="${t.id}">
          Ver Detalhes
        </button>
      </div>
    `;
    list.appendChild(card);

    card.querySelector(".view-template-btn").addEventListener("click", () => {
      state.selectedTemplateId = t.id;
      showScreen("template-detail");
      renderTemplateDetail();
    });
  });
}

function renderTemplateDetail() {
  const t = TEMPLATES.find(x => x.id === state.selectedTemplateId);
  if (!t) return;

  const screen = document.querySelector('.screen[data-screen="template-detail"]');
  screen.innerHTML = `
    <header class="flex-shrink-0 px-6 pt-12 pb-4 flex justify-between items-center bg-paper">
      <button id="backTemplateBtn" class="text-muted hover:text-ink">
        <i class="fa-solid fa-chevron-left text-lg"></i>
      </button>
      <h1 class="font-serif text-lg font-medium flex-1 text-center">${t.ficha}</h1>
      <div class="w-6"></div>
    </header>

    <main class="flex-1 min-h-0 overflow-y-auto px-6 pb-8">
      <div class="bg-card border border-hairline rounded-2xl p-4 shadow-sm mb-4">
        <h2 class="font-serif text-xl font-medium mb-2">${t.nome}</h2>
        <div class="flex flex-wrap gap-2">
          ${t.tags.map(tag => `<span class="text-[10px] bg-clay/10 text-clay font-bold px-2.5 py-1 rounded-full uppercase">${tag}</span>`).join("")}
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-[10px] font-bold text-muted uppercase tracking-[0.2em] px-1">Exercícios (${t.exercicios.length})</h3>
        ${t.exercicios.map(exId => {
          const ex = EXERCISES.find(x => x.id === exId);
          return ex ? `
            <div class="bg-card border border-hairline rounded-xl p-3">
              <p class="font-medium text-sm">${ex.nome}</p>
              <p class="text-[11px] text-muted mt-1">${ex.tags.join(", ")}</p>
            </div>
          ` : "";
        }).join("")}
      </div>
    </main>

    <div class="flex-shrink-0 px-6 py-4 bg-paper border-t border-hairline">
      <button id="backTemplateBtn2" class="w-full bg-paper border border-hairline text-ink font-medium py-3 rounded-xl hover:border-clay/40 transition-all">
        Voltar
      </button>
    </div>
  `;

  document.getElementById("backTemplateBtn").addEventListener("click", () => showScreen("treinos"));
  document.getElementById("backTemplateBtn2").addEventListener("click", () => showScreen("treinos"));
}

/* =========================================================
   TELA "CARDIO"
   ========================================================= */

document.querySelectorAll(".cardio-type-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    state.cardioTipo = btn.dataset.type;
    document.querySelectorAll(".cardio-type-btn").forEach(b => {
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
      (isSelected ? "bg-ink text-white scale-110 shadow-lg shadow-ink/20" :
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

    const header = document.createElement("button");
    header.className = "w-full p-3.5 flex items-center gap-3 text-left";
    header.innerHTML = `
      <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
        item.tipo === "treino" ? "bg-claySoft/20 text-clay" : "bg-emerald/10 text-emerald"
      }">
        <i class="fa-solid ${item.tipo === "treino" ? "fa-dumbbell" : "fa-person-running"} text-xs"></i>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-bold truncate">${item.nome}</p>
        <p class="text-[11px] text-muted truncate">${item.detalhe || ""}</p>
      </div>
      <span class="text-[10px] text-muted flex-shrink-0">${item.quando}</span>
      ${temExercicios ? '<i class="fa-solid fa-chevron-down text-[10px] text-muted flex-shrink-0 chevron-icon transition-transform"></i>' : ""}
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

      header.addEventListener("click", () => {
        details.classList.toggle("hidden");
        header.querySelector(".chevron-icon").classList.toggle("rotate-180");
      });
    }

    // Adicionar botão de deletar
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-clay hover:bg-clay/10 transition-all";
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can text-xs"></i>';
    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const confirmed = await showConfirmDialog(
        "Deletar registro?",
        `Tem certeza que deseja remover "${item.nome}" do histórico?`,
        "Deletar",
        "Cancelar"
      );
      if (confirmed) {
        p.historicoLog = p.historicoLog.filter(x => x.id !== item.id);
        renderHistorico();
        showToast("Registro removido!");
      }
    });
    card.style.position = "relative";
    card.appendChild(deleteBtn);

    list.appendChild(card);
  });
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

renderAll();
