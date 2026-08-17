import { registerRoute, initRouter, reRender } from "./router.js";
import { on } from "./state.js";
import { ProfileSwitcher } from "./components/profile-switcher.js";
import { BottomNav } from "./components/bottom-nav.js";
import { renderHome } from "./screens/home.js";
import { renderWorkouts } from "./screens/workouts.js";
import { renderWorkoutSession } from "./screens/workout-session.js";
import { renderCardio } from "./screens/cardio.js";
import { renderProgress } from "./screens/progress.js";
import { renderCalendar } from "./screens/calendar.js";
import { showEmpty } from "./ui.js";

const screenRoot = document.getElementById("screen-root");
const headerSwitcher = document.getElementById("header-switcher");
const bottomNavSlot = document.getElementById("bottom-nav-slot");

function paintHeader() {
  headerSwitcher.innerHTML = "";
  headerSwitcher.appendChild(ProfileSwitcher());
}

paintHeader();
bottomNavSlot.appendChild(BottomNav());

on("profile-changed", () => {
  paintHeader();
  reRender();
});

registerRoute("hoje", () => renderHome(screenRoot));
registerRoute("treinos", () => renderWorkouts(screenRoot));
registerRoute("execucao", (workoutId) => renderWorkoutSession(screenRoot, workoutId));
registerRoute("cardio", () => renderCardio(screenRoot));
registerRoute("progresso", () => renderProgress(screenRoot));
registerRoute("calendario", () => renderCalendar(screenRoot));

initRouter();
