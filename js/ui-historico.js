import { CATEGORY_ICONS } from './food-db.js';
import { MEAL_LABELS, histExpandedDays, store } from './state.js';
import { heroHTML } from './ui-core.js';
import { formatQtyLabel } from './ui-inicio.js';
import { addDays, icons } from './utils.js';

/* Aba Histórico: refeições passadas, filtradas por dia/semana/mês/ano. */
export function renderHistorico(){
  return `
    ${heroHTML('historico')}
    <section class="card">
      <div class="filter-segment" id="histFilter">
        <button class="seg-btn${store.historicoFilter==='dia'?' active':''}" data-filter="dia">Dia</button>
        <button class="seg-btn${store.historicoFilter==='semana'?' active':''}" data-filter="semana">Semana</button>
        <button class="seg-btn${store.historicoFilter==='mes'?' active':''}" data-filter="mes">Mês</button>
        <button class="seg-btn${store.historicoFilter==='ano'?' active':''}" data-filter="ano">Ano</button>
      </div>
      <p class="empty-hint" style="padding:0 0 10px 0;">Toque em um alimento para editar a refeição ou a data. Use a lixeira para excluir.</p>
      <div id="histContent">${renderHistContent()}</div>
    </section>
  `;
}
export function renderHistContent(){
  const today = store.homeViewDate;
  if(store.historicoFilter==='ano'){
    const months = {};
    store.state.meals.forEach(m=>{
      if(m.date < addDays(today,-365)) return;
      const key = m.date.slice(0,7);
      if(!months[key]) months[key] = {kcal:0,count:0};
      months[key].kcal += m.kcal; months[key].count++;
    });
    const keys = Object.keys(months).sort().reverse();
    if(keys.length===0) return '<p class="empty-hint">Nenhum registro no último ano.</p>';
    return keys.map(k=>{
      const label = new Intl.DateTimeFormat('pt-BR',{month:'long', year:'numeric'}).format(new Date(k+'-15T12:00:00Z'));
      return `<div class="hist-day-group"><div class="hist-date-title">${label}</div><div class="hist-day-total">${months[k].count} itens · ${Math.round(months[k].kcal)} kcal totais</div></div>`;
    }).join('');
  }

  let startDate;
  if(store.historicoFilter==='dia') startDate = today;
  else if(store.historicoFilter==='semana') startDate = addDays(today,-6);
  else startDate = addDays(today,-29);

  const relevant = store.state.meals.filter(m=>m.date>=startDate && m.date<=today);
  if(relevant.length===0) return '<p class="empty-hint">Nenhum registro nesse período.</p>';

  const byDate = {};
  relevant.forEach(m=>{ if(!byDate[m.date]) byDate[m.date]=[]; byDate[m.date].push(m); });
  const dates = Object.keys(byDate).sort().reverse();

  return dates.map(dt=>{
    const items = byDate[dt];
    const total = items.reduce((a,i)=>a+i.kcal,0);
    const groups = Object.keys(MEAL_LABELS).map(mt=>{
      const mi = items.filter(i=>i.mealType===mt);
      if(mi.length===0) return '';
      const mealTotal = mi.reduce((a,i)=>a+i.kcal,0);
      return `<div class="hist-meal-group">
        <div class="hist-meal-title">${MEAL_LABELS[mt]}</div>
        ${mi.map(i=>`<div class="food-row clickable" data-edit-meal="${i.id}"><div class="fr-icon"><i data-lucide="${CATEGORY_ICONS[i.category] || 'utensils'}"></i></div><div class="fr-info"><span class="fr-name">${i.name}</span><span class="fr-sub">${formatQtyLabel(i)}</span></div><span class="fr-kcal">${Math.round(i.kcal)} kcal</span><button class="fr-delete" data-delete-meal="${i.id}" data-meal-name="${i.name.replace(/"/g,'&quot;')}"><i data-lucide="trash-2"></i></button></div>`).join('')}
        <div class="hist-meal-total">Total ${MEAL_LABELS[mt].toLowerCase()}: <b>${Math.round(mealTotal)} kcal</b></div>
      </div>`;
    }).join('');
    const d = new Date(dt+'T12:00:00Z');
    const dayNum = d.getUTCDate();
    const monthAbbr = new Intl.DateTimeFormat('pt-BR', {month:'short', timeZone:'UTC'}).format(d).replace('.','').toUpperCase();
    const expanded = !!histExpandedDays[dt];
    return `<div class="hist-day-card">
      <button class="hist-day-header" data-toggle-day="${dt}">
        <div class="hist-day-badge ${dayStatusClass(total, store.state.goals.calorias)}">
          <span class="hd-day">${dayNum}</span>
          <span class="hd-month">${monthAbbr}</span>
        </div>
        <div class="hist-day-info">
          <span class="hist-day-kcal">${Math.round(total)} kcal</span>
          <span class="hist-day-count">${items.length} ${items.length===1?'alimento':'alimentos'}</span>
        </div>
        <i data-lucide="chevron-down" class="hist-day-chevron${expanded?' open':''}"></i>
      </button>
      <div class="hist-day-body${expanded?' open':''}">
        ${groups}
      </div>
    </div>`;
  }).join('');
}
export function dayStatusClass(kcalTotal, goalKcal){
  if(!goalKcal || goalKcal<=0) return 'ok';
  if(kcalTotal <= goalKcal) return 'ok';
  const overPct = (kcalTotal-goalKcal)/goalKcal;
  return overPct <= 0.15 ? 'warn' : 'over';
}
export function wireHistorico(){
  document.getElementById('histFilter').addEventListener('click', (e)=>{
    const btn = e.target.closest('.seg-btn');
    if(!btn) return;
    store.historicoFilter = btn.dataset.filter;
    document.querySelectorAll('#histFilter .seg-btn').forEach(b=>b.classList.toggle('active', b.dataset.filter===store.historicoFilter));
    document.getElementById('histContent').innerHTML = renderHistContent();
    icons();
  });
  document.getElementById('histContent').addEventListener('click', (e)=>{
    const toggleBtn = e.target.closest('[data-toggle-day]');
    if(!toggleBtn) return;
    const dt = toggleBtn.dataset.toggleDay;
    histExpandedDays[dt] = !histExpandedDays[dt];
    document.getElementById('histContent').innerHTML = renderHistContent();
    icons();
  });
}
