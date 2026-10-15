// The About page's "Where to next" globe: the home page's globe look, with the countries you've
// been to in solid cream and the ones you plan to visit striped. Drag to turn it; hover or tap a
// striped country (or pick one from the list) to see its name.
import { geoCentroid, geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from 'd3-geo';
import type { Geometry } from 'geojson';
import { mainland } from '../lib/geo-shared';

interface Planned {
  name: string;
  map: string;
  lon?: number;
  lat?: number;
}

const NS = 'http://www.w3.org/2000/svg';
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export async function mountWhereNext(root: HTMLElement) {
  const { planned, visited, center: start } = JSON.parse(root.dataset.config!) as {
    planned: Planned[];
    visited: string[];
    center: [number, number];
  };
  const svg = root.querySelector<SVGSVGElement>('svg.map')!;
  const sphere = svg.querySelector<SVGCircleElement>('.sphere')!;
  const rim = svg.querySelector<SVGCircleElement>('.rim')!;
  const grat = svg.querySelector<SVGPathElement>('.graticule')!;
  const land = svg.querySelector<SVGGElement>('.land')!;
  const marks = svg.querySelector<SVGGElement>('.marks')!;
  const tag = root.querySelector<HTMLElement>('.tag')!;
  const chips = [...document.querySelectorAll<HTMLButtonElement>('[data-planned]')];
  const [W, H] = svg.viewBox.baseVal ? [svg.viewBox.baseVal.width, svg.viewBox.baseVal.height] : [1000, 560];

  // The same outlines as the home page's globe (and the same file, already cached if you came from there).
  const world: { n: string; g: Geometry; m?: Geometry }[] = await fetch('/map/world.json').then((r) => r.json());

  const visitedSet = new Set(visited);
  const byMap = new Map(planned.map((p) => [p.map, p]));
  let center: [number, number] = [...start];
  const scale = H * 0.46;
  const projection = geoOrthographic().translate([W / 2, H / 2]).scale(scale).clipAngle(90);
  const path = geoPath(projection).digits(1);
  const graticule = geoGraticule10();

  const shapes = world.map((c) => {
    const el = document.createElementNS(NS, 'path');
    const plan = byMap.get(c.n);
    if (plan) {
      el.setAttribute('class', 'planned');
      el.dataset.name = plan.name;
    } else if (visitedSet.has(c.n)) el.setAttribute('class', 'visited');
    return { ...c, el, plan };
  });
  // Plain land first, then where you've been, then where you're going (on top, so stripes and
  // their outlines aren't covered by a neighbour's).
  const rank = (s: (typeof shapes)[number]) => (s.plan ? 2 : visitedSet.has(s.n) ? 1 : 0);
  land.replaceChildren(...[...shapes].sort((a, b) => rank(a) - rank(b)).map((s) => s.el));

  // Where each planned country's name sits: its mainland's middle, or the spot given for it.
  const anchors = new Map<string, [number, number]>();
  for (const p of planned) {
    const s = shapes.find((x) => x.plan === p);
    if (p.lon !== undefined && p.lat !== undefined) anchors.set(p.name, [p.lon, p.lat]);
    else if (s) anchors.set(p.name, geoCentroid(mainland(s.g)) as [number, number]);
  }
  // Places too small to see get a striped ring marker.
  const markers = planned
    .filter((p) => p.lon !== undefined)
    .map((p) => {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('class', 'planned marker');
      c.setAttribute('r', '6');
      c.dataset.name = p.name;
      marks.append(c);
      return { p, el: c };
    });

  let moving = false;
  function draw() {
    projection.rotate([-center[0], -center[1]]).precision(moving ? 0 : Math.SQRT1_2);
    for (const c of [sphere, rim]) {
      c.setAttribute('cx', String(W / 2));
      c.setAttribute('cy', String(H / 2));
      c.setAttribute('r', String(scale));
    }
    grat.setAttribute('d', path(graticule) ?? '');
    for (const s of shapes) s.el.setAttribute('d', path(((moving && s.m) || s.g) as any) ?? '');
    for (const m of markers) {
      const ll: [number, number] = [m.p.lon!, m.p.lat!];
      const front = geoDistance(ll, center) < Math.PI / 2 - 0.05;
      const [x, y] = projection(ll)!;
      m.el.setAttribute('cx', String(x));
      m.el.setAttribute('cy', String(y));
      m.el.style.display = front ? '' : 'none';
    }
    placeTag();
  }

  // ── Name tag ──
  let shown: string | null = null;
  let pinned = false; // chosen by a click or tap (stays), rather than hovered
  function show(name: string | null, pin = false) {
    shown = name;
    pinned = !!name && pin;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(pinned && c.dataset.planned === name)));
    shapes.forEach((s) => s.plan && s.el.classList.toggle('hot', s.plan.name === name));
    markers.forEach((m) => m.el.classList.toggle('hot', m.p.name === name));
    if (!name) return void (tag.hidden = true);
    tag.textContent = name;
    tag.hidden = false;
    placeTag();
  }
  function placeTag() {
    if (!shown) return;
    const ll = anchors.get(shown);
    if (!ll) return;
    if (geoDistance(ll, center) > Math.PI / 2 - 0.05) return void (tag.hidden = true);
    tag.hidden = false;
    const [x, y] = projection(ll)!;
    const r = svg.getBoundingClientRect();
    // The drawing fills the frame and is cropped at the sides on a phone ("slice").
    const k = Math.max(r.width / W, r.height / H);
    const ox = (r.width - W * k) / 2;
    const oy = (r.height - H * k) / 2;
    tag.style.transform = `translate(${ox + x * k}px, ${oy + y * k}px)`;
  }

  // ── Turning: drag (with a little momentum), or fly to a chosen country ──
  let anim = 0;
  function flyTo(to: [number, number]) {
    cancelAnimationFrame(anim);
    if (reduceMotion()) {
      center = to;
      return draw();
    }
    const interp = geoInterpolate(center, to);
    const ms = Math.min(1200, 500 + ((geoDistance(center, to) * 180) / Math.PI) * 8);
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - t0) / ms, 1);
      center = interp(ease(t)) as [number, number];
      moving = t < 1;
      draw();
      if (t < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }

  const nameAt = (e: Event) => ((e.target as Element).closest?.('.planned') as SVGElement | null)?.dataset.name ?? null;
  let drag: { x: number; y: number; c: [number, number]; moved: boolean; v: number; t: number } | null = null;
  const degPerPx = () => 180 / (Math.PI * scale * (svg.getBoundingClientRect().height / H));
  svg.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    cancelAnimationFrame(anim);
    drag = { x: e.clientX, y: e.clientY, c: [...center], moved: false, v: 0, t: performance.now() };
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    if (!drag.moved) {
      drag.moved = true;
      root.classList.add('dragging');
    }
    const k = degPerPx();
    const lon = drag.c[0] - dx * k;
    // On a phone one finger only turns it sideways, so swiping up and down still scrolls the page.
    const lat = e.pointerType === 'touch' ? drag.c[1] : Math.max(-60, Math.min(70, drag.c[1] + dy * k));
    const now = performance.now();
    drag.v = (lon - center[0]) / Math.max(now - drag.t, 1);
    drag.t = now;
    center = [lon, lat];
    moving = true;
    draw();
  });
  window.addEventListener('pointerup', (e) => {
    if (!drag) return;
    const d = drag;
    drag = null;
    root.classList.remove('dragging');
    if (!d.moved) {
      // A click or tap: name the striped country under it (or clear the name).
      const name = nameAt(e);
      return show(name, !!name);
    }
    let v = d.v * 16;
    const coast = () => {
      if (Math.abs(v) < 0.02 || reduceMotion()) {
        moving = false;
        return draw();
      }
      center = [center[0] + v, center[1]];
      v *= 0.93;
      draw();
      anim = requestAnimationFrame(coast);
    };
    anim = requestAnimationFrame(coast);
  });
  window.addEventListener('pointercancel', () => {
    drag = null;
    root.classList.remove('dragging');
  });

  // Hover names (mouse only), unless one is pinned.
  svg.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || drag?.moved || pinned) return;
    show(nameAt(e));
  });
  svg.addEventListener('pointerleave', () => !pinned && show(null));

  for (const chip of chips) {
    chip.addEventListener('click', () => {
      const name = chip.dataset.planned!;
      if (pinned && shown === name) return show(null);
      show(name, true);
      const ll = anchors.get(name);
      if (ll) flyTo([ll[0], Math.max(-30, Math.min(55, ll[1]))]);
    });
  }

  new ResizeObserver(placeTag).observe(svg);
  draw();
  root.classList.add('live');
}
