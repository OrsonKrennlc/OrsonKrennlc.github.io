// Roamline research charts adapt L15 Ballot Tally and F4 Tick Donut from lieflat-charts.
// Source values are transcribed from the original Roamline questionnaire board in Figma.
document.addEventListener('DOMContentLoaded', () => {
  const data = window.CASE_STUDIES?.roamline?.researchData;
  if (document.body.dataset.case !== 'roamline' || !data) return;

  const NS = 'http://www.w3.org/2000/svg';
  const pageStyle = getComputedStyle(document.body);
  const ink = pageStyle.getPropertyValue('--case-accent').trim() || '#254c5b';
  const paper = pageStyle.getPropertyValue('--case-chart-paper').trim() || '#f1f5f6';
  const muted = pageStyle.getPropertyValue('--case-chart-muted').trim() || '#586b72';
  const grid = pageStyle.getPropertyValue('--case-chart-line').trim() || '#cbd8dc';
  const segmentOpacity = [0.68, 1, 0.68, 0.42];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let animateMarks = false;
  const rnd = (i, k) => Math.abs(((i * 73856093) ^ (k * 19349663)) % 1000) / 1000;

  function svgElement(parent, tag, attributes = {}) {
    const node = document.createElementNS(NS, tag);
    Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
    parent.append(node);
    return node;
  }

  function label(parent, attributes, value) {
    const node = svgElement(parent, 'text', attributes);
    node.textContent = value;
    return node;
  }

  function revealAttributes(delay) {
    return animateMarks ? { class: 'case-chart__mark', style: `animation-delay:${delay}s` } : {};
  }

  function polar(cx, cy, radius, degrees) {
    const angle = degrees * Math.PI / 180;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  }

  function drawUsage(svg) {
    // F4 Tick Donut: 100 radial ticks, contiguous composition, tenth-point markers,
    // hairline leaders and central total. Decimal values remain exact in the labels.
    const display = [13, 64, 13, 10]; // Largest-remainder allocation of the source's 100.0%.
    const names = ['NEVER', '1–3 / YEAR', '4–6 / YEAR', '>6 / YEAR'];
    const cx = 200;
    const cy = 149;
    const radius = 66;
    let firstTick = 0;
    data.usageFrequency.forEach(([, value], segment) => {
      for (let tick = 0; tick < display[segment]; tick += 1) {
        const index = firstTick + tick;
        const angle = index * 3.6 - 90;
        const length = 10 + rnd(index + 1, segment + 2) * 6;
        const [x1, y1] = polar(cx, cy, radius, angle);
        const [x2, y2] = polar(cx, cy, radius + length, angle);
        svgElement(svg, 'line', {
          x1, y1, x2, y2, stroke: ink, 'stroke-opacity': segmentOpacity[segment],
          'stroke-width': 1.2,
          ...revealAttributes(index * 0.012)
        });
        if (index % 10 === 0) {
          const [dotX, dotY] = polar(cx, cy, radius - 5, angle);
          svgElement(svg, 'circle', {
            cx: dotX, cy: dotY, r: 1, fill: grid,
            ...revealAttributes(index * 0.012)
          });
        }
      }
      const midpoint = (firstTick + display[segment] / 2) * 3.6 - 90;
      const [lineX, lineY] = polar(cx, cy, radius + 20, midpoint);
      const [textX, textY] = polar(cx, cy, radius + 42, midpoint);
      svgElement(svg, 'line', {
        x1: lineX, y1: lineY, x2: textX, y2: textY, stroke: grid,
        'stroke-width': 0.8, 'stroke-dasharray': '1 3',
        ...revealAttributes(0.55 + segment * 0.1)
      });
      const horizontal = Math.cos(midpoint * Math.PI / 180);
      label(svg, {
        x: textX, y: textY + 3, fill: ink, 'font-size': 10,
        'font-weight': 700, 'letter-spacing': '.02em',
        'text-anchor': horizontal > 0.3 ? 'start' : horizontal < -0.3 ? 'end' : 'middle',
        'paint-order': 'stroke', stroke: paper, 'stroke-width': 3,
        ...revealAttributes(0.6 + segment * 0.1)
      }, `${names[segment]} · ${value.toFixed(1)}%`);
      firstTick += display[segment];
    });
    label(svg, {
      x: cx, y: cy - 2, fill: ink, 'font-size': 24, 'font-weight': 800,
      'text-anchor': 'middle', ...revealAttributes(0.8)
    }, '100');
    label(svg, {
      x: cx, y: cy + 16, fill: muted, 'font-size': 9, 'font-weight': 600,
      'text-anchor': 'middle', 'letter-spacing': '.09em', ...revealAttributes(0.8)
    }, 'PERCENT');
    label(svg, {
      x: cx, y: 298, fill: muted, 'font-size': 9, 'font-weight': 600,
      'text-anchor': 'middle', 'letter-spacing': '.05em', ...revealAttributes(1.05)
    }, 'READ CLOCKWISE FROM TWELVE O’CLOCK');
  }

  function drawTrouble(svg) {
    // L15 Ballot Tally: independent 100-tick rows with a baseline, every tenth
    // marker and direct value labels. Percent points are not individual people.
    data.itineraryTrouble.forEach(([name, value], row) => {
      const base = 82 + row * 61;
      label(svg, {
        x: 28, y: base - 27, fill: muted, 'font-size': 10, 'font-weight': 700,
        'letter-spacing': '.04em', ...revealAttributes(row * 0.09)
      }, name.toUpperCase());
      svgElement(svg, 'line', {
        x1: 28, y1: base, x2: 361, y2: base, stroke: grid,
        'stroke-width': 0.8, ...revealAttributes(row * 0.09)
      });
      for (let tick = 0; tick < 100; tick += 1) {
        const x = 28 + tick * 3.33;
        const picked = tick < Math.floor(value);
        const remainder = tick === Math.floor(value) ? value % 1 : 0;
        const height = picked || remainder ? 12 + rnd(tick + 1, row + 2) * 5 : 4.5 + rnd(tick + 1, row + 5) * 2;
        svgElement(svg, 'line', {
          x1: x, y1: base, x2: x, y2: base - height,
          stroke: picked || remainder ? ink : grid,
          'stroke-width': picked || remainder ? 1 : 0.6,
          ...(remainder ? { 'stroke-opacity': remainder } : {}),
          ...revealAttributes(row * 0.1 + tick * 0.006)
        });
        if (tick % 10 === 0) {
          svgElement(svg, 'circle', {
            cx: x, cy: base + 5, r: 1, fill: grid,
            ...revealAttributes(row * 0.1 + tick * 0.006)
          });
        }
      }
      label(svg, {
        x: 28 + value * 3.33 + 7, y: base - 11, fill: ink,
        'font-size': 12, 'font-weight': 800, 'font-variant-numeric': 'tabular-nums',
        'paint-order': 'stroke', stroke: paper, 'stroke-width': 4,
        ...revealAttributes(0.45 + row * 0.09)
      }, `${value.toFixed(1)}%`);
    });
    label(svg, {
      x: 200, y: 374, fill: muted, 'font-size': 9, 'font-weight': 600,
      'text-anchor': 'middle', 'letter-spacing': '.05em', ...revealAttributes(1)
    }, 'ONE TICK = ONE PERCENTAGE POINT · DOT EVERY TENTH');
  }

  const charts = [
    ['roamline-usage-chart', drawUsage],
    ['roamline-trouble-chart', drawTrouble]
  ];
  charts.forEach(([id, draw]) => {
    const svg = document.getElementById(id);
    if (!svg) return;
    const figure = svg.closest('.case-chart');
    const replay = figure.querySelector('.case-chart__replay');
    const render = (withAnimation) => {
      animateMarks = withAnimation && !reducedMotion;
      svg.replaceChildren();
      draw(svg);
    };
    // Keep the chart readable before reveal. Observing the figure also avoids
    // Safari treating an initially empty, auto-height SVG as a zero-size target.
    render(false);
    let observer;
    if ('IntersectionObserver' in window && !reducedMotion) {
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          render(true);
          observer.disconnect();
        }
      }, { threshold: 0.15 });
      observer.observe(figure);
    }
    replay.addEventListener('click', () => {
      observer?.disconnect();
      render(true);
    });
  });
});
