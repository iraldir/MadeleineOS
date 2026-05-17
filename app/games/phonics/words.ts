export type Difficulty = "easy" | "medium";

export interface PhonicsWord {
  word: string;
  match: string[];
  imagePrompt: string;
  difficulty: Difficulty;
}

const baseStyle =
  "cute funny illustration for a children's reading game, bright pastel colors, white background, simple, expressive";

export const EASY: PhonicsWord[] = [
  // Animals
  { word: "cat", match: ["cat", "cats"], imagePrompt: `a happy cat, ${baseStyle}`, difficulty: "easy" },
  { word: "dog", match: ["dog", "dogs"], imagePrompt: `a friendly dog, ${baseStyle}`, difficulty: "easy" },
  { word: "pig", match: ["pig", "pigs"], imagePrompt: `a chubby pink pig, ${baseStyle}`, difficulty: "easy" },
  { word: "frog", match: ["frog", "frogs"], imagePrompt: `a green frog sitting on a leaf, ${baseStyle}`, difficulty: "easy" },
  { word: "fox", match: ["fox", "foxes"], imagePrompt: `an orange fox with a bushy tail, ${baseStyle}`, difficulty: "easy" },
  { word: "rat", match: ["rat", "rats"], imagePrompt: `a cute grey rat, ${baseStyle}`, difficulty: "easy" },
  // Food
  { word: "pasta", match: ["pasta"], imagePrompt: `a bowl of spaghetti pasta, ${baseStyle}`, difficulty: "easy" },
  { word: "pizza", match: ["pizza"], imagePrompt: `a cheesy pizza slice, ${baseStyle}`, difficulty: "easy" },
  { word: "banana", match: ["banana", "bananas"], imagePrompt: `a yellow banana, ${baseStyle}`, difficulty: "easy" },
  { word: "potato", match: ["potato", "potatoes"], imagePrompt: `a smiling potato, ${baseStyle}`, difficulty: "easy" },
  { word: "tomato", match: ["tomato", "tomatoes"], imagePrompt: `a shiny red tomato, ${baseStyle}`, difficulty: "easy" },
  { word: "milk", match: ["milk"], imagePrompt: `a glass of milk, ${baseStyle}`, difficulty: "easy" },
  { word: "egg", match: ["egg", "eggs"], imagePrompt: `a sunny side up egg, ${baseStyle}`, difficulty: "easy" },
  { word: "ham", match: ["ham"], imagePrompt: `a slice of pink ham, ${baseStyle}`, difficulty: "easy" },
  { word: "jam", match: ["jam"], imagePrompt: `a jar of strawberry jam, ${baseStyle}`, difficulty: "easy" },
  // Actions
  { word: "run", match: ["run", "running", "runs"], imagePrompt: `a child running joyfully, ${baseStyle}`, difficulty: "easy" },
  { word: "jump", match: ["jump", "jumping", "jumps"], imagePrompt: `a child jumping in the air, ${baseStyle}`, difficulty: "easy" },
  { word: "stop", match: ["stop", "stopping", "stops"], imagePrompt: `a red stop sign, ${baseStyle}`, difficulty: "easy" },
  { word: "hop", match: ["hop", "hopping", "hops"], imagePrompt: `a bunny hopping, ${baseStyle}`, difficulty: "easy" },
  { word: "sing", match: ["sing", "singing", "sings"], imagePrompt: `a child singing with music notes, ${baseStyle}`, difficulty: "easy" },
  { word: "sit", match: ["sit", "sitting", "sits"], imagePrompt: `a child sitting on a chair, ${baseStyle}`, difficulty: "easy" },
  { word: "swim", match: ["swim", "swimming", "swims"], imagePrompt: `a child swimming in water, ${baseStyle}`, difficulty: "easy" },
  // Nature
  { word: "sun", match: ["sun", "suns"], imagePrompt: `a bright smiling sun, ${baseStyle}`, difficulty: "easy" },
  // Descriptors
  { word: "big", match: ["big"], imagePrompt: `a tiny mouse next to a huge elephant, big concept, ${baseStyle}`, difficulty: "easy" },
  { word: "hot", match: ["hot"], imagePrompt: `a steaming hot cup, ${baseStyle}`, difficulty: "easy" },
  { word: "fast", match: ["fast"], imagePrompt: `a speedy race car with motion lines, ${baseStyle}`, difficulty: "easy" },
  { word: "red", match: ["red"], imagePrompt: `a bright red apple, ${baseStyle}`, difficulty: "easy" },
  // Colors
  { word: "pink", match: ["pink"], imagePrompt: `a pink flower, ${baseStyle}`, difficulty: "easy" },
  // Toys & objects
  { word: "bed", match: ["bed", "beds"], imagePrompt: `a cozy bed with pillow, ${baseStyle}`, difficulty: "easy" },
  { word: "drum", match: ["drum", "drums"], imagePrompt: `a colorful toy drum, ${baseStyle}`, difficulty: "easy" },
  // People
  { word: "mama", match: ["mama", "mom", "mommy", "mum", "mummy", "maman"], imagePrompt: `a smiling mother hugging her child, ${baseStyle}`, difficulty: "easy" },
  { word: "papa", match: ["papa", "dad", "daddy"], imagePrompt: `a smiling father holding his child, ${baseStyle}`, difficulty: "easy" },
  { word: "kid", match: ["kid", "kids"], imagePrompt: `a happy little kid waving, ${baseStyle}`, difficulty: "easy" },
  // Characters
  { word: "Anna", match: ["anna", "anna's"], imagePrompt: "Princess Anna from Frozen, cute kids illustration, bright colors, white background", difficulty: "easy" },
  { word: "Elsa", match: ["elsa", "elsa's"], imagePrompt: "Queen Elsa from Frozen, cute kids illustration, bright colors, white background", difficulty: "easy" },
  { word: "Mario", match: ["mario"], imagePrompt: "Mario from Nintendo, cute kids illustration, bright colors, white background", difficulty: "easy" },
  { word: "Link", match: ["link"], imagePrompt: "Link from Zelda, cute kids illustration, bright colors, white background", difficulty: "easy" },
  { word: "Bingo", match: ["bingo"], imagePrompt: "Bingo from Bluey TV show, cute kids illustration, bright colors, white background", difficulty: "easy" },
  { word: "Pingu", match: ["pingu"], imagePrompt: "Pingu the penguin character, cute kids illustration, bright colors, white background", difficulty: "easy" },
];

