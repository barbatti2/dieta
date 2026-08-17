import { garantirLogin } from './firebase-config.js';
import {
  carregarPerfis, salvarNomePerfil,
  carregarExerciciosCustom, salvarExercicioCustom, excluirExercicioCustom,
  carregarPlano, salvarPlano, listarSemanas,
  registrarLog, carregarLogsPorPerfil, excluirLog
} from './db.js';
import { CATEGORIAS, EXERCICIOS_PADRAO, DIAS_SEMANA } from './exercises-data.js';

// ---------------------------------------------------------------
// ESTADO GLOBAL
// ---------------------------------------------------------------
const state = {
  perfilAtual: localStorage.getItem('perfilAtual') || 'p1',
  perfis: { p1: { nome: 'Pessoa 1' }, p2: { nome: 'Pessoa 2' } },
  exercicios: [...EXERCICIOS_PADRAO],
  logs: [],
  semanasCache: {},          // { perfilId: [ {semanaId, nome, dias} ] }
  semanaAtivaTreino: null,
  semanaAtivaAjustes: null,
  diaAtivoTreino: hojeDiaId(),
  diaAtivoAjustes: hojeDiaId(),
  categoriaFiltroBusca: null,
  categoriaFiltroCatalogo: null,
  viewAtual: 'inicio',
};

function hojeDiaId() {
  const map = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  return map[new Date().getDay()];
}
function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function normalizar(s) {
  return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
function catNome(id) { return (CATEGORIAS.find(c => c.id === id) || {}).nome || id; }
function exNome(id) { return (state.exercicios.find(e => e.id === id) || {}).nome || id; }

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}

// ---------------------------------------------------------------
// SHEET (modal genérico)
// ---------------------------------------------------------------
const sheetOverlay = document.getElementById('sheetOverlay');
const sheetTitle = document.getElementById('sheetTitle');
const sheetBody = document.getElementById('sheetBody');
document.getElementById('sheetClose').onclick = closeSheet;
sheetOverlay.addEventListener('click', (e) => { if (e.target === sheetOverlay) closeSheet(); });

function openSheet(title, htmlOrNode) {
  sheetTitle.textContent = title;
  sheetBody.innerHTML = '';
  if (typeof htmlOrNode === 'string') sheetBody.innerHTML = htmlOrNode;
  else sheetBody.appendChild(htmlOrNode);
  sheetOverlay.classList.add('open');
}
function closeSheet() { sheetOverlay.classList.remove('open'); }

