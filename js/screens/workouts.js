import { h, showLoading, fadeIn } from "../ui.js";
import { navigate } from "../router.js";
import { getCurrentProfile } from "../state.js";
import { getWorkouts } from "../data-service.js";
import { WorkoutCard } from "../components/workout-card.js";

export function renderWorkouts(root) {
  showLoading(root, "Carregando treinos…");
  setTimeout(() => {
    const profileId = getCurrentProfile();
    const workouts = getWorkouts(profileId);

    const screen = h("div", { class: "screen screen--workouts" }, [
      h("header", { class: "screen-header" }, [
        h("h1", { class: "screen-title" }, "Treinos"),
        h("p", { class: "screen-subtitle" }, "Sua rotina"),
      ]),
      h("div", { class: "workout-list" }, workouts.map(w => WorkoutCard(w, { onClick: () => navigate(`execucao/${w.id}`) }))),
    ]);

    root.innerHTML = "";
    root.appendChild(screen);
    fadeIn(screen);
  }, 180);
}
