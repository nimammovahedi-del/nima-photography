// Builds the photo list from src/data/photos.yaml and src/data/photo-manifest.json.
// Runs at build time only — nothing here ships to the browser.
//
// The images themselves live in Cloudflare R2 (photos.nimamovahedi.com). The "Photos" GitHub
// Action (scripts/sync-photos.mjs) makes their web versions and writes the manifest, so the
// site build never processes an image.
import path from 'node:path';
import { load as parseYaml } from 'js-yaml';
import { categories, places, type CategorySlug } from '../site.config';
import metadataSource from '../data/photos.yaml?raw';
import manifest from '../data/photo-manifest.json';

/** Where the web versions are served from. Override with PUBLIC_PHOTOS_URL (e.g. for a local test). */
const PHOTOS_URL = (import.meta.env.PUBLIC_PHOTOS_URL ?? 'https://photos.nimamovahedi.com').replace(/\/$/, '');

interface ManifestEntry {
  hash: string;
  width: number;
  height: number;
  widths: number[];
  blur: string;
  exif?: string;
}

export interface Photo {
  id: string; // e.g. "film/harbor-dusk.jpg"
  category: CategorySlug | UnlistedFolder;
  width: number; // upright size of the largest web version
  height: number;
  widths: number[]; // widths available in R2, smallest first
  hash: string; // changes when the photo does, so its URLs can be cached forever
  title: string;
  alt: string;
  filmSim?: string;
  sub?: string;
  cover?: boolean; // the subcategory's cover photo on its subject's landing page
  country?: string;
  city?: string;
  tags: string[];
  blur: string; // tiny base64 image shown while the real one loads
  exif?: string; // e.g. "Canon EOS R6 · 35mm · ƒ/2.8 · 1/250s · ISO 100"
}

export type PhotoFormat = 'avif' | 'webp';

/** URL of one web version of a photo. */
export function photoUrl(p: Photo, width: number, format: PhotoFormat) {
  return `${PHOTOS_URL}/w/${p.id.replace(/\.[^.]+$/, '')}-${p.hash}-${width}.${format}`;
}

/** srcset listing every width of a photo (optionally only up to `max`). AVIF stops at 2000px. */
export function photoSrcset(p: Photo, format: PhotoFormat, max = Infinity) {
  if (format === 'avif') max = Math.min(max, 2000);
  return p.widths
    .filter((w, i) => w <= max || i === 0)
    .map((w) => `${photoUrl(p, w, format)} ${w}w`)
    .join(', ');
}

interface Entry {
  file: string;
  title?: string;
  alt?: string;
  filmSim?: string;
  sub?: string;
  cover?: boolean;
  country?: string;
  city?: string;
  tags?: string[];
}

const slugs = new Set<string>(categories.map((c) => c.slug));

// Folders of photos that belong to one unlisted page only. They never join a tab, a place, the
// camera counts or anything else that reads getPhotos(); their page asks for them by folder.
export const unlistedFolders = ['georgetown'] as const;
export type UnlistedFolder = (typeof unlistedFolders)[number];
const unlisted = new Set<string>(unlistedFolders);

function titleFromFile(file: string) {
  return path
    .basename(file, path.extname(file))
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function load(): Promise<{ listed: Photo[]; unlisted: Photo[] }> {
  const entries = ((parseYaml(metadataSource) as Entry[] | null) ?? []).filter((e) => e?.file);
  const byFile = new Map(entries.map((e) => [e.file, e]));
  const order = new Map(entries.map((e, i) => [e.file, i]));

  const photos = Object.entries(manifest as Record<string, ManifestEntry>).map(([id, m]) => {
    const category = id.split('/')[0];
    if (!slugs.has(category) && !unlisted.has(category)) return null;

    const entry = byFile.get(id);
    if (!entry) console.warn(`[photos] ${id} has no entry in photos.yaml — using defaults.`);
    else {
      if (!entry.alt) console.warn(`[photos] ${id} is missing alt text.`);
      const subs: readonly string[] = categories.find((c) => c.slug === category)?.subs ?? [];
      if (entry.sub && !subs.includes(entry.sub))
        console.warn(`[photos] ${id}: sub "${entry.sub}" isn't listed for ${category} in site.config.ts.`);
      const place = places.find((p) => p.name === entry.country);
      if (entry.country && !place)
        console.warn(`[photos] ${id}: country "${entry.country}" isn't in site.config.ts.`);
      if (entry.city && !place?.cities.some((c) => c.name === entry.city))
        console.warn(`[photos] ${id}: city "${entry.city}" isn't listed under ${entry.country}.`);
    }

    const title = entry?.title ?? titleFromFile(id);
    return {
      id,
      category: category as Photo['category'],
      width: m.width,
      height: m.height,
      widths: m.widths,
      hash: m.hash,
      title,
      alt: entry?.alt ?? title,
      filmSim: entry?.filmSim,
      sub: entry?.sub,
      cover: entry?.cover,
      country: entry?.country,
      city: entry?.city,
      tags: entry?.tags ?? [],
      blur: m.blur,
      exif: m.exif,
    } satisfies Photo;
  });
  for (const e of entries)
    if (!(e.file in manifest))
      console.warn(`[photos] ${e.file} is in photos.yaml but not uploaded yet (no web versions in R2).`);

  // photos.yaml order first, then any un-listed files alphabetically.
  const sorted = photos
    .filter((p): p is Photo => p !== null)
    .sort(
      (a, b) =>
        (order.get(a.id) ?? Infinity) - (order.get(b.id) ?? Infinity) || a.id.localeCompare(b.id),
    );
  return {
    listed: sorted.filter((p) => !unlisted.has(p.category)),
    unlisted: sorted.filter((p) => unlisted.has(p.category)),
  };
}

let cache: ReturnType<typeof load> | undefined;
export const getPhotos = async () => (await (cache ??= load())).listed;

/** The photos of one unlisted page's folder (see unlistedFolders). */
export async function getUnlisted(folder: UnlistedFolder) {
  return (await (cache ??= load())).unlisted.filter((p) => p.category === folder);
}

export async function getCategory(slug: CategorySlug) {
  return (await getPhotos()).filter((p) => p.category === slug);
}

export async function getPhoto(id: string) {
  return (await getPhotos()).find((p) => p.id === id);
}

/** Every photo taken in a country (from any tab), optionally narrowed to one city. */
export async function getPlace(country: string, city?: string) {
  return (await getPhotos()).filter(
    (p) => p.country === country && (!city || p.city === city),
  );
}

