// Makes the web versions of every photo and stores them in Cloudflare R2.
//
//   1. Photos dropped into src/photos/<category>/ are uploaded to R2 as originals
//      (originals/<category>/<file>) and then removed from the repo.
//   2. Every original in R2 without up-to-date web versions gets them: AVIF + WebP at several
//      widths (w/<category>/<name>-<hash>-<width>.<ext>), with GPS and other metadata stripped.
//   3. src/data/photo-manifest.json records each photo's size, widths, blurred preview and
//      camera settings. The site reads only this file at build time; it never touches the images.
//
// Runs in the "Photos" GitHub Action. Needs R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and
// R2_SECRET_ACCESS_KEY (and optionally R2_BUCKET, default nima-photos).
// For a local test without R2, set R2_LOCAL_DIR to a folder that stands in for the bucket.
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import exifr from 'exifr';
import sharp from 'sharp';
import { AwsClient } from 'aws4fetch';

const INBOX = 'src/photos';
const MANIFEST = 'src/data/photo-manifest.json';
const CATEGORIES = ['architecture', 'places', 'nature', 'animals', 'film'];
const IMAGE = /\.(jpe?g|png|webp|avif|tiff?)$/i;
const WIDTHS = [480, 720, 960, 1280, 1600, 2000, 2400];
const MAX = 2400;
// AVIF is only made up to 2000px (the largest a grid tile asks for); the full-screen viewer uses
// WebP. AVIF effort 3 is ~4x faster to encode than the default with files about the same size.
const FORMATS = {
  avif: { type: 'image/avif', max: 2000, encode: (s) => s.avif({ quality: 52, effort: 3 }) },
  webp: { type: 'image/webp', max: MAX, encode: (s) => s.webp({ quality: 80, effort: 4 }) },
};
const CONCURRENCY = 4;
const IMMUTABLE = 'public, max-age=31536000, immutable';

// ---- Storage: R2 over its S3 API, or a local folder for testing ----

