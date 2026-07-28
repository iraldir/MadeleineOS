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
  /**
   * Kid-friendly facts, one of which is spoken at random on arriving at the
   * body. Each has a recording at /sounds/planets/facts/<id>-<n>.mp3.
   */
  facts: string[];
  /**
   * A second, drifting cloud layer. `drift` is in radians per second, on top
   * of the planet's own spin — negative means the clouds run against it.
   */
  clouds?: { texture: string; drift: number; opacity: number };
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
  facts: [
      "The Sun is a giant star, and it gives us all of our light and our warmth.",
      "The Sun is so big that a million Earths could fit inside it!",
      "Sunlight takes about eight minutes to travel all the way to us.",
      "The Sun is made of burning gas, so there is no ground to stand on.",
      "Everything in the solar system goes around the Sun. Even you!",
  ],
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
    facts: [
        "Mercury is the smallest planet, and the closest one to the Sun.",
        "Mercury is covered in craters, a bit like our Moon.",
        "On Mercury the days are boiling hot, and the nights are freezing cold.",
        "Mercury has no moons at all.",
        "A year on Mercury is only eighty eight days. It races around the Sun!",
    ],
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
    facts: [
        "Venus is the hottest planet of all, even hotter than Mercury.",
        "Venus spins backwards, so there, the Sun rises in the west.",
        "Venus is wrapped in thick yellow clouds that you cannot see through.",
        "Venus is almost exactly the same size as the Earth, like a twin.",
        "Venus is the brightest thing in our night sky, after the Moon.",
    ],
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
    facts: [
        "The Earth is our home. It is the only planet we know of with animals and people.",
        "The Earth has one moon, and it goes around and around us.",
        "Most of the Earth is covered in water. That is why it looks so blue!",
        "The Earth takes one whole year to travel all the way around the Sun.",
        "The Earth is the only planet where you can breathe the air.",
    ],
    clouds: {
      texture: "/textures/planets/earth_clouds.webp",
      drift: 0.012,
      opacity: 0.85,
    },
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
    facts: [
        "Mars is called the red planet, because its dust is full of rust.",
        "There are robots on Mars right now, that we sent there from Earth!",
        "Mars has the tallest volcano in the whole solar system.",
        "Mars has two little moons, called Phobos and Deimos.",
        "Mars has caps of ice at the top and the bottom, just like the Earth.",
    ],
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
    facts: [
        "Jupiter is the biggest planet in the whole solar system.",
        "Jupiter has a giant storm called the Great Red Spot, and it is bigger than the Earth!",
        "Jupiter has more than ninety moons.",
        "Jupiter is made mostly of gas, so there is nowhere to land on it.",
        "Jupiter spins so fast that one day there lasts only ten hours.",
    ],
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
    facts: [
        "Saturn's rings are made of billions of pieces of ice and rock.",
        "Saturn has more moons than any other planet.",
        "Saturn is so light that it would float in a giant bath of water!",
        "Saturn's rings are very, very wide, but they are also very, very thin.",
        "Saturn takes almost thirty years to go around the Sun just once.",
    ],
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
    facts: [
        "Uranus rolls around the Sun on its side, like a ball rolling down a hill.",
        "Uranus is a freezing cold world, made of ice and gas.",
        "Uranus has thin dark rings that stand up all around it.",
        "Uranus is blue green because of a gas called methane.",
        "One year on Uranus lasts eighty four years here on Earth.",
    ],
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
    // Neptune's equatorial winds blow against its rotation — the only planet
    // where the weather runs backwards over the ground beneath it.
    clouds: {
      texture: "/textures/planets/neptune_clouds.webp",
      drift: -0.05,
      opacity: 0.95,
    },
    facts: [
        "Neptune is the furthest planet from the Sun.",
        "Neptune has the fastest winds in the whole solar system.",
        "On Neptune the winds blow the opposite way to the way the planet spins.",
        "Neptune is a deep blue world, and far too cold for us to visit.",
        "Neptune takes a hundred and sixty five years to go around the Sun.",
    ],
  },
];

/** The Sun plus the eight planets — used by the quiz. */
export const ALL_BODIES: Planet[] = [SUN, ...PLANETS];

export const getBodyById = (id: string): Planet | undefined =>
  ALL_BODIES.find((body) => body.id === id);

/** Spoken name, e.g. "The Earth" (see scripts/generate-planet-voices.ts) */
export const planetNameUrl = (id: string) => `/sounds/planets/${id}.mp3`;

/** One of the spoken facts, numbered from 1. */
export const planetFactUrl = (id: string, index: number) =>
  `/sounds/planets/facts/${id}-${index}.mp3`;
