import { h } from "../ui.js";
import { navigate } from "../router.js";

const ICONS = {
  hoje: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 11.5 12 4l8 7.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 10v9.5h12V10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  treinos: `<svg viewBox="0 0 24 24" fill="none"><path d="M6.5 8.5v7M17.5 8.5v7M3.5 11h3M17.5 11h3M6.5 8.5h11v7h-11z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  progresso: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 19V9M11 19V4M18 19v-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  calendario: `<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="5.5" width="16" height="14.5" rx="2.5" stroke="currentColor" stroke-width="1.6"/><path d="M4 10h16M8.5 3.5v3M15.5 3.5v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
};

const ITEMS = [
  { id: "hoje", label: "Hoje" },
  { id: "treinos", label: "Treinos" },
  { id: "progresso", label: "Progresso" },
  { id: "calendario", label: "Calendário" },
];

export function BottomNav() {
  const nav = h("nav", { id: "bottom-nav", class: "bottom-nav", "aria-label": "Navegação principal" },
    ITEMS.map(item => h("button", {
      class: "bottom-nav__item",
      "data-nav-item": item.id,
      "aria-label": item.label,
      onclick: () => navigate(item.id),
      html: `${ICONS[item.id]}<span>${item.label}</span>`,
    }))
  );
  return nav;
}
