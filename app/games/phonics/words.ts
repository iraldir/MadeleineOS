import { READY_WORD_IMAGES } from "./ready";

export type Difficulty = "easy" | "medium" | "hard";

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
  // More short words
  { word: "bug", match: ["bug", "bugs", "bugg"], imagePrompt: `a friendly little ladybug beetle, ${baseStyle}`, difficulty: "easy" },
  { word: "cup", match: ["cup", "cups", "cop"], imagePrompt: `a cheerful stripy cup, ${baseStyle}`, difficulty: "easy" },
  { word: "hat", match: ["hat", "hats", "hut"], imagePrompt: `a colorful sun hat, ${baseStyle}`, difficulty: "easy" },
  { word: "box", match: ["box", "boxes", "bocks"], imagePrompt: `a cardboard box with the lid open, ${baseStyle}`, difficulty: "easy" },
  { word: "bus", match: ["bus", "buses", "busses", "buss"], imagePrompt: `a yellow school bus, ${baseStyle}`, difficulty: "easy" },
  { word: "pen", match: ["pen", "pens", "penn"], imagePrompt: `a blue pen, ${baseStyle}`, difficulty: "easy" },
  { word: "web", match: ["web", "webs"], imagePrompt: `a spider web with dew drops, ${baseStyle}`, difficulty: "easy" },
  { word: "log", match: ["log", "logs"], imagePrompt: `a mossy wooden log in a forest, ${baseStyle}`, difficulty: "easy" },
  { word: "mud", match: ["mud", "muds", "mad"], imagePrompt: `a splashy brown mud puddle with boot prints, ${baseStyle}`, difficulty: "easy" },
  { word: "van", match: ["van", "vans", "vent"], imagePrompt: `a little blue delivery van, ${baseStyle}`, difficulty: "easy" },
  { word: "bat", match: ["bat", "bats", "but"], imagePrompt: `a cute smiling bat hanging upside down, ${baseStyle}`, difficulty: "easy" },
  { word: "hen", match: ["hen", "hens", "when"], imagePrompt: `a plump brown hen, ${baseStyle}`, difficulty: "easy" },
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
  // sh / ch / th / ng digraphs
  { word: "ship", match: ["ship", "ships", "sheep", "chip"], imagePrompt: `a wooden sailing ship on blue waves, ${baseStyle}`, difficulty: "medium" },
  { word: "shell", match: ["shell", "shells", "chelle"], imagePrompt: `a pretty pink spiral seashell on sand, ${baseStyle}`, difficulty: "medium" },
  { word: "shark", match: ["shark", "sharks", "shock"], imagePrompt: `a friendly grinning shark swimming, ${baseStyle}`, difficulty: "medium" },
  { word: "sheep", match: ["sheep", "sheeps", "ship"], imagePrompt: `a fluffy white sheep in a green field, ${baseStyle}`, difficulty: "medium" },
  { word: "brush", match: ["brush", "brushes", "brash"], imagePrompt: `a paint brush dripping with rainbow paint, ${baseStyle}`, difficulty: "medium" },
  { word: "chick", match: ["chick", "chicks", "check", "chik"], imagePrompt: `a tiny fluffy yellow chick, ${baseStyle}`, difficulty: "medium" },
  { word: "chair", match: ["chair", "chairs", "cher", "share"], imagePrompt: `a red wooden chair, ${baseStyle}`, difficulty: "medium" },
  { word: "cheese", match: ["cheese", "cheeses", "chees"], imagePrompt: `a wedge of yellow cheese with holes, ${baseStyle}`, difficulty: "medium" },
  { word: "lunch", match: ["lunch", "lunches", "launch"], imagePrompt: `a lunch box packed with a sandwich and an apple, ${baseStyle}`, difficulty: "medium" },
  { word: "bench", match: ["bench", "benches", "bunch"], imagePrompt: `a wooden park bench under a tree, ${baseStyle}`, difficulty: "medium" },
  { word: "branch", match: ["branch", "branches", "brunch"], imagePrompt: `a leafy tree branch with a little bird on it, ${baseStyle}`, difficulty: "medium" },
  { word: "thumb", match: ["thumb", "thumbs", "thum", "some"], imagePrompt: `a hand giving a big thumbs up, ${baseStyle}`, difficulty: "medium" },
  { word: "teeth", match: ["teeth", "teef", "tooth"], imagePrompt: `a big happy smile showing white teeth with a toothbrush, ${baseStyle}`, difficulty: "medium" },
  { word: "bath", match: ["bath", "baths", "bat", "back"], imagePrompt: `a bathtub full of bubbles with a rubber duck, ${baseStyle}`, difficulty: "medium" },
  { word: "king", match: ["king", "kings", "kin"], imagePrompt: `a jolly king with a golden crown, ${baseStyle}`, difficulty: "medium" },
  { word: "ring", match: ["ring", "rings", "wring"], imagePrompt: `a golden ring with a sparkling gem, ${baseStyle}`, difficulty: "medium" },
  { word: "wing", match: ["wing", "wings", "wind"], imagePrompt: `a pair of feathery white wings, ${baseStyle}`, difficulty: "medium" },
  { word: "swing", match: ["swing", "swings", "sving"], imagePrompt: `a rope swing hanging from a tree branch, ${baseStyle}`, difficulty: "medium" },
  // Blends
  { word: "flag", match: ["flag", "flags", "flack"], imagePrompt: `a colorful flag waving on a pole, ${baseStyle}`, difficulty: "medium" },
  { word: "clock", match: ["clock", "clocks", "block", "cloak"], imagePrompt: `a round wall clock with big numbers, ${baseStyle}`, difficulty: "medium" },
  { word: "cloud", match: ["cloud", "clouds", "clown"], imagePrompt: `a fluffy white cloud in a blue sky, ${baseStyle}`, difficulty: "medium" },
  { word: "crab", match: ["crab", "crabs", "grab"], imagePrompt: `a red crab with waving claws on the sand, ${baseStyle}`, difficulty: "medium" },
  { word: "crown", match: ["crown", "crowns", "clown", "brown"], imagePrompt: `a golden crown with jewels, ${baseStyle}`, difficulty: "medium" },
  { word: "dress", match: ["dress", "dresses", "drs"], imagePrompt: `a twirly pink party dress, ${baseStyle}`, difficulty: "medium" },
  { word: "drink", match: ["drink", "drinks", "drank"], imagePrompt: `a tall glass of juice with a stripy straw, ${baseStyle}`, difficulty: "medium" },
  { word: "slide", match: ["slide", "slides", "sled"], imagePrompt: `a playground slide with a child sliding down, ${baseStyle}`, difficulty: "medium" },
  { word: "smile", match: ["smile", "smiles", "smiled"], imagePrompt: `a big happy smiling face, ${baseStyle}`, difficulty: "medium" },
  { word: "snail", match: ["snail", "snails", "snale"], imagePrompt: `a cheerful snail with a swirly shell, ${baseStyle}`, difficulty: "medium" },
  { word: "snake", match: ["snake", "snakes", "sneak"], imagePrompt: `a friendly green snake, ${baseStyle}`, difficulty: "medium" },
  { word: "spoon", match: ["spoon", "spoons", "spun"], imagePrompt: `a shiny silver spoon, ${baseStyle}`, difficulty: "medium" },
  { word: "stone", match: ["stone", "stones", "stown"], imagePrompt: `a smooth grey stone, ${baseStyle}`, difficulty: "medium" },
  { word: "storm", match: ["storm", "storms", "stone"], imagePrompt: `a dark cloud with rain and a lightning bolt, ${baseStyle}`, difficulty: "medium" },
  { word: "train", match: ["train", "trains", "trane"], imagePrompt: `a colorful steam train puffing smoke, ${baseStyle}`, difficulty: "medium" },
  { word: "truck", match: ["truck", "trucks", "track"], imagePrompt: `a big red toy truck, ${baseStyle}`, difficulty: "medium" },
  { word: "tent", match: ["tent", "tents", "ten"], imagePrompt: `a stripy camping tent in a meadow, ${baseStyle}`, difficulty: "medium" },
  { word: "nest", match: ["nest", "nests", "next"], imagePrompt: `a bird nest with three little eggs, ${baseStyle}`, difficulty: "medium" },
  { word: "hand", match: ["hand", "hands", "and"], imagePrompt: `an open waving hand, ${baseStyle}`, difficulty: "medium" },
  { word: "lamp", match: ["lamp", "lamps", "lump"], imagePrompt: `a glowing bedside lamp, ${baseStyle}`, difficulty: "medium" },
  { word: "pond", match: ["pond", "ponds", "pon"], imagePrompt: `a little pond with lily pads and a frog, ${baseStyle}`, difficulty: "medium" },
  { word: "sand", match: ["sand", "sands", "send"], imagePrompt: `a sandcastle on golden sand with a bucket and spade, ${baseStyle}`, difficulty: "medium" },
  { word: "gift", match: ["gift", "gifts", "lift"], imagePrompt: `a wrapped present with a big ribbon bow, ${baseStyle}`, difficulty: "medium" },
  { word: "brick", match: ["brick", "bricks", "break"], imagePrompt: `a stack of red bricks, ${baseStyle}`, difficulty: "medium" },
  { word: "plant", match: ["plant", "plants", "planet"], imagePrompt: `a green potted plant, ${baseStyle}`, difficulty: "medium" },
  { word: "grapes", match: ["grapes", "grape", "graves"], imagePrompt: `a bunch of purple grapes, ${baseStyle}`, difficulty: "medium" },
  { word: "grass", match: ["grass", "grasses", "glass"], imagePrompt: `a patch of bright green grass with a daisy, ${baseStyle}`, difficulty: "medium" },
  { word: "stick", match: ["stick", "sticks", "stuck"], imagePrompt: `a brown twig stick, ${baseStyle}`, difficulty: "medium" },
  // Long vowels
  { word: "boat", match: ["boat", "boats", "bout"], imagePrompt: `a little red rowing boat on water, ${baseStyle}`, difficulty: "medium" },
  { word: "goat", match: ["goat", "goats", "got"], imagePrompt: `a white goat with curly horns, ${baseStyle}`, difficulty: "medium" },
  { word: "coat", match: ["coat", "coats", "cot"], imagePrompt: `a cozy winter coat with a hood, ${baseStyle}`, difficulty: "medium" },
  { word: "leaf", match: ["leaf", "leafs", "leaves", "leave"], imagePrompt: `a single green leaf, ${baseStyle}`, difficulty: "medium" },
  { word: "road", match: ["road", "roads", "rode", "rowed"], imagePrompt: `a winding country road, ${baseStyle}`, difficulty: "medium" },
  { word: "soap", match: ["soap", "soaps", "sope"], imagePrompt: `a bar of soap with bubbles, ${baseStyle}`, difficulty: "medium" },
  { word: "queen", match: ["queen", "queens", "quinn"], imagePrompt: `a kind queen in a purple gown with a crown, ${baseStyle}`, difficulty: "medium" },
  { word: "beach", match: ["beach", "beaches", "beech"], imagePrompt: `a sunny sandy beach with a beach umbrella, ${baseStyle}`, difficulty: "medium" },
  { word: "bread", match: ["bread", "breads", "bred"], imagePrompt: `a crusty loaf of bread, ${baseStyle}`, difficulty: "medium" },
  { word: "sock", match: ["sock", "socks", "sok"], imagePrompt: `a pair of stripy socks, ${baseStyle}`, difficulty: "medium" },
];