// ---------------------------------------------------------------
// NAVEGAÇÃO
// ---------------------------------------------------------------
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => irPara(btn.dataset.view));
});
function irPara(view) {
  state.viewAtual = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${view}`).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  if (view === 'inicio') renderInicio();
  if (view === 'treinos') renderTreinos();
  if (view === 'atividades') renderAtividades();
  if (view === 'ajustes') renderAjustes();
}

document.querySelectorAll('.tabbar button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabbar button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-hoje').style.display = btn.dataset.tab === 'hoje' ? '' : 'none';
    document.getElementById('tab-buscar').style.display = btn.dataset.tab === 'buscar' ? '' : 'none';
  });
});

// ---------------------------------------------------------------
// PERFIS
// ---------------------------------------------------------------
function renderProfileSwitch() {
  const wrap = document.getElementById('profileSwitch');
  wrap.innerHTML = '';
  ['p1', 'p2'].forEach(pid => {
    const b = document.createElement('button');
    b.className = 'profile-pill' + (state.perfilAtual === pid ? ' active' : '');
    b.textContent = state.perfis[pid]?.nome || pid;
    b.onclick = () => trocarPerfil(pid);
    wrap.appendChild(b);
  });
}
async function trocarPerfil(pid) {
  if (pid === state.perfilAtual) return;
  state.perfilAtual = pid;
  localStorage.setItem('perfilAtual', pid);
  renderProfileSwitch();
  await carregarDadosPerfil();
  irPara(state.viewAtual);
}

// ---------------------------------------------------------------
// CARREGAR DADOS DO PERFIL ATIVO
// ---------------------------------------------------------------
async function garantirSemanas(perfilId) {
  let semanas = await listarSemanas(perfilId);
  if (semanas.length === 0) {
    await salvarPlano(perfilId, 'semana1', { nome: 'Semana 1', dias: {} });
    semanas = await listarSemanas(perfilId);
  }
  semanas.sort((a, b) => a.semanaId.localeCompare(b.semanaId, undefined, { numeric: true }));
  state.semanasCache[perfilId] = semanas;
  return semanas;
}

async function carregarDadosPerfil() {
  const semanas = await garantirSemanas(state.perfilAtual);
  state.semanaAtivaTreino = semanas[0].semanaId;
  state.semanaAtivaAjustes = semanas[0].semanaId;
  state.logs = await carregarLogsPorPerfil(state.perfilAtual, 120);
}

// ---------------------------------------------------------------
// INÍCIO
// ---------------------------------------------------------------
function renderInicio() {
  const dow = DIAS_SEMANA.find(d => d.id === hojeDiaId());
  document.getElementById('homeDay').textContent = dow ? dow.nome + '-feira' : '';
  document.getElementById('homeGreet').textContent = `Olá, ${state.perfis[state.perfilAtual]?.nome || ''}`;

  const semana = (state.semanasCache[state.perfilAtual] || []).find(s => s.semanaId === state.semanaAtivaTreino);
  const diaPlano = semana?.dias?.[hojeDiaId()] || [];
  document.getElementById('homePlanName').textContent = diaPlano.length
    ? `${semana.nome} · ${diaPlano.length} exercício(s) hoje`
    : 'Nenhum exercício cadastrado para hoje';

  // stats 7 dias
  const logs7 = filtrarLogsUltimosDias(7);
  const dias = new Set(logs7.map(l => l.data)).size;
  const series = logs7.reduce((s, l) => s + (l.series?.length || 0), 0);
  const volume = Math.round(logs7.reduce((s, l) => s + (l.series || []).reduce((a, x) => a + (Number(x.reps) || 0) * (Number(x.carga) || 0), 0), 0));

  document.getElementById('homeStats').innerHTML = `
    <div class="stat-box"><div class="num">${dias}</div><div class="lbl">Dias (7d)</div></div>
    <div class="stat-box"><div class="num">${series}</div><div class="lbl">Séries (7d)</div></div>
    <div class="stat-box"><div class="num">${volume}</div><div class="lbl">Volume kg (7d)</div></div>
  `;

  const logsHoje = state.logs.filter(l => l.data === hojeISO());
  const feitos = new Set(logsHoje.map(l => l.exercicioId));
  const listEl = document.getElementById('homeToday');
  if (diaPlano.length === 0) {
    listEl.innerHTML = `<div class="empty-state"><div class="ic">🗓️</div>Nenhum treino cadastrado para hoje.<br>Vá em Ajustes para montar o plano.</div>`;
  } else {
    listEl.innerHTML = diaPlano.map(ex => `
      <div class="quick-item" data-exid="${ex.exercicioId}">
        <div>
          <div class="qname">${feitos.has(ex.exercicioId) ? '✅ ' : ''}${ex.nome}</div>
          <div class="qmeta">${ex.categoria === 'cardio' ? `${ex.tempoCardio || '-'} min` : `${ex.series || '-'}x${ex.repeticoes || '-'} · ${ex.cargaSugerida ? ex.cargaSugerida + 'kg' : 'sugerido'}`}</div>
        </div>
        <span class="arrow">›</span>
      </div>
    `).join('');
    listEl.querySelectorAll('.quick-item').forEach(el => {
      el.onclick = () => {
        const ex = diaPlano.find(e => e.exercicioId === el.dataset.exid);
        abrirRegistro(ex.exercicioId, ex.nome, ex.categoria, ex);
      };
    });
  }
}

function filtrarLogsUltimosDias(n) {
  const limite = new Date();
  limite.setDate(limite.getDate() - (n - 1));
  limite.setHours(0, 0, 0, 0);
  return state.logs.filter(l => new Date(l.data + 'T00:00:00') >= limite);
}

// ---------------------------------------------------------------
// TREINOS
// ---------------------------------------------------------------
function renderTreinos() {
  const semanas = state.semanasCache[state.perfilAtual] || [];
  const sel = document.getElementById('weekSelectTreino');
  sel.innerHTML = semanas.map(s => `<option value="${s.semanaId}" ${s.semanaId === state.semanaAtivaTreino ? 'selected' : ''}>${s.nome}</option>`).join('');
  sel.onchange = () => { state.semanaAtivaTreino = sel.value; renderTreinos(); };

  const chips = document.getElementById('dayChipsTreino');
  chips.innerHTML = DIAS_SEMANA.map(d => {
    const semana = semanas.find(s => s.semanaId === state.semanaAtivaTreino);
    const temPlano = (semana?.dias?.[d.id] || []).length > 0;
    return `<button class="day-chip ${d.id === state.diaAtivoTreino ? 'active' : ''} ${temPlano ? 'has-plan' : ''}" data-dia="${d.id}">
      <span class="n">${d.nome.slice(0, 3)}</span>
    </button>`;
  }).join('');
  chips.querySelectorAll('.day-chip').forEach(c => {
    c.onclick = () => { state.diaAtivoTreino = c.dataset.dia; renderTreinos(); };
  });

  const semana = semanas.find(s => s.semanaId === state.semanaAtivaTreino);
  const diaPlano = semana?.dias?.[state.diaAtivoTreino] || [];
  const logsDoDia = state.logs.filter(l => l.diaSemana === state.diaAtivoTreino && l.data === hojeISO());
  const listEl = document.getElementById('dayPlanList');

  if (diaPlano.length === 0) {
    listEl.innerHTML = `<div class="empty-state"><div class="ic">📭</div>Nenhum exercício cadastrado para este dia.<br>Cadastre em Ajustes ou use "Buscar exercício".</div>`;
  } else {
    listEl.innerHTML = diaPlano.map(ex => {
      const feito = logsDoDia.find(l => l.exercicioId === ex.exercicioId);
      return `<div class="plan-item" data-exid="${ex.exercicioId}">
        <div>
          <div class="pname">${ex.nome}</div>
          <div class="pmeta">${ex.categoria === 'cardio' ? `${ex.tempoCardio || '-'} min cardio` : `${ex.series || '-'}x${ex.repeticoes || '-'} · sugerido ${ex.cargaSugerida || '-'}kg`}</div>
        </div>
        ${feito ? '<span class="pdone">FEITO ✓</span>' : '<span class="arrow">›</span>'}
      </div>`;
    }).join('');
    listEl.querySelectorAll('.plan-item').forEach(el => {
      el.onclick = () => {
        const ex = diaPlano.find(e => e.exercicioId === el.dataset.exid);
        abrirRegistro(ex.exercicioId, ex.nome, ex.categoria, ex);
      };
    });
  }

  renderCategoryChips('categoryChips', 'categoriaFiltroBusca', renderBusca);
  renderBusca();
}

function renderCategoryChips(containerId, stateKey, onchange) {
  const el = document.getElementById(containerId);
  el.innerHTML = `<button class="chip ${!state[stateKey] ? 'active' : ''}" data-cat="">Todas</button>` +
    CATEGORIAS.map(c => `<button class="chip ${state[stateKey] === c.id ? 'active' : ''}" data-cat="${c.id}">${c.icone} ${c.nome}</button>`).join('');
  el.querySelectorAll('.chip').forEach(c => {
    c.onclick = () => { state[stateKey] = c.dataset.cat || null; onchange(); };
  });
}

function renderBusca() {
  const termo = normalizar(document.getElementById('searchInput').value);
  let lista = state.exercicios;
  if (state.categoriaFiltroBusca) lista = lista.filter(e => e.categoria === state.categoriaFiltroBusca);
  if (termo) lista = lista.filter(e => normalizar(e.nome).includes(termo));
  lista = lista.slice(0, 60);

  const el = document.getElementById('searchResults');
  const chips = document.getElementById('categoryChips');
  chips.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', (c.dataset.cat || null) === state.categoriaFiltroBusca));

  if (lista.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="ic">🔎</div>Nenhum exercício encontrado.</div>`;
    return;
  }
  el.innerHTML = lista.map(ex => `
    <div class="exercise-row" data-exid="${ex.id}">
      <div><div class="ename">${ex.nome}</div><div class="ecat">${catNome(ex.categoria)}</div></div>
      <span class="arrow">›</span>
    </div>`).join('');
  el.querySelectorAll('.exercise-row').forEach(r => {
    r.onclick = () => {
      const ex = state.exercicios.find(e => e.id === r.dataset.exid);
      abrirRegistro(ex.id, ex.nome, ex.categoria);
    };
  });
}
document.getElementById('searchInput').addEventListener('input', renderBusca);

