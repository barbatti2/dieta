import { h, fmtDatePt } from "../ui.js";

const SVG_NS = "http://www.w3.org/2000/svg";
function svg(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

export function ProgressChart({ pontos }, { width = 320, height = 176 } = {}) {
  const wrap = h("div", { class: "progress-chart" });
  if (!pontos || pontos.length < 2) {
    wrap.appendChild(h("p", { class: "progress-chart__empty" }, "Registre mais sessões para ver a evolução."));
    return wrap;
  }

  const padL = 34, padR = 14, padT = 18, padB = 26;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const cargas = pontos.map(p => p.carga);
  const min = Math.min(...cargas);
  const max = Math.max(...cargas);
  const range = max - min || 1;
  const yFor = c => padT + innerH - ((c - min) / range) * innerH;
  const xFor = i => padL + (i / (pontos.length - 1)) * innerW;

  const svgEl = svg("svg", { viewBox: `0 0 ${width} ${height}`, class: "progress-chart__svg", role: "img", "aria-label": "Gráfico de evolução de carga" });

  // linhas guia
  [min, (min + max) / 2, max].forEach(v => {
    const y = yFor(v);
    svgEl.appendChild(svg("line", { x1: padL, x2: width - padR, y1: y, y2: y, class: "progress-chart__grid" }));
    const label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("x", 4); label.setAttribute("y", y + 4);
    label.setAttribute("class", "progress-chart__axis-label");
    label.textContent = `${Math.round(v)}`;
    svgEl.appendChild(label);
  });

  // path da linha
  const points = pontos.map((p, i) => `${xFor(i)},${yFor(p.carga)}`).join(" ");
  const areaPath = `M${padL},${padT + innerH} L${points.split(" ").join(" L")} L${width - padR},${padT + innerH} Z`;
  svgEl.appendChild(svg("path", { d: areaPath, class: "progress-chart__area" }));
  svgEl.appendChild(svg("polyline", { points, class: "progress-chart__line" }));

  const tooltip = h("div", { class: "progress-chart__tooltip", role: "status" });
  tooltip.style.opacity = "0";

  pontos.forEach((p, i) => {
    const cx = xFor(i), cy = yFor(p.carga);
    const dot = svg("circle", { cx, cy, r: 4, class: "progress-chart__dot" });
    const hit = svg("circle", { cx, cy, r: 12, class: "progress-chart__hit" });
    const showTooltip = () => {
      tooltip.textContent = `${fmtDatePt(p.date)} · ${p.carga} kg`;
      tooltip.style.left = `${(cx / width) * 100}%`;
      tooltip.style.top = `${(cy / height) * 100}%`;
      tooltip.style.opacity = "1";
    };
    hit.addEventListener("mouseenter", showTooltip);
    hit.addEventListener("focus", showTooltip);
    hit.addEventListener("click", showTooltip);
    hit.addEventListener("mouseleave", () => { tooltip.style.opacity = "0"; });
    svgEl.appendChild(dot);
    svgEl.appendChild(hit);
  });

  // rótulos de mês nos extremos
  const monthLabel = iso => {
    const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    return meses[+iso.split("-")[1] - 1];
  };
  [0, pontos.length - 1].forEach(i => {
    const t = document.createElementNS(SVG_NS, "text");
    t.setAttribute("x", xFor(i)); t.setAttribute("y", height - 6);
    t.setAttribute("class", "progress-chart__axis-label");
    t.setAttribute("text-anchor", i === 0 ? "start" : "end");
    t.textContent = monthLabel(pontos[i].date);
    svgEl.appendChild(t);
  });

  wrap.appendChild(svgEl);
  wrap.appendChild(tooltip);
  return wrap;
}
