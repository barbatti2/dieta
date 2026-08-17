import { h, fadeIn } from "../ui.js";
import { navigate } from "../router.js";
import { getCurrentProfile } from "../state.js";
import { registrarCardio } from "../data-service.js";
import { CardioSelector } from "../components/cardio-selector.js";
import { SetStepper } from "../components/set-stepper.js";

export function renderCardio(root) {
  const profileId = getCurrentProfile();
  let tipoSelecionado = "Esteira";
  let duracao = 30;
  let registrado = null;

  function paint() {
    const screen = h("div", { class: "screen screen--cardio" }, [
      h("header", { class: "screen-header" }, [
        h("h1", { class: "screen-title" }, "Cardio"),
      ]),

      registrado
        ? h("div", { class: "cardio-confirm" }, [
            h("div", { class: "cardio-confirm__mark" }),
            h("h2", { class: "cardio-confirm__title" }, "Cardio registrado"),
            h("p", { class: "cardio-confirm__meta" }, `${registrado.duracao} min · ${registrado.tipo}`),
            h("button", { class: "btn btn-secondary", onclick: () => navigate("hoje") }, "Voltar para hoje"),
          ])
        : h("div", {}, [
            h("p", { class: "section-label" }, "O que você fez?"),
            CardioSelector(tipoSelecionado, (tipo) => { tipoSelecionado = tipo; paint(); }),
            h("p", { class: "section-label cardio-duracao-label" }, "Duração"),
            SetStepper({ label: "", value: duracao, format: v => `${v} min`, step: 5, min: 5, onChange: v => duracao = v }),
            h("button", {
              class: "btn btn-primary",
              onclick: () => { registrado = registrarCardio(profileId, tipoSelecionado, duracao); paint(); },
            }, "Registrar cardio"),
          ]),
    ]);
    root.innerHTML = "";
    root.appendChild(screen);
    fadeIn(screen);
  }

  paint();
}
