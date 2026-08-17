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
    treinoHojeId: "a",
    diasTreinados: [2, 4, 6, 9, 11, 12, 13, 15, 16],
    historico: {
      supino_reto_barra: [
        { data: "01/08", carga: 52 }, { data: "04/08", carga: 55 },
        { data: "08/08", carga: 55 }, { data: "12/08", carga: 60 },
        { data: "15/08", carga: 60 }
      ],
      agachamento_livre: [
        { data: "02/08", carga: 70 }, { data: "05/08", carga: 75 },
        { data: "09/08", carga: 80 }, { data: "13/08", carga: 85 },
        { data: "16/08", carga: 90 }
      ]
    },
    recordes: [
      { exercicio: "supino_reto_barra", data: "12 Ago", valor: "60kg (+2kg)" },
      { exercicio: "agachamento_livre", data: "16 Ago", valor: "90kg (+5kg)" }
    ]
  },
  parceira: {
    nome: "Sua parceira",
    streak: 7,
    treinoHojeId: "b",
    diasTreinados: [3, 5, 8, 10, 13, 14, 16],
    historico: {
      supino_reto_barra: [
        { data: "03/08", carga: 15 }, { data: "07/08", carga: 17.5 },
        { data: "10/08", carga: 17.5 }, { data: "14/08", carga: 20 }
      ],
      agachamento_livre: [
        { data: "04/08", carga: 30 }, { data: "08/08", carga: 32.5 },
        { data: "11/08", carga: 35 }, { data: "15/08", carga: 35 }
      ]
    },
    recordes: [
      { exercicio: "supino_reto_barra", data: "14 Ago", valor: "20kg (+2.5kg)" }
    ]
  }
};

/* =========================================================
   ESTADO
   ========================================================= */

let state = {
  perfilAtual: "voce",
  calMonth: 7, // agosto = index 7 (0-based)
  calYear: 2026,
  execucao: null
};

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
   PERFIL
   ========================================================= */

const profileDropdown = document.getElementById("profileDropdown");

document.getElementById("profileChip").addEventListener("click", (e) => {
  e.stopPropagation();
  profileDropdown.classList.toggle("open");
});
document.addEventListener("click", () => profileDropdown.classList.remove("open"));

document.querySelectorAll(".profile-option").forEach(opt => {
  opt.addEventListener("click", (e) => {
    e.stopPropagation();
    state.perfilAtual = opt.dataset.profile;
    profileDropdown.classList.remove("open");
    renderAll();
  });
});

// os avatares "espelho" no header das outras telas (Treinos, Progresso, Calendário)
document.querySelectorAll(".profile-chip-btn").forEach(btn => {
  btn.addEventListener("click", () => showScreen("hoje"));
});

function currentProfile() {
  return PROFILES[state.perfilAtual];
}

/* =========================================================
   TELA "HOJE"
   ========================================================= */

