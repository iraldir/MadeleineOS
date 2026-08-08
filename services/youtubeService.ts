export type VideoCategory = 'yoga' | 'drawing' | 'songs';

export interface Video {
  id: string;
  youtubeId: string;
  title: string;
  thumbnail: string;
  duration?: string;
  category: VideoCategory;
  /** Uploading channel. Used to keep the drawing rotation from stacking up. */
  channel?: string;
  /** Franchise / theme tag, e.g. "Pokemon". Same purpose as `channel`. */
  franchise?: string;
  /**
   * Who or what gets drawn, for videos where more than one channel teaches the
   * same character (two Charizards, three Rosalinas). Only set where it needs
   * to group; unset means "nothing else in the list draws this".
   */
  subject?: string;
  addedDate?: string;
}

/**
 * Categories that show a rotating subset instead of the whole list.
 *
 * Only `drawing` rotates: it is the one category big enough (90+ tutorials)
 * that showing everything is overwhelming. Yoga and songs are small, curated
 * lists where Madeleine expects to find the same video where she left it, so
 * they are deliberately left alone.
 */
const ROTATING_CATEGORIES: Record<string, { size: number; maxPerChannel: number; maxPerFranchise: number }> = {
  drawing: { size: 12, maxPerChannel: 3, maxPerFranchise: 3 },
};

/**
 * Seed for the current half-day: "2026-08-08-am" / "2026-08-08-pm".
 *
 * Deriving it from a `Date` the caller passes in (rather than reading the clock
 * in here) keeps this pure and testable — and lets the UI take the reading in a
 * click handler, so no server render ever depends on the wall clock and there
 * is nothing for hydration to disagree about.
 */