export const HARD: PhonicsWord[] = [
  // Two and three syllable story words
  { word: "dragon", match: ["dragon", "dragons", "draggon", "drag on"], imagePrompt: `a friendly green dragon puffing a little smoke, ${baseStyle}`, difficulty: "hard" },
  { word: "rocket", match: ["rocket", "rockets", "rocked", "racket"], imagePrompt: `a red and white rocket blasting off, ${baseStyle}`, difficulty: "hard" },
  { word: "garden", match: ["garden", "gardens", "guardian"], imagePrompt: `a pretty flower garden with a watering can, ${baseStyle}`, difficulty: "hard" },
  { word: "elephant", match: ["elephant", "elephants", "elefant"], imagePrompt: `a happy grey elephant with big ears, ${baseStyle}`, difficulty: "hard" },
  { word: "butterfly", match: ["butterfly", "butterflies", "butter fly"], imagePrompt: `a rainbow butterfly with patterned wings, ${baseStyle}`, difficulty: "hard" },
  { word: "treasure", match: ["treasure", "treasures", "tresure"], imagePrompt: `an open treasure chest full of gold coins and jewels, ${baseStyle}`, difficulty: "hard" },
  { word: "monster", match: ["monster", "monsters", "munster"], imagePrompt: `a silly furry purple monster with big googly eyes, ${baseStyle}`, difficulty: "hard" },
  { word: "princess", match: ["princess", "princesses", "prince s"], imagePrompt: `a smiling princess in a sparkly gown, ${baseStyle}`, difficulty: "hard" },
  { word: "chocolate", match: ["chocolate", "chocolates", "choclate", "chocolat"], imagePrompt: `a bar of chocolate with a square broken off, ${baseStyle}`, difficulty: "hard" },
  { word: "rainbow", match: ["rainbow", "rainbows", "rain bow"], imagePrompt: `a bright rainbow arching over fluffy clouds, ${baseStyle}`, difficulty: "hard" },
  { word: "thunder", match: ["thunder", "thunders", "wonder", "tunder"], imagePrompt: `a storm cloud with a big yellow lightning bolt, ${baseStyle}`, difficulty: "hard" },
  { word: "splash", match: ["splash", "splashes", "splashed", "flash"], imagePrompt: `a big water splash in a puddle with droplets flying, ${baseStyle}`, difficulty: "hard" },
  { word: "crunch", match: ["crunch", "crunches", "brunch", "crunchy"], imagePrompt: `a child biting a crunchy apple with a crunch, ${baseStyle}`, difficulty: "hard" },
  { word: "string", match: ["string", "strings", "sting"], imagePrompt: `a ball of colorful string with a loose end, ${baseStyle}`, difficulty: "hard" },
  { word: "stretch", match: ["stretch", "stretches", "stretched", "sketch"], imagePrompt: `a cat stretching its back with a big yawn, ${baseStyle}`, difficulty: "hard" },
  { word: "penguin", match: ["penguin", "penguins", "pengwin", "pinguin"], imagePrompt: `a chubby penguin standing on ice, ${baseStyle}`, difficulty: "hard" },
  { word: "dolphin", match: ["dolphin", "dolphins", "dolfin"], imagePrompt: `a happy dolphin leaping out of blue water, ${baseStyle}`, difficulty: "hard" },
  { word: "tiger", match: ["tiger", "tigers", "tigger"], imagePrompt: `an orange striped tiger, ${baseStyle}`, difficulty: "hard" },
  { word: "rabbit", match: ["rabbit", "rabbits", "rabbid", "rabid"], imagePrompt: `a fluffy white rabbit with long ears, ${baseStyle}`, difficulty: "hard" },
  { word: "dinosaur", match: ["dinosaur", "dinosaurs", "dinosore", "dino"], imagePrompt: `a friendly green dinosaur with spots, ${baseStyle}`, difficulty: "hard" },
  { word: "unicorn", match: ["unicorn", "unicorns", "uni corn"], imagePrompt: `a white unicorn with a rainbow mane and golden horn, ${baseStyle}`, difficulty: "hard" },
  { word: "castle", match: ["castle", "castles", "cassel", "cattle"], imagePrompt: `a fairytale castle with tall towers and flags, ${baseStyle}`, difficulty: "hard" },
  { word: "wizard", match: ["wizard", "wizards", "lizard"], imagePrompt: `a kindly wizard with a pointy hat and a glowing wand, ${baseStyle}`, difficulty: "hard" },
  { word: "fairy", match: ["fairy", "fairies", "ferry", "furry"], imagePrompt: `a tiny fairy with sparkling wings and a wand, ${baseStyle}`, difficulty: "hard" },
  { word: "mermaid", match: ["mermaid", "mermaids", "mermade", "mer maid"], imagePrompt: `a smiling mermaid with a shimmering tail under the sea, ${baseStyle}`, difficulty: "hard" },
  { word: "pirate", match: ["pirate", "pirates", "pilot", "pyrate"], imagePrompt: `a jolly pirate with an eye patch and a hat, ${baseStyle}`, difficulty: "hard" },
  { word: "robot", match: ["robot", "robots", "roebot"], imagePrompt: `a friendly boxy robot with antennae, ${baseStyle}`, difficulty: "hard" },
  { word: "tractor", match: ["tractor", "tractors", "trackter"], imagePrompt: `a red farm tractor with big wheels, ${baseStyle}`, difficulty: "hard" },
  { word: "mountain", match: ["mountain", "mountains", "mounting"], imagePrompt: `a tall snowy mountain peak, ${baseStyle}`, difficulty: "hard" },
  { word: "forest", match: ["forest", "forests", "for rest"], imagePrompt: `a sunny forest of tall green trees, ${baseStyle}`, difficulty: "hard" },
  { word: "flower", match: ["flower", "flowers", "flour"], imagePrompt: `a bright pink flower with a green stem, ${baseStyle}`, difficulty: "hard" },
  { word: "pumpkin", match: ["pumpkin", "pumpkins", "punkin"], imagePrompt: `a plump orange pumpkin, ${baseStyle}`, difficulty: "hard" },
  { word: "cupcake", match: ["cupcake", "cupcakes", "cup cake"], imagePrompt: `a cupcake with swirly frosting and sprinkles, ${baseStyle}`, difficulty: "hard" },
  { word: "popcorn", match: ["popcorn", "pop corn", "popcorns"], imagePrompt: `a stripy bucket overflowing with popcorn, ${baseStyle}`, difficulty: "hard" },
  { word: "sandwich", match: ["sandwich", "sandwiches", "sanwich"], imagePrompt: `a cut sandwich with lettuce and cheese, ${baseStyle}`, difficulty: "hard" },
  { word: "window", match: ["window", "windows", "windo"], imagePrompt: `a cottage window with curtains and a flower box, ${baseStyle}`, difficulty: "hard" },
  { word: "kitchen", match: ["kitchen", "kitchens", "kitten"], imagePrompt: `a cheerful little kitchen with pots and a stove, ${baseStyle}`, difficulty: "hard" },
  { word: "blanket", match: ["blanket", "blankets", "blanquet"], imagePrompt: `a cozy patchwork blanket folded up, ${baseStyle}`, difficulty: "hard" },
  { word: "jacket", match: ["jacket", "jackets", "jack it"], imagePrompt: `a denim jacket with buttons, ${baseStyle}`, difficulty: "hard" },
  { word: "balloon", match: ["balloon", "balloons", "baloon", "saloon"], imagePrompt: `a bunch of colorful balloons on strings, ${baseStyle}`, difficulty: "hard" },
  { word: "picnic", match: ["picnic", "picnics", "pick nick"], imagePrompt: `a picnic blanket with a basket and fruit on the grass, ${baseStyle}`, difficulty: "hard" },
  { word: "helicopter", match: ["helicopter", "helicopters", "helecopter"], imagePrompt: `a little blue helicopter with spinning rotors, ${baseStyle}`, difficulty: "hard" },
  { word: "umbrella", match: ["umbrella", "umbrellas", "umberella"], imagePrompt: `a rainbow striped umbrella in the rain, ${baseStyle}`, difficulty: "hard" },
  // Characters she loves
  { word: "Pikachu", match: ["pikachu", "pikatchu", "picachu", "pika chu"], imagePrompt: "Pikachu the yellow electric Pokemon, cute kids illustration, bright colors, white background", difficulty: "hard" },
  { word: "Eevee", match: ["eevee", "evie", "eve", "ivy"], imagePrompt: "Eevee the brown fox-like Pokemon with a fluffy collar, cute kids illustration, bright colors, white background", difficulty: "hard" },
  { word: "Bowser", match: ["bowser", "bowzer", "browser"], imagePrompt: "Bowser the spiky turtle king from Nintendo Mario, cute kids illustration, bright colors, white background", difficulty: "hard" },
  { word: "Luigi", match: ["luigi", "louis", "lweegee", "luiggi"], imagePrompt: "Luigi from Nintendo Mario in his green cap, cute kids illustration, bright colors, white background", difficulty: "hard" },
  { word: "Peach", match: ["peach", "peaches", "princess peach"], imagePrompt: "Princess Peach from Nintendo Mario in her pink gown, cute kids illustration, bright colors, white background", difficulty: "hard" },
  { word: "Yoshi", match: ["yoshi", "yosi", "yoshee"], imagePrompt: "Yoshi the green dinosaur from Nintendo Mario, cute kids illustration, bright colors, white background", difficulty: "hard" },
  { word: "Moana", match: ["moana", "moanna", "mowana"], imagePrompt: "Moana the Disney islander heroine with her oar, cute kids illustration, bright colors, white background", difficulty: "hard" },
  { word: "Ariel", match: ["ariel", "arielle", "aerial"], imagePrompt: "Ariel the little mermaid with red hair, cute kids illustration, bright colors, white background", difficulty: "hard" },
  { word: "Rapunzel", match: ["rapunzel", "repunzel", "rapunsel"], imagePrompt: "Rapunzel from Disney Tangled with very long golden hair, cute kids illustration, bright colors, white background", difficulty: "hard" },
  { word: "Cinderella", match: ["cinderella", "cinderela", "sinderella"], imagePrompt: "Cinderella in her blue ball gown with a glass slipper, cute kids illustration, bright colors, white background", difficulty: "hard" },
  { word: "Woody", match: ["woody", "woodie", "wudy"], imagePrompt: "Woody the cowboy toy from Toy Story, cute kids illustration, bright colors, white background", difficulty: "hard" },
  { word: "Buzz", match: ["buzz", "buzz lightyear", "bus"], imagePrompt: "Buzz Lightyear the space ranger toy from Toy Story, cute kids illustration, bright colors, white background", difficulty: "hard" },
  { word: "Totoro", match: ["totoro", "tototo", "toto"], imagePrompt: "Totoro the big grey forest spirit from Studio Ghibli holding a leaf umbrella, cute kids illustration, bright colors, white background", difficulty: "hard" },
  { word: "Ponyo", match: ["ponyo", "ponio", "pony"], imagePrompt: "Ponyo the little red-haired goldfish girl from Studio Ghibli, cute kids illustration, bright colors, white background", difficulty: "hard" },
  { word: "Bloom", match: ["bloom", "blume", "broom"], imagePrompt: "Bloom the fire fairy from the 2025 CGI Winx Club reboot in her fairy form with orange hair and glowing wings, cute kids illustration, bright colors, white background", difficulty: "hard" },
];