function renderHoje() {
  const p = currentProfile();
  document.getElementById("avatarMain").src = AVATARS[state.perfilAtual];
  document.getElementById("avatarSecondary").src = AVATARS[state.perfilAtual === "voce" ? "parceira" : "voce"];
  document.querySelectorAll(".avatar-mirror").forEach(img => img.src = AVATARS[state.perfilAtual]);
  document.getElementById("streakCount").textContent = p.streak;

  const template = TEMPLATES.find(t => t.id === p.treinoHojeId);
  document.getElementById("todayFichaLabel").textContent = template.ficha;
  document.getElementById("todayWorkoutName").textContent = template.nome;
  document.getElementById("todayWorkoutMeta").textContent = `${template.exercicios.length} exercícios • ${template.exercicios.length * 10} min`;

  const strip = document.getElementById("weekStrip");
  strip.innerHTML = "";
  const dayLabels = ["D", "S", "T", "Q", "Q", "S", "S"];
  const today = 16;
  for (let i = 6; i >= 0; i--) {
    const dayNum = today - i;
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

document.getElementById("startTodayBtn").addEventListener("click", () => {
  startExecution(currentProfile().treinoHojeId);
});
document.getElementById("quickCardioBtn").addEventListener("click", () => showScreen("cardio"));

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
          <h3 class="font-serif text-xl">${t.nome}</h3>
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
  renderHoje();
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

document.getElementById("editTodayBtn").addEventListener("click", () => {
  openEditor(currentProfile().treinoHojeId);
});

/* =========================================================
   TELA "EXECUÇÃO"
   ========================================================= */

let highlighter = null;

function startExecution(templateId) {
  state.execucao = {
    templateId,
    exercicioIndex: 0,
    setAtual: 1,
    totalSets: 4,
    weight: 40,
    reps: 10,
    setsFeitos: []
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

  document.getElementById("execIndex").textContent = `${ec.exercicioIndex + 1} / ${t.exercicios.length}`;
  document.getElementById("execProgressBar").style.width = `${((ec.exercicioIndex) / t.exercicios.length) * 100}%`;
  document.getElementById("execSetLabel").textContent = `Série ${ec.setAtual} de ${ec.totalSets}`;
  document.getElementById("execName").textContent = ex.nome;

  const focusText = [...ex.primary, ...ex.secondary].map(m => muscleLabels[m] || m).join(", ");
  document.getElementById("execFocus").textContent = focusText || "—";

  const img = document.getElementById("execImage");
  img.src = ex.imagem || "";
  img.alt = ex.nome;

  renderMuscleModel(ex);
  renderSetCard();
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
    style: { width: "56px" }
  });
}

function renderSetCard() {
  const ec = state.execucao;
  document.getElementById("weightValue").textContent = ec.weight;
  document.getElementById("repsValue").textContent = ec.reps;

  const history = document.getElementById("execHistory");
  history.innerHTML = "";
  for (let i = 1; i <= ec.totalSets; i++) {
    const done = ec.setsFeitos[i - 1];
    const isCurrent = i === ec.setAtual;
    const row = document.createElement("div");
    row.className = `flex items-center justify-between px-4 py-3 ${isCurrent ? "bg-claySoft/10" : ""}`;
    row.innerHTML = `
      <span class="text-xs font-bold ${done ? "text-emerald" : isCurrent ? "text-clay" : "text-muted"}">${i}</span>
      <span class="text-xs font-medium text-ink">${done ? done.peso + " kg" : "--"}</span>
      <span class="text-xs font-medium text-ink">${done ? done.reps : "--"}</span>
    `;
    history.appendChild(row);
  }
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
    renderSetCard();
  });
});

document.getElementById("confirmSetBtn").addEventListener("click", () => {
  const ec = state.execucao;
  ec.setsFeitos[ec.setAtual - 1] = { peso: ec.weight, reps: ec.reps };
  if (ec.setAtual < ec.totalSets) ec.setAtual++;
  document.getElementById("execSetLabel").textContent = `Série ${ec.setAtual} de ${ec.totalSets}`;
  renderSetCard();
});

document.getElementById("prevExBtn").addEventListener("click", () => {
  const ec = state.execucao;
  if (ec.exercicioIndex > 0) {
    ec.exercicioIndex--;
    ec.setAtual = 1;
    ec.setsFeitos = [];
    renderExecucao();
  }
});

document.getElementById("nextExBtn").addEventListener("click", () => {
  const ec = state.execucao;
  const t = currentTemplate();
  if (ec.exercicioIndex < t.exercicios.length - 1) {
    ec.exercicioIndex++;
    ec.setAtual = 1;
    ec.setsFeitos = [];
    renderExecucao();
  } else {
    showScreen("hoje");
    renderHoje();
  }
});

document.getElementById("execCloseBtn").addEventListener("click", () => showScreen("treinos"));

/* =========================================================
   TELA "CARDIO"
   ========================================================= */

