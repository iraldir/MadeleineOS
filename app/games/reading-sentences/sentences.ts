import { READY_SENTENCE_IDS } from "./ready";
import { ACCESSIBLE_SENTENCES } from "./accessible-sentences";

export type SentenceLevel = "easy" | "medium" | "hard";

export interface ReadingSentence {
  /** Stable id — also the illustration filename. */
  id: string;
  /** What she reads out loud, with normal punctuation. */
  text: string;
  /**
   * Matching aid: for a word the recogniser reliably mangles, the spellings we
   * are willing to accept instead. Keys must be lowercase words of `text`.
   * Generic fuzziness is handled by `matching.ts`; this is for the cases no
   * edit distance would forgive (names, mostly).
   */
  alternates?: Record<string, string[]>;
  imagePrompt: string;
  level: SentenceLevel;
}

const storybook =
  "Children's storybook illustration, hand-painted watercolour and gouache " +
  "texture, warm bright cheerful colours, soft clean uncluttered background, " +
  "clear simple readable composition, gentle and friendly. " +
  "No text, no letters, no words, no speech bubbles, no captions.";

const scene = (subject: string) => `${subject} ${storybook}`;

/** Original easy sentences stay unchanged; streaks never raise the difficulty. */
export const SENTENCES: ReadingSentence[] = [
  {
    id: "cat-mat",
    text: "The cat sat on the mat.",
    imagePrompt: scene("A round ginger cat sitting neatly on a stripy woven mat in a sunny room."),
    level: "easy",
  },
  {
    id: "big-dog-run",
    text: "A big dog can run fast.",
    imagePrompt: scene("A big shaggy brown dog running joyfully across the grass with its ears flying back."),
    level: "easy",
  },
  {
    id: "sun-hot",
    text: "The sun is very hot today.",
    imagePrompt: scene("A big smiling golden sun blazing in a clear blue sky over a dry sunny field."),
    level: "easy",
  },
  {
    id: "red-apples",
    text: "I like to eat red apples.",
    imagePrompt: scene("A happy child taking a bite out of a shiny red apple, with a bowl of apples beside them."),
    level: "easy",
  },
  {
    id: "frog-pond",
    text: "The frog hops in the pond.",
    imagePrompt: scene("A cheerful green frog leaping over a little pond with lily pads and ripples."),
    level: "easy",
  },
  {
    id: "duck-swim",
    text: "My duck can swim very fast.",
    imagePrompt: scene("A bright yellow duckling paddling quickly across blue water leaving a wake behind it."),
    level: "easy",
  },
  {
    id: "pig-mud",
    text: "The pig is in the mud.",
    imagePrompt: scene("A delighted pink pig sitting in a brown mud puddle on a farm, splattered and grinning."),
    level: "easy",
  },
  {
    id: "ten-fish",
    text: "Ten fish swim in the sea.",
    imagePrompt: scene("A shoal of ten colourful little fish swimming together in clear blue sea water."),
    level: "easy",
  },
  {
    id: "bug-leaf",
    text: "The bug is on a leaf.",
    imagePrompt: scene("A tiny red ladybug sitting on a big green leaf."),
    level: "easy",
  },
  {
    id: "hen-eggs",
    text: "A hen sat on six eggs.",
    imagePrompt: scene("A plump brown hen sitting proudly in a straw nest with six pale eggs peeking out."),
    level: "easy",
  },
  {
    id: "yellow-bus",
    text: "The bus is big and yellow.",
    imagePrompt: scene("A big cheerful yellow school bus parked on a sunny street."),
    level: "easy",
  },
  {
    id: "jump-high",
    text: "I can jump up very high.",
    imagePrompt: scene("A happy child leaping high in the air with arms up, hair flying."),
    level: "easy",
  },
  {
    id: "moon-sky",
    text: "The moon is up in the sky.",
    imagePrompt: scene("A big friendly crescent moon high in a deep blue starry night sky above rooftops."),
    level: "easy",
  },
  {
    id: "cup-milk",
    text: "My cup is full of milk.",
    imagePrompt: scene("A stripy cup filled to the brim with creamy white milk on a kitchen table."),
    level: "easy",
  },
  {
    id: "fox-log",
    text: "The fox ran into the log.",
    imagePrompt: scene("An orange fox with a bushy tail slipping into a hollow mossy log in a wood."),
    level: "easy",
  },
  {
    id: "bat-dark",
    text: "A bat hangs in the dark.",
    imagePrompt: scene("A small friendly bat hanging upside down from a branch in a dim blue night cave."),
    level: "easy",
  },
  {
    id: "van-road",
    text: "The van went down the road.",
    imagePrompt: scene("A little blue delivery van driving along a winding country road."),
    level: "easy",
  },
  {
    id: "blue-hat",
    text: "I have a new blue hat.",
    imagePrompt: scene("A smiling child wearing a brand new bright blue woolly hat."),
    level: "easy",
  },
  {
    id: "rat-jam",
    text: "The rat ate all my jam.",
    imagePrompt: scene("A cheeky grey rat sitting beside an empty jar of strawberry jam with a sticky face."),
    level: "easy",
  },
  {
    id: "mario-box",
    text: "Mario can jump on a box.",
    alternates: { mario: ["maria", "mareo"] },
    imagePrompt: scene("Mario from Nintendo in his red cap jumping happily on top of a golden question block."),
    level: "easy",
  },
  {
    id: "elsa-snowman",
    text: "Elsa made a big snowman.",
    alternates: { elsa: ["elsie", "else"] },
    imagePrompt: scene("a snow queen in a sparkling pale blue gown with a long blonde braid, beside a big round smiling snowman in the snow."),
    level: "easy",
  },
  {
    id: "bingo-ball",
    text: "Bingo plays with a ball.",
    alternates: { bingo: ["bing", "bingle"] },
    imagePrompt: scene("Bingo the orange puppy from the Bluey cartoon playing happily with a bouncy ball."),
    level: "easy",
  },
  {
    id: "hop-bed",
    text: "I hop into my warm bed.",
    imagePrompt: scene("A child in pyjamas hopping into a cosy bed with a patchwork quilt."),
    level: "easy",
  },
  {
    id: "cat-nap",
    text: "The cat had a long nap.",
    imagePrompt: scene("A fluffy grey cat curled up fast asleep on a cushion with little sleepy z shapes."),
    level: "easy",
  },

  ...ACCESSIBLE_SENTENCES,
];

/** Active material only; archived sentences are never selected or generated. */
export const ALL_SENTENCES: ReadingSentence[] = SENTENCES;

export function hasSentenceImage(sentence: ReadingSentence): boolean {
  return READY_SENTENCE_IDS.has(sentence.id);
}

export function sentenceImage(sentence: ReadingSentence): string {
  return `/images/sentences/${sentence.id}.webp`;
}

/** Keep the same accessible level at every streak, with no repeats per cycle. */
export function pickNextSentence(
  _streak: number,
  recent: string[]
): ReadingSentence {
  const unseen = SENTENCES.filter((sentence) => !recent.includes(sentence.id));
  // A complete cycle starts again without immediately repeating the last item.
  const candidates = unseen.length > 0
    ? unseen
    : SENTENCES.filter((sentence) => sentence.id !== recent[0]);
  return candidates[Math.floor(Math.random() * candidates.length)] ?? SENTENCES[0];
}

/** Artwork coverage; sentences without artwork still have a star reward. */
export const readySentenceCount = () =>
  SENTENCES.filter(hasSentenceImage).length;
