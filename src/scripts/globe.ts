// The interactive globe on the landing page. Loaded only when the globe scrolls into view.
import { geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from 'd3-geo';
import type { Geometry } from 'geojson';
import { countryView, layoutLabels } from '../lib/geo-shared';

export interface GlobePlace {
  name: string;
  map: string;
  slug: string;
  region: string;
  cities: { name: string; slug: string; lon: number; lat: number }[];
}
export interface GlobeConfig {
  size: number;
  base: number; // scale at which the whole globe fits
  views: Record<string, { center: [number, number]; scale: number }>;
  initial: string;
  places: GlobePlace[];
}
export interface GlobeHooks {
  /** Called when a visited country is clicked on the globe. */
  onCountryClick(place: GlobePlace): void;
  /** Called when someone zooms back out of a country with a gesture. */
  onLeaveCountry(place: GlobePlace): void;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export async function createGlobe(root: HTMLElement, cfg: GlobeConfig, hooks: GlobeHooks) {
  const svg = root.querySelector<SVGSVGElement>('svg.globe')!;
  const pinLayer = root.querySelector<HTMLElement>('.pins')!;
  const tip = root.querySelector<HTMLElement>('.tip')!;
  const S = cfg.size;
  const NS = 'http://www.w3.org/2000/svg';

  const world: { n: string; g: Geometry }[] = await fetch('/map/world.json').then((r) => r.json());
  // Detailed outlines load the first time someone zooms into a country.
  let detail: Record<string, Geometry | null> | undefined;
  let detailPromise: Promise<void> | undefined;
  const loadDetail = () =>
    fetch('/map/detail.json')
      .then((r) => r.json())
      .then((d) => void (detail = d))
      .catch(() => {});

  const byMap = new Map(cfg.places.map((p) => [p.map, p]));
  const start = cfg.views[cfg.initial];
  let center: [number, number] = [...start.center];
  let scale = start.scale;
  let focused: GlobePlace | null = null;

  const projection = geoOrthographic().translate([S / 2, S / 2]).clipExtent([
    [0, 0],
    [S, S],
  ]);
  const path = geoPath(projection).digits(1);
  const graticule = geoGraticule10();

  // ── Reuse the still picture's elements (they carry the component's styles);
  //    swap in one path per country. `draw` then only updates the `d` attributes. ──
  const sphere = svg.querySelector<SVGCircleElement>('.sphere')!;
  const rim = svg.querySelector<SVGCircleElement>('.rim')!;
  const grat = svg.querySelector<SVGPathElement>('.graticule')!;
  const land = svg.querySelector<SVGGElement>('.land')!;
  const shapes = world.map((c) => {
    const el = document.createElementNS(NS, 'path');
    const place = byMap.get(c.n);
    if (place) {
      el.setAttribute('class', 'visited');
      el.dataset.name = place.name;
    }
    return { ...c, el, place };
  });
  // Visited countries go last so their outline sits on top of neighbours.
  land.replaceChildren(
    ...shapes.filter((s) => !s.place).map((s) => s.el),
    ...shapes.filter((s) => s.place).map((s) => s.el),
  );

  function draw() {
    projection.rotate([-center[0], -center[1]]).scale(scale);
    sphere.setAttribute('cx', String(S / 2));
    sphere.setAttribute('cy', String(S / 2));
    sphere.setAttribute('r', String(scale));
    rim.setAttribute('cx', String(S / 2));
    rim.setAttribute('cy', String(S / 2));
    rim.setAttribute('r', String(scale));
    grat.setAttribute('d', path(graticule) ?? '');
    for (const s of shapes) {
      const g = focused && s.place === focused && detail?.[s.n] ? detail[s.n]! : s.g;
      s.el.setAttribute('d', path(g as any) ?? '');
    }
    if (focused) placePins();
  }

  // ── Camera animation between two views, arcing out a little on long trips. ──
  let anim = 0;
  let finishFlight: (() => void) | undefined;
  function flyTo(toCenter: [number, number], toScale: number, ms = 1100) {
    // A new flight interrupts the current one; let anything awaiting the old one move on.
    cancelAnimationFrame(anim);
    finishFlight?.();
    stopSpin();
    if (reduceMotion()) {
      center = toCenter;
      scale = toScale;
      draw();
      return Promise.resolve();
    }
    const from = [...center] as [number, number];
    const fromScale = scale;
    const interp = geoInterpolate(from, toCenter);
    const dist = (geoDistance(from, toCenter) * 180) / Math.PI;
    const dip = Math.min(dist / 120, 0.45); // zoom out mid-flight for longer journeys
    const t0 = performance.now();
    return new Promise<void>((resolve) => {
      finishFlight = resolve;
      const step = (now: number) => {
        const t = Math.min((now - t0) / ms, 1);
        const e = ease(t);
        center = interp(e) as [number, number];
        const logScale = Math.log(fromScale) + (Math.log(toScale) - Math.log(fromScale)) * e;
        scale = Math.exp(logScale) * (1 - dip * Math.sin(Math.PI * t));
        draw();
        if (t < 1) anim = requestAnimationFrame(step);
        else resolve();
      };
      anim = requestAnimationFrame(step);
    });
  }

  // ── City pins (HTML over the SVG so labels stay readable at any size). ──
  function placePins() {
    const pins = [...pinLayer.children] as HTMLElement[];
    if (!focused || pins.length !== focused.cities.length) return; // pins appear after the zoom
    const px = svg.clientWidth / S;
    const pts = focused.cities.map((c, i) => {
      const [x, y] = projection([c.lon, c.lat])!;
      const el = pins[i];
      // Pins round the back of the globe (after rotating) are hidden.
      el.hidden = geoDistance([c.lon, c.lat], center) > Math.PI / 2 - 0.05;
      el.style.left = `${(x / S) * 100}%`;
      el.style.top = `${(y / S) * 100}%`;
      const label = el.querySelector<HTMLElement>('.label')!;
      return { x: x * px, y: y * px, w: label.offsetWidth, h: label.offsetHeight || 18 };
    });
    const sides = layoutLabels(pts, { width: svg.clientWidth, height: svg.clientHeight });
    pins.forEach((el, i) => (el.dataset.side = sides[i]));
  }

  function buildPins(place: GlobePlace) {
    pinLayer.replaceChildren(
      ...place.cities.map((c, i) => {
        const a = document.createElement('a');
        a.className = 'pin';
        a.href = `/places/${place.slug}/${c.slug}`;
        a.dataset.city = c.name;
        a.style.setProperty('--i', String(i));
        a.innerHTML = `<span class="dot" aria-hidden="true"></span><span class="label">${c.name}</span>`;
        return a;
      }),
    );
  }

  // ── Public controls ──
  // Each new request gets a number; a slower, older request never overrides a newer one.
  let request = 0;

  async function showRegion(name: string) {
    request++;
    const v = cfg.views[name];
    focused = null;
    tip.hidden = true;
    root.classList.remove('focus');
    pinLayer.replaceChildren();
    await flyTo(v.center, v.scale);
  }

  async function showCountry(place: GlobePlace) {
    const mine = ++request;
    tip.hidden = true;
    detailPromise ??= loadDetail();
    const shape = shapes.find((s) => s.place === place)!;
    const pins = place.cities.map((c) => [c.lon, c.lat] as [number, number]);
    const pad = S * (place.cities.length ? 0.16 : 0.2);
    const v = countryView(shape.g, pins, S, S, pad);
    focused = place;
    root.classList.add('focus');
    shapes.forEach((s) => s.el.classList.toggle('focused', s.place === place));
    pinLayer.replaceChildren();
    focusScale = Math.min(v.scale, cfg.base * 40);
    await Promise.all([flyTo(v.center, focusScale, 1400), detailPromise]);
    if (mine !== request) return;
    buildPins(place);
    draw();
    pinLayer.classList.remove('in');
    void pinLayer.offsetWidth; // restart the pop-in animation
    pinLayer.classList.add('in');
  }

  function highlightCity(name: string | null) {
    pinLayer
      .querySelectorAll<HTMLElement>('.pin')
      .forEach((p) => p.classList.toggle('hot', p.dataset.city === name));
  }

  // ── Zoom: two-finger trackpad scroll/pinch, mouse wheel, or pinch on a phone ──
  const MIN_SCALE = cfg.base * 0.85;
  const MAX_SCALE = cfg.base * 40;
  let focusScale = 0; // scale the country view settled at

  function setScale(next: number) {
    cancelAnimationFrame(anim);
    finishFlight?.();
    stopSpin();
    scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
    // Zooming well out of a country hands you back to the globe.
    if (focused && scale < focusScale * 0.5) leaveCountry();
    draw();
  }

  function leaveCountry() {
    const place = focused;
    request++;
    focused = null;
    root.classList.remove('focus');
    shapes.forEach((s) => s.el.classList.remove('focused'));
    pinLayer.replaceChildren();
    if (place) hooks.onLeaveCountry(place);
  }

  svg.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault(); // keep the page still while zooming the globe
      tip.hidden = true;
      // Pinch gestures arrive as ctrl+wheel with small deltas; scrolls are larger.
      const speed = e.ctrlKey ? 0.012 : 0.0025;
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      setScale(scale * Math.exp(-delta * speed));
    },
    { passive: false },
  );

  // ── Drag to rotate (with a little momentum); two fingers on a touchscreen pinch-zoom ──
  let drag: { x: number; y: number; c: [number, number]; moved: boolean; vx: number; t: number } | null =
    null;
  const touches = new Map<number, { x: number; y: number }>();
  let pinch: { d: number; scale: number } | null = null;
  let spin = 0;
  const stopSpin = () => cancelAnimationFrame(spin);
  const degPerPx = () => ((S / svg.clientWidth) * 180) / (Math.PI * scale);
  const spread = () => {
    const [a, b] = [...touches.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  svg.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') {
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 2) {
        drag = null; // second finger: switch from rotating to pinching
        pinch = { d: spread(), scale };
        return;
      }
    }
    if (e.button !== 0) return;
    cancelAnimationFrame(anim);
    stopSpin();
    drag = { x: e.clientX, y: e.clientY, c: [...center], moved: false, vx: 0, t: performance.now() };
  });
  window.addEventListener('pointermove', (e) => {
    if (touches.has(e.pointerId)) touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && touches.size === 2) {
      setScale((pinch.scale * spread()) / pinch.d);
      return;
    }
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    if (!drag.moved) {
      drag.moved = true;
      root.classList.add('dragging');
      tip.hidden = true;
    }
    const k = degPerPx();
    const lon = drag.c[0] - dx * k;
    // One finger only rotates sideways, so vertical swipes still scroll the page.
    const lat = e.pointerType === 'touch' ? drag.c[1] : Math.max(-80, Math.min(80, drag.c[1] + dy * k));
    const now = performance.now();
    drag.vx = (center[0] - lon) / Math.max(now - drag.t, 1);
    drag.t = now;
    center = [lon, lat];
    draw();
  });
  const endTouch = (e: PointerEvent) => {
    touches.delete(e.pointerId);
    if (touches.size < 2) pinch = null;
  };
  window.addEventListener('pointercancel', (e) => {
    endTouch(e);
    drag = null;
    root.classList.remove('dragging');
  });
  window.addEventListener('pointerup', (e) => {
    endTouch(e);
    if (!drag) return;
    const d = drag;
    drag = null;
    root.classList.remove('dragging');
    if (!d.moved) {
      // A click: open the country under the pointer, if it's one you've visited.
      const target = (e.target as Element).closest?.('path.visited') as SVGPathElement | null;
      const place = target && cfg.places.find((p) => p.name === target.dataset.name);
      if (place && place !== focused) hooks.onCountryClick(place);
      return;
    }
    if (reduceMotion()) return;
    let v = -d.vx * 16; // degrees per frame
    const coast = () => {
      if (Math.abs(v) < 0.02) return;
      center = [center[0] + v, center[1]];
      v *= 0.94;
      draw();
      spin = requestAnimationFrame(coast);
    };
    spin = requestAnimationFrame(coast);
  });

  // ── Tooltip on hover ──
  svg.addEventListener('pointermove', (e) => {
    if (drag?.moved || focused || e.pointerType !== 'mouse') return;
    const target = (e.target as Element).closest('path.visited') as SVGPathElement | null;
    if (!target) return void (tip.hidden = true);
    const place = cfg.places.find((p) => p.name === target.dataset.name)!;
    tip.querySelector('strong')!.textContent = place.name;
    tip.querySelector('span')!.textContent = place.cities.length
      ? place.cities.map((c) => c.name).join(' · ')
      : 'View photos';
    tip.hidden = false;
    const r = root.getBoundingClientRect();
    tip.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`;
  });
  svg.addEventListener('pointerleave', () => (tip.hidden = true));

  new ResizeObserver(() => focused && placePins()).observe(svg);

  draw();
  root.classList.add('live');
  return { showRegion, showCountry, highlightCity, isFocused: () => focused };
}
