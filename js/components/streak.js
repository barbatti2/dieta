import { h } from "../ui.js";

export function Streak(dias) {
  return h("div", { class: "streak" }, [
    h("span", { class: "streak__number" }, String(dias)),
    h("span", { class: "streak__label" }, ["dias", h("br"), "de sequência"]),
  ]);
}

export function Last7Days(dias) {
  return h("div", { class: "last7" }, dias.map(d => {
    const classes = ["last7__day"];
    if (d.treinou) classes.push("is-done");
    else if (!d.programado) classes.push("is-rest");
    if (d.isHoje) classes.push("is-today");
    return h("div", { class: classes.join(" ") }, [
      h("span", { class: "last7__label" }, d.label),
      h("span", { class: "last7__mark", "aria-hidden": "true" }),
    ]);
  }));
}