// ---------------------------------------------------------------
// REGISTRAR TREINO (sheet)
// ---------------------------------------------------------------
function abrirRegistro(exercicioId, nome, categoria, planoRef) {
  const isCardio = categoria === 'cardio';
  const seriesIniciais = planoRef?.series ? Number(planoRef.series) : 3;

  let bodyHtml = `<div class="field"><label>Exercício</label><input type="text" value="${nome}" disabled></div>`;

  if (isCardio) {
    bodyHtml += `
      <div class="field-row">
        <div class="field"><label>Tempo (min)</label><input type="number" id="regTempo" inputmode="decimal" value="${planoRef?.tempoCardio || ''}"></div>
        <div class="field"><label>Distância (km)</label><input type="number" id="regDist" inputmode="decimal" step="0.1"></div>
      </div>`;
  } else {
    bodyHtml += `
      <div class="set-head"><span>#</span><span>Reps</span><span>Carga (kg)</span><span></span></div>
      <div class="set-table" id="setTable"></div>
      <button class="btn btn-ghost btn-sm" id="addSetBtn" type="button">+ Série</button>`;
  }

  bodyHtml += `
    <div class="field" style="margin-top:14px;">
      <label>Duração (min) — opcional</label>
      <input type="number" id="regDuracao" placeholder="tempo gasto neste exercício">
    </div>
    <div class="field"><label>Observação</label><textarea id="regObs" placeholder="opcional"></textarea></div>
    <button class="btn btn-primary btn-full" id="salvarRegBtn">Salvar registro</button>
  `;

  openSheet('Registrar treino', bodyHtml);

  if (!isCardio) {
    const setTable = document.getElementById('setTable');
    const addRow = (reps = '', carga = '') => {
      const idx = setTable.children.length + 1;
      const row = document.createElement('div');
      row.className = 'set-row';
      row.innerHTML = `<span class="set-idx">${idx}</span>
        <input type="number" inputmode="numeric" placeholder="${planoRef?.repeticoes || '12'}" value="${reps}">
        <input type="number" inputmode="decimal" placeholder="${planoRef?.cargaSugerida || '0'}" value="${carga}">
        <button class="rm" type="button">✕</button>`;
      row.querySelector('.rm').onclick = () => { row.remove(); renumerar(); };
      setTable.appendChild(row);
    };
    const renumerar = () => setTable.querySelectorAll('.set-idx').forEach((s, i) => s.textContent = i + 1);
    for (let i = 0; i < seriesIniciais; i++) addRow();
    document.getElementById('addSetBtn').onclick = () => addRow();
  }

  document.getElementById('salvarRegBtn').onclick = async () => {
    const obs = document.getElementById('regObs').value.trim();
    const duracaoMin = Number(document.getElementById('regDuracao').value) || 0;
    let payload = {
      perfilId: state.perfilAtual,
      data: hojeISO(),
      diaSemana: hojeDiaId(),
      exercicioId, nome, categoria, obs, duracaoMin,
    };
    if (isCardio) {
      payload.series = [];
      payload.cardio = {
        tempoMin: Number(document.getElementById('regTempo').value) || 0,
        distanciaKm: Number(document.getElementById('regDist').value) || 0,
      };
    } else {
      const rows = [...document.getElementById('setTable').querySelectorAll('.set-row')];
      payload.series = rows.map(r => {
        const inputs = r.querySelectorAll('input');
        return { reps: Number(inputs[0].value) || 0, carga: Number(inputs[1].value) || 0 };
      }).filter(s => s.reps > 0 || s.carga > 0);
    }
    await registrarLog(payload);
    state.logs = await carregarLogsPorPerfil(state.perfilAtual, 120);
    closeSheet();
    toast('Treino registrado ✓');
    if (state.viewAtual === 'inicio') renderInicio();
    if (state.viewAtual === 'treinos') renderTreinos();
    if (state.viewAtual === 'atividades') renderAtividades();
  };
}

