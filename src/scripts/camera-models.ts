// Illustrated 3D models of the cameras on the About page, built from simple shapes in the site's
// tan palette with inked outlines — drawings, not photo-real replicas. Two levels of detail: a
// simple one for the small turning models on /about, and a full one (dials with ridges, buttons,
// lens rings, lettering) for each camera's own page.
//
// Units are 10 cm (so a 152 mm wide camera is 1.52 wide). x runs to the right as you face the
// lens, y up, z out of the lens towards you. The finished model is centred on the origin.
import {
  BackSide,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DataTexture,
  EdgesGeometry,
  ExtrudeGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  NearestFilter,
  PlaneGeometry,
  RedFormat,
  Shape,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
  Box3,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { CameraModel } from '../data/cameras';

export type Detail = 'simple' | 'full';

// ── Palette (from the site: the globe's tans, khaki, cream and sage) ──
const C = {
  body: '#c9bc98', // light tan, like the globe's land
  hide: '#968867', // khaki: leatherette and grips
  dark: '#5f5947', // rubber, lens barrels
  metal: '#efe8d2', // cream: metal plates, dials
  glass: '#a4bdba', // sage: lens glass
  screen: '#24261f',
  ink: '#1a1712', // outlines and lettering
  accent: '#b0a27c',
};

// Three flat tones of light, for the drawn look.
const tones = new DataTexture(new Uint8Array([110, 190, 255]), 3, 1, RedFormat);
tones.minFilter = tones.magFilter = NearestFilter;
tones.needsUpdate = true;

const mats = new Map<string, Material>();
function mat(color: string, flat = false) {
  // (`flat` only keys the cache: ridged shapes get their facets from their own normals, see zcyl.)
  const key = color + flat;
  let m = mats.get(key);
  if (!m) {
    m = new MeshToonMaterial({ color: new Color(color), gradientMap: tones });
    mats.set(key, m);
  }
  return m;
}

// Inked outline: a slightly fattened copy of each shape drawn from the inside, plus lines on
// its sharp edges.
const hullMat = new MeshBasicMaterial({ color: C.ink, side: BackSide });
hullMat.onBeforeCompile = (s) => {
  s.uniforms.thickness = { value: 0.009 };
  s.vertexShader = s.vertexShader
    .replace('#include <common>', '#include <common>\nuniform float thickness;')
    .replace('#include <begin_vertex>', 'vec3 transformed = position + normalize(normal) * thickness;');
};
const lineMat = new LineBasicMaterial({ color: C.ink, transparent: true, opacity: 0.75 });

interface Opts {
  outline?: boolean; // default true
  edges?: number; // crease angle for ink lines (degrees); 0 = none
}

/** Add a shape to a group, inked. */
function add(g: Group, geo: BufferGeometry, color: string, at: [number, number, number], o: Opts & { flat?: boolean; rot?: [number, number, number] } = {}) {
  const m = new Mesh(geo, mat(color, o.flat));
  m.position.set(...at);
  if (o.rot) m.rotation.set(...o.rot);
  if (o.outline !== false) m.add(new Mesh(geo, hullMat));
  const edges = o.edges ?? 40;
  if (edges) m.add(new LineSegments(new EdgesGeometry(geo, edges), lineMat));
  g.add(m);
  return m;
}

const rbox = (w: number, h: number, d: number, r: number, seg = 3) =>
  new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2) * 0.999);

