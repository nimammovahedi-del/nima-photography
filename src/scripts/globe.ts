// Interactive globe/map engine used by the landing-page globe and the Places explorer.
// Loaded only when needed. Draws into an existing <svg> (which carries the component's styles).
import {
  geoCentroid,
  geoDistance,
  geoGraticule10,
  geoInterpolate,
  geoOrthographic,
  geoPath,
  geoStream,
} from 'd3-geo';
import type { Geometry } from 'geojson';
import { countryView, layoutLabels, mainland } from '../lib/geo-shared';

export interface MapPlace {
  name: string;
  map: string;
  slug: string;
  region: string;
  cities: { name: string; slug: string; lon: number; lat: number }[];
  /** The camera of the map strip on this country's pages (see lib/strip.ts). */
  strip: { center: [number, number]; x: number; y: number; scale: number };
}
export interface MapView {
  center: [number, number];
  scale: number;
  /** Where on the map (from its middle, in map units) the centre sits; usually the middle itself. */
  shift?: [number, number];
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
let worldData: Promise<{ n: string; g: Geometry; m?: Geometry }[]> | undefined;
// The countries you've been to come at full detail in it (see lib/world.ts), so zooming in needs
// nothing more — and their borders match their neighbours' exactly. While the globe moves, they're
// drawn from a lighter outline ("m") that also matches its neighbours, so phones keep up.
const loadWorld = () => (worldData ??= fetch('/map/world.json').then((r) => r.json()));

export async function createMap(root: HTMLElement, cfg: MapConfig, hooks: MapHooks) {
  const svg = root.querySelector<SVGSVGElement>('svg.map')!;
  const pinLayer = root.querySelector<HTMLElement>('.pins')!;
  const tip = root.querySelector<HTMLElement>('.tip');
  const W = cfg.width;
  const H = cfg.height;
  const NS = 'http://www.w3.org/2000/svg';
  const MAX_SCALE = Math.min(W, H) * 40;

  const world = await loadWorld();

  const byMap = new Map(cfg.places.map((p) => [p.map, p]));
  let center: [number, number] = [...cfg.start.center];
  let scale = cfg.start.scale;
  let shift: [number, number] = [0, 0];
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
    // A cap (centre + angular radius) around each country, so the ones out of view can be
    // skipped while drawing — most of the world is off screen once you zoom in.
    const mid = geoCentroid(c.g);
    let reach = 0;
    geoStream(c.g, {
      point: (x: number, y: number) => void (reach = Math.max(reach, geoDistance(mid, [x, y]))),
      lineStart() {},
      lineEnd() {},
      polygonStart() {},
      polygonEnd() {},
      sphere() {},
    });
    return { ...c, el, place, mid, reach, drawn: true };
  });
  land.replaceChildren(
    ...shapes.filter((s) => !s.place).map((s) => s.el),
    ...shapes.filter((s) => s.place).map((s) => s.el),
  );
  const shapeOf = (p: MapPlace) => shapes.find((s) => s.place === p)!;

  // Mid-flight, outlines are drawn point to point without d3's extra smoothing between points
  // (precision 0): at the world map's level of detail the difference can't be seen while moving,
  // and it saves about a fifth of each frame's work. The last frame is drawn smoothly again.
  let inFlight = false;
  // Dragging or zooming by hand: the lighter outlines too, until the map has been still a moment.
  let handMoving = false;
  let settle = 0;
  function moving() {
    handMoving = true;
    clearTimeout(settle);
    settle = window.setTimeout(() => {
      handMoving = false;
      draw();
    }, 150);
  }
  // While the map shows through a window smaller than the screen (shrinking into, or growing out of,
  // a country page's map strip), only what's inside that window needs drawing. Screen pixels.
  let visibleArea: (() => { left: number; top: number; right: number; bottom: number } | null) | null =
    null;
  /** The part of the globe (a centre and an angle around it) inside `visibleArea`, if any. */
  function visibleCap(): [[number, number], number] | null {
    const r = visibleArea?.();
    if (!r) return null;
    const { k, ox, oy } = fit();
    const at = (x: number, y: number) => projection.invert!([(x - ox) / k, (y - oy) / k]);
    const mid = at((r.left + r.right) / 2, (r.top + r.bottom) / 2);
    const corners = [at(r.left, r.top), at(r.right, r.top), at(r.left, r.bottom), at(r.right, r.bottom)];
    const ok = (p: [number, number] | null): p is [number, number] => !!p && isFinite(p[0]) && isFinite(p[1]);
    if (!ok(mid) || !corners.every(ok)) return null; // the window reaches past the globe's edge
    // A margin for the window's edges bulging out a little between its corners on the globe.
    return [mid, Math.max(...corners.map((c) => geoDistance(mid, c as [number, number]))) * 1.25 + 0.02];
  }
  function draw() {
    const [ox, oy] = [W / 2 + shift[0], H / 2 + shift[1]];
    projection
      .rotate([-center[0], -center[1]])
      .scale(scale)
      .translate([ox, oy])
      .precision(inFlight ? 0 : Math.SQRT1_2);
    for (const c of [sphere, rim]) {
      if (!c) continue;
      c.setAttribute('cx', String(ox));
      c.setAttribute('cy', String(oy));
      c.setAttribute('r', String(scale));
    }
    grat.setAttribute('d', path(graticule) ?? '');
    // How far from the centre (as an angle on the globe) the corners of the frame reach.
    const corner = Math.hypot(W / 2 + Math.abs(shift[0]), H / 2 + Math.abs(shift[1]));
    const view = corner >= scale ? Math.PI / 2 : Math.asin(corner / scale);
    // Zoomed into a country, everything else steps back — until the country is turned out of view
    // (say, dragging from America over to Europe), when the others light up again.
    if (focused) {
      const f = shapeOf(focused);
      const inView = geoDistance(center, f.mid) < view;
      root.classList.toggle('focus', inView);
      if (inView && tip) tip.hidden = true;
    }
    const [cullAt, cullTo] = visibleCap() ?? [center, view + 0.02];
    for (const s of shapes) {
      if (geoDistance(cullAt, s.mid) - s.reach > cullTo) {
        if (s.drawn) s.el.setAttribute('d', '');
        s.drawn = false;
        continue;
      }
      s.el.setAttribute('d', path(((inFlight || handMoving) && s.m) || (s.g as any)) ?? '');
      s.drawn = true;
    }
    placeMarkers();
  }

  // ── Camera flights, arcing out a little on long trips ──
  let anim = 0;
  let finishFlight: (() => void) | undefined;
  function flyTo(to: MapView, msOverride?: number) {
    cancelAnimationFrame(anim);
    inFlight = false;
    finishFlight?.();
    stopSpin();
    const toShift = to.shift ?? [0, 0];
    if (reduceMotion() || msOverride === 0) {
      center = to.center;
      scale = to.scale;
      shift = toShift;
      draw();
      return Promise.resolve();
    }
    const from = [...center] as [number, number];
    const fromScale = scale;
    const fromShift = shift;
    const interp = geoInterpolate(from, to.center);
    const dist = (geoDistance(from, to.center) * 180) / Math.PI;
    const zoom = Math.abs(Math.log(to.scale / fromScale));
    // Longer journeys (in distance or zoom) take a little longer, so every flight feels unhurried.
    const ms = msOverride ?? Math.min(1700, Math.max(850, 700 + dist * 5 + zoom * 220));
    // Pull back a touch mid-flight on long trips — but not when timed to match something else
    // (the strip on a country page growing into the globe), where it reads as a wobble.
    const dip = msOverride === undefined ? Math.min(dist / 140, 0.35) : 0;
    const t0 = performance.now();
    return new Promise<void>((resolve) => {
      finishFlight = resolve;
      const step = (now: number) => {
        const t = Math.min((now - t0) / ms, 1);
        const e = ease(t);
        center = interp(e) as [number, number];
        shift = [
          fromShift[0] + (toShift[0] - fromShift[0]) * e,
          fromShift[1] + (toShift[1] - fromShift[1]) * e,
        ];
        scale =
          Math.exp(Math.log(fromScale) + (Math.log(to.scale) - Math.log(fromScale)) * e) *
          (1 - dip * Math.sin(Math.PI * t));
        inFlight = t < 1;
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
  let sizes: ({ w: number; h: number } | undefined)[] = [];

  function setMarkers(list: Marker[]) {
    markers = list;
    sizes = [];
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

  /** Screen pixels per map unit, and where the map's corner sits, for the svg's "slice" fit. */
  function fit() {
    const [cw, ch] = [svg.clientWidth, svg.clientHeight];
    const k = Math.max(cw / W, ch / H);
    return { k, ox: (cw - W * k) / 2, oy: (ch - H * k) / 2 };
  }

  function placeMarkers() {
    const els = [...pinLayer.children] as HTMLElement[];
    if (!markers.length || els.length !== markers.length) return;
    // Where the drawing actually sits in the frame: it fills it, cropped ("slice"), even when the
    // window has changed shape since the map opened — pins must follow it exactly.
    const { k: px, ox, oy } = fit();
    const visible: number[] = [];
    const pts = markers.map((m, i) => {
      const [x, y] = projection([m.lon, m.lat])!;
      const el = els[i];
      el.hidden = geoDistance([m.lon, m.lat], center) > Math.PI / 2 - 0.05; // round the back
      if (!el.hidden) visible.push(i);
      el.style.left = `${ox + x * px}px`;
      el.style.top = `${oy + y * px}px`;
      // Label sizes never change while a set of pins is up; measure once instead of every frame.
      const size = (sizes[i] ??= (() => {
        const label = el.querySelector<HTMLElement>('.label')!;
        if (el.hidden || !label.offsetWidth) return undefined;
        return { w: label.offsetWidth, h: label.offsetHeight || 20 };
      })());
      return { x: ox + x * px, y: oy + y * px, w: size?.w ?? 0, h: size?.h ?? 20 };
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
    // A region of one country (America) would just frame that country: show the continent around it.
    const wide = geoms.length === 1 ? 0.4 : 1;
    return { center: v.center, scale: Math.min(v.scale * wide, MAX_SCALE) };
  }

  async function showRegion(name: string, ms?: number) {
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

  /**
   * Fly in to a country (taking `ms`, if given, rather than a time to suit the distance).
   */
  async function showCountry(place: MapPlace, ms?: number) {
    const mine = ++request;
    if (tip) tip.hidden = true;
    const pins = place.cities.map((c) => [c.lon, c.lat] as [number, number]);
    const pad = Math.min(W, H) * (place.cities.length ? 0.16 : 0.2);
    const v = countryView(shapeOf(place).g, pins, W, H, pad);
    focused = place;
    region = place.region;
    focusScale = Math.min(v.scale, MAX_SCALE);
    root.classList.add('focus');
    shapes.forEach((s) => s.el.classList.toggle('focused', s.place === place));
    setMarkers([]);
    await flyTo({ center: v.center, scale: focusScale }, ms);
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
    inFlight = false;
    finishFlight?.();
    stopSpin();
    scale = Math.min(MAX_SCALE, Math.max(cfg.minScale, next));
    if (focused && scale < focusScale * 0.5) {
      leaveCountry();
    } else if (!focused && region && hooks.onZoomOutOfRegion && !zoomedOut && scale < regionScale * 0.6) {
      if (regionFloor) {
        // Just arrived by pinching out of a country page: that pinch stops here, at the region.
        scale = regionScale * 0.6;
        floorHit = true;
      } else {
        zoomedOut = true;
        hooks.onZoomOutOfRegion();
      }
    }
    moving();
    draw();
  }

  // A Mac trackpad keeps sending scroll events for a moment after the fingers lift ("momentum").
  // If the map opens while that is still happening — e.g. scrolling down the page and clicking
  // America — those leftover events would zoom the new map straight back out and close it before
  // the cities appear. So ignore wheel input until there has been a short pause: a real zoom
  // gesture always starts after one.
  let lastWheel = performance.now();
  let wheelArmed = false;
  let holdWheelUntil = 0;
  // After arriving from a country page (see holdWheel), zooming out stops at the region until a
  // fresh gesture starts once it has: one long or repeated pinch shouldn't fly past the region.
  let regionFloor = false;
  let floorHit = false;
  const newGesture = () => {
    if (floorHit) regionFloor = floorHit = false;
  };
  svg.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault(); // keep the page still while zooming the map
      const now = performance.now();
      const gap = now - lastWheel;
      lastWheel = now;
      if (now < holdWheelUntil) return;
      if (gap >= 400) newGesture();
      if (!wheelArmed) {
        if (gap < 250) return;
        wheelArmed = true;
      }
      if (tip) tip.hidden = true;
      const speed = e.ctrlKey ? 0.012 : 0.0025; // pinch arrives as ctrl+wheel
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      setScale(scale * Math.exp(-delta * speed));
    },
    { passive: false },
  );

  // Safari reports a Mac trackpad pinch as gesture events rather than ctrl+wheel. (On iPhone and
  // iPad the same pinch also arrives as two touches, handled below, so ignore it there.)
  let gestureFrom = 0;
  svg.addEventListener('gesturestart', (e) => {
    e.preventDefault();
    if (touches.size) return;
    newGesture();
    // A pinch still going from the country page that brought us here isn't meant for the globe.
    gestureFrom = performance.now() < holdWheelUntil ? 0 : scale;
  });
  svg.addEventListener('gesturechange', (e) => {
    e.preventDefault();
    if (touches.size || !gestureFrom) return;
    if (tip) tip.hidden = true;
    setScale(gestureFrom * (e as unknown as { scale: number }).scale);
  });
  svg.addEventListener('gestureend', (e) => {
    e.preventDefault();
    gestureFrom = 0;
  });

  // ── Drag to rotate (with momentum); two fingers pinch-zoom ──
  let drag: { x: number; y: number; c: [number, number]; moved: boolean; vx: number; t: number } | null =
    null;
  const touches = new Map<number, { x: number; y: number }>();
  let pinch: { d: number; scale: number } | null = null;
  let spin = 0;
  const stopSpin = () => cancelAnimationFrame(spin);
  const degPerPx = () => 180 / (Math.PI * scale * fit().k);
  const spread = () => {
    const [a, b] = [...touches.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'touch') {
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 2) {
        newGesture();
        drag = null; // second finger: switch from rotating to pinching
        pinch = { d: spread(), scale };
        return;
      }
    }
    if (e.button !== 0) return;
    // A plain click while the camera is flying leaves the flight alone (see onMove).
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
      // Dragging mid-flight takes over from the flight. That must also count as the flight
      // finishing, or whatever was waiting for it (a country's city pins) would never appear.
      cancelAnimationFrame(anim);
      inFlight = false;
      finishFlight?.();
      drag.c = [...center];
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
    moving();
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
      moving();
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
      // No tooltips while zoomed into a country — unless it has been turned out of view, when the
      // rest of the world is back to normal (see draw).
      const inCountry = focused && root.classList.contains('focus');
      if (drag?.moved || inCountry || e.pointerType !== 'mouse') return;
      const target = (e.target as Element).closest('path.visited') as SVGPathElement | null;
      const place = target && cfg.places.find((p) => p.name === target.dataset.name);
      if (!place || place === focused) return void (tip.hidden = true);
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

  const resize = new ResizeObserver(() => {
    sizes = []; // fonts may have changed size with the window
    placeMarkers();
  });
  resize.observe(svg);

  draw();
  root.classList.add('live');

  /** Back to the starting view, with no country selected. */
  function reset() {
    request++;
    region = null;
    unfocus();
    setMarkers([]);
    flyTo(cfg.start, 0);
  }

  /** Ignore wheel input until a pause, e.g. while the pinch that opened this map may still be going. */
  function holdWheel() {
    lastWheel = performance.now();
    wheelArmed = false;
    holdWheelUntil = lastWheel + 1800;
    regionFloor = true;
    floorHit = false;
  }

  /**
   * Fly to (or, with ms 0, jump to) any view with `place` highlighted and no pins — e.g. to line
   * the globe up with a country page's map strip on the way to or from that page.
   */
  function frame(view: MapView, place: MapPlace, ms?: number) {
    request++;
    if (tip) tip.hidden = true;
    const pins = place.cities.map((c) => [c.lon, c.lat] as [number, number]);
    const pad = Math.min(W, H) * (place.cities.length ? 0.16 : 0.2);
    focusScale = Math.min(countryView(shapeOf(place).g, pins, W, H, pad).scale, MAX_SCALE);
    focused = place;
    region = place.region;
    regionScale = regionView(place.region).scale; // for zooming out past the region later
    zoomedOut = false;
    root.classList.add('focus');
    shapes.forEach((s) => s.el.classList.toggle('focused', s.place === place));
    setMarkers([]);
    return flyTo(view, ms);
  }

  return {
    frame,
    /** Draw only what's inside this part of the screen (null: the whole screen) — see visibleArea. */
    setVisibleArea(area: typeof visibleArea) {
      visibleArea = area;
    },
    showRegion,
    showCountry,
    holdWheel,
    highlight,
    regionView,
    reset,
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