export const MEDIUM: PhonicsWord[] = [
  { word: "bear", match: ["bear", "bears"], imagePrompt: `a friendly brown bear, ${baseStyle}`, difficulty: "medium" },
  { word: "cake", match: ["cake", "cakes"], imagePrompt: `a birthday cake with candles, ${baseStyle}`, difficulty: "medium" },
  { word: "sleep", match: ["sleep", "sleeping", "sleeps"], imagePrompt: `a child sleeping peacefully with z's floating, ${baseStyle}`, difficulty: "medium" },
  { word: "moon", match: ["moon"], imagePrompt: `a crescent moon in a starry sky, ${baseStyle}`, difficulty: "medium" },
  { word: "rain", match: ["rain", "raining"], imagePrompt: `raindrops falling from a cloud, ${baseStyle}`, difficulty: "medium" },
  { word: "tree", match: ["tree", "trees"], imagePrompt: `a leafy green tree, ${baseStyle}`, difficulty: "medium" },
  { word: "blue", match: ["blue"], imagePrompt: `a blue paint splash, ${baseStyle}`, difficulty: "medium" },
  { word: "green", match: ["green"], imagePrompt: `a green leaf, ${baseStyle}`, difficulty: "medium" },
  { word: "book", match: ["book", "books"], imagePrompt: `an open colorful storybook, ${baseStyle}`, difficulty: "medium" },
  { word: "baby", match: ["baby", "babies"], imagePrompt: `a smiling baby, ${baseStyle}`, difficulty: "medium" },
  { word: "star", match: ["star", "stars"], imagePrompt: `a sparkling yellow star, ${baseStyle}`, difficulty: "medium" },
  { word: "Belle", match: ["belle"], imagePrompt: "Princess Belle from Beauty and the Beast, cute kids illustration, bright colors, white background", difficulty: "medium" },
  { word: "cold", match: ["cold"], imagePrompt: `a snowman shivering with snowflakes, ${baseStyle}`, difficulty: "medium" },
  { word: "small", match: ["small"], imagePrompt: `a tiny mouse next to a huge book, small concept, ${baseStyle}`, difficulty: "medium" },
  { word: "ball", match: ["ball", "balls"], imagePrompt: `a colorful bouncy ball, ${baseStyle}`, difficulty: "medium" },
  { word: "doll", match: ["doll", "dolls"], imagePrompt: `a cute rag doll toy, ${baseStyle}`, difficulty: "medium" },
  { word: "duck", match: ["duck", "ducks"], imagePrompt: `a yellow duckling, ${baseStyle}`, difficulty: "medium" },
  { word: "fish", match: ["fish", "fishes"], imagePrompt: `a colorful fish swimming, ${baseStyle}`, difficulty: "medium" },
];

export const ALL_WORDS: PhonicsWord[] = [...EASY, ...MEDIUM];

export function imageFilename(word: PhonicsWord): string {
  return `${word.word.toLowerCase()}.webp`;
}

export function judgeMatch(word: PhonicsWord, transcript: string): boolean {
  const normalized = transcript.toLowerCase();
  const tokens = normalized.split(/[\s.,!?;:'"()]+/).filter(Boolean);
  const set = new Set(word.match);
  return tokens.some((t) => set.has(t));
}

export function pickNextWord(
  streak: number,
  recent: string[]
): PhonicsWord {
  const pool = streak >= 10 ? [...EASY, ...MEDIUM] : EASY;
  const filtered = pool.filter((w) => !recent.includes(w.word));
  const candidates = filtered.length > 0 ? filtered : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