// ---------------------------------------------------------------
// ATIVIDADES
// ---------------------------------------------------------------
document.getElementById('historyRange').addEventListener('change', renderAtividades);

function renderAtividades() {
  const logs7 = filtrarLogsUltimosDias(7);
  const dias = new Set(logs7.map(l => l.data)).size;
  const series = logs7.reduce((s, l) => s + (l.series?.length || 0), 0);
  const reps = logs7.reduce((s, l) => s + (l.series || []).reduce((a, x) => a + (Number(x.reps) || 0), 0), 0);
  const volume = Math.round(logs7.reduce((s, l) => s + (l.series || []).reduce((a, x) => a + (Number(x.reps) || 0) * (Number(x.carga) || 0), 0), 0));
  const tempoTotal = logs7.reduce((s, l) => s + (Number(l.duracaoMin) || 0) + (Number(l.cardio?.tempoMin) || 0), 0);

  document.getElementById('activityStats').innerHTML = `
    <div class="stat-box"><div class="num">${dias}</div><div class="lbl">Dias treinados</div></div>
    <div class="stat-box"><div class="num">${tempoTotal}</div><div class="lbl">Min. de treino</div></div>
    <div class="stat-box"><div class="num">${series}</div><div class="lbl">Séries</div></div>
    <div class="stat-box"><div class="num">${reps}</div><div class="lbl">Repetições</div></div>
    <div class="stat-box"><div class="num">${volume}</div><div class="lbl">Volume (kg)</div></div>
    <div class="stat-box"><div class="num">${logs7.length}</div><div class="lbl">Exercícios</div></div>
  `;

  const porRegiao = {};
  logs7.forEach(l => { porRegiao[l.categoria] = (porRegiao[l.categoria] || 0) + 1; });
  const max = Math.max(1, ...Object.values(porRegiao));
  const regioes = CATEGORIAS.map(c => ({ ...c, n: porRegiao[c.id] || 0 })).sort((a, b) => b.n - a.n);
  document.getElementById('regionBars').innerHTML = regioes.map(r => `
    <div class="bar-row">
      <span class="blabel">${r.icone} ${r.nome}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(r.n / max) * 100}%"></div></div>
      <span class="bval">${r.n}</span>
    </div>`).join('');

  const dias2 = Number(document.getElementById('historyRange').value || 7);
  const logsHist = filtrarLogsUltimosDias(dias2).sort((a, b) => b.data.localeCompare(a.data));
  const porData = {};
  logsHist.forEach(l => { (porData[l.data] = porData[l.data] || []).push(l); });
  const datas = Object.keys(porData).sort((a, b) => b.localeCompare(a));

  const histEl = document.getElementById('historyList');
  if (datas.length === 0) {
    histEl.innerHTML = `<div class="empty-state"><div class="ic">📆</div>Sem registros neste período.</div>`;
    return;
  }
  histEl.innerHTML = datas.map(data => {
    const itens = porData[data];
    const dt = new Date(data + 'T00:00:00');
    const dataFmt = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    const dow = DIAS_SEMANA.find(d => d.id === itens[0].diaSemana)?.nome || '';
    return `<div class="log-entry">
      <span class="ldate">${dataFmt}</span><span class="ldow">${dow}</span>
      <div class="ltags">${itens.map(i => `<span class="ltag">${i.nome}${i.series?.length ? ' · ' + i.series.length + 'x' : ''}</span>`).join('')}</div>
    </div>`;
  }).join('');
}