document.querySelectorAll(".cardio-type-btn").forEach(btn => {
  btn.addEventListener("click", () => {
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
  // aqui entraria o salvamento real (Firestore)
  showScreen("hoje");
});

/* =========================================================
   TELA "PROGRESSO"
   ========================================================= */

function renderProgressoOptions() {
  const select = document.getElementById("progressExerciseSelect");
  select.innerHTML = "";
  const p = currentProfile();
  Object.keys(p.historico).forEach(exId => {
    const opt = document.createElement("option");
    opt.value = exId;
    opt.textContent = EXERCISES[exId]?.nome || exId;
    select.appendChild(opt);
  });
  renderProgresso(select.value);
}

document.getElementById("progressExerciseSelect").addEventListener("change", e => renderProgresso(e.target.value));

function renderProgresso(exId) {
  const p = currentProfile();
  const dados = p.historico[exId] || [];
  if (dados.length === 0) return;

  const cargas = dados.map(d => d.carga);
  const last = cargas[cargas.length - 1];
  const max = Math.max(...cargas);
  const avg = (cargas.reduce((a, b) => a + b, 0) / cargas.length).toFixed(1);
  const change = (((last - cargas[0]) / cargas[0]) * 100).toFixed(0);

  document.getElementById("statLast").innerHTML = `${last} <span class="text-xs font-sans text-muted">kg</span>`;
  document.getElementById("statMax").innerHTML = `${max} <span class="text-xs font-sans text-muted">kg</span>`;
  document.getElementById("statAvg").innerHTML = `${avg} <span class="text-xs font-sans text-muted">kg</span>`;
  document.getElementById("statSessions").textContent = dados.length;
  document.getElementById("statChange").textContent = `${change >= 0 ? "+" : ""}${change}% no período`;

  const records = document.getElementById("recordsList");
  records.innerHTML = "";
  p.recordes.forEach(r => {
    const el = document.createElement("div");
    el.className = "bg-white/50 border border-hairline rounded-2xl p-4 flex items-center justify-between";
    el.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-claySoft/20 rounded-full flex items-center justify-center text-clay">
          <i class="fa-solid fa-trophy text-xs"></i>
        </div>
        <div>
          <p class="text-xs font-bold">${EXERCISES[r.exercicio]?.nome || r.exercicio}</p>
          <p class="text-[10px] text-muted">${r.data} • ${r.valor}</p>
        </div>
      </div>
      <i class="fa-solid fa-chevron-right text-hairline text-xs"></i>
    `;
    records.appendChild(el);
  });

  const trace = {
    x: dados.map(d => d.data),
    y: cargas,
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: '#C9482F', width: 3, shape: 'spline' },
    marker: { color: '#C9482F', size: 8, line: { color: 'white', width: 2 } },
    fill: 'tozeroy',
    fillcolor: 'rgba(201, 72, 47, 0.05)'
  };
  const layout = {
    margin: { t: 10, r: 10, b: 30, l: 30 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: { showgrid: false, tickfont: { size: 9, color: '#8A8378', family: 'Inter' } },
    yaxis: { showgrid: true, gridcolor: '#D8D3C8', tickfont: { size: 9, color: '#8A8378', family: 'Inter' }, zeroline: false },
    showlegend: false
  };
  Plotly.newPlot('progressionChart', [trace], layout, { responsive: true, displayModeBar: false, displaylogo: false });
}

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
  const today = 16;

  for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement("span"));

  for (let day = 1; day <= daysInMonth; day++) {
    const trained = isCurrentMonth && p.diasTreinados.includes(day);
    const isToday = isCurrentMonth && day === today;
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
  const template = TEMPLATES.find(t => t.id === currentProfile().treinoHojeId);
  document.getElementById("dayDetailWrap").style.display = "block";
  document.getElementById("dayDetailTitle").textContent = `Detalhes: ${day} de ${MONTH_NAMES[state.calMonth]}`;
  document.getElementById("dayDetailName").textContent = template.nome;
  document.getElementById("dayDetailMeta").textContent = `${template.exercicios.length} exercícios • ~50 min`;
}

/* =========================================================
   RENDER GERAL
   ========================================================= */

function renderAll() {
  renderHoje();
  renderTemplateList();
  renderProgressoOptions();
  renderCalendario();
}

renderAll();
