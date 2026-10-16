// The cameras on the About page. Each gets a 3D model (src/scripts/camera-models.ts) and its own
// page at /about/<slug>.
//
//   exif:       how the camera names itself in a photo's EXIF (the first part of `exif` in
//               photo-manifest.json). Photos taken on it add their countries automatically.
//   countries:  countries it was used in that the photos don't show yet (names as in
//               site.config.ts). Both lists are merged.
//   highlights: the traits on its page. `view` (optional) is where the 3D camera flies to when the
//               trait is picked: a point to look at and the direction to look from (x right,
//               y up, z out of the lens), in the model's units (10 cm). `part` is what lights up
//               on the model when it's picked (see camera-models.ts); parts inside the camera are
//               shown through its body, which fades to see-through.

export type CameraModel = 'eos-5d-mark-ii' | 'eos-7d-mark-ii' | 'x-e1';

export interface Highlight {
  title: string;
  text: string;
  view?: { target: [number, number, number]; from: [number, number, number] };
  part?: string;
}

export interface Camera {
  slug: string;
  model: CameraModel;
  brand: string;
  name: string;
  /** One line under the name on the About page. */
  short: string;
  year: number;
  exif: string;
  countries: string[];
  intro: string;
  specs: [string, string][];
  highlights: Highlight[];
}