/** A cylinder along z (the lens axis). Ridged: grip ridges around its side. */
function zcyl(r: number, len: number, segs = 48, ridges = 0, r2 = r) {
  const n = ridges ? ridges * 2 : segs;
  let geo: BufferGeometry = new CylinderGeometry(r2, r, len, n, 1, false);
  if (ridges) {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const rr = Math.hypot(x, z);
      if (rr < 1e-6) continue;
      const a = Math.atan2(z, x);
      const k = Math.round(((a + Math.PI) / (2 * Math.PI)) * n) % 2 ? 1 : 1 - 0.035;
      p.setXYZ(i, (x / rr) * rr * k, p.getY(i), (z / rr) * rr * k);
    }
    // Unshared corners, so each ridge catches the light as its own facet.
    geo = geo.toNonIndexed();
    geo.computeVertexNormals();
  }
  geo.rotateX(Math.PI / 2);
  return geo;
}
/** A cylinder standing upright (dials, buttons). */
function ycyl(r: number, h: number, segs = 40, ridges = 0) {
  const g = zcyl(r, h, segs, ridges);
  g.rotateX(-Math.PI / 2);
  return g;
}

/** Lettering on a transparent plane facing +z. */
function label(text: string, h: number, color = C.ink, weight = 600, letterSpacing = 0) {
  const fontPx = 96;
  const cvs = document.createElement('canvas');
  const ctx = cvs.getContext('2d')!;
  const font = `${weight} ${fontPx}px Poppins, Helvetica, Arial, sans-serif`;
  ctx.font = font;
  (ctx as any).letterSpacing = `${letterSpacing}px`;
  const w = Math.ceil(ctx.measureText(text).width) + 16;
  cvs.width = w;
  cvs.height = fontPx * 1.3;
  ctx.font = font;
  (ctx as any).letterSpacing = `${letterSpacing}px`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 8, cvs.height / 2);
  const tex = new CanvasTexture(cvs);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  const m = new Mesh(
    new PlaneGeometry((h * w) / cvs.height, h),
    new MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
  );
  return m;
}

/** A flat shape in the x–z plane (seen from above), extruded upwards by `h`. */
function plan(points: [number, number][], h: number, bevel: number) {
  const s = new Shape();
  points.forEach(([x, z], i) => (i ? s.lineTo(x, -z) : s.moveTo(x, -z)));
  s.closePath();
  const geo = new ExtrudeGeometry(s, {
    depth: h - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 16,
  });
  geo.translate(0, 0, bevel);
  geo.rotateX(-Math.PI / 2);
  return geo;
}

/** A rounded outline through the given corner points (quadratic curves through the midpoints). */
function rounded(pts: [number, number][]): [number, number][] {
  const out: [number, number][] = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[(i - 1 + n) % n];
    const b = pts[i];
    const c = pts[(i + 1) % n];
    const m1: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const m2: [number, number] = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
    for (let t = 0; t <= 1; t += 0.125) {
      const u = 1 - t;
      out.push([u * u * m1[0] + 2 * u * t * b[0] + t * t * m2[0], u * u * m1[1] + 2 * u * t * b[1] + t * t * m2[1]]);
    }
  }
  return out;
}

/** A lens: rings stacked along +z from the mount. */
type Ring = { r: number; len: number; color: string; ridges?: number; r2?: number };
function lens(g: Group, at: [number, number, number], rings: Ring[], glassR: number, full: boolean) {
  let z = at[2];
  for (const ring of rings) {
    const ridged = full && ring.ridges;
    add(g, zcyl(ring.r, ring.len, full ? 64 : 32, ridged ? ring.ridges : 0, ring.r2 ?? ring.r), ring.color, [at[0], at[1], z + ring.len / 2], {
      flat: !!ridged,
      edges: ridged ? 0 : 50,
    });
    z += ring.len;
  }
  // The front: a dark recess and the glass, domed a little.
  const last = rings[rings.length - 1];
  add(g, zcyl(last.r * 0.9, 0.012, 48), C.ink, [at[0], at[1], z + 0.002], { outline: false, edges: 0 });
  const glass = new Mesh(zcyl(glassR, 0.02, 48), mat(C.glass));
  glass.position.set(at[0], at[1], z + 0.006);
  g.add(glass);
  if (full) {
    // A highlight across the glass, and the inner element.
    const inner = new Mesh(zcyl(glassR * 0.55, 0.02, 40), mat('#7f9a97'));
    inner.position.set(at[0], at[1], z + 0.012);
    g.add(inner);
    const glint = new Mesh(new PlaneGeometry(glassR * 0.5, glassR * 0.14), new MeshBasicMaterial({ color: '#e9f1ef', transparent: true, opacity: 0.7 }));
    glint.position.set(at[0] + glassR * 0.3, at[1] + glassR * 0.42, z + 0.024);
    glint.rotation.z = -0.5;
    g.add(glint);
  }
  return z;
}

