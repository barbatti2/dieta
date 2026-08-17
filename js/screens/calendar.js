import { h, showLoading, fadeIn } from "../ui.js";
import { getCurrentProfile } from "../state.js";
import { getCalendarMonth, getDayDetail } from "../data-service.js";
import { Calendar } from "../components/calendar.js";

export function renderCalendar(root) {
  showLoading(root, "Carregando calendário…");
  setTimeout(() => {
    const profileId = getCurrentProfile();
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    let selectedDate = null;

    function paint() {
      const monthData = getCalendarMonth(profileId, year, month);
      const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

      const screen = h("div", { class: "screen screen--calendar" }, [
        h("header", { class: "screen-header" }, [
          h("h1", { class: "screen-title" }, "Calendário"),
        ]),
        Calendar(monthData, {
          selectedDate,
          isCurrentMonth,
          onSelectDay: (iso) => { selectedDate = selectedDate === iso ? null : iso; paint(); },
          onPrevMonth: () => { month--; if (month < 0) { month = 11; year--; } selectedDate = null; paint(); },
          onNextMonth: () => { if (isCurrentMonth) return; month++; if (month > 11) { month = 0; year++; } selectedDate = null; paint(); },
        }),
        selectedDate ? renderDetail(profileId, selectedDate) : null,
      ]);

      root.innerHTML = "";
      root.appendChild(screen);
      fadeIn(screen);
    }

    paint();
  }, 180);
}

function renderDetail(profileId, iso) {
  const detail = getDayDetail(profileId, iso);
  const kids = [
    h("p", { class: "day-detail__data" }, `${detail.diaMes} de ${detail.mes}`),
  ];

  if (detail.treino) {
    kids.push(h("div", { class: "day-detail__item" }, [
      h("span", { class: "day-detail__tag" }, detail.treino.nome),
      h("p", { class: "day-detail__nome" }, detail.treino.grupo),
      h("p", { class: "day-detail__meta" }, `${detail.treino.exercicios} exercícios · ${detail.treino.series} séries`),
    ]));
  }
  if (detail.cardio) {
    kids.push(h("div", { class: "day-detail__item" }, [
      h("span", { class: "day-detail__tag day-detail__tag--cardio" }, "Cardio"),
      h("p", { class: "day-detail__meta" }, `${detail.cardio.tipo} · ${detail.cardio.duracao} min`),
    ]));
  }
  if (!detail.treino && !detail.cardio) {
    kids.push(h("p", { class: "day-detail__empty" }, "Nenhuma atividade registrada neste dia"));
  }

  return h("div", { class: "day-detail" }, kids);
}