function r2Store() {
  // Trimmed because a secret pasted with a trailing newline otherwise breaks the request signature.
  const env = (name) => process.env[name]?.trim();
  const [R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY] = [
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
  ].map(env);
  const bucket = env('R2_BUCKET') || 'nima-photos';
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY)
    throw new Error('Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY (or R2_LOCAL_DIR).');
  const aws = new AwsClient({
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    service: 's3',
    region: 'auto',
  });
  const base = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucket}`;
  const url = (key) => `${base}/${key.split('/').map(encodeURIComponent).join('/')}`;

  async function call(input, init, attempt = 1) {
    const res = await aws.fetch(input, init);
    if (res.ok) return res;
    if (attempt < 4 && (res.status >= 500 || res.status === 429)) {
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      return call(input, init, attempt + 1);
    }
    throw new Error(`R2 ${init?.method ?? 'GET'} ${input} → ${res.status} ${await res.text()}`);
  }

  return {
    async list(prefix) {
      const out = new Map();
      let token;
      do {
        const q = new URLSearchParams({ 'list-type': '2', prefix });
        if (token) q.set('continuation-token', token);
        const xml = await (await call(`${base}?${q}`)).text();
        for (const [, body] of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
          const key = decodeXml(body.match(/<Key>([\s\S]*?)<\/Key>/)[1]);
          const etag = decodeXml(body.match(/<ETag>([\s\S]*?)<\/ETag>/)?.[1] ?? '').replace(/"/g, '');
          out.set(key, etag);
        }
        token = /<IsTruncated>true<\/IsTruncated>/.test(xml)
          ? decodeXml(xml.match(/<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/)[1])
          : undefined;
      } while (token);
      return out;
    },
    async get(key) {
      return Buffer.from(await (await call(url(key))).arrayBuffer());
    },
    async put(key, body, type, cacheControl) {
      const headers = { 'Content-Type': type };
      if (cacheControl) headers['Cache-Control'] = cacheControl;
      const res = await call(url(key), { method: 'PUT', body, headers });
      return (res.headers.get('etag') ?? '').replace(/"/g, '');
    },
  };
}

function localStore(dir) {
  const md5 = (b) => createHash('md5').update(b).digest('hex');
  return {
    async list(prefix) {
      const out = new Map();
      for (const f of await walk(path.join(dir, prefix)).catch(() => []))
        out.set(path.relative(dir, f).split(path.sep).join('/'), md5(await readFile(f)));
      return out;
    },
    get: (key) => readFile(path.join(dir, key)),
    async put(key, body) {
      await mkdir(path.dirname(path.join(dir, key)), { recursive: true });
      await writeFile(path.join(dir, key), body);
      return md5(body);
    },
  };
}

const decodeXml = (s) =>
  s.replace(/&(amp|lt|gt|quot|apos);/g, (_, e) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" })[e]);

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

// ---- Image processing ----

function formatExif(e) {
  if (!e) return undefined;
  const model = e.Model ? String(e.Model).trim() : undefined;
  const camera =
    model && e.Make && !model.toLowerCase().startsWith(String(e.Make).toLowerCase())
      ? `${String(e.Make).trim()} ${model}`
      : model;
  const shutter = e.ExposureTime
    ? e.ExposureTime >= 1
      ? `${e.ExposureTime}s`
      : `1/${Math.round(1 / e.ExposureTime)}s`
    : undefined;
  const parts = [
    camera,
    e.FocalLength && `${Math.round(e.FocalLength)}mm`,
    e.FNumber && `ƒ/${e.FNumber}`,
    shutter,
    e.ISO && `ISO ${e.ISO}`,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : undefined;
}

/** Makes and uploads every web version of one original; returns its manifest entry. */
async function makeWebVersions(store, id, buf, etag) {
  const hash = createHash('sha256').update(buf).digest('hex').slice(0, 10);
  const stem = id.replace(/\.[^.]+$/, '');
  // Upright, colour-managed to sRGB, at most 2400px on the long edge. Metadata (GPS included)
  // isn't copied into the web files; camera settings go in the manifest instead.
  const upright = await sharp(buf, { failOn: 'none' })
    .rotate()
    .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
    .toBuffer({ resolveWithObject: true });
  const { width, height } = upright.info;
  const widths = [...WIDTHS.filter((w) => w < width), Math.min(width, MAX)].filter(
    (w, i, a) => a.indexOf(w) === i,
  );

  for (const w of widths) {
    for (const [ext, f] of Object.entries(FORMATS)) {
      if (w > f.max) continue;
      const out = await f.encode(sharp(upright.data).resize({ width: w })).toBuffer();
      await store.put(`w/${stem}-${hash}-${w}.${ext}`, out, f.type, IMMUTABLE);
    }
  }

  const [exif, blur] = await Promise.all([
    exifr
      .parse(buf, ['Make', 'Model', 'FocalLength', 'FNumber', 'ExposureTime', 'ISO'])
      .catch(() => undefined),
    sharp(upright.data).resize(16).webp({ quality: 40 }).toBuffer(),
  ]);

  return {
    etag,
    hash,
    width,
    height,
    widths,
    blur: `data:image/webp;base64,${blur.toString('base64')}`,
    exif: formatExif(exif),
  };
}

async function pool(items, fn) {
  let next = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < items.length) await fn(items[next++]);
    }),
  );
}

const contentType = (file) =>
  ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif', tif: 'image/tiff', tiff: 'image/tiff' })[
    path.extname(file).slice(1).toLowerCase()
  ];

// ---- Main ----

const store = process.env.R2_LOCAL_DIR ? localStore(process.env.R2_LOCAL_DIR) : r2Store();
const manifest = JSON.parse(await readFile(MANIFEST, 'utf8').catch(() => '{}'));
let changed = 0;

// 1. New photos in the repo: upload the original, make the web versions, then remove the file.
const inbox = (await walk(INBOX).catch(() => [])).filter((f) => IMAGE.test(f));
await pool(inbox, async (file) => {
  const id = path.relative(INBOX, file).split(path.sep).join('/');
  if (!CATEGORIES.includes(id.split('/')[0])) {
    console.warn(`skip ${id}: not in one of ${CATEGORIES.join(', ')}`);
    return;
  }
  const buf = await readFile(file);
  const etag = await store.put(`originals/${id}`, buf, contentType(file));
  manifest[id] = await makeWebVersions(store, id, buf, etag);
  await rm(file);
  changed++;
  console.log(`added ${id}`);
});

// 2. Originals already in R2 (e.g. uploaded in the Cloudflare dashboard) that are new or changed.
const originals = await store.list('originals/');
const todo = [...originals].filter(([key, etag]) => {
  const id = key.slice('originals/'.length);
  return IMAGE.test(id) && CATEGORIES.includes(id.split('/')[0]) && manifest[id]?.etag !== etag;
});
await pool(todo, async ([key, etag]) => {
  const id = key.slice('originals/'.length);
  manifest[id] = await makeWebVersions(store, id, await store.get(key), etag);
  changed++;
  console.log(`processed ${id}`);
});

// 3. Photos whose original was deleted from R2 leave the site. (Their old web files stay in
//    R2 but nothing links to them.)
for (const id of Object.keys(manifest)) {
  if (!originals.has(`originals/${id}`)) {
    delete manifest[id];
    changed++;
    console.log(`removed ${id}`);
  }
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(MANIFEST, JSON.stringify(sorted, null, 1) + '\n');
console.log(`${Object.keys(sorted).length} photos, ${changed} changed.`);