// ── Canon DSLRs ─────────────────────────────────────────────────────────────

interface DslrSpec {
  w: number; // body width
  hb: number; // body height below the prism
  db: number; // body thickness
  grip: number; // how far the grip stands out in front
  prismW: number;
  prismH: number;
  flash: boolean; // a pop-up flash in the prism (7D Mark II)
  logo: string;
  badge: string;
  lens: Ring[];
  lensGlass: number;
  lensLabel: string;
  accentRing?: boolean; // the red ring of an L lens (drawn in sage)
}

function dslr(s: DslrSpec, full: boolean) {
  const g = new Group();
  const { w, hb, db } = s;
  const top = hb / 2;
  const front = db / 2;
  const back = -db / 2;
  const mountX = 0.04;
  const mountY = -0.05;

  // Body
  add(g, rbox(w, hb, db, 0.09, full ? 4 : 3), C.body, [0, 0, 0], { edges: 0 });
  // Leatherette band around the front (a slightly larger, thin shell, behind the body's face)
  add(g, rbox(w - 0.02, hb * 0.62, 0.02, 0.01), C.hide, [0.06, -0.05, front - 0.004], { edges: 0 });

  // Grip, on the left as you face the lens.
  const gx0 = -w / 2 - 0.005;
  const gripPts = rounded([
    [gx0, back + 0.1],
    [gx0, front + s.grip],
    [gx0 + 0.38, front + s.grip * 0.9],
    [gx0 + 0.42, front - 0.02],
    [gx0 + 0.3, back + 0.1],
  ]);
  const grip = add(g, plan(gripPts, hb * 0.94, 0.05), C.hide, [0, -hb * 0.47, 0], { edges: 0 });
  grip.position.y = -hb * 0.49;

  // Prism hump
  const pw = s.prismW;
  const ph = s.prismH;
  const prismShape = new Shape();
  prismShape.moveTo(-pw / 2, 0);
  prismShape.lineTo(pw / 2, 0);
  prismShape.lineTo(pw * (s.flash ? 0.34 : 0.26), ph);
  prismShape.lineTo(-pw * (s.flash ? 0.34 : 0.26), ph);
  prismShape.closePath();
  const pd = db * 0.82;
  const prismGeo = new ExtrudeGeometry(prismShape, {
    depth: pd - 0.08,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: full ? 5 : 3,
    curveSegments: 8,
  });
  prismGeo.translate(0, -0.04, -(pd - 0.08) / 2);
  add(g, prismGeo, C.body, [mountX, top - 0.02, -0.01], { edges: 0 });
  // Its front face, sloping forward over the lens mount.
  const nose = rbox(pw * 0.62, ph * 0.72, 0.16, 0.05);
  add(g, nose, C.body, [mountX, top + ph * 0.32, front - 0.04], { edges: 0, rot: [-0.35, 0, 0] });
  if (s.flash) {
    // The pop-up flash's head along the top of the prism.
    add(g, rbox(pw * 0.62, 0.1, pd * 0.78, 0.04), C.body, [mountX, top + ph - 0.02, 0.02], { edges: 0 });
    add(g, rbox(pw * 0.42, 0.055, 0.02, 0.012), C.metal, [mountX, top + ph - 0.03, 0.02 + pd * 0.39 + 0.005], { outline: false, edges: 0 });
  }

  // Logo on the front of the prism
  const logo = label(s.logo, 0.11, C.ink, 700);
  logo.position.set(mountX, top + ph * 0.36, front + 0.045);
  logo.rotation.x = -0.35;
  g.add(logo);

  // Hot shoe
  const shoeY = top + ph + (s.flash ? 0.05 : 0.0);
  add(g, new BoxGeometry(0.2, 0.025, 0.19), C.metal, [mountX, shoeY, -0.02]);
  if (full) {
    add(g, new BoxGeometry(0.03, 0.04, 0.19), C.metal, [mountX - 0.095, shoeY + 0.02, -0.02]);
    add(g, new BoxGeometry(0.03, 0.04, 0.19), C.metal, [mountX + 0.095, shoeY + 0.02, -0.02]);
  }

  // Eyepiece on the back of the prism
  add(g, rbox(0.36, 0.26, 0.12, 0.06), C.dark, [mountX, top + 0.1, back - 0.04], { edges: 0 });
  add(g, rbox(0.22, 0.14, 0.02, 0.03), C.screen, [mountX, top + 0.1, back - 0.1], { outline: false, edges: 0 });

  // Lens mount and lens
  add(g, zcyl(0.32, 0.04, 48), C.metal, [mountX, mountY, front + 0.02]);
  const lensFront = lens(g, [mountX, mountY, front + 0.04], s.lens, s.lensGlass, full);
  void lensFront;

  // Shutter button and dial on top of the grip
  const sx = -w / 2 + 0.2;
  add(g, ycyl(0.07, 0.07, 32), C.body, [sx, top + 0.02, front + 0.12], { rot: [0.3, 0, 0] });
  add(g, ycyl(0.05, 0.05, 32), C.metal, [sx, top + 0.07, front + 0.135], { rot: [0.3, 0, 0] });
  add(g, ycyl(0.12, 0.05, 40, full ? 30 : 0), C.dark, [sx + 0.14, top + 0.005, front - 0.02], { flat: full, edges: 0 });

  // Top LCD panel on the grip side; mode dial on the other.
  add(g, rbox(0.34, 0.03, 0.24, 0.02), C.dark, [-w / 2 + 0.44, top + 0.005, -0.04], { edges: 0 });
  add(g, new PlaneGeometry(0.26, 0.17), C.screen, [-w / 2 + 0.44, top + 0.022, -0.04], { outline: false, edges: 0, rot: [-Math.PI / 2, 0, 0] });
  add(g, ycyl(0.15, 0.09, 48, full ? 36 : 0), C.dark, [w / 2 - 0.24, top + 0.04, -0.02], { flat: full, edges: 0 });
  add(g, ycyl(0.09, 0.02, 32), C.body, [w / 2 - 0.24, top + 0.09, -0.02], { edges: 0 });

  // Rear screen
  add(g, rbox(0.66, 0.5, 0.03, 0.03), C.dark, [0.1, -0.08, back - 0.01], { edges: 0 });
  add(g, new PlaneGeometry(0.6, 0.45), C.screen, [0.1, -0.08, back - 0.027], { outline: false, edges: 0, rot: [0, Math.PI, 0] });
  // Quick control dial
  add(g, new TorusGeometry(0.12, 0.03, 12, 40), C.dark, [-w / 2 + 0.3, -0.14, back - 0.01], { edges: 0 });
  add(g, zcyl(0.06, 0.03, 24), C.body, [-w / 2 + 0.3, -0.14, back - 0.01]);
  // Thumb rest
  add(g, rbox(0.3, 0.2, 0.06, 0.05), C.hide, [-w / 2 + 0.2, top - 0.15, back - 0.01], { edges: 0 });

  if (full) {
    // Rear buttons down the left (seen from behind: on the right as you face the lens).
    for (let i = 0; i < 5; i++) {
      add(g, rbox(0.08, 0.05, 0.03, 0.015), C.dark, [w / 2 - 0.14, 0.18 - i * 0.1, back - 0.01], { edges: 0 });
    }
    // Joystick and AF-ON / exposure-lock buttons
    add(g, zcyl(0.035, 0.05, 20), C.dark, [-w / 2 + 0.3, 0.08, back - 0.02]);
    add(g, zcyl(0.04, 0.03, 20), C.dark, [-w / 2 + 0.36, top - 0.1, back - 0.04]);
    add(g, zcyl(0.04, 0.03, 20), C.dark, [-w / 2 + 0.24, top - 0.1, back - 0.04]);
    // Buttons in front of the top screen
    for (let i = 0; i < 3; i++) {
      add(g, rbox(0.07, 0.025, 0.04, 0.01), C.dark, [-w / 2 + 0.36 + i * 0.085, top + 0.01, 0.13], { edges: 0 });
    }
    // Lens release button and depth-of-field preview
    add(g, zcyl(0.045, 0.03, 24), C.metal, [mountX + 0.4, mountY + 0.12, front + 0.01]);
    add(g, rbox(0.05, 0.08, 0.02, 0.01), C.dark, [mountX + 0.38, mountY - 0.18, front + 0.01], { edges: 0 });
    // Self-timer lamp on the grip, card door seam
    add(g, zcyl(0.03, 0.02, 20), C.dark, [-w / 2 + 0.32, top - 0.12, front + 0.02]);
    // Port doors on the side
    add(g, rbox(0.02, hb * 0.55, db * 0.6, 0.01), C.hide, [w / 2 + 0.002, -0.04, 0], { edges: 0 });
    // Strap lugs
    for (const x of [-w / 2 - 0.005, w / 2 + 0.005]) {
      const lug = add(g, new TorusGeometry(0.04, 0.012, 8, 16), C.metal, [x, top - 0.1, 0.02], { edges: 0, rot: [0, Math.PI / 2, 0] });
      void lug;
    }
    // Model badge on the front
    const badge = label(s.badge, 0.06, C.ink, 500);
    badge.position.set(mountX + 0.52, top - 0.06, front + 0.003);
    g.add(badge);
    // Lens lettering
    const ll = label(s.lensLabel, 0.045, C.metal, 500, 2);
    const lr = s.lens[0].r + 0.003;
    ll.position.set(mountX, mountY + lr, front + 0.04 + s.lens[0].len / 2);
    ll.rotation.x = -Math.PI / 2;
    g.add(ll);
    if (s.accentRing) {
      // An L lens's red ring, drawn in sage to stay in the palette.
      const z = front + 0.04 + s.lens.slice(0, 2).reduce((a, r) => a + r.len, 0);
      add(g, zcyl(s.lens[2].r + 0.004, 0.02, 64), C.glass, [mountX, mountY, z + 0.01], { edges: 0, outline: false });
    }
  }
  return g;
}

