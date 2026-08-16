import createBodyHighlighter from 'https://esm.sh/body-highlighter';

/* =========================================================
   DADOS FAKE — isso tudo depois vira leitura/escrita no Firestore
   ========================================================= */

const EXERCISES = {
  agachamento: {
    nome: "Agachamento Livre",
    primary: ["quadriceps"],
    secondary: ["gluteal", "hamstring"]
  },
  legPress: {
    nome: "Leg Press 45°",
    primary: ["quadriceps"],
    secondary: ["gluteal"]
  },
  cadeiraFlexora: {
    nome: "Cadeira Flexora",
    primary: ["hamstring"],
    secondary: []
  },
  remadaCurvada: {
    nome: "Remada Curvada",
    primary: ["upper-back"],
    secondary: ["biceps", "back-deltoids"]
  },
  puxadaFrente: {
    nome: "Puxada pela Frente",
    primary: ["upper-back"],
    secondary: ["biceps"]
  },
  roscaDireta: {
    nome: "Rosca Direta",
    primary: ["biceps"],
    secondary: ["forearm"]
  },
  supino: {
    nome: "Supino Reto",
    primary: ["chest"],
    secondary: ["front-deltoids", "triceps"]
  },
  desenvolvimento: {
    nome: "Desenvolvimento com Halteres",
    primary: ["front-deltoids"],
    secondary: ["triceps"]
  },
  triceps: {
    nome: "Tríceps Corda",
    primary: ["triceps"],
    secondary: []
  }
};

const backMuscles = ["trapezius", "upper-back", "lower-back", "triceps", "back-deltoids", "gluteal", "hamstring"];

const muscleLabels = {
  chest: "Peitoral", "front-deltoids": "Ombro", "back-deltoids": "Ombro (post.)",
  triceps: "Tríceps", biceps: "Bíceps", "upper-back": "Costas", "lower-back": "Lombar",
  trapezius: "Trapézio", quadriceps: "Quadríceps", gluteal: "Glúteo", hamstring: "Posterior",
  calves: "Panturrilha", abs: "Abdômen", forearm: "Antebraço"
};

const TEMPLATES = [
  { id: "a", nome: "Treino A — Perna", exercicios: ["agachamento", "legPress", "cadeiraFlexora"] },
  { id: "b", nome: "Treino B — Costas & Bíceps", exercicios: ["remadaCurvada", "puxadaFrente", "roscaDireta"] },
  { id: "c", nome: "Treino C — Peito, Ombro & Tríceps", exercicios: ["supino", "desenvolvimento", "triceps"] },
  { id: "cardio", nome: "Cardio", exercicios: [] }
];

// dados por perfil (fake) — isso vira o "usuarios/{uid}/..." no Firestore
const PROFILES = {
  voce: {
    nome: "Você",
    inicial: "V",
    streak: 5,
    treinoHoje: "a",
    diasTreinados: [2, 4, 6, 9, 11, 12, 13, 15, 16],
    historico: {
      agachamento: [
        { data: "20/07", carga: 60 }, { data: "27/07", carga: 62.5 },
        { data: "03/08", carga: 65 }, { data: "10/08", carga: 67.5 },
        { data: "15/08", carga: 70 }
      ],
      supino: [
        { data: "21/07", carga: 40 }, { data: "28/07", carga: 42.5 },
        { data: "04/08", carga: 42.5 }, { data: "11/08", carga: 45 }
      ]
    }
  },
  parceira: {
    nome: "Sua parceira",
    inicial: "P",
    streak: 3,
    treinoHoje: "b",
    diasTreinados: [3, 5, 8, 10, 13, 14, 16],
    historico: {
      agachamento: [
        { data: "22/07", carga: 30 }, { data: "29/07", carga: 32.5 },
        { data: "05/08", carga: 35 }, { data: "12/08", carga: 35 }
      ],
      supino: [
        { data: "23/07", carga: 15 }, { data: "30/07", carga: 17.5 },
        { data: "06/08", carga: 20 }
      ]
    }
  }
};

/* =========================================================
   ESTADO
   ========================================================= */

let state = {
  perfilAtual: "voce",
  execucao: {
    templateId: null,
    exercicioIndex: 0,
    setAtual: 1,
    totalSets: 4,
    weight: 40,
    reps: 10,
    setsFeitos: [] // [{peso, reps}]
  }
};

/* =========================================================
   NAVEGAÇÃO ENTRE TELAS
   ========================================================= */

function showScreen(name) {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.toggle("active", s.dataset.screen === name);
  });
  document.querySelectorAll(".nav-item").forEach(b => {
    b.classList.toggle("active", b.dataset.nav === name);
  });
}