// ---------------------------------------------------------------
// AJUSTES
// ---------------------------------------------------------------
document.getElementById('salvarPerfisBtn').onclick = async () => {
  const n1 = document.getElementById('nomePerfil1').value.trim();
  const n2 = document.getElementById('nomePerfil2').value.trim();
  if (n1) { await salvarNomePerfil('p1', n1); state.perfis.p1.nome = n1; }
  if (n2) { await salvarNomePerfil('p2', n2); state.perfis.p2.nome = n2; }
  renderProfileSwitch();
  toast('Perfis atualizados ✓');
};

document.getElementById('novaSemanaBtn').onclick = async () => {
  const n = state.semanasCache[state.perfilAtual].length + 1;
  const semanaId = `semana${n}`;
  await salvarPlano(state.perfilAtual, semanaId, { nome: `Semana ${n}`, dias: {} });
  await garantirSemanas(state.perfilAtual);
  state.semanaAtivaAjustes = semanaId;
  renderAjustes();
  toast('Semana criada ✓');
};

document.getElementById('renomearSemanaBtn').onclick = async () => {
  const semana = state.semanasCache[state.perfilAtual].find(s => s.semanaId === state.semanaAtivaAjustes);
  const novo = prompt('Novo nome da semana:', semana.nome);
  if (!novo) return;
  await salvarPlano(state.perfilAtual, state.semanaAtivaAjustes, { nome: novo, dias: semana.dias || {} });
  await garantirSemanas(state.perfilAtual);
  renderAjustes();
  toast('Semana renomeada ✓');
};

