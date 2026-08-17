import { h } from "../ui.js";

const LETTER_TONE = { A: "tone-a", B: "tone-b", C: "tone-c" };

export function WorkoutCard(workout, { onClick } = {}) {
  const letter = workout.nome.trim().slice(-1);
  return h("button", { class: `workout-card ${LETTER_TONE[letter] || ""}`, onclick: onClick }, [
    h("span", { class: "workout-card__letter" }, letter),
    h("span", { class: "workout-card__body" }, [
      h("span", { class: "workout-card__nome" }, workout.nome),
      h("span", { class: "workout-card__grupo" }, workout.grupo),
      h("span", { class: "workout-card__meta" }, `${workout.exercicios.length} exercícios`),
    ]),
    h("span", { class: "workout-card__arrow", "aria-hidden": "true" }, "→"),
  ]);
}