// ── Fujifilm X-E1 ───────────────────────────────────────────────────────────

function xe1(full: boolean) {
  const g = new Group();
  const w = 1.29;
  const d = 0.3;
  const hLow = 0.5; // leatherette part
  const hTop = 0.2; // top plate
  const yLow = -0.1; // centre of the leatherette part
  const top = yLow + hLow / 2 + hTop;
  const front = d / 2;
  const back = -d / 2;

  // Bottom plate, leatherette body, top plate (two-tone, like the silver X-E1)
  add(g, rbox(w, 0.06, d, 0.03), C.metal, [0, yLow - hLow / 2 - 0.02, 0], { edges: 0 });
  add(g, rbox(w - 0.01, hLow, d - 0.01, 0.04, full ? 4 : 3), C.hide, [0, yLow, 0], { edges: 0 });
  add(g, rbox(w, hTop, d, 0.06, full ? 4 : 3), C.metal, [0, yLow + hLow / 2 + hTop / 2 - 0.01, 0], { edges: 0 });

  // A small grip on the front, left as you face the lens
  add(g, rbox(0.16, 0.42, 0.08, 0.04), C.hide, [-w / 2 + 0.14, yLow, front + 0.02], { edges: 0 });

  // Lens: XF 35mm f/1.4 — aperture ring, wide focus ring
  const lx = -0.02;
  const ly = yLow + 0.02;
  add(g, zcyl(0.3, 0.03, 48), C.metal, [lx, ly, front + 0.015]);
  const rings: Ring[] = [
    { r: 0.3, len: 0.05, color: C.dark },
    { r: 0.305, len: 0.11, color: C.dark, ridges: 40 },
    { r: 0.3, len: 0.04, color: C.dark },
    { r: 0.32, len: 0.2, color: C.dark, ridges: 56 },
    { r: 0.315, len: 0.12, color: C.dark },
  ];
  lens(g, [lx, ly, front + 0.03], rings, 0.22, full);

  // Top dials (shutter speed and exposure compensation), on the left as you face the lens
  const sdX = -w / 2 + 0.36;
  add(g, ycyl(0.13, 0.08, 48, full ? 40 : 0), C.metal, [sdX, top + 0.04, -0.01], { flat: full, edges: 0 });
  add(g, ycyl(0.045, 0.06, 24), C.metal, [sdX, top + 0.09, -0.01]);
  add(g, ycyl(0.1, 0.07, 40, full ? 32 : 0), C.metal, [-w / 2 + 0.12, top + 0.035, -0.06], { flat: full, edges: 0 });
  // Hot shoe and the pop-up flash
  add(g, new BoxGeometry(0.2, 0.025, 0.19), C.dark, [0.08, top + 0.012, -0.02]);
  add(g, rbox(0.34, 0.04, d - 0.04, 0.02), C.metal, [0.38, top + 0.015, 0], { edges: 0 });
  add(g, rbox(0.2, 0.025, 0.012, 0.008), C.screen, [0.38, top + 0.01, front - 0.01], { outline: false, edges: 0 });

  // Viewfinder at the back's top corner, the screen below it
  add(g, rbox(0.3, 0.18, 0.07, 0.05), C.dark, [0.42, top - 0.11, back - 0.02], { edges: 0 });
  add(g, rbox(0.17, 0.09, 0.02, 0.02), C.screen, [0.42, top - 0.11, back - 0.055], { outline: false, edges: 0 });
  add(g, rbox(0.62, 0.48, 0.025, 0.03), C.dark, [0.16, yLow - 0.02, back - 0.008], { edges: 0 });
  add(g, new PlaneGeometry(0.56, 0.42), C.screen, [0.16, yLow - 0.02, back - 0.022], { outline: false, edges: 0, rot: [0, Math.PI, 0] });
  // Four-way pad
  add(g, new TorusGeometry(0.075, 0.022, 10, 32), C.dark, [-w / 2 + 0.3, yLow - 0.06, back - 0.005], { edges: 0 });
  add(g, zcyl(0.04, 0.03, 20), C.dark, [-w / 2 + 0.3, yLow - 0.06, back - 0.008]);

  // Lettering on the top plate
  const logo = label('FUJIFILM', 0.06, C.ink, 600, 4);
  logo.position.set(0.32, top - 0.1, front + 0.002);
  g.add(logo);

  if (full) {
    const badge = label('X-E1', 0.075, C.ink, 600);
    badge.position.set(-w / 2 + 0.2, top - 0.1, front + 0.002);
    g.add(badge);
    // Command dial at the thumb, buttons down the right of the back (seen from behind)
    add(g, zcyl(0.06, 0.03, 32, 18), C.dark, [-w / 2 + 0.14, top - 0.08, back - 0.005], { flat: true, edges: 0 });
    for (let i = 0; i < 3; i++) {
      add(g, rbox(0.08, 0.045, 0.025, 0.012), C.dark, [-w / 2 + 0.12, yLow + 0.12 - i * 0.12, back - 0.006], { edges: 0 });
    }
    for (let i = 0; i < 2; i++) {
      add(g, zcyl(0.03, 0.025, 20), C.dark, [-w / 2 + 0.3 + i * 0.09, top - 0.08, back - 0.005]);
    }
    // Focus-mode switch and the AF-assist lamp on the front
    add(g, rbox(0.04, 0.08, 0.025, 0.012), C.dark, [lx + 0.39, ly - 0.06, front + 0.008], { edges: 0 });
    add(g, zcyl(0.035, 0.02, 20), C.screen, [0.5, top - 0.08, front + 0.004]);
    // Fn button and power collar round the shutter button
    add(g, new TorusGeometry(0.06, 0.012, 8, 24), C.dark, [sdX, top + 0.085, -0.01], { edges: 0, rot: [Math.PI / 2, 0, 0] });
    add(g, ycyl(0.035, 0.03, 20), C.dark, [sdX + 0.22, top + 0.01, 0.06]);
    // Strap lugs
    for (const x of [-w / 2 - 0.005, w / 2 + 0.005]) {
      add(g, new TorusGeometry(0.035, 0.01, 8, 16), C.metal, [x, top - 0.08, 0.0], { edges: 0, rot: [0, Math.PI / 2, 0] });
    }
    // Lens lettering and aperture numbers
    const ll = label('XF 35mm  1:1.4 R', 0.04, C.metal, 500, 2);
    ll.position.set(lx, ly + 0.303, front + 0.03 + 0.05 + 0.11 + 0.02);
    ll.rotation.x = -Math.PI / 2;
    g.add(ll);
    const ap = label('1.4   2   2.8   4   5.6   8   11   16', 0.03, C.metal, 500);
    ap.position.set(lx, ly + 0.308, front + 0.03 + 0.05 + 0.055);
    ap.rotation.x = -Math.PI / 2;
    g.add(ap);
    const sd = label('4000 2000 1000 500 250', 0.022, C.ink, 500);
    sd.position.set(sdX, top + 0.082, 0.03);
    sd.rotation.x = -Math.PI / 2;
    sd.scale.setScalar(0.85);
    g.add(sd);
  }
  return g;
}

