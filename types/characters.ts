export interface Character {
  id: string;
  name: string;
  imageUrl: string;
  franchise: string;
  coloringPages?: string[]; // Array of image paths for coloring
  isSecret?: boolean;
}

export const characters: Character[] = [
  // Avatar: The Last Airbender
  {
    id: "aang",
    name: "AANG",
    imageUrl: "/images/characters/aang.webp",
    franchise: "Avatar: The Last Airbender",
    coloringPages: [
      "/images/coloring/aang1.webp",
      "/images/coloring/aang2.webp",
      "/images/coloring/aang3.webp",
      "/images/coloring/aang4.webp",
    ],
  },
  {
    id: "katara",
    name: "KATARA",
    imageUrl: "/images/characters/katara.webp",
    franchise: "Avatar: The Last Airbender",
    coloringPages: [
      "/images/coloring/katara1.webp",
      "/images/coloring/katara2.webp",
      "/images/coloring/katara3.webp",
      "/images/coloring/katara4.webp",
    ],
  },
  {
    id: "sokka",
    name: "SOKKA",
    imageUrl: "/images/characters/sokka.webp",
    franchise: "Avatar: The Last Airbender",
    coloringPages: [
      "/images/coloring/sokka1.webp",
      "/images/coloring/sokka2.webp",
      "/images/coloring/sokka3.webp",
      "/images/coloring/sokka4.webp",
    ],
  },
  {
    id: "toph",
    name: "TOPH",
    imageUrl: "/images/characters/toph.webp",
    franchise: "Avatar: The Last Airbender",
    coloringPages: [
      "/images/coloring/toph1.webp",
      "/images/coloring/toph2.webp",
      "/images/coloring/toph3.webp",
      "/images/coloring/toph4.webp",
    ],
  },
  // My Little Pony
  {
    id: "fluttershy",
    name: "FLUTTERSHY",
    imageUrl: "/images/characters/fluttershy.webp",
    franchise: "My Little Pony",
    coloringPages: [
      "/images/coloring/fluttershy1.webp",
      "/images/coloring/fluttershy2.webp",
      "/images/coloring/fluttershy3.webp",
      "/images/coloring/fluttershy4.webp",
    ],
  },
  {
    id: "rainbowdash",
    name: "RAINBOW DASH",
    imageUrl: "/images/characters/rainbowdash.webp",
    franchise: "My Little Pony",
    coloringPages: [
      "/images/coloring/rainbowdash1.webp",
      "/images/coloring/rainbowdash2.webp",
      "/images/coloring/rainbowdash3.webp",
      "/images/coloring/rainbowdash4.webp",
    ],
  },
  // Zootopia
  {
    id: "judy",
    name: "JUDY",
    imageUrl: "/images/characters/judy.webp",
    franchise: "Zootopia",
    coloringPages: [
      "/images/coloring/judy1.webp",
      "/images/coloring/judy2.webp",
      "/images/coloring/judy3.webp",
      "/images/coloring/judy4.webp",
    ],
  },
  {
    id: "nick",
    name: "NICK",
    imageUrl: "/images/characters/nick.webp",
    franchise: "Zootopia",
    coloringPages: [
      "/images/coloring/nick1.webp",
      "/images/coloring/nick2.webp",
      "/images/coloring/nick3.webp",
      "/images/coloring/nick4.webp",
    ],
  },
  // Ratatouille
  {
    id: "ratatouille",
    name: "RATATOUILLE",
    imageUrl: "/images/characters/ratatouille.webp",
    franchise: "Ratatouille",
    coloringPages: [
      "/images/coloring/ratatouille1.webp",
      "/images/coloring/ratatouille2.webp",
      "/images/coloring/ratatouille3.webp",
      "/images/coloring/ratatouille4.webp",
    ],
  },
  // Moana
  {
    id: "moana",
    name: "MOANA",
    imageUrl: "/images/characters/moana.webp",
    franchise: "Moana",
    coloringPages: [
      "/images/coloring/moana1.webp",
      "/images/coloring/moana2.webp",
      "/images/coloring/moana3.webp",
      "/images/coloring/moana4.webp",
    ],
  },
  {
    id: "maui",
    name: "MAUI",
    imageUrl: "/images/characters/maui.webp",
    franchise: "Moana",
    coloringPages: [
      "/images/coloring/maui1.webp",
      "/images/coloring/maui2.webp",
      "/images/coloring/maui3.webp",
      "/images/coloring/maui4.webp",
    ],
  },
  // Frozen
  {
    id: "elsa",
    name: "ELSA",
    imageUrl: "/images/characters/elsa.webp",
    franchise: "Frozen",
    coloringPages: [
      "/images/coloring/elsa1.webp",
      "/images/coloring/elsa2.webp",
      "/images/coloring/elsa3.webp",
      "/images/coloring/elsa4.webp",
    ],
  },
  {
    id: "madeleine",
    name: "MADELEINE",
    imageUrl: "/images/characters/madeleine.webp",
    franchise: "Original",
    coloringPages: [
      "/images/coloring/madeleine1.webp",
      "/images/coloring/madeleine2.webp",
      "/images/coloring/madeleine3.webp",
      "/images/coloring/madeleine4.webp",
    ],
  },
  {
    id: "anna",
    name: "ANNA",
    imageUrl: "/images/characters/anna.webp",
    franchise: "Frozen",
    coloringPages: [
      "/images/coloring/anna1.webp",
      "/images/coloring/anna2.webp",
      "/images/coloring/anna3.webp",
      "/images/coloring/anna4.webp",
    ],
  },
  // Tangled
  {
    id: "rapunzel",
    name: "RAPUNZEL",
    imageUrl: "/images/characters/rapunzel.webp",
    franchise: "Tangled",
    coloringPages: [
      "/images/coloring/rapunzel1.webp",
      "/images/coloring/rapunzel2.webp",
      "/images/coloring/rapunzel3.webp",
      "/images/coloring/rapunzel4.webp",
    ],
  },
  {
    id: "eugene",
    name: "EUGENE",
    imageUrl: "/images/characters/eugene.webp",
    franchise: "Tangled",
    coloringPages: [
      "/images/coloring/eugene1.webp",
      "/images/coloring/eugene2.webp",
      "/images/coloring/eugene3.webp",
      "/images/coloring/eugene4.webp",
    ],
  },
  // Brave
  {
    id: "merida",
    name: "MERIDA",
    imageUrl: "/images/characters/merida.webp",
    franchise: "Brave",
    coloringPages: [
      "/images/coloring/merida1.webp",
      "/images/coloring/merida2.webp",
      "/images/coloring/merida3.webp",
      "/images/coloring/merida4.webp",
    ],
  },
  // Mario
  {
    id: "mario",
    name: "MARIO",
    imageUrl: "/images/characters/mario.webp",
    franchise: "Nintendo",
    coloringPages: [
      "/images/coloring/mario1.webp",
      "/images/coloring/mario2.webp",
      "/images/coloring/mario3.webp",
      "/images/coloring/mario4.webp",
    ],
  },
  {
    id: "luigi",
    name: "LUIGI",
    imageUrl: "/images/characters/luigi.webp",
    franchise: "Nintendo",
    coloringPages: [
      "/images/coloring/luigi1.webp",
      "/images/coloring/luigi2.webp",
      "/images/coloring/luigi3.webp",
      "/images/coloring/luigi4.webp",
    ],
  },
  {
    id: "pingu",
    name: "PINGU",
    imageUrl: "/images/characters/pingu.webp",
    franchise: "Pingu",
    coloringPages: [
      "/images/coloring/pingu1.webp",
      "/images/coloring/pingu2.webp",
      "/images/coloring/pingu3.webp",
      "/images/coloring/pingu4.webp",
    ],
  },
  {
    id: "peach",
    name: "PEACH",
    imageUrl: "/images/characters/peach.webp",
    franchise: "Nintendo",
    coloringPages: [
      "/images/coloring/peach1.webp",
      "/images/coloring/peach2.webp",
      "/images/coloring/peach3.webp",
      "/images/coloring/peach4.webp",
    ],
  },
  // Zelda
  {
    id: "link",
    name: "LINK",
    imageUrl: "/images/characters/link.webp",
    franchise: "Nintendo",
    coloringPages: [
      "/images/coloring/link1.webp",
      "/images/coloring/link2.webp",
      "/images/coloring/link3.webp",
      "/images/coloring/link4.webp",
    ],
  },
  {
    id: "zelda",
    name: "ZELDA",
    imageUrl: "/images/characters/zelda.webp",
    franchise: "Nintendo",
    coloringPages: [
      "/images/coloring/zelda1.webp",
      "/images/coloring/zelda2.webp",
      "/images/coloring/zelda3.webp",
      "/images/coloring/zelda4.webp",
    ],
  },
  // Beauty and the Beast
  {
    id: "belle",
    name: "BELLE",
    imageUrl: "/images/characters/belle.webp",
    franchise: "Beauty and the Beast",
    coloringPages: [
      "/images/coloring/belle1.webp",
      "/images/coloring/belle2.webp",
      "/images/coloring/belle3.webp",
      "/images/coloring/belle4.webp",
    ],
  },
  // Pocahontas
  {
    id: "pocahontas",
    name: "POCAHONTAS",
    imageUrl: "/images/characters/pocahontas.webp",
    franchise: "Pocahontas",
    coloringPages: [
      "/images/coloring/pocahontas1.webp",
      "/images/coloring/pocahontas2.webp",
      "/images/coloring/pocahontas3.webp",
      "/images/coloring/pocahontas4.webp",
    ],
  },
  // Rosalina
  {
    id: "rosalina",
    name: "ROSALINA",
    imageUrl: "/images/characters/rosalina.webp",
    franchise: "Nintendo",
    coloringPages: [
      "/images/coloring/rosalina1.webp",
      "/images/coloring/rosalina2.webp",
      "/images/coloring/rosalina3.webp",
      "/images/coloring/rosalina4.webp",
    ],
  },
  // Tiana
  {
    id: "tiana",
    name: "TIANA",
    imageUrl: "/images/characters/tiana.webp",
    franchise: "The Princess and the Frog",
    coloringPages: [
      "/images/coloring/tiana1.webp",
      "/images/coloring/tiana2.webp",
      "/images/coloring/tiana3.webp",
      "/images/coloring/tiana4.webp",
    ],
  },
  // Cinderella
  {
    id: "cinderella",
    name: "CINDERELLA",
    imageUrl: "/images/characters/cinderella.webp",
    franchise: "Cinderella",
    coloringPages: [
      "/images/coloring/cinderella1.webp",
      "/images/coloring/cinderella2.webp",
      "/images/coloring/cinderella3.webp",
      "/images/coloring/cinderella4.webp",
    ],
  },
  // Jasmine
  {
    id: "jasmine",
    name: "JASMINE",
    imageUrl: "/images/characters/jasmine.webp",
    franchise: "Aladdin",
    coloringPages: [
      "/images/coloring/jasmine1.webp",
      "/images/coloring/jasmine2.webp",
      "/images/coloring/jasmine3.webp",
      "/images/coloring/jasmine4.webp",
    ],
  },
  // Snow White
  {
    id: "snowwhite",
    name: "SNOW WHITE",
    imageUrl: "/images/characters/snowwhite.webp",
    franchise: "Snow White and the Seven Dwarfs",
    coloringPages: [
      "/images/coloring/snowwhite1.webp",
      "/images/coloring/snowwhite2.webp",
      "/images/coloring/snowwhite3.webp",
      "/images/coloring/snowwhite4.webp",
    ],
  },
  // Daisy
  {
    id: "daisy",
    name: "DAISY",
    imageUrl: "/images/characters/daisy.webp",
    franchise: "Nintendo",
    coloringPages: [
      "/images/coloring/daisy1.webp",
      "/images/coloring/daisy2.webp",
      "/images/coloring/daisy3.webp",
      "/images/coloring/daisy4.webp",
    ],
  },
  // Bluey
  {
    id: "bluey",
    name: "BLUEY",
    imageUrl: "/images/characters/bluey.webp",
    franchise: "Bluey",
    coloringPages: [
      "/images/coloring/bluey1.webp",
      "/images/coloring/bluey2.webp",
      "/images/coloring/bluey3.webp",
      "/images/coloring/bluey4.webp",
    ],
  },
  // Bingo
  {
    id: "bingo",
    name: "BINGO",
    imageUrl: "/images/characters/bingo.webp",
    franchise: "Bluey",
    coloringPages: [
      "/images/coloring/bingo1.webp",
      "/images/coloring/bingo2.webp",
      "/images/coloring/bingo3.webp",
      "/images/coloring/bingo4.webp",
    ],
  },
  // Pokemon
  {
    id: "snorlax",
    name: "SNORLAX",
    imageUrl: "/images/characters/snorlax.webp",
    franchise: "Pokemon",
    coloringPages: [
      "/images/coloring/snorlax1.webp",
      "/images/coloring/snorlax2.webp",
      "/images/coloring/snorlax3.webp",
      "/images/coloring/snorlax4.webp",
    ],
  },
  {
    id: "pikachu",
    name: "PIKACHU",
    imageUrl: "/images/characters/pikachu.webp",
    franchise: "Pokemon",
    coloringPages: [
      "/images/coloring/pikachu1.webp",
      "/images/coloring/pikachu2.webp",
      "/images/coloring/pikachu3.webp",
      "/images/coloring/pikachu4.webp",
    ],
  },
  {
    id: "charmander",
    name: "CHARMANDER",
    imageUrl: "/images/characters/charmander.webp",
    franchise: "Pokemon",
    coloringPages: [
      "/images/coloring/charmander1.webp",
      "/images/coloring/charmander2.webp",
      "/images/coloring/charmander3.webp",
      "/images/coloring/charmander4.webp",
    ],
  },
  {
    id: "bulbasaur",
    name: "BULBASAUR",
    imageUrl: "/images/characters/bulbasaur.webp",
    franchise: "Pokemon",
    coloringPages: [
      "/images/coloring/bulbasaur1.webp",
      "/images/coloring/bulbasaur2.webp",
      "/images/coloring/bulbasaur3.webp",
      "/images/coloring/bulbasaur4.webp",
    ],
  },
  {
    id: "squirtle",
    name: "SQUIRTLE",
    imageUrl: "/images/characters/squirtle.webp",
    franchise: "Pokemon",
    coloringPages: [
      "/images/coloring/squirtle1.webp",
      "/images/coloring/squirtle2.webp",
      "/images/coloring/squirtle3.webp",
      "/images/coloring/squirtle4.webp",
    ],
  },
  // Harry Potter
  {
    id: "harry-potter",
    name: "HARRY POTTER",
    imageUrl: "/images/characters/harry-potter.webp",
    franchise: "Harry Potter",
    coloringPages: [
      "/images/coloring/harry-potter1.webp",
      "/images/coloring/harry-potter2.webp",
      "/images/coloring/harry-potter3.webp",
      "/images/coloring/harry-potter4.webp",
    ],
  },
  // Ron Weasley
  {
    id: "ron-weasley",
    name: "RON WEASLEY",
    imageUrl: "/images/characters/ron-weasley.webp",
    franchise: "Harry Potter",
    coloringPages: [
      "/images/coloring/ron-weasley1.webp",
      "/images/coloring/ron-weasley2.webp",
      "/images/coloring/ron-weasley3.webp",
      "/images/coloring/ron-weasley4.webp",
    ],
  },
  // Hermione Granger
  {
    id: "hermione-granger",
    name: "HERMIONE GRANGER",
    imageUrl: "/images/characters/hermione-granger.webp",
    franchise: "Harry Potter",
    coloringPages: [
      "/images/coloring/hermione-granger1.webp",
      "/images/coloring/hermione-granger2.webp",
      "/images/coloring/hermione-granger3.webp",
      "/images/coloring/hermione-granger4.webp",
    ],
  },
  // Hagrid
  {
    id: "hagrid",
    name: "HAGRID",
    imageUrl: "/images/characters/hagrid.webp",
    franchise: "Harry Potter",
    coloringPages: [
      "/images/coloring/hagrid1.webp",
      "/images/coloring/hagrid2.webp",
      "/images/coloring/hagrid3.webp",
      "/images/coloring/hagrid4.webp",
    ],
  },
  // Hedwig
  {
    id: "hedwig",
    name: "HEDWIG",
    imageUrl: "/images/characters/hedwig.webp",
    franchise: "Harry Potter",
    coloringPages: [
      "/images/coloring/hedwig1.webp",
      "/images/coloring/hedwig2.webp",
      "/images/coloring/hedwig3.webp",
      "/images/coloring/hedwig4.webp",
    ],
  },
  // Rumi
  {
    id: "rumi",
    name: "RUMI",
    imageUrl: "/images/characters/rumi.webp",
    franchise: "KPop Demon Hunters",
    coloringPages: [
      "/images/coloring/rumi1.webp",
      "/images/coloring/rumi2.webp",
      "/images/coloring/rumi3.webp",
      "/images/coloring/rumi4.webp",
    ],
  },
  // Mira
  {
    id: "mira",
    name: "MIRA",
    imageUrl: "/images/characters/mira.webp",
    franchise: "KPop Demon Hunters",
    coloringPages: [
      "/images/coloring/mira1.webp",
      "/images/coloring/mira2.webp",
      "/images/coloring/mira3.webp",
      "/images/coloring/mira4.webp",
    ],
  },
  // Zoey
  {
    id: "zoey",
    name: "ZOEY",
    imageUrl: "/images/characters/zoey.webp",
    franchise: "KPop Demon Hunters",
    coloringPages: [
      "/images/coloring/zoey1.webp",
      "/images/coloring/zoey2.webp",
      "/images/coloring/zoey3.webp",
      "/images/coloring/zoey4.webp",
    ],
  },
  // Beep
  {
    id: "beep",
    name: "BEEP",
    imageUrl: "/images/characters/beep.webp",
    franchise: "StoryBots",
    coloringPages: [
      "/images/coloring/beep1.webp",
      "/images/coloring/beep2.webp",
      "/images/coloring/beep3.webp",
      "/images/coloring/beep4.webp",
    ],
  },
  // Boop
  {
    id: "boop",
    name: "BOOP",
    imageUrl: "/images/characters/boop.webp",
    franchise: "StoryBots",
    coloringPages: [
      "/images/coloring/boop1.webp",
      "/images/coloring/boop2.webp",
      "/images/coloring/boop3.webp",
      "/images/coloring/boop4.webp",
    ],
  },
  // Bing
  {
    id: "bing",
    name: "BING",
    imageUrl: "/images/characters/bing.webp",
    franchise: "StoryBots",
    coloringPages: [
      "/images/coloring/bing1.webp",
      "/images/coloring/bing2.webp",
      "/images/coloring/bing3.webp",
      "/images/coloring/bing4.webp",
    ],
  },
  // Bang
  {
    id: "bang",
    name: "BANG",
    imageUrl: "/images/characters/bang.webp",
    franchise: "StoryBots",
    coloringPages: [
      "/images/coloring/bang1.webp",
      "/images/coloring/bang2.webp",
      "/images/coloring/bang3.webp",
      "/images/coloring/bang4.webp",
    ],
  },
  // Bo
  {
    id: "bo",
    name: "BO",
    imageUrl: "/images/characters/bo.webp",
    franchise: "StoryBots",
    coloringPages: [
      "/images/coloring/bo1.webp",
      "/images/coloring/bo2.webp",
      "/images/coloring/bo3.webp",
      "/images/coloring/bo4.webp",
    ],
  },
  // Totoro
  {
    id: "totoro",
    name: "TOTORO",
    imageUrl: "/images/characters/totoro.webp",
    franchise: "My Neighbor Totoro",
    coloringPages: [
      "/images/coloring/totoro1.webp",
      "/images/coloring/totoro2.webp",
      "/images/coloring/totoro3.webp",
      "/images/coloring/totoro4.webp",
    ],
  },
  // Satsuki
  {
    id: "satsuki",
    name: "SATSUKI",
    imageUrl: "/images/characters/satsuki.webp",
    franchise: "My Neighbor Totoro",
    coloringPages: [
      "/images/coloring/satsuki1.webp",
      "/images/coloring/satsuki2.webp",
      "/images/coloring/satsuki3.webp",
      "/images/coloring/satsuki4.webp",
    ],
  },
  // Mei
  {
    id: "mei",
    name: "MEI",
    imageUrl: "/images/characters/mei.webp",
    franchise: "My Neighbor Totoro",
    coloringPages: [
      "/images/coloring/mei1.webp",
      "/images/coloring/mei2.webp",
      "/images/coloring/mei3.webp",
      "/images/coloring/mei4.webp",
    ],
  },
  // Catbus
  {
    id: "catbus",
    name: "CATBUS",
    imageUrl: "/images/characters/catbus.webp",
    franchise: "My Neighbor Totoro",
    coloringPages: [
      "/images/coloring/catbus1.webp",
      "/images/coloring/catbus2.webp",
      "/images/coloring/catbus3.webp",
      "/images/coloring/catbus4.webp",
    ],
  },
  // Kiki
  {
    id: "kiki",
    name: "KIKI",
    imageUrl: "/images/characters/kiki.webp",
    franchise: "Kiki's Delivery Service",
    coloringPages: [
      "/images/coloring/kiki1.webp",
      "/images/coloring/kiki2.webp",
      "/images/coloring/kiki3.webp",
      "/images/coloring/kiki4.webp",
    ],
  },
  // Jiji
  {
    id: "jiji",
    name: "JIJI",
    imageUrl: "/images/characters/jiji.webp",
    franchise: "Kiki's Delivery Service",
    coloringPages: [
      "/images/coloring/jiji1.webp",
      "/images/coloring/jiji2.webp",
      "/images/coloring/jiji3.webp",
      "/images/coloring/jiji4.webp",
    ],
  },
  // Tombo
  {
    id: "tombo",
    name: "TOMBO",
    imageUrl: "/images/characters/tombo.webp",
    franchise: "Kiki's Delivery Service",
    coloringPages: [
      "/images/coloring/tombo1.webp",
      "/images/coloring/tombo2.webp",
      "/images/coloring/tombo3.webp",
      "/images/coloring/tombo4.webp",
    ],
  },
  // Bloom
  {
    id: "bloom",
    name: "BLOOM",
    imageUrl: "/images/characters/bloom.webp",
    franchise: "Winx Club",
    coloringPages: [
      "/images/coloring/bloom1.webp",
      "/images/coloring/bloom2.webp",
      "/images/coloring/bloom3.webp",
      "/images/coloring/bloom4.webp",
    ],
  },
  // Stella
  {
    id: "stella",
    name: "STELLA",
    imageUrl: "/images/characters/stella.webp",
    franchise: "Winx Club",
    coloringPages: [
      "/images/coloring/stella1.webp",
      "/images/coloring/stella2.webp",
      "/images/coloring/stella3.webp",
      "/images/coloring/stella4.webp",
    ],
  },
  // Flora
  {
    id: "flora",
    name: "FLORA",
    imageUrl: "/images/characters/flora.webp",
    franchise: "Winx Club",
    coloringPages: [
      "/images/coloring/flora1.webp",
      "/images/coloring/flora2.webp",
      "/images/coloring/flora3.webp",
      "/images/coloring/flora4.webp",
    ],
  },
  // Musa
  {
    id: "musa",
    name: "MUSA",
    imageUrl: "/images/characters/musa.webp",
    franchise: "Winx Club",
    coloringPages: [
      "/images/coloring/musa1.webp",
      "/images/coloring/musa2.webp",
      "/images/coloring/musa3.webp",
      "/images/coloring/musa4.webp",
    ],
  },
  // Tecna
  {
    id: "tecna",
    name: "TECNA",
    imageUrl: "/images/characters/tecna.webp",
    franchise: "Winx Club",
    coloringPages: [
      "/images/coloring/tecna1.webp",
      "/images/coloring/tecna2.webp",
      "/images/coloring/tecna3.webp",
      "/images/coloring/tecna4.webp",
    ],
  },
  // Aisha
  {
    id: "aisha",
    name: "AISHA",
    imageUrl: "/images/characters/aisha.webp",
    franchise: "Winx Club",
    coloringPages: [
      "/images/coloring/aisha1.webp",
      "/images/coloring/aisha2.webp",
      "/images/coloring/aisha3.webp",
      "/images/coloring/aisha4.webp",
    ],
  },
];

export const secretCharacters: Character[] = [
  {
    id: "papa",
    name: "PAPA",
    imageUrl: "/images/characters/question-mark.webp",
    franchise: "Family",
    isSecret: true,
    coloringPages: [
      "/images/coloring/papa1.webp",
      "/images/coloring/papa2.webp",
      "/images/coloring/papa3.webp",
      "/images/coloring/papa4.webp",
    ],
  },
  {
    id: "mama",
    name: "MAMA",
    imageUrl: "/images/characters/question-mark.webp",
    franchise: "Family",
    isSecret: true,
    coloringPages: [
      "/images/coloring/mama1.webp",
      "/images/coloring/mama2.webp",
      "/images/coloring/mama3.webp",
      "/images/coloring/mama4.webp",
    ],
  },
];
