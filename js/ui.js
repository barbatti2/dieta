// ui.js
// Utilidades pequenas de DOM. Nada de framework — só o suficiente para
// manter os componentes legíveis.

export function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null && v !== false) el.setAttribute(k, v);
  }
  const kids = Array.isArray(children) ? children : [children];
  kids.forEach(c => {
    if (c === null || c === undefined || c === false) return;
    el.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(c) : c);
  });
  return el;
}

export function mount(root, node) {
  root.innerHTML = "";
  root.appendChild(node);
}

export function fmtKg(v) {
  return Number.isInteger(v) ? `${v} kg` : `${v.toFixed(1)} kg`;
}

export function fmtDatePt(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}`;
}

// pequeno helper para transição de entrada suave em troca de tela
export function fadeIn(el) {
  el.classList.add("screen-enter");
  requestAnimationFrame(() => {
    el.classList.add("screen-enter-active");
    setTimeout(() => el.classList.remove("screen-enter", "screen-enter-active"), 260);
  });
}

export function showLoading(root, label = "Carregando…") {
  root.innerHTML = "";
  root.appendChild(h("div", { class: "loading-state" }, [
    h("div", { class: "loading-spinner" }),
    h("p", { class: "loading-label" }, label),
  ]));
}

export function showEmpty(root, { title, description, action }) {
  root.innerHTML = "";
  const kids = [
    h("div", { class: "empty-mark" }),
    h("h3", { class: "empty-title" }, title),
    h("p", { class: "empty-desc" }, description),
  ];
  if (action) kids.push(action);
  root.appendChild(h("div", { class: "empty-state" }, kids));
}

export function showError(root, { title = "Algo não carregou", description = "Tente novamente em instantes.", onRetry } = {}) {
  root.innerHTML = "";
  root.appendChild(h("div", { class: "empty-state empty-state--error" }, [
    h("div", { class: "empty-mark empty-mark--error" }),
    h("h3", { class: "empty-title" }, title),
    h("p", { class: "empty-desc" }, description),
    onRetry ? h("button", { class: "btn btn-secondary", onclick: onRetry }, "Tentar de novo") : null,
  ]));
}