document.getElementById('addExercicioDiaBtn').onclick = () => abrirEscolhaExercicioParaDia();

function abrirEscolhaExercicioParaDia() {
  let html = `
    <div class="search-wrap"><span class="sicon">🔍</span><input type="text" id="sheetSearchInput" placeholder="Buscar exercício..."></div>
    <div class="chip-row" id="sheetCatChips"></div>
    <div id="sheetExList" style="max-height:280px;overflow-y:auto;"></div>`;
  openSheet('Adicionar exercício', html);

  let catFiltro = null;
  const chips = document.getElementById('sheetCatChips');
  chips.innerHTML = `<button class="chip active" data-cat="">Todas</button>` +
    CATEGORIAS.map(c => `<button class="chip" data-cat="${c.id}">${c.icone} ${c.nome}</button>`).join('');
  const renderLista = () => {
    const termo = normalizar(document.getElementById('sheetSearchInput').value);
    let lista = state.exercicios;
    if (catFiltro) lista = lista.filter(e => e.categoria === catFiltro);
    if (termo) lista = lista.filter(e => normalizar(e.nome).includes(termo));
    lista = lista.slice(0, 50);
    document.getElementById('sheetExList').innerHTML = lista.map(ex => `
      <div class="exercise-row" data-exid="${ex.id}">
        <div><div class="ename">${ex.nome}</div><div class="ecat">${catNome(ex.categoria)}</div></div>
        <span class="arrow">›</span>
      </div>`).join('') || `<div class="empty-state">Nenhum resultado.</div>`;
    document.getElementById('sheetExList').querySelectorAll('.exercise-row').forEach(r => {
      r.onclick = () => {
        const ex = state.exercicios.find(e => e.id === r.dataset.exid);
        abrirConfigMeta(ex);
      };
    });
  };
  chips.querySelectorAll('.chip').forEach(c => {
    c.onclick = () => { catFiltro = c.dataset.cat || null; chips.querySelectorAll('.chip').forEach(x => x.classList.remove('active')); c.classList.add('active'); renderLista(); };
  });
  document.getElementById('sheetSearchInput').addEventListener('input', renderLista);
  renderLista();
}

