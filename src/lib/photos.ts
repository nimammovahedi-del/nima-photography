// Builds the photo list from src/photos/<category>/ and src/data/photos.yaml.
// Runs at build time only — nothing here ships to the browser.
import type { ImageMetadata } from 'astro';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import exifr from 'exifr';
import { load as parseYaml } from 'js-yaml';
import sharp from 'sharp';
import { categories, places, type CategorySlug } from '../site.config';
import metadataSource from '../data/photos.yaml?raw';

export interface Photo {
  id: string; // e.g. "film/harbor-dusk.jpg"
  category: CategorySlug;
  image: ImageMetadata;
  title: string;
  alt: string;
  filmSim?: string;
  sub?: string;
  country?: string;
  city?: string;
  blur: string; // tiny base64 image shown while the real one loads
  exif?: string; // e.g. "Canon EOS R6 · 35mm · ƒ/2.8 · 1/250s · ISO 100"
}

interface Entry {
  file: string;
  title?: string;
  alt?: string;
  filmSim?: string;
  sub?: string;
  country?: string;
  city?: string;
}

const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/photos/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}',
  { eager: true },
);

const slugs = new Set<string>(categories.map((c) => c.slug));

function formatExif(e: Record<string, any> | undefined): string | undefined {
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

function titleFromFile(file: string) {
  return path
    .basename(file, path.extname(file))
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function load(): Promise<Photo[]> {
  const entries = ((parseYaml(metadataSource) as Entry[] | null) ?? []).filter((e) => e?.file);
  const byFile = new Map(entries.map((e) => [e.file, e]));
  const order = new Map(entries.map((e, i) => [e.file, i]));

  const photos = await Promise.all(
    Object.entries(images).map(async ([key, mod]) => {
      const id = key.replace('/src/photos/', '');
      const category = id.split('/')[0];
      if (!slugs.has(category)) return null;

      const entry = byFile.get(id);
      if (!entry) console.warn(`[photos] ${id} has no entry in photos.yaml — using defaults.`);
      else {
        if (!entry.alt) console.warn(`[photos] ${id} is missing alt text.`);
        const subs: readonly string[] = categories.find((c) => c.slug === category)!.subs;
        if (entry.sub && !subs.includes(entry.sub))
          console.warn(`[photos] ${id}: sub "${entry.sub}" isn't listed for ${category} in site.config.ts.`);
        const place = places.find((p) => p.name === entry.country);
        if (entry.country && !place)
          console.warn(`[photos] ${id}: country "${entry.country}" isn't in site.config.ts.`);
        if (entry.city && !place?.cities.some((c) => c.name === entry.city))
          console.warn(`[photos] ${id}: city "${entry.city}" isn't listed under ${entry.country}.`);
      }

      const file = await readFile(path.join(process.cwd(), key));
      const [exif, blurBuf] = await Promise.all([
        exifr
          .parse(file, ['Make', 'Model', 'FocalLength', 'FNumber', 'ExposureTime', 'ISO'])
          .catch(() => undefined),
        sharp(file).rotate().resize(16).webp({ quality: 40 }).toBuffer(),
      ]);

      const title = entry?.title ?? titleFromFile(id);
      return {
        id,
        category: category as CategorySlug,
        image: mod.default,
        title,
        alt: entry?.alt ?? title,
        filmSim: entry?.filmSim,
        sub: entry?.sub,
        country: entry?.country,
        city: entry?.city,
        blur: `data:image/webp;base64,${blurBuf.toString('base64')}`,
        exif: formatExif(exif),
      } satisfies Photo;
    }),
  );

  // photos.yaml order first, then any un-listed files alphabetically.
  return photos
    .filter((p): p is Photo => p !== null)
    .sort(
      (a, b) =>
        (order.get(a.id) ?? Infinity) - (order.get(b.id) ?? Infinity) || a.id.localeCompare(b.id),
    );
}

let cache: Promise<Photo[]> | undefined;
export const getPhotos = () => (cache ??= load());

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

