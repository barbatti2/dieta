import { h } from "../ui.js";

const WEEKDAY_LABELS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];

export function Calendar(monthData, { selectedDate, onSelectDay, onPrevMonth, onNextMonth, isCurrentMonth } = {}) {
  const grid = h("div", { class: "calendar__grid" }, [
    ...WEEKDAY_LABELS.map(d => h("div", { class: "calendar__weekday" }, d)),
    ...Array.from({ length: monthData.offset }, () => h("div", { class: "calendar__cell calendar__cell--empty" })),
    ...monthData.dias.map(dia => {
      const classes = ["calendar__cell", "calendar__day"];
      if (dia.treino) classes.push("has-treino");
      if (dia.cardio && !dia.treino) classes.push("has-cardio");
      if (dia.date === selectedDate) classes.push("is-selected");
      if (dia.isFuturo) classes.push("is-future");
      return h("button", {
        class: classes.join(" "),
        onclick: () => onSelectDay?.(dia.date),
        "aria-label": `Dia ${dia.dia}`,
        "aria-pressed": dia.date === selectedDate ? "true" : "false",
      }, [
        h("span", {}, String(dia.dia)),
        dia.treino ? h("span", { class: "calendar__dot" }) : null,
      ]);
    }),
  ]);

  return h("div", { class: "calendar" }, [
    h("div", { class: "calendar__header" }, [
      h("button", { class: "calendar__nav", "aria-label": "Mês anterior", onclick: onPrevMonth }, "‹"),
      h("h2", { class: "calendar__title" }, `${monthData.nomeMes[0].toUpperCase()}${monthData.nomeMes.slice(1)} ${monthData.year}`),
      h("button", { class: "calendar__nav", disabled: isCurrentMonth, "aria-label": "Próximo mês", onclick: onNextMonth }, "›"),
    ]),
    grid,
  ]);
}
