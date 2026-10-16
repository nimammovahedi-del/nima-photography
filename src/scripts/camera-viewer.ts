// Shows one of the 3D cameras in a <canvas>, turning slowly on its own. It doesn't respond to
// dragging or zooming: on the About page ('card') a click simply opens the camera's page, and on
// that page ('page') the view moves only when a feature is picked (focus()).
import {
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
  Quaternion,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { buildCamera, setPaper } from './camera-models';
import type { CameraModel } from '../data/cameras';

type View = { target: [number, number, number]; from: [number, number, number] };
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export async function mountCamera(
  canvas: HTMLCanvasElement,
  model: CameraModel,
  mode: 'card' | 'page',
  /** Where in its turn to start (radians): the page picks up where the About page's card was. */
  startRotation = 0,
) {
  // Lettering on the model uses the site font: wait for it so it isn't drawn in a fallback.
  await document.fonts?.ready;

  // The cards keep their last frame so it can be copied for the opening animation (see about/index).
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: mode === 'card' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new Scene();
  scene.add(new AmbientLight('#ffffff', 1.1));
  const sun = new DirectionalLight('#fff7e6', 2.4);
  sun.position.set(-2, 4, 5);
  scene.add(sun);
  const fill = new DirectionalLight('#dfe8e6', 0.6);
  fill.position.set(3, -1, -4);
  scene.add(fill);

  // The drawing's surfaces are filled with the colour behind it (so hidden lines stay hidden).
  setPaper(canvas.dataset.paper ?? '#0b0b0b', renderer.getPixelRatio());
  const { group, size, offset } = buildCamera(model, mode === 'card' ? 'simple' : 'full');
  scene.add(group);
  group.rotation.y = startRotation;

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
  let flight: ((now: number) => boolean) | undefined;
  let focused = false; // looking at a feature: the turning stops
  const target = new Vector3();

  function frame(now: number) {
    const dt = Math.min(now - last, 50);
    last = now;
    if (!focused && !flight && !reduceMotion()) {
      group.rotation.y += dt * 0.00035;
      dirty = true;
    }
    if (flight && !flight(now)) flight = undefined;
    if (dirty) {
      cam.lookAt(target);
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

  /** Fly the view to look at a feature (or, with none, back to the start and turning again). */
  function focus(view?: View) {
    if (mode !== 'page') return;
    // Views are in the model's own coordinates; a little further back than written, so the
    // feature is seen with some of the camera around it.
    const toTarget = view ? new Vector3(...view.target).add(offset) : new Vector3();
    const toPos = view
      ? new Vector3(...view.from).add(offset).sub(toTarget).multiplyScalar(1.7).add(toTarget)
      : home.clone();
    // The views are written for the model facing its usual way: turn it back there on the way
    // (by the shorter way round).
    const fromRot = group.rotation.y;
    const toRot = view ? Math.round(fromRot / (2 * Math.PI)) * 2 * Math.PI : fromRot;
    focused = !!view;
    if (reduceMotion()) {
      target.copy(toTarget);
      cam.position.copy(toPos);
      group.rotation.y = toRot;
      dirty = true;
      return;
    }
    const fromTarget = target.clone();
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
      target.lerpVectors(fromTarget, toTarget, e);
      group.rotation.y = fromRot + (toRot - fromRot) * e;
      const len = fromDir.length() + (toDir.length() - fromDir.length()) * e;
      const dir = fromDir.clone().normalize().applyQuaternion(new Quaternion().slerp(turn, e));
      cam.position.copy(target).addScaledVector(dir, len);
      dirty = true;
      return t < 1;
    };
  }

  /** How far through its turn the model is (radians). */
  const rotation = () => group.rotation.y;

  return { focus, rotation };
}
