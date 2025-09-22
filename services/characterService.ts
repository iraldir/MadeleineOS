import { Character, characters, secretCharacters } from '@/types/characters';

class CharacterService {
  private static instance: CharacterService;
  private readonly characterOrder: string[] = [
    'elsa', 'anna', 'moana', 'belle', 'aurora',
    'luigi', 'peach', 'yoshi', 'bowser', 'toad',
    'blastoise', 'venusaur', 'charizard', 'sylveon', 'meowth',
    'pikachu', 'charmander', 'bulbasaur', 'squirtle', 'jigglypuff',
    'aang', 'katara', 'sokka', 'toph', 'zuko',
    'spongebob', 'patrick', 'squidward', 'sandy', 'gary',
    'bluey', 'bingo', 'chili', 'bandit', 'muffin',
    'george', 'peppa', 'rebecca', 'danny', 'suzy',
    'zelda', 'link', 'ganon', 'midna', 'zelda2',
    'pingu', 'robby', 'pinga', 'mama', 'papa'
  ];

  private allCharacters: Map<string, Character> = new Map();

  private constructor() {
    this.initializeCharacters();
  }

  public static getInstance(): CharacterService {
    if (!CharacterService.instance) {
      CharacterService.instance = new CharacterService();
    }
    return CharacterService.instance;
  }

  private initializeCharacters(): void {
    // Add regular characters
    characters.forEach(char => {
      this.allCharacters.set(char.id, char);
    });

    // Add secret characters
    secretCharacters.forEach(char => {
      this.allCharacters.set(char.id, char);
    });
  }

  public getCharacterOrder(): string[] {
    return [...this.characterOrder];
  }

  public getCharacterById(id: string): Character | undefined {
    return this.allCharacters.get(id);
  }

  public getCharactersByFranchise(franchise: string): Character[] {
    return Array.from(this.allCharacters.values()).filter(
      char => char.franchise === franchise
    );
  }

  public getAllCharacters(includeSecret: boolean = false): Character[] {
    if (includeSecret) {
      return Array.from(this.allCharacters.values());
    }
    return characters;
  }

  public getOrderedCharacters(includeSecret: boolean = false): Character[] {
    const chars = this.getAllCharacters(includeSecret);
    const orderedChars: Character[] = [];
    
    // First add characters in the specified order
    this.characterOrder.forEach(id => {
      const char = chars.find(c => c.id === id);
      if (char) {
        orderedChars.push(char);
      }
    });

    // Then add any remaining characters not in the order
    chars.forEach(char => {
      if (!this.characterOrder.includes(char.id)) {
        orderedChars.push(char);
      }
    });

    return orderedChars;
  }

  public getRandomCharacter(excludeIds?: string[]): Character | null {
    const availableChars = characters.filter(
      char => !excludeIds?.includes(char.id)
    );
    
    if (availableChars.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * availableChars.length);
    return availableChars[randomIndex];
  }

  public getCharacterImageUrl(characterId: string): string {
    const character = this.getCharacterById(characterId);
    return character?.imageUrl || `/images/characters/${characterId}.webp`;
  }

  public getColoringPages(characterId: string): string[] {
    return [1, 2, 3, 4].map(num => `/images/coloring/${characterId}${num}.webp`);
  }

  public getFranchises(): string[] {
    const franchises = new Set<string>();
    this.allCharacters.forEach(char => {
      franchises.add(char.franchise);
    });
    return Array.from(franchises).sort();
  }

  public searchCharacters(query: string): Character[] {
    const lowerQuery = query.toLowerCase();
    return characters.filter(char => 
      char.name.toLowerCase().includes(lowerQuery) ||
      char.franchise.toLowerCase().includes(lowerQuery)
    );
  }

  public getCharacterIndex(characterId: string): number {
    return this.characterOrder.indexOf(characterId);
  }

  public getNextCharacter(currentId: string): Character | null {
    const currentIndex = this.getCharacterIndex(currentId);
    if (currentIndex === -1 || currentIndex === this.characterOrder.length - 1) {
      return null;
    }
    const nextId = this.characterOrder[currentIndex + 1];
    return this.getCharacterById(nextId) || null;
  }

  public getPreviousCharacter(currentId: string): Character | null {
    const currentIndex = this.getCharacterIndex(currentId);
    if (currentIndex <= 0) {
      return null;
    }
    const prevId = this.characterOrder[currentIndex - 1];
    return this.getCharacterById(prevId) || null;
  }

  public validateCharacterExists(characterId: string): boolean {
    return this.allCharacters.has(characterId);
  }
}

export const characterService = CharacterService.getInstance();