import { h, showLoading, showEmpty, fadeIn, fmtKg } from "../ui.js";
import { getCurrentProfile } from "../state.js";
import { getExercisesWithProgress, getExercise, getProgress } from "../data-service.js";
import { ProgressChart } from "../components/progress-chart.js";

export function renderProgress(root) {
  showLoading(root, "Calculando sua evolução…");
  setTimeout(() => {
    const profileId = getCurrentProfile();
    const disponiveis = getExercisesWithProgress(profileId);

    if (disponiveis.length === 0) {
      showEmpty(root, { title: "Sem progresso ainda", description: "Conclua um treino para começar a ver sua evolução aqui." });
      return;
    }

    let selecionado = disponiveis.find(e => e.id === "supino-reto")?.id
      || disponiveis.find(e => e.id === "agachamento-livre")?.id
      || disponiveis[0].id;

    function paint() {
      const exerciseDef = getExercise(selecionado);
      const progress = getProgress(profileId, selecionado);

      const screen = h("div", { class: "screen screen--progress" }, [
        h("header", { class: "screen-header" }, [
          h("h1", { class: "screen-title" }, "Progresso"),
        ]),
        h("select", {
          class: "progress-select",
          "aria-label": "Selecionar exercício",
          onchange: (e) => { selecionado = e.target.value; paint(); },
        }, disponiveis.map(ex => h("option", { value: ex.id, selected: ex.id === selecionado || undefined }, ex.nome))),

        h("div", { class: "progress-stats" }, [
          h("div", { class: "progress-stat" }, [
            h("span", { class: "progress-stat__value" }, fmtKg(progress.ultimaCarga)),
            h("span", { class: "progress-stat__label" }, "Última carga"),
          ]),
          h("div", { class: "progress-stat" }, [
            h("span", { class: "progress-stat__value" }, fmtKg(progress.maiorCarga)),
            h("span", { class: "progress-stat__label" }, "Maior carga"),
          ]),
          h("div", { class: "progress-stat" }, [
            h("span", { class: "progress-stat__value" }, String(progress.sessoes)),
            h("span", { class: "progress-stat__label" }, "Sessões"),
          ]),
        ]),

        ProgressChart(progress),
      ]);

      root.innerHTML = "";
      root.appendChild(screen);
      fadeIn(screen);
    }

    paint();
  }, 200);
}
