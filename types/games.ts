export interface GameChallenge {
  /** Sentence template for the daily challenge, e.g. "Solve {n} math problems" */
  label: string;
  /** Inclusive range the daily goal is picked from */
  minGoal: number;
  maxGoal: number;
}

export interface Game {
  id: string;
  title: string;
  thumbnailUrl: string;
  path: string;
  /**
   * Opts the game into the "Challenge of the day" system. The game must call
   * challengeService.recordProgress(id) each time one exercise is completed.
   */
  challenge?: GameChallenge;
}

export const games: Game[] = [
  {
    id: "character-list",
    title: "Character List",
    thumbnailUrl: "/images/games/characterlist.webp",
    path: "/games/character-list",
  },
  {
    id: "character-recognition",
    title: "Character Recognition",
    thumbnailUrl: "/images/games/choice.webp", // Temporarily using the writing thumbnail
    path: "/games/character-recognition",
    challenge: {
      label: "Recognise {n} characters",
      minGoal: 5,
      maxGoal: 10,
    },
  },
  {
    id: "coloring-search",
    title: "Coloring Search",
    thumbnailUrl: "/images/games/coloring.webp",
    path: "/games/coloring-search",
  },
  {
    id: "character-writing",
    title: "Character Writing",
    thumbnailUrl: "/images/games/writing.webp",
    path: "/games/character-writing",
    challenge: {
      label: "Write {n} character names",
      minGoal: 3,
      maxGoal: 6,
    },
  },
  {
    id: "math",
    title: "Math Game",
    thumbnailUrl: "/images/games/math.webp",
    path: "/games/math",
    challenge: {
      label: "Solve {n} math problems",
      minGoal: 5,
      maxGoal: 10,
    },
  },
  {
    id: "weather",
    title: "Today's Weather",
    thumbnailUrl: "/images/games/weather.webp",
    path: "/games/weather",
  },
  {
    id: "youtube",
    title: "Videos",
    thumbnailUrl: "/images/games/youtube.png",
    path: "/games/youtube",
  },
  {
    id: "vocabulary",
    title: "Vocabulary Cards",
    thumbnailUrl: "/images/games/vocabulary.webp",
    path: "/games/vocabulary",
  },
  {
    id: "coupon",
    title: "Redeem Coupon",
    thumbnailUrl: "/images/games/coupon.webp",
    path: "/games/coupon",
  },
  {
    id: "phonics",
    title: "Phonics",
    thumbnailUrl: "/images/games/phonics.webp",
    path: "/games/phonics",
    challenge: {
      label: "Read {n} words out loud",
      minGoal: 3,
      maxGoal: 6,
    },
  },
  {
    id: "stickers",
    title: "Sticker Book",
    thumbnailUrl: "/images/games/stickers.webp",
    path: "/games/stickers",
  },
  {
    id: "coming-soon-3",
    title: "Coming Soon",
    thumbnailUrl: "/images/games/placeholder3.png",
    path: "#",
  },
  {
    id: "coming-soon-4",
    title: "Coming Soon",
    thumbnailUrl: "/images/games/placeholder4.png",
    path: "#",
  },
  {
    id: "coming-soon-5",
    title: "Coming Soon",
    thumbnailUrl: "/images/games/placeholder5.png",
    path: "#",
  },
];
