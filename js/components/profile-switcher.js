import { h } from "../ui.js";
import { getProfiles } from "../data-service.js";
import { getCurrentProfile, setProfile } from "../state.js";

export function ProfileSwitcher() {
  const profiles = getProfiles();
  const current = getCurrentProfile();

  const pill = h("div", { class: "profile-switcher", role: "tablist", "aria-label": "Selecionar perfil" },
    profiles.map(p => h("button", {
      class: `profile-switcher__item${p.id === current ? " is-active" : ""}`,
      role: "tab",
      "aria-selected": p.id === current ? "true" : "false",
      onclick: () => setProfile(p.id),
    }, p.nome))
  );
  return pill;
}
