import { READY_SENTENCE_IDS } from "./ready";

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

export const SENTENCES: ReadingSentence[] = [
  // ---------------------------------------------------------------- easy
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
    imagePrompt: scene("Queen Elsa from Frozen in her blue dress beside a big round smiling snowman in the snow."),
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

  // -------------------------------------------------------------- medium
  {
    id: "dragon-rock",
    text: "The dragon sat on a big rock.",
    alternates: { dragon: ["draggon", "dragging"] },
    imagePrompt: scene("A friendly little green dragon perched on a huge grey boulder, tail curled around it."),
    level: "medium",
  },
  {
    id: "ship-sea",
    text: "A ship sails on the blue sea.",
    imagePrompt: scene("A wooden sailing ship with white sails gliding over rolling blue ocean waves."),
    level: "medium",
  },
  {
    id: "shark-teeth",
    text: "The shark has lots of sharp teeth.",
    imagePrompt: scene("A friendly cartoon shark grinning underwater showing rows of white pointy teeth."),
    level: "medium",
  },
  {
    id: "sheep-tree",
    text: "Six sheep sleep under a tree.",
    imagePrompt: scene("Six fluffy white sheep dozing in the shade of a big leafy tree in a green field."),
    level: "medium",
  },
  {
    id: "brush-teeth",
    text: "I brush my teeth every night.",
    imagePrompt: scene("A child in pyjamas brushing their teeth at a bathroom sink with a foamy toothbrush."),
    level: "medium",
  },
  {
    id: "chick-shell",
    text: "The chick came out of the shell.",
    imagePrompt: scene("A tiny fluffy yellow chick stepping out of a cracked white eggshell in a straw nest."),
    level: "medium",
  },
  {
    id: "picnic-park",
    text: "We had a picnic in the park.",
    imagePrompt: scene("A checked picnic blanket in a sunny park with a basket, fruit and sandwiches laid out."),
    level: "medium",
  },
  {
    id: "snail-slow",
    text: "The snail is slow but happy.",
    imagePrompt: scene("A smiling snail with a swirly striped shell inching along a garden path."),
    level: "medium",
  },
  {
    id: "snake-pond",
    text: "A green snake slid past the pond.",
    imagePrompt: scene("A long friendly green snake gliding through grass beside a little pond."),
    level: "medium",
  },
  {
    id: "king-crown",
    text: "The king wears a shiny gold crown.",
    imagePrompt: scene("A jolly bearded king on a throne wearing a gleaming golden crown."),
    level: "medium",
  },
  {
    id: "kite-wind",
    text: "My kite flew up in the wind.",
    imagePrompt: scene("A bright diamond kite with a ribbon tail flying high in a breezy blue sky."),
    level: "medium",
  },
  {
    id: "train-track",
    text: "The train goes fast down the track.",
    imagePrompt: scene("A colourful steam train puffing along a railway track through green countryside."),
    level: "medium",
  },
  {
    id: "rain-umbrella",
    text: "Rain drops fall on my umbrella.",
    imagePrompt: scene("A child under a rainbow striped umbrella with raindrops bouncing off it."),
    level: "medium",
  },
  {
    id: "crab-beach",
    text: "The crab walks on the sandy beach.",
    imagePrompt: scene("A little red crab scuttling sideways across golden sand by the sea."),
    level: "medium",
  },
  {
    id: "tent-sticks",
    text: "We made a tent out of sticks.",
    imagePrompt: scene("Two children beside a den made of leaning sticks and a blanket in a garden."),
    level: "medium",
  },
  {
    id: "clock-three",
    text: "The clock on the wall says three.",
    imagePrompt: scene("A round wall clock with big black hands pointing to three o'clock."),
    level: "medium",
  },
  {
    id: "bird-branch",
    text: "A little bird sings on the branch.",
    imagePrompt: scene("A small blue bird singing on a leafy tree branch with tiny music notes around it."),
    level: "medium",
  },
  {
    id: "goat-grass",
    text: "The goat ate all the green grass.",
    imagePrompt: scene("A white goat with curly horns munching bright green grass in a meadow."),
    level: "medium",
  },
  {
    id: "shell-beach",
    text: "I found a shell on the beach.",
    imagePrompt: scene("A child's hand holding a pretty pink spiral seashell above golden sand."),
    level: "medium",
  },
  {
    id: "peach-kart",
    text: "Peach and Luigi ride a red kart.",
    alternates: { peach: ["peaches", "beach"], luigi: ["louis", "luiggi", "lweegee"] },
    imagePrompt: scene("Princess Peach and Luigi from Nintendo riding a bright red go-kart around a bend."),
    level: "medium",
  },
  {
    id: "pikachu-tree",
    text: "Pikachu sleeps under a big tree.",
    alternates: { pikachu: ["pikatchu", "picachu", "peekachu"] },
    imagePrompt: scene("Pikachu the yellow Pokemon curled up asleep in the shade of a big leafy tree."),
    level: "medium",
  },
  {
    id: "yoshi-hills",
    text: "Yoshi runs across the green hills.",
    alternates: { yoshi: ["yosi", "yoshee", "joshy"] },
    imagePrompt: scene("Yoshi the green dinosaur from Nintendo running happily over rolling green hills."),
    level: "medium",
  },
  {
    id: "woody-buzz",
    text: "Woody and Buzz play in the box.",
    alternates: { woody: ["woodie", "would he"], buzz: ["bus", "buzzed"] },
    imagePrompt: scene("Woody the cowboy toy and Buzz Lightyear from Toy Story playing inside a big cardboard box."),
    level: "medium",
  },
  {
    id: "totoro-rain",
    text: "Totoro waits in the rain with me.",
    alternates: { totoro: ["toto", "tortoro", "to toro"] },
    imagePrompt: scene("Totoro the big grey forest spirit from Studio Ghibli standing in the rain at a bus stop holding a leaf over his head."),
    level: "medium",
  },
  {
    id: "moon-boat",
    text: "The little boat floats past the moon.",
    imagePrompt: scene("A small wooden rowing boat drifting on calm water beneath a huge glowing moon."),
    level: "medium",
  },
  {
    id: "cake-candles",
    text: "The cake has seven pink candles.",
    imagePrompt: scene("A birthday cake with white icing, sprinkles and seven lit pink candles."),
    level: "medium",
  },

  // ---------------------------------------------------------------- hard
  {
    id: "dragon-castle",
    text: "The little dragon flew over the tall castle.",
    alternates: { dragon: ["draggon"] },
    imagePrompt: scene("A small friendly dragon flying above a fairytale castle with tall towers and fluttering flags."),
    level: "hard",
  },
  {
    id: "rocket-sky",
    text: "A rocket blasted off into the dark sky.",
    imagePrompt: scene("A red and white rocket launching upward on a plume of flame into a deep blue starry sky."),
    level: "hard",
  },
  {
    id: "elephant-splash",
    text: "The elephant splashed water on his back.",
    imagePrompt: scene("A happy grey elephant standing in a river spraying water over its own back with its trunk."),
    level: "hard",
  },
  {
    id: "butterfly-garden",
    text: "Butterflies danced around the flowers in the garden.",
    imagePrompt: scene("Several colourful butterflies fluttering above a bed of bright flowers in a sunny garden."),
    level: "hard",
  },
  {
    id: "pirate-treasure",
    text: "The pirate found a chest full of treasure.",
    imagePrompt: scene("A jolly pirate with an eye patch opening a wooden chest spilling gold coins and jewels on a beach."),
    level: "hard",
  },
  {
    id: "thunder-rain",
    text: "Thunder rumbled and the rain came down hard.",
    imagePrompt: scene("A dramatic dark storm cloud with a yellow lightning bolt and heavy rain over a small cottage."),
    level: "hard",
  },
  {
    id: "robot-dance",
    text: "My robot friend can dance and sing songs.",
    imagePrompt: scene("A friendly boxy robot with antennae dancing with its arms up, little music notes around it."),
    level: "hard",
  },
  {
    id: "unicorn-rainbow",
    text: "The unicorn galloped under a bright rainbow.",
    imagePrompt: scene("A white unicorn with a rainbow mane galloping across a meadow beneath a big arching rainbow."),
    level: "hard",
  },
  {
    id: "chocolate-party",
    text: "We ate chocolate cupcakes at the birthday party.",
    imagePrompt: scene("A table of chocolate cupcakes with swirly frosting at a cheerful birthday party with bunting."),
    level: "hard",
  },
  {
    id: "monster-bed",
    text: "A friendly monster hid under my bed.",
    imagePrompt: scene("A silly furry purple monster with big googly eyes peeking out from under a child's bed."),
    level: "hard",
  },
  {
    id: "penguin-hill",
    text: "The penguin slid down the icy hill.",
    imagePrompt: scene("A chubby penguin sliding on its tummy down a snowy slope, snow spraying behind it."),
    level: "hard",
  },
  {
    id: "dolphin-jump",
    text: "Dolphins jumped high out of the blue water.",
    imagePrompt: scene("Two dolphins leaping together out of sparkling blue sea water against a sunny sky."),
    level: "hard",
  },
  {
    id: "wizard-wand",
    text: "The wizard waved his wand and smiled.",
    imagePrompt: scene("A kindly old wizard in a pointy hat waving a glowing wand with sparkles trailing from it."),
    level: "hard",
  },
  {
    id: "mermaid-waves",
    text: "A mermaid sang a song beneath the waves.",
    imagePrompt: scene("A smiling mermaid with a shimmering tail singing underwater among coral and little fish."),
    level: "hard",
  },
  {
    id: "tractor-field",
    text: "The tractor drove slowly across the muddy field.",
    imagePrompt: scene("A red farm tractor with big wheels driving over a brown ploughed field."),
    level: "hard",
  },
  {
    id: "rapunzel-hair",
    text: "Rapunzel let down her very long hair.",
    alternates: { rapunzel: ["repunzel", "rapunsel", "rapunzo"] },
    imagePrompt: scene("Rapunzel from Disney Tangled leaning out of a tower window with her golden hair tumbling far down."),
    level: "hard",
  },
  {
    id: "moana-ocean",
    text: "Moana sailed her boat across the ocean.",
    alternates: { moana: ["moanna", "mowana", "banana"] },
    imagePrompt: scene("Moana the Disney islander heroine steering her small sailing canoe over bright ocean waves."),
    level: "hard",
  },
  {
    id: "bloom-magic",
    text: "Bloom used her fire magic to help her friends.",
    alternates: { bloom: ["blume", "broom", "blooms"] },
    imagePrompt: scene("Bloom the fire fairy from the 2025 CGI Winx Club reboot in her winged fairy form, orange hair glowing, casting warm orange fire magic."),
    level: "hard",
  },
  {
    id: "ponyo-waves",
    text: "Ponyo ran along the top of the waves.",
    alternates: { ponyo: ["ponio", "pony", "pony o"] },
    imagePrompt: scene("Ponyo the little red-haired girl from Studio Ghibli running joyfully over the crests of big blue waves."),
    level: "hard",
  },
  {
    id: "dinosaur-forest",
    text: "The dinosaur stomped through the big green forest.",
    imagePrompt: scene("A friendly spotted green dinosaur walking between tall trees in a lush forest."),
    level: "hard",
  },
  {
    id: "helicopter-mountain",
    text: "The helicopter flew over the snowy mountain.",
    imagePrompt: scene("A little blue helicopter flying past a tall snow-capped mountain peak."),
    level: "hard",
  },
  {
    id: "princess-garden",
    text: "The princess planted flowers in her secret garden.",
    imagePrompt: scene("A smiling princess in a simple gown kneeling to plant bright flowers in a walled garden."),
    level: "hard",
  },
  {
    id: "balloon-clouds",
    text: "The red balloon floated up past the clouds.",
    imagePrompt: scene("A single bright red balloon drifting high above fluffy white clouds in a blue sky."),
    level: "hard",
  },
  {
    id: "fairy-mushroom",
    text: "A tiny fairy slept inside a spotted mushroom.",
    imagePrompt: scene("A tiny winged fairy curled up asleep under the cap of a red mushroom with white spots."),
    level: "hard",
  },
  {
    id: "sandcastle-sea",
    text: "We built a sandcastle beside the sea.",
    imagePrompt: scene("Two children beside a tall sandcastle with towers and a flag on a sunny beach by the waves."),
    level: "hard",
  },
  {
    id: "owl-night",
    text: "The wise old owl watched the quiet night.",
    imagePrompt: scene("A big round owl with wide eyes perched on a branch under a starry night sky."),
    level: "hard",
  },
];

