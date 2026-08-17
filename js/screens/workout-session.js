import { h, showLoading, showEmpty, fadeIn, fmtKg } from "../ui.js";
import { navigate } from "../router.js";
import { getCurrentProfile, getActiveSession, startWorkoutSession, clearActiveSession } from "../state.js";
import { getWorkout, getExercise, getProgress, registrarSessao } from "../data-service.js";
import { MuscleMap } from "../components/muscle-map.js";
import { SetStepper } from "../components/set-stepper.js";

export function renderWorkoutSession(root, workoutId) {
  showLoading(root, "Preparando o treino…");
  setTimeout(() => {
    const profileId = getCurrentProfile();
    const workout = getWorkout(profileId, workoutId);
    if (!workout) {
      showEmpty(root, { title: "Treino não encontrado", description: "Volte e escolha um treino da sua rotina." });
      return;
    }

    let session = getActiveSession();
    if (!session || session.workoutId !== workoutId) {
      session = startWorkoutSession(workout);
    }

    renderStep(root, profileId, session);
  }, 180);
}

function renderStep(root, profileId, session) {
  const idx = session.exercicioIndex;
  const total = session.exercicios.length;
  const item = session.exercicios[idx];
  const exerciseDef = getExercise(item.exercicioId);
  const progress = getProgress(profileId, item.exercicioId);
  const isLastExercise = idx === total - 1;
  const metaAtingida = item.seriesConcluidas.length >= item.metaSeries;

  const pctBar = ((idx) / total) * 100 + (item.seriesConcluidas.length / item.metaSeries) * (100 / total);

  const screen = h("div", { class: "screen screen--session" }, [
    h("header", { class: "session-header" }, [
      h("button", { class: "session-back", "aria-label": "Voltar", onclick: () => { clearActiveSession(); navigate("treinos"); } }, "←"),
      h("span", { class: "session-header__title" }, session.workoutNome),
      h("span", { class: "session-header__count" }, `${idx + 1} / ${total}`),
    ]),
    h("div", { class: "session-progress" }, [
      h("div", { class: "session-progress__bar", style: `width:${Math.min(100, pctBar)}%` }),
    ]),

    h("div", { class: "session-exercise" }, [
      h("p", { class: "session-exercise__grupo" }, exerciseDef.grupoPrincipal.toUpperCase()),
      h("h1", { class: "session-exercise__nome" }, exerciseDef.nome),
      MuscleMap(exerciseDef, { compact: true }),
      progress.sessoes > 0
        ? h("p", { class: "session-exercise__ultima" }, `Última vez · ${fmtKg(progress.ultimaCarga)} × ${item.repsAlvo} reps`)
        : h("p", { class: "session-exercise__ultima" }, "Primeira vez registrando este exercício"),
    ]),

    h("div", { class: "session-controls" }, [
      SetStepper({ label: "PESO", value: item.pesoAtual, format: fmtKg, step: 2.5, min: 0, onChange: v => item.pesoAtual = v }),
      SetStepper({ label: "REPETIÇÕES", value: item.repsAtual, format: String, step: 1, min: 1, onChange: v => item.repsAtual = v }),
    ]),

    h("button", {
      class: "btn btn-primary btn-conclude",
      disabled: metaAtingida,
      onclick: (e) => concluirSerie(root, profileId, session, item, e.currentTarget),
    }, metaAtingida ? "Todas as séries concluídas" : "Concluir série"),

    h("div", { class: "session-sets" }, [
      h("p", { class: "section-label" }, "Séries concluídas"),
      item.seriesConcluidas.length
        ? h("ul", { class: "session-sets__list" }, item.seriesConcluidas.map(s => h("li", {}, `✓ ${fmtKg(s.peso)} × ${s.reps}`)))
        : h("p", { class: "session-sets__empty" }, "Nenhuma série ainda"),
    ]),

    h("button", {
      class: "btn btn-ghost btn-next",
      onclick: () => avancar(root, profileId, session),
    }, isLastExercise ? "Finalizar treino" : "Próximo exercício →"),
  ]);

  root.innerHTML = "";
  root.appendChild(screen);
  fadeIn(screen);
}

function concluirSerie(root, profileId, session, item, button) {
  if (item.seriesConcluidas.length >= item.metaSeries) return;
  item.seriesConcluidas.push({ peso: item.pesoAtual, reps: item.repsAtual });
  button.classList.remove("btn-conclude--pulse");
  void button.offsetWidth;
  button.classList.add("btn-conclude--pulse");
  renderStep(root, profileId, session);
}

function avancar(root, profileId, session) {
  const total = session.exercicios.length;
  if (session.exercicioIndex < total - 1) {
    session.exercicioIndex += 1;
    renderStep(root, profileId, session);
  } else {
    finalizarTreino(root, profileId, session);
  }
}

function finalizarTreino(root, profileId, session) {
  const exercicios = session.exercicios
    .filter(e => e.seriesConcluidas.length > 0)
    .map(e => ({ exercicioId: e.exercicioId, series: e.seriesConcluidas }));
  registrarSessao(profileId, session.workoutId, exercicios);
  clearActiveSession();

  const totalSeries = exercicios.reduce((acc, e) => acc + e.series.length, 0);
  const screen = h("div", { class: "screen screen--session-done" }, [
    h("div", { class: "session-done__mark" }),
    h("h1", { class: "session-done__title" }, "Treino concluído"),
    h("p", { class: "session-done__meta" }, `${exercicios.length} exercícios · ${totalSeries} séries`),
    h("button", { class: "btn btn-primary", onclick: () => navigate("hoje") }, "Voltar para hoje"),
  ]);
  root.innerHTML = "";
  root.appendChild(screen);
  fadeIn(screen);
}
