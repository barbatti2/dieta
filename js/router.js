// router.js
// Roteador simples baseado em hash (#/tela ou #/tela/param). Sem
// dependências — só o suficiente para a navegação parecer um app real,
// com histórico do navegador (voltar/avançar funcionam).

const routes = {};
let notFoundHandler = () => {};

export function registerRoute(name, handler) {
  routes[name] = handler;
}

export function setNotFound(handler) {
  notFoundHandler = handler;
}

export function navigate(path) {
  if (location.hash.slice(1) === path) { handleRoute(); return; }
  location.hash = path;
}

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [name, ...rest] = raw.split("/");
  return { name: name || "hoje", params: rest };
}

function handleRoute() {
  const { name, params } = parseHash();
  const handler = routes[name];
  if (handler) handler(...params);
  else notFoundHandler(name);
  updateBottomNavActive(name);
}

function updateBottomNavActive(name) {
  document.querySelectorAll("[data-nav-item]").forEach(el => {
    el.classList.toggle("is-active", el.dataset.navItem === name);
  });
  const bottomNav = document.getElementById("bottom-nav");
  const immersive = name === "execucao";
  bottomNav?.classList.toggle("is-hidden", immersive);
  document.getElementById("app")?.classList.toggle("is-immersive", immersive);
}

export function currentRouteName() {
  return parseHash().name;
}

export function reRender() {
  handleRoute();
}

export function initRouter() {
  window.addEventListener("hashchange", handleRoute);
  handleRoute();
}
