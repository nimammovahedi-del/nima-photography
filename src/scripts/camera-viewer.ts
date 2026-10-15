// Shows one of the 3D cameras in a <canvas>.
//
//   'card' (About page): the simple model turning slowly; drag sideways to spin it. Vertical
//          swipes still scroll the page on a phone.
//   'page' (a camera's own page): the detailed model; drag to rotate in any direction, scroll or
//          pinch to zoom right in, and fly to a feature with focus().
import {
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
  Quaternion,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildCamera } from './camera-models';
import type { CameraModel } from '../data/cameras';

type View = { target: [number, number, number]; from: [number, number, number] };
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export async function mountCamera(canvas: HTMLCanvasElement, model: CameraModel, mode: 'card' | 'page') {
  // Lettering on the model uses the site font: wait for it so it isn't drawn in a fallback.
  await document.fonts?.ready;

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new Scene();
  scene.add(new AmbientLight('#ffffff', 1.1));
  const sun = new DirectionalLight('#fff7e6', 2.4);
  sun.position.set(-2, 4, 5);
  scene.add(sun);
  const fill = new DirectionalLight('#dfe8e6', 0.6);
  fill.position.set(3, -1, -4);
  scene.add(fill);

  const { group, size, offset } = buildCamera(model, mode === 'card' ? 'simple' : 'full');
  scene.add(group);

  const radius = size.length() / 2;
  const cam = new PerspectiveCamera(mode === 'card' ? 28 : 32, 1, 0.05, 100);
  const homeDist = radius / Math.sin(((cam.fov / 2) * Math.PI) / 180) * (mode === 'card' ? 0.8 : 0.78);
  // A three-quarter view from the front, a little above.
  const home = new Vector3(-0.55, 0.35, 1).normalize().multiplyScalar(homeDist);
  cam.position.copy(home);
  cam.lookAt(0, 0, 0);

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    // Keep the whole camera in view in a narrower frame too (a phone's).
    cam.zoom = Math.min(1, cam.aspect / (mode === 'card' ? 0.95 : 1.3));
    cam.updateProjectionMatrix();
    dirty = true;
  }

  let dirty = true;
  let visible = true;
  let raf = 0;
  let last = performance.now();
  let controls: OrbitControls | undefined;
  let flight: ((now: number) => boolean) | undefined;

  if (mode === 'page') {
    controls = new OrbitControls(cam, canvas);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.zoomToCursor = true;
    controls.minDistance = radius * 0.6;
    controls.maxDistance = homeDist * 1.8;
    controls.rotateSpeed = 0.8;
    controls.addEventListener('change', () => (dirty = true));
    controls.addEventListener('start', () => (flight = undefined));
  }

  // ── Card: slow turn, drag sideways to spin ──
  let spin = 0; // extra rotation speed from a flick
  let dragged = false;
  if (mode === 'card') {
    let down: { x: number; t: number; rot: number } | null = null;
    canvas.addEventListener('pointerdown', (e) => {
      down = { x: e.clientX, t: performance.now(), rot: group.rotation.y };
      dragged = false;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - down.x;
      if (Math.abs(dx) > 4) dragged = true;
      if (!dragged) return;
      const now = performance.now();
      const next = down.rot + dx * 0.012;
      spin = (next - group.rotation.y) / Math.max(now - down.t, 1) * 16;
      down.t = now;
      group.rotation.y = next;
      down.rot = next;
      down.x = e.clientX;
      dirty = true;
    });
    const up = () => (down = null);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    // A drag isn't a click: don't follow the link around the canvas.
    canvas.closest('a')?.addEventListener('click', (e) => {
      if (dragged) {
        e.preventDefault();
        dragged = false;
      }
    });
  }

  function frame(now: number) {
    const dt = Math.min(now - last, 50);
    last = now;
    if (mode === 'card') {
      if (!reduceMotion()) group.rotation.y += dt * 0.00035;
      if (Math.abs(spin) > 0.0005) {
        group.rotation.y += spin;
        spin *= 0.93;
      }
      dirty = true;
    }
    if (flight && !flight(now)) flight = undefined;
    if (controls) controls.update();
    if (dirty) {
      renderer.render(scene, cam);
      dirty = false;
    }
    raf = visible ? requestAnimationFrame(frame) : 0;
  }

  // Only draw while on screen.
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }).observe(canvas);
  new ResizeObserver(resize).observe(canvas);
  resize();
  renderer.render(scene, cam);
  canvas.classList.add('ready');

  /** Fly the view to look at a feature (or back to the start, with no view). */
  function focus(view?: View) {
    if (!controls) return;
    // Views are in the model's own coordinates; a little further back than written, so the
    // feature is seen with some of the camera around it.
    const toTarget = view ? new Vector3(...view.target).add(offset) : new Vector3();
    const toPos = view
      ? new Vector3(...view.from).add(offset).sub(toTarget).multiplyScalar(1.35).add(toTarget)
      : home.clone();
    if (reduceMotion()) {
      controls.target.copy(toTarget);
      cam.position.copy(toPos);
      dirty = true;
      return;
    }
    const fromTarget = controls.target.clone();
    const fromPos = cam.position.clone();
    // Swing round the model rather than straight through it: move in a curve around the target.
    const fromDir = fromPos.clone().sub(fromTarget);
    const toDir = toPos.clone().sub(toTarget);
    const turn = new Quaternion().setFromUnitVectors(fromDir.clone().normalize(), toDir.clone().normalize());
    const t0 = performance.now();
    const ms = 1100;
    flight = (now) => {
      const t = Math.min((now - t0) / ms, 1);
      const e = ease(t);
      controls!.target.lerpVectors(fromTarget, toTarget, e);
      const len = fromDir.length() + (toDir.length() - fromDir.length()) * e;
      const dir = fromDir.clone().normalize().applyQuaternion(new Quaternion().slerp(turn, e));
      cam.position.copy(controls!.target).addScaledVector(dir, len);
      dirty = true;
      return t < 1;
    };
  }

  return { focus };
}