/** Every sentence, ordered easy to hard. */
export const ALL_SENTENCES: ReadingSentence[] = SENTENCES;

export function sentenceImage(sentence: ReadingSentence): string {
  return `/images/sentences/${sentence.id}.webp`;
}

/**
 * The pool widens with the streak, the same way the phonics word pool does.
 * `recent` holds the last handful of ids so nothing comes straight back round.
 */
export function pickNextSentence(
  streak: number,
  recent: string[]
): ReadingSentence {
  const allowed: SentenceLevel[] =
    streak >= 8
      ? ["easy", "medium", "hard"]
      : streak >= 4
        ? ["easy", "medium"]
        : ["easy"];
  // Only sentences whose illustration exists — the picture is the reward for
  // reading, and the artwork is still being generated in the background.
  const pool = SENTENCES.filter(
    (s) => allowed.includes(s.level) && READY_SENTENCE_IDS.has(s.id)
  );
  // If a tier has nothing illustrated yet, drop back to any ready sentence
  // rather than hand the game an empty list.
  const ready = pool.length > 0 ? pool : SENTENCES.filter((s) => READY_SENTENCE_IDS.has(s.id));
  const usable = ready.length > 0 ? ready : SENTENCES;
  const filtered = usable.filter((s) => !recent.includes(s.id));
  const candidates = filtered.length > 0 ? filtered : usable;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/** How much of the written material is playable right now. */
export const readySentenceCount = () =>
  SENTENCES.filter((s) => READY_SENTENCE_IDS.has(s.id)).length;
