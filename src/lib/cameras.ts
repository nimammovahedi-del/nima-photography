// The cameras with the countries they were used in: from the photos' EXIF, plus any listed by
// hand in src/data/cameras.ts. Build time only.
import { cameras } from '../data/cameras';
import { sortedPlaces } from '../site.config';
import { getPhotos } from './photos';

export async function getCameras() {
  const photos = await getPhotos();
  return cameras.map((c) => {
    const shot = photos.filter((p) => p.exif?.split(' · ')[0] === c.exif);
    const names = new Set([...c.countries, ...shot.map((p) => p.country).filter((n): n is string => !!n)]);
    const countries = sortedPlaces
      .filter((p) => names.has(p.name))
      .map((p) => ({ name: p.name, slug: p.slug, photos: shot.filter((s) => s.country === p.name).length }));
    return { ...c, countries, photoCount: shot.length };
  });
}
