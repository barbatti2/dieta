import { h } from "../ui.js";

export function ExerciseCard(exercicio, exerciseDef, { index, active, done } = {}) {
  const classes = ["exercise-card"];
  if (active) classes.push("is-active");
  if (done) classes.push("is-done");
  return h("div", { class: classes.join(" ") }, [
    h("span", { class: "exercise-card__index" }, done ? "✓" : String(index)),
    h("span", { class: "exercise-card__body" }, [
      h("span", { class: "exercise-card__nome" }, exerciseDef.nome),
      h("span", { class: "exercise-card__meta" }, `${exercicio.series} séries · ${exercicio.repsAlvo} reps`),
    ]),
  ]);
}
