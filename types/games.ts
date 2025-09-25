export interface Game {
  id: string;
  title: string;
  thumbnailUrl: string;
  path: string;
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
  },
  {
    id: "math",
    title: "Math Game",
    thumbnailUrl: "/images/games/math.webp",
    path: "/games/math",
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
    id: "coming-soon-2",
    title: "Coming Soon",
    thumbnailUrl: "/images/games/placeholder2.png",
    path: "#",
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
