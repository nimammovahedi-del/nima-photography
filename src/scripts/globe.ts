// Interactive globe/map engine used by the landing-page globe and the Places explorer.
// Loaded only when needed. Draws into an existing <svg> (which carries the component's styles).
import { geoCentroid, geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from 'd3-geo';
import type { Geometry } from 'geojson';
import { countryView, layoutLabels, mainland } from '../lib/geo-shared';

export interface MapPlace {
  name: string;
  map: string;
  slug: string;
  region: string;
  cities: { name: string; slug: string; lon: number; lat: number }[];
}
export interface MapView {
  center: [number, number];
  scale: number;
}
export interface MapConfig {
  width: number;
  height: number;
  places: MapPlace[];
  start: MapView;
  minScale: number;
  /** Show clickable country names when looking at a region. */
  regionLabels?: boolean;
  /** Allow vertical dragging on touchscreens (only when the map owns the whole screen). */
  touchVertical?: boolean;
}
export interface MapHooks {
  onCountryClick(place: MapPlace): void;
  /** Zoomed back out of a country with a gesture. */
  onLeaveCountry?(place: MapPlace): void;
  /** Zoomed out beyond the region view with a gesture. */
  onZoomOutOfRegion?(): void;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Map data is fetched once per page, however many maps use it.
let worldData: Promise<{ n: string; g: Geometry }[]> | undefined;
let detailData: Promise<Record<string, Geometry | null>> | undefined;
const loadWorld = () => (worldData ??= fetch('/map/world.json').then((r) => r.json()));
const loadDetail = () =>
  (detailData ??= fetch('/map/detail.json')
    .then((r) => r.json())
    .catch(() => ({})));

export async function createMap(root: HTMLElement, cfg: MapConfig, hooks: MapHooks) {
  const svg = root.querySelector<SVGSVGElement>('svg.map')!;
  const pinLayer = root.querySelector<HTMLElement>('.pins')!;
  const tip = root.querySelector<HTMLElement>('.tip');
  const W = cfg.width;
  const H = cfg.height;
  const NS = 'http://www.w3.org/2000/svg';
  const MAX_SCALE = Math.min(W, H) * 40;

  const world = await loadWorld();
  let detail: Record<string, Geometry | null> | undefined;

  const byMap = new Map(cfg.places.map((p) => [p.map, p]));
  let center: [number, number] = [...cfg.start.center];
  let scale = cfg.start.scale;
  let focused: MapPlace | null = null;
  let region: string | null = null;
  let regionScale = 0;
  let focusScale = 0;
  let zoomedOut = false;

  const projection = geoOrthographic()
    .translate([W / 2, H / 2])
    .clipExtent([
      [0, 0],
      [W, H],
    ]);
  const path = geoPath(projection).digits(1);
  const graticule = geoGraticule10();

  // Reuse the still picture's elements; swap in one path per country.
  const sphere = svg.querySelector<SVGCircleElement>('.sphere')!;
  const rim = svg.querySelector<SVGCircleElement>('.rim');
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
  land.replaceChildren(
    ...shapes.filter((s) => !s.place).map((s) => s.el),
    ...shapes.filter((s) => s.place).map((s) => s.el),
  );
  const shapeOf = (p: MapPlace) => shapes.find((s) => s.place === p)!;

  function draw() {
    projection.rotate([-center[0], -center[1]]).scale(scale);
    for (const c of [sphere, rim]) {
      if (!c) continue;
      c.setAttribute('cx', String(W / 2));
      c.setAttribute('cy', String(H / 2));
      c.setAttribute('r', String(scale));
    }
    grat.setAttribute('d', path(graticule) ?? '');
    for (const s of shapes) {
      const g = focused && s.place === focused && detail?.[s.n] ? detail[s.n]! : s.g;
      s.el.setAttribute('d', path(g as any) ?? '');
    }
    placeMarkers();
  }

  // ── Camera flights, arcing out a little on long trips ──
  let anim = 0;
  let finishFlight: (() => void) | undefined;
  function flyTo(to: MapView, ms = 1100) {
    cancelAnimationFrame(anim);
    finishFlight?.();
    stopSpin();
    if (reduceMotion() || ms === 0) {
      center = to.center;
      scale = to.scale;
      draw();
      return Promise.resolve();
    }
    const from = [...center] as [number, number];
    const fromScale = scale;
    const interp = geoInterpolate(from, to.center);
    const dist = (geoDistance(from, to.center) * 180) / Math.PI;
    const dip = Math.min(dist / 120, 0.45);
    const t0 = performance.now();
    return new Promise<void>((resolve) => {
      finishFlight = resolve;
      const step = (now: number) => {
        const t = Math.min((now - t0) / ms, 1);
        const e = ease(t);
        center = interp(e) as [number, number];
        scale =
          Math.exp(Math.log(fromScale) + (Math.log(to.scale) - Math.log(fromScale)) * e) *
          (1 - dip * Math.sin(Math.PI * t));
        draw();
        if (t < 1) anim = requestAnimationFrame(step);
        else resolve();
      };
      anim = requestAnimationFrame(step);
    });
  }

  // ── Markers: city pins in a country, or country names in a region ──
  type Marker = {
    label: string;
    lon: number;
    lat: number;
    href: string;
    kind: 'city' | 'country';
    place?: MapPlace;
  };
  let markers: Marker[] = [];

  function setMarkers(list: Marker[]) {
    markers = list;
    pinLayer.replaceChildren(
      ...list.map((m, i) => {
        const a = document.createElement('a');
        a.className = `pin ${m.kind}`;
        a.href = m.href;
        a.dataset.label = m.label;
        a.style.setProperty('--i', String(i));
        a.innerHTML = `<span class="dot" aria-hidden="true"></span><span class="label">${m.label}</span>`;
        if (m.kind === 'country' && m.place) {
          const place = m.place;
          a.addEventListener('click', (e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey) return; // "open in new tab" still works
            e.preventDefault();
            hooks.onCountryClick(place);
          });
        }
        return a;
      }),
    );
    placeMarkers();
    pinLayer.classList.remove('in');
    void pinLayer.offsetWidth; // restart the pop-in animation
    pinLayer.classList.add('in');
  }

  function placeMarkers() {
    const els = [...pinLayer.children] as HTMLElement[];
    if (!markers.length || els.length !== markers.length) return;
    const px = svg.clientWidth / W;
    const visible: number[] = [];
    const pts = markers.map((m, i) => {
      const [x, y] = projection([m.lon, m.lat])!;
      const el = els[i];
      el.hidden = geoDistance([m.lon, m.lat], center) > Math.PI / 2 - 0.05; // round the back
      if (!el.hidden) visible.push(i);
      el.style.left = `${(x / W) * 100}%`;
      el.style.top = `${(y / H) * 100}%`;
      const label = el.querySelector<HTMLElement>('.label')!;
      return { x: x * px, y: y * px, w: label.offsetWidth, h: label.offsetHeight || 20 };
    });
    const sides = layoutLabels(
      visible.map((i) => pts[i]),
      { width: svg.clientWidth, height: svg.clientHeight },
    );
    visible.forEach((i, k) => (els[i].dataset.side = sides[k]));
  }

  const countryMarkers = (name: string): Marker[] =>
    cfg.places
      .filter((p) => p.region === name)
      .map((p) => {
        const [lon, lat] = geoCentroid(mainland(shapeOf(p).g));
        return { label: p.name, lon, lat, href: `/places/${p.slug}`, kind: 'country', place: p };
      });

  // ── Public controls ──
  let request = 0; // a slower, older request never overrides a newer one

  /** The view that frames every visited country in a region. */
  function regionView(name: string): MapView {
    const geoms = cfg.places.filter((p) => p.region === name).map((p) => mainland(shapeOf(p).g));
    const v = countryView(
      { type: 'GeometryCollection', geometries: geoms },
      [],
      W,
      H,
      Math.min(W, H) * 0.14,
    );
    return { center: v.center, scale: Math.min(v.scale, MAX_SCALE) };
  }

  async function showRegion(name: string, ms = 1100) {
    const mine = ++request;
    const v = regionView(name);
    region = name;
    regionScale = v.scale;
    zoomedOut = false;
    unfocus();
    setMarkers([]);
    await flyTo(v, ms);
    if (mine === request && cfg.regionLabels) setMarkers(countryMarkers(name));
  }

  async function showCountry(place: MapPlace) {
    const mine = ++request;
    if (tip) tip.hidden = true;
    const detailReady = loadDetail().then((d) => void (detail = d));
    const pins = place.cities.map((c) => [c.lon, c.lat] as [number, number]);
    const pad = Math.min(W, H) * (place.cities.length ? 0.16 : 0.2);
    const v = countryView(shapeOf(place).g, pins, W, H, pad);
    focused = place;
    region = place.region;
    focusScale = Math.min(v.scale, MAX_SCALE);
    root.classList.add('focus');
    shapes.forEach((s) => s.el.classList.toggle('focused', s.place === place));
    setMarkers([]);
    await Promise.all([flyTo({ center: v.center, scale: focusScale }, 1400), detailReady]);
    if (mine !== request) return;
    draw();
    setMarkers(
      place.cities.map((c) => ({
        label: c.name,
        lon: c.lon,
        lat: c.lat,
        href: `/places/${place.slug}/${c.slug}`,
        kind: 'city' as const,
      })),
    );
  }

  function unfocus() {
    focused = null;
    root.classList.remove('focus');
    shapes.forEach((s) => s.el.classList.remove('focused'));
  }

  function leaveCountry() {
    const place = focused!;
    request++;
    unfocus();
    setMarkers(region && cfg.regionLabels ? countryMarkers(region) : []);
    hooks.onLeaveCountry?.(place);
  }

  function highlight(label: string | null) {
    pinLayer
      .querySelectorAll<HTMLElement>('.pin')
      .forEach((p) => p.classList.toggle('hot', p.dataset.label === label));
  }

  // ── Zoom: two-finger trackpad scroll/pinch, mouse wheel, or pinch on a phone ──
  function setScale(next: number) {
    cancelAnimationFrame(anim);
    finishFlight?.();
    stopSpin();
    scale = Math.min(MAX_SCALE, Math.max(cfg.minScale, next));
    if (focused && scale < focusScale * 0.5) {
      leaveCountry();
    } else if (!focused && region && hooks.onZoomOutOfRegion && !zoomedOut && scale < regionScale * 0.6) {
      zoomedOut = true;
      hooks.onZoomOutOfRegion();
    }
    draw();
  }

  svg.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault(); // keep the page still while zooming the map
      if (tip) tip.hidden = true;
      const speed = e.ctrlKey ? 0.012 : 0.0025; // pinch arrives as ctrl+wheel
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      setScale(scale * Math.exp(-delta * speed));
    },
    { passive: false },
  );

  // ── Drag to rotate (with momentum); two fingers pinch-zoom ──
  let drag: { x: number; y: number; c: [number, number]; moved: boolean; vx: number; t: number } | null =
    null;
  const touches = new Map<number, { x: number; y: number }>();
  let pinch: { d: number; scale: number } | null = null;
  let spin = 0;
  const stopSpin = () => cancelAnimationFrame(spin);
  const degPerPx = () => ((W / svg.clientWidth) * 180) / (Math.PI * scale);
  const spread = () => {
    const [a, b] = [...touches.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onDown = (e: PointerEvent) => {
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
  };
  const onMove = (e: PointerEvent) => {
    if (touches.has(e.pointerId)) touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && touches.size === 2) return setScale((pinch.scale * spread()) / pinch.d);
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    if (!drag.moved) {
      drag.moved = true;
      root.classList.add('dragging');
      if (tip) tip.hidden = true;
    }
    const k = degPerPx();
    const lon = drag.c[0] - dx * k;
    // On a scrolling page, one finger only spins sideways so vertical swipes still scroll.
    const lockLat = e.pointerType === 'touch' && !cfg.touchVertical;
    const lat = lockLat ? drag.c[1] : Math.max(-80, Math.min(80, drag.c[1] + dy * k));
    const now = performance.now();
    drag.vx = (center[0] - lon) / Math.max(now - drag.t, 1);
    drag.t = now;
    center = [lon, lat];
    draw();
  };
  const endTouch = (e: PointerEvent) => {
    touches.delete(e.pointerId);
    if (touches.size < 2) pinch = null;
  };
  const onUp = (e: PointerEvent) => {
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
  };
  const onCancel = (e: PointerEvent) => {
    endTouch(e);
    drag = null;
    root.classList.remove('dragging');
  };
  svg.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onCancel);

  // ── Tooltip on hover (mouse only) ──
  if (tip) {
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
  }

  const resize = new ResizeObserver(() => placeMarkers());
  resize.observe(svg);

  draw();
  root.classList.add('live');

  return {
    showRegion,
    showCountry,
    highlight,
    regionView,
    destroy() {
      cancelAnimationFrame(anim);
      stopSpin();
      resize.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    },
  };
}
