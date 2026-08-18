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
        <div class="w-9 h-9 bg-emerald rounded-full flex items-center justify-center text-white flex-shrink-0">
          <i class="fa-solid fa-check text-xs"></i>
        </div>
        <div class="min-w-0 flex-1">
          <span class="text-[10px] font-bold text-emerald uppercase tracking-[0.15em]">${t.ficha} · Concluído</span>
          <h3 class="font-serif text-base font-medium truncate">${t.nome}</h3>
        </div>
      </div>
      <button id="trocarTreinoBtn" class="mt-3 text-xs font-bold text-clay uppercase tracking-widest">Escolher outro treino</button>
    `;
    document.getElementById("trocarTreinoBtn").addEventListener("click", () => {
      state.hojeTemplateId = null;
      renderTodayWorkout();
    });
    return;
  }

  container.innerHTML = `
    <div class="bg-card border border-hairline rounded-2xl p-4 shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <div>
          <span class="text-[10px] font-bold text-clay uppercase tracking-[0.2em]">${t.ficha}</span>
          <h3 class="font-serif text-lg font-medium">${t.nome}</h3>
          ${emAndamento ? `<p class="text-[11px] text-muted mt-0.5">Exercício ${state.execucao.exercicioIndex + 1} de ${t.exercicios.length}</p>` : ""}
        </div>
        <div class="w-10 h-10 bg-paper rounded-xl flex items-center justify-center text-clay flex-shrink-0">
          <i class="fa-solid fa-dumbbell"></i>
        </div>
      </div>
      <button class="start-today-btn w-full bg-ink text-white font-medium py-2.5 rounded-xl text-sm active:scale-[0.98] transition-all" data-template-id="${t.id}">
        ${emAndamento ? "Continuar Treino" : "Iniciar Treino"}
      </button>
      <button id="trocarTreinoBtn" class="mt-2 w-full text-xs font-bold text-muted uppercase tracking-widest py-1">Escolher outro treino</button>
    </div>
  `;

  container.querySelector(".start-today-btn").addEventListener("click", () => startExecution(t.id));
  document.getElementById("trocarTreinoBtn").addEventListener("click", () => {
    state.hojeTemplateId = null;
    renderTodayWorkout();
  });
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
          <h3 class="font-serif text-base font-medium truncate">${t.nome}</h3>
          <p class="text-[11px] text-muted mt-0.5">${t.exercicios.length} exercícios · ${diasTexto}</p>
        </div>
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <button class="template-edit w-8 h-8 bg-paper rounded-lg flex items-center justify-center text-muted hover:text-clay transition-all">
            <i class="fa-solid fa-pen text-[11px]"></i>
          </button>
          <div class="template-open w-8 h-8 bg-paper rounded-lg flex items-center justify-center text-ink group-hover:bg-clay group-hover:text-white transition-all cursor-pointer">
            <i class="fa-solid fa-chevron-right text-[11px]"></i>
          </div>
        </div>
      </div>
    `;
    card.querySelectorAll(".template-open").forEach(el => {
      el.addEventListener("click", () => openEditor(t.id));
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
  renderHoje();
  showToast("Treino salvo!");
  showScreen("treinos");
});
document.getElementById("editorDeleteBtn").addEventListener("click", () => {
  if (!confirm("Excluir esta ficha de treino?")) return;
  const idx = TEMPLATES.findIndex(t => t.id === editorTemplateId);
  if (idx >= 0) TEMPLATES.splice(idx, 1);
  renderTemplateList();
  renderHoje();
  showScreen("treinos");
});

/* =========================================================
   TELA "EXECUÇÃO"
   ========================================================= */

let highlighter = null;

function startExecution(templateId) {
  state.hojeTemplateId = templateId;
  // se já tem um treino dessa mesma ficha em andamento, retoma de onde parou;
  // só começa do zero se for uma ficha diferente ou não houver nada rolando
  if (!state.execucao || state.execucao.templateId !== templateId) {
    state.execucao = {
      templateId,
      exercicioIndex: 0,
      weight: 40,
      reps: 10,
      log: [] // registra peso/reps de cada exercício conforme vai concluindo
    };
  }
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

  const grupo = GROUPS.find(g => g.id === ex.grupo);
  document.getElementById("execGroupTag").textContent = grupo ? grupo.nome : "";

  const img = document.getElementById("execImage");
  img.src = ex.imagem || "";
  img.alt = ex.nome;

  document.getElementById("weightValue").textContent = ec.weight;
  document.getElementById("repsValue").textContent = ec.reps;

  document.getElementById("mainExecBtnLabel").textContent = isLast ? "Concluir Treino" : "Próximo";
  const mainIcon = document.getElementById("mainExecBtnIcon");
  mainIcon.className = isLast ? "fa-solid fa-check text-xs" : "fa-solid fa-chevron-right text-xs";
  document.getElementById("prevExBtn").disabled = ec.exercicioIndex === 0;

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
      probe.style.fill = "#D8D3C8"; // precisa bater com o bodyColor passado acima
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

document.getElementById("mainExecBtn").addEventListener("click", () => {
  const ec = state.execucao;
  if (!ec) return; // segurança: evita clique duplicado depois de já ter concluído
  const t = currentTemplate();
  const ex = currentExercise();
  const isLast = ec.exercicioIndex === t.exercicios.length - 1;

  // guarda o peso/reps usados neste exercício antes de avançar
  ec.log.push({ nome: ex.nome, peso: ec.weight, reps: ec.reps });

  if (!isLast) {
    ec.exercicioIndex++;
    renderExecucao();
    return;
  }

  // aqui entraria o salvamento real (Firestore) do treino concluído
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
  state.execucao = null;
  renderHoje();
  renderCalendario();
  renderHistorico();
  showToast("Treino concluído! 💪");
  showScreen("hoje");
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
  // aqui entraria o salvamento real (Firestore)
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