export const cameras: Camera[] = [
  {
    slug: 'canon-eos-5d-mark-ii',
    model: 'eos-5d-mark-ii',
    brand: 'Canon',
    name: 'EOS 5D Mark II',
    short: 'Full-frame DSLR · 2008',
    year: 2008,
    exif: 'Canon EOS 5D Mark II',
    countries: ['United States', 'Germany'],
    intro:
      'The camera that made full-frame affordable for a generation of photographers, and the first DSLR to shoot full HD video, which was good enough that whole TV episodes were filmed on it. Big, quiet, and forgiving of light that would trouble smaller sensors.',
    specs: [
      ['Sensor', '21.1 MP full-frame CMOS (36 × 24 mm)'],
      ['Processor', 'DIGIC 4'],
      ['ISO', '100–6400 (50–25,600 expanded)'],
      ['Autofocus', '9 points + 6 assist points'],
      ['Burst', '3.9 frames per second'],
      ['Video', '1080p full HD'],
      ['Screen', '3.0″, 920k dots'],
      ['Body', 'Magnesium alloy, weather-sealed · about 810 g'],
    ],
    highlights: [
      {
        title: 'Full-frame sensor',
        text: 'A sensor the size of a 35mm film frame: wide lenses stay truly wide, backgrounds melt away more easily and shadows stay clean at high ISO.',
        view: { target: [0.04, -0.05, -0.15], from: [1.1, 0.6, 2.3] },
        part: 'sensor',
      },
      {
        title: 'Optical viewfinder',
        text: 'A glass pentaprism shows the scene through the lens with no lag, covering 98% of the frame.',
        view: { target: [0.04, 0.3, -0.02], from: [1.7, 1.1, 1.4] },
        part: 'viewfinder',
      },
      {
        title: 'Quick control dial',
        text: 'The large rear wheel Canon is known for, for setting exposure compensation or flicking through photos with a thumb.',
        view: { target: [-0.46, -0.14, -0.26], from: [-0.9, 0.2, -2.4] },
        part: 'qcd',
      },
      {
        title: 'Top LCD panel',
        text: 'A small backlit panel on the top plate shows the settings at a glance, without lighting up the big screen.',
        view: { target: [-0.32, 0.43, -0.04], from: [-0.9, 2.1, 1.4] },
        part: 'lcd',
      },
    ],
  },
  {
    slug: 'canon-eos-7d-mark-ii',
    model: 'eos-7d-mark-ii',
    brand: 'Canon',
    name: 'EOS 7D Mark II',
    short: 'APS-C action DSLR · 2014',
    year: 2014,
    exif: 'Canon EOS 7D Mark II',
    countries: [],
    intro:
      "Canon's speed camera: built for wildlife and sport, with a smaller sensor that stretches every lens 1.6 times further and a shutter that keeps up with birds in flight. Rugged enough for Scottish weather and Norwegian fjords.",
    specs: [
      ['Sensor', '20.2 MP APS-C CMOS (1.6× crop)'],
      ['Processor', 'Dual DIGIC 6'],
      ['ISO', '100–16,000 (51,200 expanded)'],
      ['Autofocus', '65 points, all cross-type · Dual Pixel AF'],
      ['Burst', '10 frames per second'],
      ['Video', '1080p at 60 fps'],
      ['Extras', 'Built-in GPS · CF and SD card slots'],
      ['Body', 'Magnesium alloy, weather-sealed · about 910 g'],
    ],
    highlights: [
      {
        title: '1.6× crop sensor',
        text: 'The APS-C sensor frames tighter than full frame, so a 300 mm lens behaves like a 480 mm one: a big help for distant animals.',
        view: { target: [0.04, -0.05, -0.14], from: [1.1, 0.6, 2.3] },
        part: 'sensor',
      },
      {
        title: '10 frames per second',
        text: 'A shutter rated for 200,000 shots and a mirror that settles fast enough for ten frames a second, for the moment a gull takes off.',
        view: { target: [0.04, -0.05, -0.04], from: [1.7, 0.8, 1.7] },
        part: 'shutter',
      },
      {
        title: 'Built-in GPS',
        text: 'A GPS receiver in the top of the prism records where every photo was taken. (The site removes it from the photos it serves.)',
        view: { target: [0.04, 0.62, -0.06], from: [0.9, 2.2, 1.3] },
        part: 'gps',
      },
      {
        title: 'Weather sealing',
        text: 'Gaskets around every door and dial keep out rain and spray, the reason it came home from the Cairngorms working.',
        view: { target: [-0.2, 0, 0], from: [-2.2, 1.1, 1.6] },
        part: 'seals',
      },
    ],
  },
  {
    slug: 'fujifilm-x-e1',
    model: 'x-e1',
    brand: 'Fujifilm',
    name: 'X-E1',
    short: 'Rangefinder-style mirrorless · 2012',
    year: 2012,
    exif: 'FUJIFILM X-E1',
    countries: [],
    intro:
      "A small, quiet camera styled after the rangefinders of the 1950s, with real dials for shutter speed and exposure on top and an aperture ring on the lens. Fujifilm's film simulations give its photos the colours of their old film stocks, the look behind the Film page.",
    specs: [
      ['Sensor', '16.3 MP APS-C X-Trans CMOS'],
      ['Processor', 'EXR Processor Pro'],
      ['ISO', '200–6400 (100–25,600 expanded)'],
      ['Viewfinder', '0.5″ OLED, 2.36 million dots'],
      ['Burst', '6 frames per second'],
      ['Screen', '2.8″, 460k dots'],
      ['Film simulations', 'Provia, Velvia, Astia, Pro Neg, Monochrome, Sepia'],
      ['Body', 'About 350 g with battery'],
    ],
    highlights: [
      {
        title: 'X-Trans sensor',
        text: 'Its colour filters sit in an irregular 6 × 6 pattern, like the random grain of film, so it needs no blurring filter in front of the sensor and resolves fine detail sharply.',
        view: { target: [-0.02, -0.08, 0], from: [0.9, 0.5, 2.1] },
        part: 'sensor',
      },
      {
        title: 'Shutter speed dial',
        text: 'Shutter speed and exposure compensation have their own engraved dials on the top plate, so settings can be read with the camera switched off.',
        view: { target: [-0.29, 0.39, -0.01], from: [-0.8, 1.9, 0.9] },
        part: 'sdial',
      },
      {
        title: 'Aperture ring',
        text: 'Aperture is set on the lens itself, a click per third of a stop, the way it was on film cameras.',
        view: { target: [-0.02, -0.02, 0.29], from: [1.2, 0.6, 1.6] },
        part: 'aring',
      },
      {
        title: 'Film simulations',
        text: 'Colour profiles modelled on Fujifilm film stocks: Provia for everyday colour, Velvia for vivid landscapes, Astia for soft skin tones, plus black-and-white and sepia.',
        view: { target: [0.12, -0.1, -0.09], from: [0.5, 0.4, -2.1] },
        part: 'processor',
      },
    ],
  },
];
