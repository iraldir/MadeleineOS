export interface Sticker {
  id: string;
  name: string;
  /** Prompt used by scripts/generate-stickers.ts to create the artwork */
  prompt: string;
}

const s = (id: string, name: string, prompt: string): Sticker => ({
  id,
  name,
  prompt,
});

export const stickers: Sticker[] = [
  s("smiley-icecream", "Smiley Ice Cream", "a smiling ice cream cone with a swirl"),
  s("confused-pug", "Confused Pug", "a confused pug dog with a tilted head"),
  s("sleepy-taco", "Sleepy Taco", "a sleepy taco taking a nap"),
  s("happy-avocado", "Happy Avocado", "a happy avocado hugging its pit"),
  s("winking-strawberry", "Winking Strawberry", "a winking strawberry"),
  s("dancing-banana", "Dancing Banana", "a dancing banana with little arms"),
  s("shy-cactus", "Shy Cactus", "a shy blushing cactus in a flower pot"),
  s("grumpy-cloud", "Grumpy Cloud", "a grumpy little rain cloud"),
  s("singing-sushi", "Singing Sushi", "a singing sushi roll holding a microphone"),
  s("baby-dragon", "Baby Dragon", "a baby dragon with tiny wings"),
  s("skating-peach", "Skating Peach", "a peach on roller skates"),
  s("nervous-egg", "Nervous Egg", "a nervous fried egg with big eyes"),
  s("cool-watermelon", "Cool Watermelon", "a watermelon slice wearing sunglasses"),
  s("crying-onion", "Crying Onion", "a crying onion holding a tissue"),
  s("laughing-donut", "Laughing Donut", "a laughing pink frosted donut with sprinkles"),
  s("sleepy-moon", "Sleepy Moon", "a sleepy crescent moon with a nightcap"),
  s("waving-jellyfish", "Waving Jellyfish", "a friendly jellyfish waving a tentacle"),
  s("proud-croissant", "Proud Croissant", "a proud croissant wearing a beret"),
  s("surprised-cupcake", "Surprised Cupcake", "a surprised cupcake with a cherry on top"),
  s("yawning-kitten", "Yawning Kitten", "a tiny yawning kitten"),
  s("bouncy-bubble-tea", "Bouncy Bubble Tea", "a bouncing cup of bubble tea with a straw"),
  s("super-hamster", "Super Hamster", "a superhero hamster with a red cape"),
  s("blushing-dumpling", "Blushing Dumpling", "a blushing steamed dumpling"),
  s("skater-turtle", "Skater Turtle", "a turtle riding a skateboard"),
  s("giggly-mushroom", "Giggly Mushroom", "a giggling red mushroom with white spots"),
  s("astro-corgi", "Astro Corgi", "a corgi in an astronaut helmet"),
  s("rainbow-snail", "Rainbow Snail", "a snail with a rainbow swirl shell"),
  s("ninja-bunny", "Ninja Bunny", "a bunny in a ninja headband"),
  s("pirate-duckling", "Pirate Duckling", "a duckling with a pirate hat and eye patch"),
  s("wizard-frog", "Wizard Frog", "a frog wearing a wizard hat holding a tiny wand"),
  s("mermaid-cat", "Mermaid Cat", "a cat with a mermaid tail"),
  s("dizzy-saturn", "Dizzy Saturn", "a dizzy planet Saturn with swirly eyes and rings"),
  s("happy-toast", "Happy Toast", "a happy piece of toast with jam heart"),
  s("karate-carrot", "Karate Carrot", "a carrot doing a karate kick"),
  s("sleepy-sloth", "Sleepy Sloth", "a sleepy sloth hanging from a branch"),
  s("party-pineapple", "Party Pineapple", "a pineapple with a party hat and confetti"),
  s("shy-ghost", "Shy Ghost", "a shy little ghost peeking from behind its hands"),
  s("singing-chick", "Singing Chick", "a baby chick singing with musical notes"),
  s("detective-owl", "Detective Owl", "an owl with a magnifying glass and detective hat"),
  s("cake-unicorn", "Cake Unicorn", "a unicorn happily eating a slice of cake"),
  s("love-robot", "Love Robot", "a little robot with a heart on its screen"),
  s("curious-axolotl", "Curious Axolotl", "a curious pink axolotl"),
  s("teacup-pig", "Teacup Pig", "a tiny pig sitting inside a teacup"),
  s("juggling-octopus", "Juggling Octopus", "an octopus juggling colorful balls"),
  s("cool-star", "Cool Star", "a yellow star wearing sunglasses"),
  s("flower-boot", "Flower Boot", "a yellow rain boot with a daisy growing inside"),
  s("milk-and-cookie", "Milk & Cookie", "a milk carton and a cookie who are best friends holding hands"),
  s("panda-bao", "Panda Bao", "a panda munching a steamed bao bun"),
  s("cozy-penguin", "Cozy Penguin", "a penguin wrapped in a cozy scarf"),
  s("bookish-fox", "Bookish Fox", "a fox reading a tiny book"),
  s("berry-hedgehog", "Berry Hedgehog", "a hedgehog wearing a strawberry as a hat"),
  s("rainbow-whale", "Rainbow Whale", "a whale spouting a rainbow"),
  s("bumble-bee", "Bumble Bee", "a round bumblebee with big sparkly eyes"),
  s("party-llama", "Party Llama", "a llama wearing a party hat"),
  s("balloon-dino", "Balloon Dino", "a green dinosaur holding a red balloon"),
  s("otter-shell", "Otter & Shell", "an otter hugging a seashell"),
  s("grinning-cheese", "Grinning Cheese", "a grinning wedge of swiss cheese"),
  s("popcorn-party", "Popcorn Party", "an overflowing box of popcorn with happy popcorn kernels jumping out"),
  s("burrito-cat", "Burrito Cat", "a cat wrapped up in a blanket like a burrito"),
  s("smiling-rainbow", "Smiling Rainbow", "a smiling rainbow with little clouds at each end"),
];

export const getStickerById = (id: string): Sticker | undefined =>
  stickers.find((sticker) => sticker.id === id);

export const stickerImageUrl = (id: string): string =>
  `/images/stickers/${id}.webp`;