document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => showScreen(btn.dataset.nav));
});

/* =========================================================
   PERFIL
   ========================================================= */

const profileChip = document.getElementById("profileChip");
const profileDropdown = document.getElementById("profileDropdown");

profileChip.addEventListener("click", () => {
  profileDropdown.classList.toggle("open");
});

document.querySelectorAll(".profile-option").forEach(opt => {
  opt.addEventListener("click", () => {
    state.perfilAtual = opt.dataset.profile;
    profileDropdown.classList.remove("open");
    renderAll();
  });
});

function currentProfile() {
  return PROFILES[state.perfilAtual];
}

/* =========================================================
   TELA "HOJE"
   ========================================================= */

function renderHoje() {
  const p = currentProfile();
  document.getElementById("avatarInitial").textContent = p.inicial;
  document.getElementById("profileName").textContent = p.nome;
  document.getElementById("greetingName").textContent = p.nome;
  document.getElementById("streakCount").textContent = p.streak;

  const template = TEMPLATES.find(t => t.id === p.treinoHoje);
  document.getElementById("todayName").textContent = template.nome;
  document.getElementById("todayMeta").textContent =
    `${template.exercicios.length} exercícios · ~${template.exercicios.length * 10} min`;

  // faixa da semana (fake: últimos 7 dias, marca os que batem com diasTreinados)
  const strip = document.getElementById("weekStrip");
  strip.innerHTML = "";
  const dayLabels = ["S", "T", "Q", "Q", "S", "S", "D"];
  const today = 16; // dia fake de "hoje" pra combinar com diasTreinados
  for (let i = 6; i >= 0; i--) {
    const dayNum = today - i;
    const trained = p.diasTreinados.includes(dayNum);
    const el = document.createElement("div");
    el.className = "week-day" + (trained ? " trained" : "");
    el.innerHTML = `<div class="d">${dayLabels[(dayNum) % 7]}</div><div class="n">${dayNum}</div>`;
    strip.appendChild(el);
  }
}

document.getElementById("startTodayBtn").addEventListener("click", () => {
  const p = currentProfile();
  startExecution(p.treinoHoje);
});

document.getElementById("quickCardioBtn").addEventListener("click", () => {
  showScreen("cardio");
});

/* =========================================================
   TELA "TREINOS" (lista de templates)
   ========================================================= */

function renderTemplateList() {
  const list = document.getElementById("templateList");
  list.innerHTML = "";
  TEMPLATES.forEach(t => {
    const btn = document.createElement("button");
    btn.className = "template-card";
    const isCardio = t.id === "cardio";
    btn.innerHTML = `
      <div>
        <p class="t-name">${t.nome}</p>
        <p class="t-meta">${isCardio ? "Esteira, bike, elíptico..." : t.exercicios.length + " exercícios"}</p>
      </div>
      <span class="t-arrow">→</span>
    `;
    btn.addEventListener("click", () => {
      if (isCardio) showScreen("cardio");
      else startExecution(t.id);
    });
    list.appendChild(btn);
  });
}

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
  const t = currentTemplate();
  const exId = t.exercicios[state.execucao.exercicioIndex];
  return { id: exId, ...EXERCISES[exId] };
}

function renderExecucao() {
  const t = currentTemplate();
  const ex = currentExercise();
  const ec = state.execucao;

  document.getElementById("execTemplateName").textContent = t.nome;

  // barra de progresso por exercício
  const progRow = document.getElementById("execProgress");
  progRow.innerHTML = "";
  t.exercicios.forEach((_, i) => {
    const seg = document.createElement("div");
    seg.className = "seg" + (i < ec.exercicioIndex ? " done" : i === ec.exercicioIndex ? " current" : "");
    progRow.appendChild(seg);
  });

  document.getElementById("execIndex").textContent =
    `${String(ec.exercicioIndex + 1).padStart(2, "0")} / ${String(t.exercicios.length).padStart(2, "0")}`;
  document.getElementById("execName").textContent = ex.nome;
  document.getElementById("execPrimary").textContent = ex.primary.map(m => muscleLabels[m] || m).join(", ") || "—";
  document.getElementById("execSecondary").textContent = ex.secondary.map(m => muscleLabels[m] || m).join(", ") || "—";

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
    style: { width: "68px" }
  });
}