export const ALL_WORDS: PhonicsWord[] = [...EASY, ...MEDIUM, ...HARD];

export function imageFilename(word: PhonicsWord): string {
  return `${word.word.toLowerCase()}.webp`;
}

function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

export function judgeMatch(word: PhonicsWord, transcript: string): boolean {
  const normalized = transcript.toLowerCase();
  const tokens = normalized.split(/[\s.,!?;:'"()]+/).filter(Boolean);
  const set = new Set(word.match);
  if (tokens.some((t) => set.has(t))) return true;

  // The recogniser often splits a long word in two ("butter fly"), so try the
  // neighbouring tokens joined up as well.
  for (let i = 0; i + 1 < tokens.length; i++) {
    if (set.has(`${tokens[i]} ${tokens[i + 1]}`)) return true;
    if (set.has(tokens[i] + tokens[i + 1])) return true;
  }

  /**
   * Only long words get the benefit of the doubt. "Helicopter" and "Rapunzel"
   * come back from the recogniser mangled all the time and there is nothing
   * else they could be — whereas at three letters "cat" and "cap" are a real
   * distinction the game exists to teach, so those must still be read exactly.
   */
  return tokens.some((token) => {
    if (token.length < 6) return false;
    for (const candidate of word.match) {
      if (candidate.length < 6 || candidate.includes(" ")) continue;
      if (editDistance(candidate, token) <= 2) return true;
    }
    return false;
  });
}

/**
 * The pool widens as the streak grows: easy words to begin with, then the
 * blends and digraphs, then the long story words. `recent` keeps the last few
 * words from coming straight back round.
 */
export function pickNextWord(
  streak: number,
  recent: string[]
): PhonicsWord {
  const tier =
    streak >= 8
      ? [...EASY, ...MEDIUM, ...HARD]
      : streak >= 4
        ? [...EASY, ...MEDIUM]
        : EASY;
  // Words whose picture has not been generated yet are held back — the
  // illustration is what she gets for reading it. See `pnpm media:ready`.
  const ready = tier.filter((w) => hasImage(w));
  const pool = ready.length > 0 ? ready : tier;
  const filtered = pool.filter((w) => !recent.includes(w.word));
  const candidates = filtered.length > 0 ? filtered : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function hasImage(word: PhonicsWord): boolean {
  return READY_WORD_IMAGES.has(word.word.toLowerCase());
}
