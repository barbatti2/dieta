import { h } from "../ui.js";

const TIPOS = ["Esteira", "Bike", "Elíptico", "Outro"];

export function CardioSelector(selected, onSelect) {
  return h("div", { class: "cardio-selector", role: "radiogroup", "aria-label": "Tipo de cardio" },
    TIPOS.map(tipo => h("button", {
      class: `cardio-selector__item${tipo === selected ? " is-active" : ""}`,
      role: "radio",
      "aria-checked": tipo === selected ? "true" : "false",
      onclick: () => onSelect(tipo),
    }, tipo))
  );
}