function renderSetCard() {
  const ec = state.execucao;
  document.getElementById("setLabel").textContent = `Série ${ec.setAtual} de ${ec.totalSets}`;
  document.getElementById("weightValue").textContent = ec.weight;
  document.getElementById("repsValue").textContent = ec.reps;

  const list = document.getElementById("setList");
  list.innerHTML = "";
  for (let i = 1; i <= ec.totalSets; i++) {
    const done = ec.setsFeitos[i - 1];
    const row = document.createElement("div");
    row.className = "set-row" + (done ? " done" : "");
    row.innerHTML = `
      <span class="n">Série ${i}</span>
      <span class="data">${done ? `${done.peso} kg × ${done.reps}` : (i === ec.setAtual ? "Em andamento" : "—")}</span>
      <span class="check ${done ? "done" : "pending"}">${done ? "✓" : ""}</span>
    `;
    list.appendChild(row);
  }
}

document.querySelectorAll(".stepper").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    const dir = parseInt(btn.dataset.dir, 10);
    const ec = state.execucao;
    if (target === "weight") ec.weight = Math.max(0, ec.weight + dir * 2.5);
    if (target === "reps") ec.reps = Math.max(0, ec.reps + dir);
    if (target === "cardioMin") {
      const el = document.getElementById("cardioMinValue");
      el.textContent = Math.max(0, parseInt(el.textContent, 10) + dir * 5);
      return;
    }
    renderSetCard();
  });
});

document.getElementById("confirmSetBtn").addEventListener("click", () => {
  const ec = state.execucao;
  ec.setsFeitos[ec.setAtual - 1] = { peso: ec.weight, reps: ec.reps };
  if (ec.setAtual < ec.totalSets) {
    ec.setAtual++;
  }
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
    // fim do treino
    showScreen("hoje");
    renderHoje();
  }
});

document.getElementById("execCloseBtn").addEventListener("click", () => {
  showScreen("treinos");
});

/* =========================================================
   TELA "CARDIO"
   ========================================================= */

document.querySelectorAll("#cardioTypeRow .chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll("#cardioTypeRow .chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
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
  renderChart(select.value);
}

document.getElementById("progressExerciseSelect").addEventListener("change", e => {
  renderChart(e.target.value);
});

function renderChart(exId) {
  const p = currentProfile();
  const dados = p.historico[exId] || [];
  const svg = document.getElementById("chartSvg");
  svg.innerHTML = "";

  if (dados.length === 0) return;

  const cargas = dados.map(d => d.carga);
  const min = Math.min(...cargas);
  const max = Math.max(...cargas);
  const pad = 20;
  const w = 300, h = 140;

  const points = dados.map((d, i) => {
    const x = pad + (i / (dados.length - 1 || 1)) * (w - pad * 2);
    const y = h - pad - ((d.carga - min) / (max - min || 1)) * (h - pad * 2);
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => (i === 0 ? "M" : "L") + p.x + " " + p.y).join(" ");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathD);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#C9482F");
  path.setAttribute("stroke-width", "2.5");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  svg.appendChild(path);

  points.forEach(p => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", p.x);
    circle.setAttribute("cy", p.y);
    circle.setAttribute("r", "3.5");
    circle.setAttribute("fill", "#C9482F");
    svg.appendChild(circle);
  });

  document.getElementById("lastLoad").textContent = cargas[cargas.length - 1] + " kg";
  document.getElementById("maxLoad").textContent = max + " kg";
}

/* =========================================================
   TELA "CALENDÁRIO"
   ========================================================= */

function renderCalendario() {
  const p = currentProfile();
  const grid = document.getElementById("calGrid");
  grid.innerHTML = "";

  ["D", "S", "T", "Q", "Q", "S", "S"].forEach(d => {
    const head = document.createElement("div");
    head.className = "cal-cell head";
    head.textContent = d;
    grid.appendChild(head);
  });

  // agosto 2026 fake: começa numa sábado (dia 1), 31 dias
  const firstWeekday = 6; // sáb
  const daysInMonth = 31;
  const today = 16;

  for (let i = 0; i < firstWeekday; i++) {
    grid.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    const trained = p.diasTreinados.includes(day);
    cell.className = "cal-cell" + (trained ? " trained" : "") + (day === today ? " today" : "");
    cell.textContent = day;
    if (trained) {
      cell.addEventListener("click", () => {
        document.getElementById("dayDetail").style.display = "block";
        document.getElementById("dayDetailDate").textContent = `${day} de agosto`;
        document.getElementById("dayDetailContent").textContent =
          "Treino concluído — detalhes viriam do histórico salvo no Firestore.";
      });
    }
    grid.appendChild(cell);
  }
}

/* =========================================================
   RENDER GERAL (ao trocar de perfil, por exemplo)
   ========================================================= */

function renderAll() {
  renderHoje();
  renderTemplateList();
  renderProgressoOptions();
  renderCalendario();
}

renderAll();