function abrirConfigMeta(ex) {
  const isCardio = ex.categoria === 'cardio';
  let html = `<div class="field"><label>Exercício</label><input type="text" value="${ex.nome}" disabled></div>`;
  if (isCardio) {
    html += `<div class="field"><label>Tempo sugerido (min)</label><input type="number" id="mTempo" value="20"></div>`;
  } else {
    html += `
      <div class="field-row">
        <div class="field"><label>Séries</label><input type="number" id="mSeries" value="3"></div>
        <div class="field"><label>Repetições</label><input type="number" id="mReps" value="12"></div>
      </div>
      <div class="field"><label>Carga sugerida (kg)</label><input type="number" id="mCarga" value="0"></div>`;
  }
  html += `<button class="btn btn-primary btn-full" id="mSalvar">Adicionar ao dia</button>`;
  openSheet('Definir meta', html);
  document.getElementById('mSalvar').onclick = async () => {
    const semana = state.semanasCache[state.perfilAtual].find(s => s.semanaId === state.semanaAtivaAjustes);
    const dias = semana.dias || {};
    const lista = dias[state.diaAtivoAjustes] || [];
    const item = { exercicioId: ex.id, nome: ex.nome, categoria: ex.categoria };
    if (isCardio) item.tempoCardio = Number(document.getElementById('mTempo').value) || 0;
    else {
      item.series = Number(document.getElementById('mSeries').value) || 0;
      item.repeticoes = Number(document.getElementById('mReps').value) || 0;
      item.cargaSugerida = Number(document.getElementById('mCarga').value) || 0;
    }
    lista.push(item);
    dias[state.diaAtivoAjustes] = lista;
    await salvarPlano(state.perfilAtual, state.semanaAtivaAjustes, { nome: semana.nome, dias });
    await garantirSemanas(state.perfilAtual);
    closeSheet();
    toast('Exercício adicionado ao dia ✓');
    renderAjustes();
  };
}

function renderAjustes() {
  document.getElementById('nomePerfil1').value = state.perfis.p1?.nome || '';
  document.getElementById('nomePerfil2').value = state.perfis.p2?.nome || '';

  const semanas = state.semanasCache[state.perfilAtual] || [];
  const sel = document.getElementById('weekSelectAjustes');
  sel.innerHTML = semanas.map(s => `<option value="${s.semanaId}" ${s.semanaId === state.semanaAtivaAjustes ? 'selected' : ''}>${s.nome}</option>`).join('');
  sel.onchange = () => { state.semanaAtivaAjustes = sel.value; renderAjustes(); };

  const semana = semanas.find(s => s.semanaId === state.semanaAtivaAjustes);
  const chips = document.getElementById('dayChipsAjustes');
  chips.innerHTML = DIAS_SEMANA.map(d => {
    const temPlano = (semana?.dias?.[d.id] || []).length > 0;
    return `<button class="day-chip ${d.id === state.diaAtivoAjustes ? 'active' : ''} ${temPlano ? 'has-plan' : ''}" data-dia="${d.id}"><span class="n">${d.nome.slice(0, 3)}</span></button>`;
  }).join('');
  chips.querySelectorAll('.day-chip').forEach(c => {
    c.onclick = () => { state.diaAtivoAjustes = c.dataset.dia; renderAjustes(); };
  });

  const diaLista = semana?.dias?.[state.diaAtivoAjustes] || [];
  const editEl = document.getElementById('dayEditList');
  editEl.innerHTML = diaLista.length ? diaLista.map((ex, i) => `
    <div class="plan-item">
      <div>
        <div class="pname">${ex.nome}</div>
        <div class="pmeta">${ex.categoria === 'cardio' ? `${ex.tempoCardio || '-'} min cardio` : `${ex.series || '-'}x${ex.repeticoes || '-'} · ${ex.cargaSugerida || '-'}kg`}</div>
      </div>
      <button class="del" data-i="${i}">🗑</button>
    </div>`).join('') : `<div class="empty-state"><div class="ic">🗒️</div>Nenhum exercício neste dia ainda.</div>`;
  editEl.querySelectorAll('.del').forEach(b => {
    b.onclick = async () => {
      diaLista.splice(Number(b.dataset.i), 1);
      semana.dias[state.diaAtivoAjustes] = diaLista;
      await salvarPlano(state.perfilAtual, state.semanaAtivaAjustes, { nome: semana.nome, dias: semana.dias });
      await garantirSemanas(state.perfilAtual);
      renderAjustes();
      toast('Removido do dia');
    };
  });

  renderCategoryChips('categoryChipsAjustes', 'categoriaFiltroCatalogo', renderCatalogo);
  renderCatalogo();
}

