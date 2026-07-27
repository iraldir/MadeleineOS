export interface Planet {
  /** Unique id, matches the texture and audio filenames */
  id: string;
  name: string;
  /** Equirectangular colour map under /public/textures/planets/ */
  texture: string;
  /** Sphere radius in scene units (compressed — real ratios would make Mercury invisible) */
  radius: number;
  /** Distance from the Sun in scene units (compressed the same way) */
  orbitRadius: number;
  /**
   * Seconds for one full orbit on screen. Earth takes 60s and every other
   * planet is scaled by its real orbital period, so Neptune really does crawl.
   * 0 for the Sun.
   */
  orbitSeconds: number;
  /**
   * Seconds for one full spin on screen. Earth takes 30s and every other body
   * is scaled by its real rotation period — so a Venus "day" is very long.
   * Negative means retrograde (Venus, Uranus).
   */
  spinSeconds: number;
  /** Axial tilt in degrees */
  tilt: number;
  /** Accent colour used by the UI (labels, quiz glow) */
  color: string;
  /** One kid-friendly sentence read on the info panel */
  fact: string;
  /** Facts shown as a little table */
  diameter: string;
  dayLength: string;
  yearLength: string;
  moons: string;
  /**
   * Ring system, as a multiple of the planet radius. `faint` swaps Saturn's
   * bright banded ring for the thin dark band Uranus actually wears.
   */
  ring?: { inner: number; outer: number; faint?: boolean };
  /** Earth only — a small moon orbiting the planet */
  moon?: { radius: number; distance: number; orbitSeconds: number };
}

export const SUN: Planet = {
  id: "sun",
  name: "Sun",
  texture: "/textures/planets/sun.webp",
  radius: 9,
  orbitRadius: 0,
  orbitSeconds: 0,
  spinSeconds: 764, // 25 Earth days
  tilt: 7.25,
  color: "#ffb02e",
  fact: "The Sun is a giant ball of burning gas, and it gives us all our light and warmth. It is so big that a million Earths could fit inside it!",
  diameter: "1,392,000 km",
  dayLength: "25 Earth days",
  yearLength: "It stays in the middle",
  moons: "8 planets",
};

export const PLANETS: Planet[] = [
  {
    id: "mercury",
    name: "Mercury",
    texture: "/textures/planets/mercury.webp",
    radius: 0.95,
    orbitRadius: 18,
    orbitSeconds: 14.5,
    spinSeconds: 1764,
    tilt: 0.03,
    color: "#b7a8a0",
    fact: "Mercury is the smallest planet and the one closest to the Sun. Its days are boiling hot and its nights are freezing cold.",
    diameter: "4,879 km",
    dayLength: "59 Earth days",
    yearLength: "88 Earth days",
    moons: "No moons",
  },
  {
    id: "venus",
    name: "Venus",
    texture: "/textures/planets/venus.webp",
    radius: 1.5,
    orbitRadius: 26,
    orbitSeconds: 36.9,
    spinSeconds: -7311,
    tilt: 177.4,
    color: "#e6b878",
    fact: "Venus is the hottest planet of them all. It spins backwards, so if you stood there the Sun would rise in the west!",
    diameter: "12,104 km",
    dayLength: "243 Earth days",
    yearLength: "225 Earth days",
    moons: "No moons",
  },
  {
    id: "earth",
    name: "Earth",
    texture: "/textures/planets/earth.webp",
    radius: 1.6,
    orbitRadius: 35,
    orbitSeconds: 60,
    spinSeconds: 30,
    tilt: 23.4,
    color: "#5aa9e6",
    fact: "Earth is our home. It is the only planet we know of with oceans, forests, animals and people.",
    diameter: "12,742 km",
    dayLength: "24 hours",
    yearLength: "365 days",
    moons: "1 moon",
    // A true 27-day month would be 4.5s on the orbit scale (frantic) or 819s on
    // the spin scale (frozen), so the Moon gets a watchable middle ground.
    moon: { radius: 0.42, distance: 3.4, orbitSeconds: 30 },
  },
  {
    id: "mars",
    name: "Mars",
    texture: "/textures/planets/mars.webp",
    radius: 1.15,
    orbitRadius: 45,
    orbitSeconds: 112.8,
    spinSeconds: 30.9,
    tilt: 25.2,
    color: "#e07a5f",
    fact: "Mars is called the Red Planet because its dust is full of rust. It has the tallest volcano in the whole solar system.",
    diameter: "6,779 km",
    dayLength: "25 hours",
    yearLength: "687 days",
    moons: "2 moons",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    texture: "/textures/planets/jupiter.webp",
    radius: 3.8,
    orbitRadius: 60,
    orbitSeconds: 711.7,
    spinSeconds: 12.4,
    tilt: 3.1,
    color: "#d9a066",
    fact: "Jupiter is the biggest planet. Its Great Red Spot is a giant storm that has been swirling for hundreds of years.",
    diameter: "139,820 km",
    dayLength: "10 hours",
    yearLength: "12 Earth years",
    moons: "97 moons",
  },
  {
    id: "saturn",
    name: "Saturn",
    texture: "/textures/planets/saturn.webp",
    radius: 3.2,
    orbitRadius: 78,
    orbitSeconds: 1767,
    spinSeconds: 13.4,
    tilt: 26.7,
    color: "#e8d8a0",
    fact: "Saturn wears the most beautiful rings in the solar system. They are made of billions of pieces of ice and rock.",
    diameter: "116,460 km",
    dayLength: "11 hours",
    yearLength: "29 Earth years",
    moons: "274 moons",
    ring: { inner: 1.35, outer: 2.3 },
  },
  {
    id: "uranus",
    name: "Uranus",
    texture: "/textures/planets/uranus.webp",
    radius: 2.3,
    orbitRadius: 93,
    orbitSeconds: 5041,
    spinSeconds: -21.6,
    tilt: 97.8,
    color: "#9fd8e0",
    fact: "Uranus rolls around the Sun lying on its side, like a ball rolling down a hill.",
    diameter: "50,724 km",
    dayLength: "17 hours",
    yearLength: "84 Earth years",
    moons: "28 moons",
    // Uranus lies on its side, so its rings stand up almost vertically
    ring: { inner: 1.4, outer: 1.75, faint: true },
  },
  {
    id: "neptune",
    name: "Neptune",
    texture: "/textures/planets/neptune.webp",
    radius: 2.2,
    orbitRadius: 107,
    orbitSeconds: 9887,
    spinSeconds: 20.2,
    tilt: 28.3,
    color: "#4d6fd4",
    fact: "Neptune is the windiest planet. Its storms blow faster than a racing car, and it is a deep, deep blue.",
    diameter: "49,244 km",
    dayLength: "16 hours",
    yearLength: "165 Earth years",
    moons: "16 moons",
  },
];

/** The Sun plus the eight planets — used by the quiz. */
export const ALL_BODIES: Planet[] = [SUN, ...PLANETS];

export const getBodyById = (id: string): Planet | undefined =>
  ALL_BODIES.find((body) => body.id === id);

/** Spoken name recorded with Google TTS (see /public/sounds/planets) */
export const planetAudioUrl = (id: string) => `/sounds/planets/${id}.mp3`;
