import { h } from "../ui.js";

export function SetStepper({ label, value, format, step, min = 0, onChange }) {
  let current = value;
  const display = h("div", { class: "stepper__value" }, format(current));

  function set(v) {
    current = Math.max(min, +v.toFixed(2));
    display.textContent = format(current);
    onChange(current);
    display.classList.remove("stepper__value--pulse");
    void display.offsetWidth;
    display.classList.add("stepper__value--pulse");
  }

  return h("div", { class: "stepper" }, [
    h("span", { class: "stepper__label" }, label),
    h("div", { class: "stepper__row" }, [
      h("button", { class: "stepper__btn", "aria-label": `Diminuir ${label}`, onclick: () => set(current - step) }, "−"),
      display,
      h("button", { class: "stepper__btn", "aria-label": `Aumentar ${label}`, onclick: () => set(current + step) }, "+"),
    ]),
  ]);
}