export function halfDaySeed(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}-${now.getHours() < 12 ? 'am' : 'pm'}`;
}

/** FNV-1a: turns the seed string into the 32-bit number the PRNG wants. */
function hashSeed(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, well-distributed seeded PRNG. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: readonly T[], rand: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Pick `size` videos for one half-day.
 *
 * A full Fisher-Yates shuffle first (so the result looks nothing like a slice
 * of the list), then a greedy walk that skips anything which would push a
 * channel or a franchise over its cap — otherwise a shuffle of a list that is
 * half Art for Kids Hub happily returns twelve Art for Kids Hub videos. The
 * same subject never appears twice, so you don't get two Charizard lessons
 * side by side just because two different channels teach it.
 *
 * The caps are relaxed in later passes so we always return a full set even if
 * the pool ever gets too lopsided to satisfy them.
 */
export function pickRotation(
  videos: readonly Video[],
  size: number,
  seed: string,
  maxPerChannel: number,
  maxPerFranchise: number
): Video[] {
  if (videos.length <= size) return videos.slice();

  const shuffled = seededShuffle(videos, mulberry32(hashSeed(seed)));
  const picked: Video[] = [];
  const taken = new Set<string>();
  const channelCount = new Map<string, number>();
  const franchiseCount = new Map<string, number>();
  const subjectCount = new Map<string, number>();

  const bump = (counts: Map<string, number>, key: string) => counts.set(key, (counts.get(key) ?? 0) + 1);

  for (const relax of [0, 1, Infinity]) {
    const chanCap = maxPerChannel + relax;
    const franCap = maxPerFranchise + relax;
    const subjCap = 1 + relax;
    for (const video of shuffled) {
      if (picked.length >= size) break;
      if (taken.has(video.id)) continue;
      const channel = video.channel ?? video.id;
      const franchise = video.franchise ?? video.id;
      const subject = video.subject ?? video.id;
      if ((channelCount.get(channel) ?? 0) >= chanCap) continue;
      if ((franchiseCount.get(franchise) ?? 0) >= franCap) continue;
      if ((subjectCount.get(subject) ?? 0) >= subjCap) continue;
      picked.push(video);
      taken.add(video.id);
      bump(channelCount, channel);
      bump(franchiseCount, franchise);
      bump(subjectCount, subject);
    }
    if (picked.length >= size) break;
  }

  return picked;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  icon: string;
  color: string;
  thumbnail: string;
}

class YouTubeService {
  private static instance: YouTubeService;

  private readonly categories: Category[] = [
    {
      id: 'yoga',
      name: 'Yoga',
      emoji: '🧘‍♀️',
      icon: '/images/youtube/yoga-icon.webp',
      color: '#9C27B0',
      thumbnail: '/images/youtube/yoga-thumb.png'
    },
    {
      id: 'drawing',
      name: 'Drawing',
      emoji: '🎨',
      icon: '/images/youtube/drawing-icon.webp',
      color: '#FF6B6B',
      thumbnail: '/images/youtube/drawing-thumb.png'
    },
    {
      id: 'songs',
      name: 'Songs',
      emoji: '🎵',
      icon: '/images/youtube/songs-icon.webp',
      color: '#E91E63',
      thumbnail: '/images/youtube/songs-thumb.png'
    }
  ];

  private readonly videos: Video[] = [
    {
      id: 'drawing-1',
      youtubeId: 'jBfMs-YskHo',
      title: 'How To Draw Ariel The Little Mermaid',
      thumbnail: 'https://i.ytimg.com/vi/jBfMs-YskHo/hqdefault.jpg',
      duration: '9:09',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Disney',
      addedDate: '2026-05-17'
    },
    {
      id: 'drawing-2',
      youtubeId: 'twAox47nBes',
      title: 'How To Draw A Cartoon Moana',
      thumbnail: 'https://i.ytimg.com/vi/twAox47nBes/hqdefault.jpg',
      duration: '10:59',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Disney',
      subject: 'Moana',
      addedDate: '2026-05-17'
    },
    {
      id: 'drawing-3',
      youtubeId: 'kvpkTj-6EZw',
      title: 'How To Draw Princess Jasmine From Aladdin',
      thumbnail: 'https://i.ytimg.com/vi/kvpkTj-6EZw/hqdefault.jpg',
      duration: '7:13',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Disney',
      addedDate: '2026-05-17'
    },
    {
      id: 'drawing-4',
      youtubeId: 'YBwoGTvsA2Q',
      title: 'How To Draw Princess Tiana From Princess And The Frog',
      thumbnail: 'https://i.ytimg.com/vi/YBwoGTvsA2Q/hqdefault.jpg',
      duration: '10:43',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Disney',
      addedDate: '2026-05-17'
    },
    {
      id: 'drawing-5',
      youtubeId: 'hky2ggpPM88',
      title: 'How To Draw A Cartoon Belle From Beauty And The Beast',
      thumbnail: 'https://i.ytimg.com/vi/hky2ggpPM88/hqdefault.jpg',
      duration: '11:29',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Disney',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-6',
      youtubeId: 'Tg64kM4Q8ek',
      title: 'How To Draw Elsa **NEW**',
      thumbnail: 'https://i.ytimg.com/vi/Tg64kM4Q8ek/hqdefault.jpg',
      duration: '13:04',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Disney',
      subject: 'Elsa',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-7',
      youtubeId: 'GcpXN_FFFVg',
      title: 'How To Draw Anna **NEW**',
      thumbnail: 'https://i.ytimg.com/vi/GcpXN_FFFVg/hqdefault.jpg',
      duration: '12:34',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Disney',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-8',
      youtubeId: 'AbH7lCWaDX0',
      title: 'How To Draw Mulan',
      thumbnail: 'https://i.ytimg.com/vi/AbH7lCWaDX0/hqdefault.jpg',
      duration: '6:44',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Disney',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-9',
      youtubeId: 'R4TgExfr12I',
      title: 'How to Draw Rapunzel from Tangled Cute and Easy',
      thumbnail: 'https://i.ytimg.com/vi/R4TgExfr12I/hqdefault.jpg',
      duration: '9:31',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Disney',
      addedDate: '2026-05-17'
    },
    {
      id: 'drawing-10',
      youtubeId: 'aeJQsbPAEhc',
      title: 'How to Draw Cinderella ✨  Disney Princess (New)',
      thumbnail: 'https://i.ytimg.com/vi/aeJQsbPAEhc/hqdefault.jpg',
      duration: '14:41',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Disney',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-11',
      youtubeId: '80mkqBe4TsQ',
      title: 'How to Draw Elsa in White Dress Hair Down | Disney Frozen',
      thumbnail: 'https://i.ytimg.com/vi/80mkqBe4TsQ/hqdefault.jpg',
      duration: '19:29',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Disney',
      subject: 'Elsa',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-12',
      youtubeId: 'zrLIop2WukM',
      title: 'How to Draw Snow White 🍎 Disney Princess',
      thumbnail: 'https://i.ytimg.com/vi/zrLIop2WukM/hqdefault.jpg',
      duration: '15:34',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Disney',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-13',
      youtubeId: 'VlazaMYoIjs',
      title: 'How to Draw Moana | Disney Moana 2',
      thumbnail: 'https://i.ytimg.com/vi/VlazaMYoIjs/hqdefault.jpg',
      duration: '15:19',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Disney',
      subject: 'Moana',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-14',
      youtubeId: '7H1fm0SEVcY',
      title: 'How to Draw Disney Princess Merida from Brave step by step Cute',
      thumbnail: 'https://i.ytimg.com/vi/7H1fm0SEVcY/hqdefault.jpg',
      duration: '15:01',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Disney',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-15',
      youtubeId: 'CNb2cV24wr0',
      title: 'How to Draw Mirabel Madrigal 🦋Disney Encanto',
      thumbnail: 'https://i.ytimg.com/vi/CNb2cV24wr0/hqdefault.jpg',
      duration: '13:55',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Disney',
      subject: 'Mirabel',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-16',
      youtubeId: 'ZHZ5qrogCOE',
      title: 'How To Draw Mirabel | Beginner Sketch Tutorial (Step-by-Step)',
      thumbnail: 'https://i.ytimg.com/vi/ZHZ5qrogCOE/hqdefault.jpg',
      duration: '29:46',
      category: 'drawing',
      channel: 'Cartooning Club How to Draw',
      franchise: 'Disney',
      subject: 'Mirabel',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-17',
      youtubeId: 'FObW5ynBbVg',
      title: 'How To Draw Princess Peach',
      thumbnail: 'https://i.ytimg.com/vi/FObW5ynBbVg/hqdefault.jpg',
      duration: '17:07',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Nintendo',
      subject: 'Peach',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-18',
      youtubeId: 'OukDd4qFjM8',
      title: 'How To Draw Princess Rosalina from Super Mario Galaxy',
      thumbnail: 'https://i.ytimg.com/vi/OukDd4qFjM8/hqdefault.jpg',
      duration: '13:26',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Nintendo',
      subject: 'Rosalina',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-19',
      youtubeId: 'QGMz2e3MFxY',
      title: 'How To Draw Bowser',
      thumbnail: 'https://i.ytimg.com/vi/QGMz2e3MFxY/hqdefault.jpg',
      duration: '16:06',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Nintendo',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-20',
      youtubeId: 'tWYhAy8K0Eg',
      title: 'How To Draw Mario',
      thumbnail: 'https://i.ytimg.com/vi/tWYhAy8K0Eg/hqdefault.jpg',
      duration: '10:50',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Nintendo',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-21',
      youtubeId: 'Kchg3IK7mFM',
      title: 'How To Draw Luigi',
      thumbnail: 'https://i.ytimg.com/vi/Kchg3IK7mFM/hqdefault.jpg',
      duration: '11:01',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Nintendo',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-22',
      youtubeId: 'iPJeemfinZ8',
      title: 'How To Draw Yoshi From Mario',
      thumbnail: 'https://i.ytimg.com/vi/iPJeemfinZ8/hqdefault.jpg',
      duration: '8:16',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Nintendo',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-23',
      youtubeId: '2yxnq_Q_bsI',
      title: 'How To Draw Bowser Jr From Mario',
      thumbnail: 'https://i.ytimg.com/vi/2yxnq_Q_bsI/hqdefault.jpg',
      duration: '12:53',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Nintendo',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-24',
      youtubeId: 'JwSVs1aRs9A',
      title: 'How To Draw King Boo From Mario',
      thumbnail: 'https://i.ytimg.com/vi/JwSVs1aRs9A/hqdefault.jpg',
      duration: '8:47',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Nintendo',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-25',
      youtubeId: 'q15P6OE0EGk',
      title: 'How To Draw Kamek Magic Koopa From Mario',
      thumbnail: 'https://i.ytimg.com/vi/q15P6OE0EGk/hqdefault.jpg',
      duration: '10:52',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Nintendo',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-26',
      youtubeId: 'IrQ_BcEAR3A',
      title: 'How To Draw Kirby',
      thumbnail: 'https://i.ytimg.com/vi/IrQ_BcEAR3A/hqdefault.jpg',
      duration: '18:27',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Nintendo',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-27',
      youtubeId: '4eIMePaqk5A',
      title: 'How To Draw Toon Link',
      thumbnail: 'https://i.ytimg.com/vi/4eIMePaqk5A/hqdefault.jpg',
      duration: '32:04',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Nintendo',
      subject: 'Link',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-28',
      youtubeId: 'AQIx4UfYrJI',
      title: 'How To Draw Link From Zelda',
      thumbnail: 'https://i.ytimg.com/vi/AQIx4UfYrJI/hqdefault.jpg',
      duration: '10:47',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Nintendo',
      subject: 'Link',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-29',
      youtubeId: '_aHGaUZnRJc',
      title: 'How to Draw Princess Peach from Super Mario',
      thumbnail: 'https://i.ytimg.com/vi/_aHGaUZnRJc/hqdefault.jpg',
      duration: '11:19',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Nintendo',
      subject: 'Peach',
      addedDate: '2026-05-17'
    },
    {
      id: 'drawing-30',
      youtubeId: 'K0VSVYmPcbI',
      title: 'How to Draw Rosalina ⭐️Super Mario',
      thumbnail: 'https://i.ytimg.com/vi/K0VSVYmPcbI/hqdefault.jpg',
      duration: '13:51',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Nintendo',
      subject: 'Rosalina',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-31',
      youtubeId: 'rA06Tpnx44E',
      title: 'How to Draw Princess Daisy | Super Mario',
      thumbnail: 'https://i.ytimg.com/vi/rA06Tpnx44E/hqdefault.jpg',
      duration: '12:29',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Nintendo',
      subject: 'Daisy',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-32',
      youtubeId: '7x5v_tt1az0',
      title: 'How to Draw Link | The Legend of Zelda | Breath of the Wild',
      thumbnail: 'https://i.ytimg.com/vi/7x5v_tt1az0/hqdefault.jpg',
      duration: '15:01',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Nintendo',
      subject: 'Link',
      addedDate: '2026-05-17'
    },
    {
      id: 'drawing-33',
      youtubeId: 'TDxVwg3BwAo',
      title: 'How To Draw Rosalina | Super Mario',
      thumbnail: 'https://i.ytimg.com/vi/TDxVwg3BwAo/hqdefault.jpg',
      duration: '11:01',
      category: 'drawing',
      channel: 'Cartooning Club How to Draw',
      franchise: 'Nintendo',
      subject: 'Rosalina',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-34',
      youtubeId: 'T-TqSyNKYfk',
      title: 'How to Draw Princess Daisy | Super Mario Bros',
      thumbnail: 'https://i.ytimg.com/vi/T-TqSyNKYfk/hqdefault.jpg',
      duration: '10:13',
      category: 'drawing',
      channel: 'Cartooning Club How to Draw',
      franchise: 'Nintendo',
      subject: 'Daisy',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-35',
      youtubeId: '-RRw77w183w',
      title: 'How To Draw Charizard',
      thumbnail: 'https://i.ytimg.com/vi/-RRw77w183w/hqdefault.jpg',
      duration: '25:08',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Pokemon',
      subject: 'Charizard',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-36',
      youtubeId: '1zX0hLFrlbQ',
      title: 'How To Draw Ash Ketchum From Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/1zX0hLFrlbQ/hqdefault.jpg',
      duration: '22:17',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Pokemon',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-37',
      youtubeId: 'HXW6W1eVo3c',
      title: 'How To Draw Eevee Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/HXW6W1eVo3c/hqdefault.jpg',
      duration: '13:16',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Pokemon',
      subject: 'Eevee',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-38',
      youtubeId: '6IeaiSVU7Cc',
      title: 'How To Draw Squirtle',
      thumbnail: 'https://i.ytimg.com/vi/6IeaiSVU7Cc/hqdefault.jpg',
      duration: '17:26',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Pokemon',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-39',
      youtubeId: 'hbo1WnqlMrc',
      title: 'How To Draw Charmander + Pokemon Giveaway',
      thumbnail: 'https://i.ytimg.com/vi/hbo1WnqlMrc/hqdefault.jpg',
      duration: '15:57',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Pokemon',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-40',
      youtubeId: '8Hi-04JwsuM',
      title: 'How To Draw Blastoise From Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/8Hi-04JwsuM/hqdefault.jpg',
      duration: '32:20',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Pokemon',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-41',
      youtubeId: 'K48siVDktpI',
      title: 'How To Draw Bulbasaur Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/K48siVDktpI/hqdefault.jpg',
      duration: '11:37',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Pokemon',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-42',
      youtubeId: 'U4uf_F6JY1M',
      title: 'How To Draw Mewtwo',
      thumbnail: 'https://i.ytimg.com/vi/U4uf_F6JY1M/hqdefault.jpg',
      duration: '28:48',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Pokemon',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-43',
      youtubeId: 'j3RafPJ3iWY',
      title: 'How To Draw Vaporeon Pokémon',
      thumbnail: 'https://i.ytimg.com/vi/j3RafPJ3iWY/hqdefault.jpg',
      duration: '14:44',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Pokemon',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-44',
      youtubeId: 'zsrFZMVxBs8',
      title: 'How To Draw Sprigatito Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/zsrFZMVxBs8/hqdefault.jpg',
      duration: '15:30',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Pokemon',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-45',
      youtubeId: 'WoV4f1ncE7U',
      title: 'How To Draw Pikachu (with color)',
      thumbnail: 'https://i.ytimg.com/vi/WoV4f1ncE7U/hqdefault.jpg',
      duration: '7:58',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Pokemon',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-46',
      youtubeId: 'yLmPwjDtMnQ',
      title: 'How To Draw Pokemon | Charizard',
      thumbnail: 'https://i.ytimg.com/vi/yLmPwjDtMnQ/hqdefault.jpg',
      duration: '13:32',
      category: 'drawing',
      channel: 'Cartooning Club How to Draw',
      franchise: 'Pokemon',
      subject: 'Charizard',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-47',
      youtubeId: 'aN-HP2z2MF4',
      title: 'How To Draw Eevee | Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/aN-HP2z2MF4/hqdefault.jpg',
      duration: '9:12',
      category: 'drawing',
      channel: 'Cartooning Club How to Draw',
      franchise: 'Pokemon',
      subject: 'Eevee',
      addedDate: '2026-05-17'
    },
    {
      id: 'drawing-48',
      youtubeId: 'jCCPBGOCo6Q',
      title: 'How to Draw Vulpix | Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/jCCPBGOCo6Q/hqdefault.jpg',
      duration: '13:34',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Pokemon',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-49',
      youtubeId: 'fqGlGkI6LAk',
      title: 'How to Draw Pokemon Easy | Sylveon',
      thumbnail: 'https://i.ytimg.com/vi/fqGlGkI6LAk/hqdefault.jpg',
      duration: '10:51',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Pokemon',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-50',
      youtubeId: 'XtPfR_D8BC0',
      title: 'How to Draw Espeon Easy | Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/XtPfR_D8BC0/hqdefault.jpg',
      duration: '9:06',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Pokemon',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-51',
      youtubeId: '9wzr0PRok2w',
      title: 'How to Draw Umbreon | Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/9wzr0PRok2w/hqdefault.jpg',
      duration: '10:00',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Pokemon',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-52',
      youtubeId: 'NW20U356pmA',
      title: 'How to Draw Totoro 🌱 My Neighbor Totoro',
      thumbnail: 'https://i.ytimg.com/vi/NW20U356pmA/hqdefault.jpg',
      duration: '11:35',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Ghibli',
      subject: 'Totoro',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-53',
      youtubeId: 'bpXEx0Ypeiw',
      title: 'How to Draw Kiki | Kiki\'s Delivery Service',
      thumbnail: 'https://i.ytimg.com/vi/bpXEx0Ypeiw/hqdefault.jpg',
      duration: '12:17',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Ghibli',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-54',
      youtubeId: 'Vg7wVaiSXJs',
      title: 'How to Draw Chihiro | Spirited Away',
      thumbnail: 'https://i.ytimg.com/vi/Vg7wVaiSXJs/hqdefault.jpg',
      duration: '11:56',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Ghibli',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-55',
      youtubeId: 'hutTbIT8pPc',
      title: 'How to Draw Jiji Black Cat | Kiki\'s Delivery Service',
      thumbnail: 'https://i.ytimg.com/vi/hutTbIT8pPc/hqdefault.jpg',
      duration: '9:24',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Ghibli',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-56',
      youtubeId: 'Q3lsif7GkI0',
      title: 'How To Draw Totoro | Sketch Saturday',
      thumbnail: 'https://i.ytimg.com/vi/Q3lsif7GkI0/hqdefault.jpg',
      duration: '28:18',
      category: 'drawing',
      channel: 'Cartooning Club How to Draw',
      franchise: 'Ghibli',
      subject: 'Totoro',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-57',
      youtubeId: '_24oxPpE9kY',
      title: 'How to Draw No Face (Kaonashi) | Spirited Away',
      thumbnail: 'https://i.ytimg.com/vi/_24oxPpE9kY/hqdefault.jpg',
      duration: '6:16',
      category: 'drawing',
      channel: 'Cartooning Club How to Draw',
      franchise: 'Ghibli',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-58',
      youtubeId: 'FM0n1aq1ROw',
      title: 'How To Draw Ponyo - Easy Step By Step Tutorial',
      thumbnail: 'https://i.ytimg.com/vi/FM0n1aq1ROw/hqdefault.jpg',
      duration: '13:08',
      category: 'drawing',
      channel: 'Quick Doodle',
      franchise: 'Ghibli',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-59',
      youtubeId: '2zZadXzXgKo',
      title: 'How To Draw Cartoon Woody From Toy Story',
      thumbnail: 'https://i.ytimg.com/vi/2zZadXzXgKo/hqdefault.jpg',
      duration: '7:52',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Toy Story',
      subject: 'Woody',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-60',
      youtubeId: '0srd_PwKUaU',
      title: 'How To Draw Cartoon Buzz Lightyear',
      thumbnail: 'https://i.ytimg.com/vi/0srd_PwKUaU/hqdefault.jpg',
      duration: '12:56',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Toy Story',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-61',
      youtubeId: 'bayiwrmYilg',
      title: 'How To Draw Cartoon Jessie From Toy Story',
      thumbnail: 'https://i.ytimg.com/vi/bayiwrmYilg/hqdefault.jpg',
      duration: '10:40',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Toy Story',
      subject: 'Jessie',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-62',
      youtubeId: '9ilXZhSwRn4',
      title: 'How to Draw Sheriff Woody | Toy Story',
      thumbnail: 'https://i.ytimg.com/vi/9ilXZhSwRn4/hqdefault.jpg',
      duration: '15:38',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Toy Story',
      subject: 'Woody',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-63',
      youtubeId: 'QafsWEkdNlM',
      title: 'How to Draw Jessie | Toy Story',
      thumbnail: 'https://i.ytimg.com/vi/QafsWEkdNlM/hqdefault.jpg',
      duration: '18:14',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Toy Story',
      subject: 'Jessie',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-64',
      youtubeId: '5F7XT-MFy_s',
      title: 'How to Draw Bo Peep from Toy Story',
      thumbnail: 'https://i.ytimg.com/vi/5F7XT-MFy_s/hqdefault.jpg',
      duration: '15:36',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Toy Story',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-65',
      youtubeId: 'YCSieMazLi8',
      title: 'How To Draw Woody | Toy Story Sketch Tutorial',
      thumbnail: 'https://i.ytimg.com/vi/YCSieMazLi8/hqdefault.jpg',
      duration: '16:41',
      category: 'drawing',
      channel: 'Cartooning Club How to Draw',
      franchise: 'Toy Story',
      subject: 'Woody',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-66',
      youtubeId: '5rEzWsuYXCc',
      title: 'How To Draw Aang From Avatar: The Last Airbender',
      thumbnail: 'https://i.ytimg.com/vi/5rEzWsuYXCc/hqdefault.jpg',
      duration: '22:08',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Avatar',
      subject: 'Aang',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-67',
      youtubeId: 'WsgEs8tIra0',
      title: 'How To Draw Katara From Avatar: The Last Airbender',
      thumbnail: 'https://i.ytimg.com/vi/WsgEs8tIra0/hqdefault.jpg',
      duration: '10:49',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Avatar',
      subject: 'Katara',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-68',
      youtubeId: 'XAtY402mTlY',
      title: 'How To Draw Appa From Avatar: The Last Airbender',
      thumbnail: 'https://i.ytimg.com/vi/XAtY402mTlY/hqdefault.jpg',
      duration: '22:27',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Avatar',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-69',
      youtubeId: 'qhE3w81K4LU',
      title: 'How to Draw Aang | Avatar The Last Airbender',
      thumbnail: 'https://i.ytimg.com/vi/qhE3w81K4LU/hqdefault.jpg',
      duration: '13:45',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Avatar',
      subject: 'Aang',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-70',
      youtubeId: '8dZJK8i-KFM',
      title: 'How to Draw Katara from Avatar: The Last Airbender 💧',
      thumbnail: 'https://i.ytimg.com/vi/8dZJK8i-KFM/hqdefault.jpg',
      duration: '13:20',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Avatar',
      subject: 'Katara',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-71',
      youtubeId: 'WiW0t9ic7_s',
      title: 'How To Draw Zuko | Step By Step| Avatar The Last Air Bender',
      thumbnail: 'https://i.ytimg.com/vi/WiW0t9ic7_s/hqdefault.jpg',
      duration: '14:18',
      category: 'drawing',
      channel: 'Art.Simple.',
      franchise: 'Avatar',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-72',
      youtubeId: 'KO2yNtHs5lg',
      title: 'How to Draw Fairy Bloom | Winx Club',
      thumbnail: 'https://i.ytimg.com/vi/KO2yNtHs5lg/hqdefault.jpg',
      duration: '22:43',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Winx Club',
      subject: 'Bloom',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-73',
      youtubeId: '7ryzgt0XN6s',
      title: 'How to Draw Fairy Princess Bloom | Winx Club',
      thumbnail: 'https://i.ytimg.com/vi/7ryzgt0XN6s/hqdefault.jpg',
      duration: '18:03',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Winx Club',
      subject: 'Bloom',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-74',
      youtubeId: 'UJ2EfvqWn9I',
      title: 'How to draw winx club ✤ Stella ✤ believix   Fairy Form Slow mode',
      thumbnail: 'https://i.ytimg.com/vi/UJ2EfvqWn9I/hqdefault.jpg',
      duration: '11:13',
      category: 'drawing',
      channel: 'Discover to Draw',
      franchise: 'Winx Club',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-75',
      youtubeId: 'q3DGqCBnuco',
      title: 'How to draw Winx Club Musa Believix - Slow mode',
      thumbnail: 'https://i.ytimg.com/vi/q3DGqCBnuco/hqdefault.jpg',
      duration: '27:07',
      category: 'drawing',
      channel: 'Discover to Draw',
      franchise: 'Winx Club',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-76',
      youtubeId: 'qz5I8OXMW-o',
      title: 'Winx Club Art Journey | Draw and Color All the Fairies for a Brain Break',
      thumbnail: 'https://i.ytimg.com/vi/qz5I8OXMW-o/hqdefault.jpg',
      duration: '30:39',
      category: 'drawing',
      channel: 'Winx Club Official',
      franchise: 'Winx Club',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-77',
      youtubeId: 'qc5uz9uXNj4',
      title: 'Winx Club - Draw and colour Aisha',
      thumbnail: 'https://i.ytimg.com/vi/qc5uz9uXNj4/hqdefault.jpg',
      duration: '7:19',
      category: 'drawing',
      channel: 'Winx Club Official',
      franchise: 'Winx Club',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-78',
      youtubeId: 'lSSYciuiKSA',
      title: 'How To Draw Bluey',
      thumbnail: 'https://i.ytimg.com/vi/lSSYciuiKSA/hqdefault.jpg',
      duration: '8:44',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Bluey',
      subject: 'Bluey',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-79',
      youtubeId: '5mA03XDIRUg',
      title: 'How To Draw Bluey From The Dragon Episode',
      thumbnail: 'https://i.ytimg.com/vi/5mA03XDIRUg/hqdefault.jpg',
      duration: '8:34',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Bluey',
      subject: 'Bluey',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-80',
      youtubeId: 'l_4ZAq5zyJM',
      title: 'How to Draw Bluey the Puppy | Disney',
      thumbnail: 'https://i.ytimg.com/vi/l_4ZAq5zyJM/hqdefault.jpg',
      duration: '10:31',
      category: 'drawing',
      channel: 'Draw So Cute',
      franchise: 'Bluey',
      subject: 'Bluey',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-81',
      youtubeId: 'yGIUAkEbwpY',
      title: 'How To Draw Bluey and Bingo | Bluey',
      thumbnail: 'https://i.ytimg.com/vi/yGIUAkEbwpY/hqdefault.jpg',
      duration: '11:06',
      category: 'drawing',
      channel: 'Bluey - Official Channel',
      franchise: 'Bluey',
      subject: 'Bluey',
      addedDate: '2026-08-08'
    },
    {
      id: 'drawing-82',
      youtubeId: 'eFHwTD9eHyw',
      title: 'How To Draw A Mythical Kitten Dragon',
      thumbnail: 'https://i.ytimg.com/vi/eFHwTD9eHyw/hqdefault.jpg',
      duration: '16:01',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Mythical',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-83',
      youtubeId: 'TzifMl12ahk',
      title: 'How To Draw An Ice Dragon - Advanced',
      thumbnail: 'https://i.ytimg.com/vi/TzifMl12ahk/hqdefault.jpg',
      duration: '17:12',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Mythical',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-84',
      youtubeId: 'ANcwbdO-QYM',
      title: 'How To Draw Chinese Dragon',
      thumbnail: 'https://i.ytimg.com/vi/ANcwbdO-QYM/hqdefault.jpg',
      duration: '22:40',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Mythical',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-85',
      youtubeId: 'TBH3-tjHNHY',
      title: 'How To Draw A Griffin',
      thumbnail: 'https://i.ytimg.com/vi/TBH3-tjHNHY/hqdefault.jpg',
      duration: '13:32',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Mythical',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-86',
      youtubeId: '14L8XVjus3U',
      title: 'How To Draw A Cute Phoenix',
      thumbnail: 'https://i.ytimg.com/vi/14L8XVjus3U/hqdefault.jpg',
      duration: '15:13',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Mythical',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-87',
      youtubeId: 'KUXOQfh0ZKY',
      title: 'How To Draw An Alicorn (Unicorn & Pegasus)',
      thumbnail: 'https://i.ytimg.com/vi/KUXOQfh0ZKY/hqdefault.jpg',
      duration: '10:45',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Mythical',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-88',
      youtubeId: '9U1zQ_oX5LU',
      title: 'How To Draw A Cute Fall Fairy',
      thumbnail: 'https://i.ytimg.com/vi/9U1zQ_oX5LU/hqdefault.jpg',
      duration: '8:31',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Mythical',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-89',
      youtubeId: 'KRAarF177Y4',
      title: 'How To Draw A Dragon',
      thumbnail: 'https://i.ytimg.com/vi/KRAarF177Y4/hqdefault.jpg',
      duration: '20:28',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Mythical',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-90',
      youtubeId: 'LNJqyHm95w0',
      title: 'How To Draw A Cartoon Harry Potter And Hedwig',
      thumbnail: 'https://i.ytimg.com/vi/LNJqyHm95w0/hqdefault.jpg',
      duration: '13:51',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Harry Potter',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-91',
      youtubeId: 'T37o30V69YQ',
      title: 'How To Draw Sonic The Hedgehog',
      thumbnail: 'https://i.ytimg.com/vi/T37o30V69YQ/hqdefault.jpg',
      duration: '19:57',
      category: 'drawing',
      channel: 'Art for Kids Hub',
      franchise: 'Sonic',
      addedDate: '2026-05-16'
    },
    {
      id: 'drawing-92',
      youtubeId: 'fgr9KZ64TXc',
      title: 'How to Draw a Tyrannosaurus Rex | Step By Step',
      thumbnail: 'https://i.ytimg.com/vi/fgr9KZ64TXc/hqdefault.jpg',
      duration: '22:46',
      category: 'drawing',
      channel: 'Art.Simple.',
      franchise: 'Dinosaurs',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-1',
      youtubeId: '2cxcGwDZNWQ',
      title: '10 min Morning Yoga Full Body Stretch for Beginners',
      thumbnail: 'https://img.youtube.com/vi/2cxcGwDZNWQ/maxresdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-2',
      youtubeId: 'LCVengYJHss',
      title: 'Halloween Yoga for Kids | Cosmic Kids',
      thumbnail: 'https://img.youtube.com/vi/LCVengYJHss/maxresdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-3',
      youtubeId: 'Sjq2OPw3AMQ',
      title: 'Dinosaur Yoga for Kids | Cosmic Kids',
      thumbnail: 'https://img.youtube.com/vi/Sjq2OPw3AMQ/maxresdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-4',
      youtubeId: 'Jw03oUANsZg',
      title: 'Ariel Yoga | Mermaid Inspired',
      thumbnail: 'https://img.youtube.com/vi/Jw03oUANsZg/maxresdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-5',
      youtubeId: '6ftVNC0_8Sw',
      title: 'Grinch Summer Yoga',
      thumbnail: 'https://img.youtube.com/vi/6ftVNC0_8Sw/maxresdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-6',
      youtubeId: 'YkqbXc84nVQ',
      title: 'Disney Princess Yoga | Cosmic Yoga',
      thumbnail: 'https://img.youtube.com/vi/YkqbXc84nVQ/maxresdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-7',
      youtubeId: 'oLC13hFePTc',
      title: 'Morning Yoga! Stretch, breathe, sing along and greet the day with @yogapalooza!',
      thumbnail: 'https://i.ytimg.com/vi/oLC13hFePTc/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-8',
      youtubeId: 'a6wrKLFLLeI',
      title: '✨ New Demon Hunters K-Pop Songs You’ve Never Heard 🎵 – Yoga & Chill 🧘‍♀️💜Brain Break✨',
      thumbnail: 'https://i.ytimg.com/vi/a6wrKLFLLeI/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-9',
      youtubeId: 'OXdRnk6gM_E',
      title: '🎃WEDNESDAY YOGA🧘🏻‍♀️🖤Halloween Cosmic Kids Yoga! Relaxing Addams family Brain break for students',
      thumbnail: 'https://i.ytimg.com/vi/OXdRnk6gM_E/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-10',
      youtubeId: '3WM5MXc1b2E',
      title: '🌞 Summer Yoga by the Pool! 🧘‍♂️🌴 Brain Break to Stay Cool 🌞 Fun Poses for Kids 🐶 ft. Bluey and Bingo',
      thumbnail: 'https://i.ytimg.com/vi/3WM5MXc1b2E/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-11',
      youtubeId: 'CLwlqj_Vp3k',
      title: '🌞 Summer Yoga Brain Break with Sonic & Friends 🌀🧘‍♂️ | Relaxing Sonic World Music 🎵',
      thumbnail: 'https://i.ytimg.com/vi/CLwlqj_Vp3k/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-12',
      youtubeId: 'COQL4nmV4gA',
      title: '🔵STITCH YOGA🌸Calming yoga for kids🏖️ Lilo & Stitch Summer Brain Break🧘🏽‍♀️Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/COQL4nmV4gA/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-13',
      youtubeId: 'mwna2yhrvsE',
      title: '☀️FROZEN YOGA🧘‍♀️Calming yoga for kids🏖️ Summer Brain Break✨ Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/mwna2yhrvsE/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-14',
      youtubeId: 'gAqYFZo2Pmw',
      title: '🐞LADYBUG YOGA for Kids! 🧘‍♀️ Fun Brain Break on the Rooftops of Paris!🇫🇷🗼',
      thumbnail: 'https://i.ytimg.com/vi/gAqYFZo2Pmw/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-15',
      youtubeId: 'UctMlcgsc0g',
      title: '🍎 SNOW WHITE & The Seven Dwarfs Yoga 🧘‍♀️ | Relaxing Cosmic Yoga for Kids! 🍎✨ Brain Break 🌿',
      thumbnail: 'https://i.ytimg.com/vi/UctMlcgsc0g/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-16',
      youtubeId: 'vKuy6pH0Uh8',
      title: '🔵Yoga for Kids with Bluey and Friends! 🐾🧘‍♂️ Fun and Relaxing Brain Break!',
      thumbnail: 'https://i.ytimg.com/vi/vKuy6pH0Uh8/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-17',
      youtubeId: 'j5RP53eZzCg',
      title: '🔵INSIDE OUT 2 YOGA🟣Calming yoga for kids | Brain Break🧘‍♀️Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/j5RP53eZzCg/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-18',
      youtubeId: 'EUfwa2oprxw',
      title: '🌹BEAUTY and the BEAST YOGA🧘‍♂️Read the Love story | Reading practise | Brain Break for kids',
      thumbnail: 'https://i.ytimg.com/vi/EUfwa2oprxw/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-19',
      youtubeId: 'Xqp55rTw_Zg',
      title: 'DISNEY PRINCESS YOGA 🧘‍♀️ calming yoga for kids | Valentine’s day Brain Break | Cosmic GoNoodle',
      thumbnail: 'https://i.ytimg.com/vi/Xqp55rTw_Zg/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-20',
      youtubeId: 'yU-k5zYFW-8',
      title: '🌻BARBIE SPRING YOGA 🌻🧘‍♀️ calming yoga for kids | Brain Break | Danny Go Noodle inspired🌻',
      thumbnail: 'https://i.ytimg.com/vi/yU-k5zYFW-8/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-21',
      youtubeId: 'c0Xb5TK5mYg',
      title: '🧘‍♀️🐰Easter Yoga Brain Break with Barbie | Fun & Relaxing Moves for kids! 🎀🌸',
      thumbnail: 'https://i.ytimg.com/vi/c0Xb5TK5mYg/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-22',
      youtubeId: 'gK4Ot-tUaqs',
      title: '💕Frozen Yoga ❄️🧘‍♀️Valentine’s day calming yoga for kids💕Brain Break💕Relaxing cosmic yoga❄️💕Elsa',
      thumbnail: 'https://i.ytimg.com/vi/gK4Ot-tUaqs/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-23',
      youtubeId: 'cvKGxllxJC8',
      title: '☀️Lion King Yoga 🦁: A Wild Adventure to Inner Peace! Brain Break for kids 🌅Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/cvKGxllxJC8/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-24',
      youtubeId: 'zHAL_2Ao26U',
      title: '🍀FROZEN YOGA 🧘‍♀️ calming yoga for kids | St. Patrick’s Brain Break | Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/zHAL_2Ao26U/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-25',
      youtubeId: '8U-X4cgXD9Q',
      title: '🟢 GRINCH CHRISTMAS YOGA🧘‍♀️ calming yoga for kids | Winter Brain Break | Danny Go Noodle inspired🎄',
      thumbnail: 'https://i.ytimg.com/vi/8U-X4cgXD9Q/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-26',
      youtubeId: '71uTdpWO-W0',
      title: '❄️Frozen Yoga ❄️ Winter fun☃️Elsa, Anna, Olaf & Kristoff ❄️🧘 Christmas Brain break for kids!🎄',
      thumbnail: 'https://i.ytimg.com/vi/71uTdpWO-W0/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-27',
      youtubeId: 'RZpebeUPc7s',
      title: '🔴​MARIO CHRISTMAS YOGA 🧘‍♀️ calming yoga for kids | Winter Brain Break | Cosmic GoNoodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/RZpebeUPc7s/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-28',
      youtubeId: 'I-7MrePivNE',
      title: '🌀SONIC WINTER YOGA 🧘‍♀️ calming yoga for kids | Christmas Brain Break | Go Noodle inspired🎄',
      thumbnail: 'https://i.ytimg.com/vi/I-7MrePivNE/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-29',
      youtubeId: 'O7qi1arcr_I',
      title: '❄️FROZEN YOGA 🧘‍♀️ calming yoga for kids | Brain Break | Cosmic kids Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/O7qi1arcr_I/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-30',
      youtubeId: 'WeWDGdrI9nc',
      title: '🟢 GRINCH CHRISTMAS YOGA🧘‍♀️ calming yoga for kids | Winter Brain Break | Go Noodle inspired🎄',
      thumbnail: 'https://i.ytimg.com/vi/WeWDGdrI9nc/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-31',
      youtubeId: 'eNev0X6yo6Y',
      title: 'MALEFICENT YOGA🧘‍♀️🖤HALLOWEEN brain break for kids🎃 Spooky Relaxing Cosmic Yoga!🦇',
      thumbnail: 'https://i.ytimg.com/vi/eNev0X6yo6Y/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-32',
      youtubeId: '05lBMRLZhwg',
      title: '💀Halloween Yoga with Jack Skellington & Sally 🎃🧘‍♂️ Spooky Stretches for a Fang-tastic Flow!',
      thumbnail: 'https://i.ytimg.com/vi/05lBMRLZhwg/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-33',
      youtubeId: 'FluFdtJXZC8',
      title: '🌵COCO’s Cinco de Mayo YOGA 🎉🌮Brain Break for Kids | relaxing yoga for all🪇Danny Go Noodle',
      thumbnail: 'https://i.ytimg.com/vi/FluFdtJXZC8/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-34',
      youtubeId: 'ZAEVnH6yIDU',
      title: 'Halloween Yoga with Harley Quinn | 🧘‍♀️🖤🎃 A Wickedly Fun Cosmic Yoga Adventure! Brain break for kids',
      thumbnail: 'https://i.ytimg.com/vi/ZAEVnH6yIDU/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-35',
      youtubeId: '5y1nYMfU7is',
      title: '🚨MEGA MINION’s YOGA! 🦸‍♂️Despicable me 4 BRAIN BREAK💪Relaxing yoga for kids 🧘‍♀️Danny Go Noodle',
      thumbnail: 'https://i.ytimg.com/vi/5y1nYMfU7is/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-36',
      youtubeId: 'DCaxhfe1aP8',
      title: '🏫Back to School Yoga with FROZEN❄️🧘‍♀️🎒✨ Relaxing Yoga for kids | Brain break for children',
      thumbnail: 'https://i.ytimg.com/vi/DCaxhfe1aP8/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-37',
      youtubeId: 'jUVoMyZ9TfE',
      title: '⛩️Mulan Yoga🧘‍♀️🌸🌞 Relaxing Cosmic Yoga for kids! Summer Brain Break | Danny Go Noodle inspired💫',
      thumbnail: 'https://i.ytimg.com/vi/jUVoMyZ9TfE/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-38',
      youtubeId: 'Z6VezbNy9pI',
      title: '🧘‍♀️BRAVE YOGA🌸Calming yoga for kids🏖️ Summer Brain Break🏹Danny Go Noodle Merida inspired',
      thumbnail: 'https://i.ytimg.com/vi/Z6VezbNy9pI/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-39',
      youtubeId: 'cqHP1HBug-k',
      title: '🌟Rapunzel YOGA🧘‍♀️🌴✨ Fun Kids Yoga Adventure! 🌊 Summer Tangled Brain Break | Danny Go Noodle 💫',
      thumbnail: 'https://i.ytimg.com/vi/cqHP1HBug-k/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-40',
      youtubeId: '9AuhuNBSgCs',
      title: '🧘‍♀️MOANA YOGA🌸Calming yoga for kids🏖️ Summer Brain Break🌊Danny Go Noodle Maui inspired',
      thumbnail: 'https://i.ytimg.com/vi/9AuhuNBSgCs/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-41',
      youtubeId: 'XQIuhXJ5GWA',
      title: '🧞‍♂️JASMINE YOGA🌸Aladdin 🕌 Calming yoga for kids🧘🏽‍♀️Summer Brain Break | Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/XQIuhXJ5GWA/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-42',
      youtubeId: 'LpZ7BqA6exE',
      title: '🐼 KUNG FU PANDA 4 YOGA 🧘‍♀️ calming yoga for kids | St. Patrick’s day Brain Break | GoNoodle',
      thumbnail: 'https://i.ytimg.com/vi/LpZ7BqA6exE/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-43',
      youtubeId: 'u98dNiWaWyk',
      title: '🌸Frozen Spring Yoga🌸Brain Break | Calming yoga for kids | Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/u98dNiWaWyk/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-44',
      youtubeId: 'ZTf_G9EsrFM',
      title: '🐰🌸FROZEN YOGA 🧘‍♀️ calming yoga for kids | Easter Bunny Brain Break | Danny Go Noodle inspired🌸',
      thumbnail: 'https://i.ytimg.com/vi/ZTf_G9EsrFM/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-45',
      youtubeId: 'WaPJDvQWH1w',
      title: '🐢 TMNT Yoga! Ninja Turtles Relaxing yoga for kids🧘‍♂️🌟 Brain Break 🐢 Danny go Noodle inspired💫',
      thumbnail: 'https://i.ytimg.com/vi/WaPJDvQWH1w/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-46',
      youtubeId: 'yhUB0a8UlgI',
      title: '✨Star Wars Yoga May the 4th! 🌟🧘‍♂️Bluey Brain Break for kids | Relaxing yoga for all✨',
      thumbnail: 'https://i.ytimg.com/vi/yhUB0a8UlgI/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-47',
      youtubeId: '5upPfUE0OkI',
      title: '✨Star Wars YOGA | Mandalorian baby yoda Bluey🌟🧘‍♂️ | Brain Break | Relaxing cosmic yoga for kids✨',
      thumbnail: 'https://i.ytimg.com/vi/5upPfUE0OkI/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-48',
      youtubeId: 'czYLT3Oj9aY',
      title: '🔴POKEMON YOGA 🧘‍♀️ calming yoga for kids | Brain Break | Cosmic Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/czYLT3Oj9aY/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-49',
      youtubeId: 'cfc39k6O05Q',
      title: '🌍Simpsons Earth Day Yoga Session 🧘‍♀️ Brain Break | Calming yoga for kids | Cosmic Yoga inspired🧘‍♀️',
      thumbnail: 'https://i.ytimg.com/vi/cfc39k6O05Q/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-50',
      youtubeId: 'osYWVaxqd8s',
      title: '🟡SPONGE BOB YOGA🐙🧘‍♂️🌊 Relaxing Yoga for kids and all!🍍Brain Break | Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/osYWVaxqd8s/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-51',
      youtubeId: 'TPmJWXJrr6Q',
      title: '🔵INSIDE OUT 2 RACES🟣FEELINGS game for kids | Brain Break🧘‍♀️Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/TPmJWXJrr6Q/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-52',
      youtubeId: 'KGbpI98nmEo',
      title: '👑 YOGA with Princess TIANA and the Frog | 🧘‍♀️🐸✨ Fun Brain Break for Kids | Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/KGbpI98nmEo/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-53',
      youtubeId: 'jjoBKc0MnQ8',
      title: '🧊Frozen’s Feelings from Inside Out 2!❄️✨ Brain Break for Kids! Just dance🌟',
      thumbnail: 'https://i.ytimg.com/vi/jjoBKc0MnQ8/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-54',
      youtubeId: 'Eje2boTbAZA',
      title: 'Halloween Yoga with Jack O’Lantern 🎃🧘Spooky Brain break for kids | Fun relaxing cosmic yoga!',
      thumbnail: 'https://i.ytimg.com/vi/Eje2boTbAZA/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-55',
      youtubeId: 'JBQ1Qhas69o',
      title: '🔵Inside Out Party with Joy: Feelings, Workout & Yoga for Kids! 🎭❄️🧘‍♀️Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/JBQ1Qhas69o/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-56',
      youtubeId: 'GVX4m4Y4R30',
      title: '🔴RUDOLPH YOGA🎄Christmas Brain break for kids 🦌Relaxing Cosmic Yoga | Danny Go Noodle',
      thumbnail: 'https://i.ytimg.com/vi/GVX4m4Y4R30/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-57',
      youtubeId: '3vyBk_wT0q4',
      title: '🎉12-Minute Rudolph Party: Freeze Dance & Yoga Fun for Kids! 🎄🦌Christmas Brain Break | Just Dance',
      thumbnail: 'https://i.ytimg.com/vi/3vyBk_wT0q4/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-58',
      youtubeId: 'HXys2IeAR7Y',
      title: '🔴INSIDE OUT 2 RACES🟣FEELINGS game for kids | Valentine’s day Brain Break🧘‍♀️Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/HXys2IeAR7Y/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-59',
      youtubeId: 'wh9dRFUM42c',
      title: '❤️Valentine\'s Day Fun with Bluey: Would You Rather, Freeze Dance & Yoga! 💖🎉 JUST DANCE | 20 min!🕺❤️',
      thumbnail: 'https://i.ytimg.com/vi/wh9dRFUM42c/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-60',
      youtubeId: '2Nud9QJTyeQ',
      title: '4️⃣The Fantastic Four! 💪💙 | Yoga, Games & Dance Party! Brain break for kids ft. Bluey',
      thumbnail: 'https://i.ytimg.com/vi/2Nud9QJTyeQ/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'yoga-61',
      youtubeId: 'cR9mGcb4joA',
      title: '✨ The MOST Fun Gabby’s Dollhouse Brain Break Ever! 🧘‍♀️🎾🐱Yoga, Games & more with Mister Alonso 🎉🐱',
      thumbnail: 'https://i.ytimg.com/vi/cR9mGcb4joA/hqdefault.jpg',
      category: 'yoga',
      addedDate: '2026-05-16'
    },
    {
      id: 'songs-1',
      youtubeId: 'L0MK7qz13bU',
      title: 'FROZEN | Let It Go Sing-along | Official Disney UK',
      thumbnail: 'https://i.ytimg.com/vi/L0MK7qz13bU/hqdefault.jpg',
      category: 'songs',
      addedDate: '2026-05-16'
    },
    {
      id: 'songs-2',
      youtubeId: 'h9nB5ZzbSO8',
      title: 'DISNEY SING-ALONGS | Do You Want To Build A Snowman? | Official Disney UK',
      thumbnail: 'https://i.ytimg.com/vi/h9nB5ZzbSO8/hqdefault.jpg',
      category: 'songs',
      addedDate: '2026-05-16'
    },
    {
      id: 'songs-3',
      youtubeId: 'rnEB2F_v_cE',
      title: 'FROZEN | In Summer - Sing-a-long with Olaf | Official Disney UK',
      thumbnail: 'https://i.ytimg.com/vi/rnEB2F_v_cE/hqdefault.jpg',
      category: 'songs',
      addedDate: '2026-05-16'
    },
    {
      id: 'songs-4',
      youtubeId: 'Jn76I_rFd7g',
      title: 'Frozen Do You Want To Build A Snowman? | Disney Kids Sing-Along',
      thumbnail: 'https://i.ytimg.com/vi/Jn76I_rFd7g/hqdefault.jpg',
      category: 'songs',
      addedDate: '2026-05-16'
    },
    {
      id: 'songs-5',
      youtubeId: 'qSU560anReg',
      title: 'Let It Go (From Frozen Soundtrack)',
      thumbnail: 'https://i.ytimg.com/vi/qSU560anReg/hqdefault.jpg',
      category: 'songs',
      addedDate: '2026-05-16'
    },
    {
      id: 'songs-6',
      youtubeId: 'rDhlGc6OcR8',
      title: 'How Far I\'ll Go | Moana Lyric Video | DISNEY SING-ALONGS',
      thumbnail: 'https://i.ytimg.com/vi/rDhlGc6OcR8/hqdefault.jpg',
      category: 'songs',
      addedDate: '2026-05-16'
    },
    {
      id: 'songs-7',
      youtubeId: 'r6xYtt1v9Ek',
      title: 'Moana You\'re Welcome Sing-along | Disney Kids',
      thumbnail: 'https://i.ytimg.com/vi/r6xYtt1v9Ek/hqdefault.jpg',
      category: 'songs',
      addedDate: '2026-05-16'
    },
    {
      id: 'songs-8',
      youtubeId: 'y5dpfFfcQ3E',
      title: 'DISNEY SING-ALONGS | You\'re Welcome - Moana Lyric Video | Official Disney UK',
      thumbnail: 'https://i.ytimg.com/vi/y5dpfFfcQ3E/hqdefault.jpg',
      category: 'songs',
      addedDate: '2026-05-16'
    },
    {
      id: 'songs-9',
      youtubeId: '6BZ6hO5QGzA',
      title: 'Moana - You\'re Welcome - Dwayne Johnson | Disney Animation',
      thumbnail: 'https://i.ytimg.com/vi/6BZ6hO5QGzA/hqdefault.jpg',
      category: 'songs',
      addedDate: '2026-05-16'
    },
    {
      id: 'songs-10',
      youtubeId: 'h9SAUq5-V7o',
      title: 'I See the Light (From Tangled Soundtrack)',
      thumbnail: 'https://i.ytimg.com/vi/h9SAUq5-V7o/hqdefault.jpg',
      category: 'songs',
      addedDate: '2026-05-16'
    },
    {
      id: 'songs-11',
      youtubeId: 'zLVrbFB7Xlc',
      title: 'When Will My Life Begin? (From Tangled Soundtrack)',
      thumbnail: 'https://i.ytimg.com/vi/zLVrbFB7Xlc/hqdefault.jpg',
      category: 'songs',
      addedDate: '2026-05-16'
    },
    {
      id: 'songs-12',
      youtubeId: 'AkFSSFFtGM4',
      title: 'When Will My Life Begin Music Video! | Disney Princess',
      thumbnail: 'https://i.ytimg.com/vi/AkFSSFFtGM4/hqdefault.jpg',
      category: 'songs',
      addedDate: '2026-05-16'
    },
    {
      id: 'songs-13',
      youtubeId: '_hedDikCr2w',
      title: 'Tangled | When Will My Life Begin | Disney Princess',
      thumbnail: 'https://i.ytimg.com/vi/_hedDikCr2w/hqdefault.jpg',
      category: 'songs',
      addedDate: '2026-05-16'
    },
    {
      id: 'songs-14',
      youtubeId: 'cWppAbqm9I8',
      title: 'Your Idol | Official Song Clip | KPop Demon Hunters | Sony Animation',
      thumbnail: 'https://i.ytimg.com/vi/cWppAbqm9I8/hqdefault.jpg',
      category: 'songs',
      addedDate: '2026-05-16'
    },
    {
      id: 'songs-15',
      youtubeId: 'QGsevnbItdU',
      title: 'How It\'s Done Official Lyric Video | KPop Demon Hunters | Sony Animation',
      thumbnail: 'https://i.ytimg.com/vi/QGsevnbItdU/hqdefault.jpg',
      category: 'songs',
      addedDate: '2026-05-16'
    },
    {
      id: 'songs-16',
      youtubeId: 'l8Dr7vzMSVE',
      title: 'Takedown Official Lyric Video feat. TWICE | KPop Demon Hunters',
      thumbnail: 'https://i.ytimg.com/vi/l8Dr7vzMSVE/hqdefault.jpg',
      category: 'songs',
      addedDate: '2026-05-16'
    },
    {
      id: 'songs-17',
      youtubeId: 'yebNIHKAC4A',
      title: 'Golden Official Lyric Video | KPop Demon Hunters | Sony Animation',
      thumbnail: 'https://i.ytimg.com/vi/yebNIHKAC4A/hqdefault.jpg',
      category: 'songs',
      addedDate: '2026-05-16'
    },
    {
      id: 'songs-18',
      youtubeId: 'TbMEMCvFbZk',
      title: 'What It Sounds Like | Official Song Clip | KPop Demon Hunters | Sony Animation',
      thumbnail: 'https://i.ytimg.com/vi/TbMEMCvFbZk/hqdefault.jpg',
      category: 'songs',
      addedDate: '2026-05-16'
    }
  ];

  private constructor() {}

  public static getInstance(): YouTubeService {
    if (!YouTubeService.instance) {
      YouTubeService.instance = new YouTubeService();
    }
    return YouTubeService.instance;
  }

  public getCategories(): Category[] {
    return this.categories;
  }

  public getCategory(id: string): Category | undefined {
    return this.categories.find(cat => cat.id === id);
  }

  public getVideosByCategory(category: VideoCategory): Video[] {
    return this.videos
      .filter(video => video.category === category)
      .sort(this.compareByAddedDateDesc);
  }

  /**
   * What the category screen should actually show.
   *
   * For rotating categories (drawing) this is a seeded, variety-constrained
   * pick of 12 that changes twice a day; for everything else it is the whole
   * list. Pass the seed from {@link halfDaySeed}; pass `null` and you get the
   * full list, which is what a render with no clock reading yet should show.
   */
  public getVideosForDisplay(category: VideoCategory, seed: string | null): Video[] {
    const all = this.getVideosByCategory(category);
    const rotation = ROTATING_CATEGORIES[category];
    if (!rotation || !seed) return all;
    return pickRotation(all, rotation.size, seed, rotation.maxPerChannel, rotation.maxPerFranchise);
  }

  public getVideo(id: string): Video | undefined {
    return this.videos.find(video => video.id === id);
  }

  public getAllVideos(): Video[] {
    return this.videos.slice().sort(this.compareByAddedDateDesc);
  }

  /**
   * The most recent addedDate across all videos in a category — videos
   * matching this date are considered the current "new batch".
   */
  public getLatestAddedDate(category?: VideoCategory): string | undefined {
    const pool = category
      ? this.videos.filter(v => v.category === category)
      : this.videos;
    let latest: string | undefined;
    for (const v of pool) {
      if (v.addedDate && (!latest || v.addedDate > latest)) latest = v.addedDate;
    }
    return latest;
  }

  private compareByAddedDateDesc = (a: Video, b: Video): number => {
    const aDate = a.addedDate ?? '';
    const bDate = b.addedDate ?? '';
    if (aDate === bDate) return 0;
    return aDate < bDate ? 1 : -1;
  };

  // YouTube Player options for ad-free, clean experience
  public getPlayerOptions() {
    return {
      playerVars: {
        autoplay: 0,
        controls: 0, // Hide YouTube controls, we'll use custom ones
        disablekb: 1, // Disable keyboard controls
        fs: 0, // Disable fullscreen button
        modestbranding: 1, // Minimal YouTube branding
        rel: 0, // Don't show related videos at the end
        showinfo: 0, // Hide video info
        iv_load_policy: 3, // Hide annotations
        cc_load_policy: 0, // Hide closed captions by default
        playsinline: 1, // Play inline on iOS
        enablejsapi: 1 // Enable JS API
      }
    };
  }
}

export const youtubeService = YouTubeService.getInstance();