document.getElementById('novoExercicioBtn').onclick = () => {
  const html = `
    <div class="field"><label>Nome do exercício</label><input type="text" id="novoExNome" placeholder="ex: Supino inclinado no smith"></div>
    <div class="field"><label>Categoria</label>
      <select id="novoExCat">${CATEGORIAS.map(c => `<option value="${c.id}">${c.icone} ${c.nome}</option>`).join('')}</select>
    </div>
    <button class="btn btn-primary btn-full" id="novoExSalvar">Salvar no catálogo</button>`;
  openSheet('Novo exercício', html);
  document.getElementById('novoExSalvar').onclick = async () => {
    const nome = document.getElementById('novoExNome').value.trim();
    if (!nome) { toast('Digite um nome'); return; }
    const categoria = document.getElementById('novoExCat').value;
    const id = await salvarExercicioCustom({ nome, categoria, custom: true });
    state.exercicios.push({ id, nome, categoria, custom: true });
    closeSheet();
    toast('Exercício cadastrado ✓');
    if (state.viewAtual === 'ajustes') renderAjustes();
  };
};

function renderCatalogo() {
  let lista = state.exercicios;
  if (state.categoriaFiltroCatalogo) lista = lista.filter(e => e.categoria === state.categoriaFiltroCatalogo);
  const el = document.getElementById('catalogoList');
  el.innerHTML = lista.map(ex => `
    <div class="exercise-row">
      <div><div class="ename">${ex.nome}</div><div class="ecat">${catNome(ex.categoria)}</div></div>
      ${ex.custom ? `<button class="del" data-exid="${ex.id}">🗑</button>` : ''}
    </div>`).join('');
  el.querySelectorAll('.del').forEach(b => {
    b.onclick = async (e) => {
      e.stopPropagation();
      await excluirExercicioCustom(b.dataset.exid);
      state.exercicios = state.exercicios.filter(x => x.id !== b.dataset.exid);
      renderCatalogo();
      toast('Exercício removido do catálogo');
    };
  });
}

// ---------------------------------------------------------------
// INICIALIZAÇÃO
// ---------------------------------------------------------------
async function init() {
  await garantirLogin();
  state.perfis = await carregarPerfis();
  const custom = await carregarExerciciosCustom();
  state.exercicios = [...EXERCICIOS_PADRAO, ...custom.map(e => ({ ...e, custom: true }))];
  renderProfileSwitch();
  await carregarDadosPerfil();
  irPara('inicio');
}
init().catch(err => {
  console.error(err);
  toast('Erro ao conectar ao Firebase. Verifique js/firebase-config.js');
});
