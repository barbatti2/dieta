// muscle-map.js
// Camada isolada para o mapa muscular. A biblioteca body-highlighter é
// feita para React e não roda em JS vanilla sem build step; para não
// desenhar um boneco anatômico manualmente (fora do escopo pedido),
// usamos um fallback visual elegante que respeita a mesma taxonomia de
// músculos (slugs) que a lib usaria — assim, se o projeto migrar para
// React futuramente, basta trocar o corpo desta função.
import { h } from "../ui.js";

const MUSCLE_LABELS = {
  chest: "Peito", triceps: "Tríceps", "front-deltoids": "Ombros", "back-deltoids": "Ombros",
  "upper-back": "Costas", "lower-back": "Lombar", biceps: "Bíceps", forearm: "Antebraço",
  trapezius: "Trapézio", quadriceps: "Quadríceps", hamstring: "Posterior de coxa",
  gluteal: "Glúteos", calves: "Panturrilha", abductors: "Abdutores", abs: "Abdômen",
  obliques: "Oblíquos",
};

export function MuscleMap(exercise, { compact = true } = {}) {
  const primary = exercise.muscles?.primary || [];
  const secondary = exercise.muscles?.secondary || [];

  const badge = h("div", { class: "muscle-map__glyph", "aria-hidden": "true" }, [
    h("div", { class: "muscle-map__ring muscle-map__ring--primary" }),
    secondary.length ? h("div", { class: "muscle-map__ring muscle-map__ring--secondary" }) : null,
  ]);

  const list = h("div", { class: "muscle-map__list" }, [
    ...primary.map(m => h("span", { class: "muscle-chip muscle-chip--primary" }, MUSCLE_LABELS[m] || m)),
    ...secondary.map(m => h("span", { class: "muscle-chip muscle-chip--secondary" }, MUSCLE_LABELS[m] || m)),
  ]);

  return h("div", { class: `muscle-map${compact ? " muscle-map--compact" : ""}` }, [badge, list]);
}
