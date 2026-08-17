import { h, showLoading, fadeIn } from "../ui.js";
import { navigate } from "../router.js";
import { getCurrentProfile } from "../state.js";
import { getProfile, getTodayWorkout, getStreak, getLast7Days, getCardioHistory } from "../data-service.js";
import { Streak, Last7Days } from "../components/streak.js";

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export function renderHome(root) {
  showLoading(root, "Preparando o seu dia…");
  setTimeout(() => {
    const profileId = getCurrentProfile();
    const profile = getProfile(profileId);
    const workout = getTodayWorkout(profileId);
    const streak = getStreak(profileId);
    const last7 = getLast7Days(profileId);
    const cardioHistory = getCardioHistory(profileId);
    const ultimoCardio = cardioHistory[0];

    const screen = h("div", { class: "screen screen--home" }, [
      h("header", { class: "home-header" }, [
        h("p", { class: "home-greeting" }, `${saudacao()}, ${profile.nome}`),
        Streak(streak),
      ]),

      h("section", { class: "today-block" }, [
        h("p", { class: "eyebrow" }, "Hoje"),
        workout
          ? h("div", { class: "today-card" }, [
              h("h2", { class: "today-card__nome" }, workout.nome),
              h("p", { class: "today-card__grupo" }, workout.grupo),
              h("p", { class: "today-card__meta" }, `${workout.exercicios.length} exercícios`),
              h("button", { class: "btn btn-primary", onclick: () => navigate(`execucao/${workout.id}`) }, "Iniciar treino"),
            ])
          : h("div", { class: "today-card today-card--rest" }, [
              h("h2", { class: "today-card__nome" }, "Dia de descanso"),
              h("p", { class: "today-card__grupo" }, "Aproveite para recuperar — o corpo cresce no descanso."),
            ]),
      ]),

      h("hr", { class: "divider" }),

      h("section", { class: "last7-block" }, [
        h("p", { class: "section-label" }, "Últimos 7 dias"),
        Last7Days(last7),
      ]),

      h("hr", { class: "divider" }),

      h("section", { class: "cardio-block" }, [
        h("p", { class: "section-label" }, "Cardio"),
        ultimoCardio
          ? h("p", { class: "cardio-block__last" }, `Último registro: ${ultimoCardio.duracao} min de ${ultimoCardio.tipo.toLowerCase()}`)
          : h("p", { class: "cardio-block__last" }, "Nenhum cardio registrado ainda"),
        h("button", { class: "btn btn-secondary", onclick: () => navigate("cardio") }, "Registrar cardio"),
      ]),
    ]);

    root.innerHTML = "";
    root.appendChild(screen);
    fadeIn(screen);
  }, 220);
}