// ── Public ──────────────────────────────────────────────────────────────────

export function buildCamera(model: CameraModel, detail: Detail) {
  const full = detail === 'full';
  let g: Group;
  if (model === 'x-e1') g = xe1(full);
  else if (model === 'eos-5d-mark-ii')
    g = dslr(
      {
        w: 1.52,
        hb: 0.82,
        db: 0.5,
        grip: 0.22,
        prismW: 0.66,
        prismH: 0.3,
        flash: false,
        logo: 'Canon',
        badge: '5D Mark II',
        lens: [
          { r: 0.37, len: 0.16, color: C.dark },
          { r: 0.41, len: 0.36, color: C.dark, ridges: 60 },
          { r: 0.405, len: 0.09, color: C.dark },
          { r: 0.41, len: 0.2, color: C.dark, ridges: 64 },
          { r: 0.42, len: 0.14, color: C.dark },
        ],
        lensGlass: 0.31,
        lensLabel: 'EF 24-105mm  1:4 L IS',
        accentRing: true,
      },
      full,
    );
  else
    g = dslr(
      {
        w: 1.49,
        hb: 0.8,
        db: 0.52,
        grip: 0.24,
        prismW: 0.7,
        prismH: 0.32,
        flash: true,
        logo: 'Canon',
        badge: '7D Mark II',
        lens: [
          { r: 0.35, len: 0.14, color: C.dark },
          { r: 0.385, len: 0.34, color: C.dark, ridges: 56 },
          { r: 0.37, len: 0.1, color: C.dark },
          { r: 0.375, len: 0.16, color: C.dark, ridges: 60 },
          { r: 0.385, len: 0.12, color: C.dark },
        ],
        lensGlass: 0.29,
        lensLabel: 'EF-S 18-135mm  IS USM',
      },
      full,
    );
  // Centre the model on the origin.
  const box = new Box3().setFromObject(g);
  const c = box.getCenter(new Vector3());
  g.position.sub(c);
  const wrap = new Group();
  wrap.add(g);
  // `offset` maps the model's own coordinates (as used for the highlights' views) to the scene's.
  return { group: wrap, size: box.getSize(new Vector3()), offset: g.position.clone() };
}
