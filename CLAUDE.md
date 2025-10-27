# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Madeleine's Learning Games" - an educational web application for children built with Next.js 15.1.7 and TypeScript. The app features interactive games for character recognition, writing practice, coloring pages, and basic math.

## Essential Commands

```bash
# Development
npm run dev      # Start development server with Turbopack (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint

# Common development tasks
npm install      # Install dependencies after cloning or when package.json changes
```

## Utility Toolkit

The project includes a comprehensive CLI toolkit for managing vocabulary and generating media:

### Vocabulary Management

```bash
# Add a new vocabulary word
npm run vocab:add -- -e "house" -f "maison" -i "casa" -c "house" -p "cozy house illustration"

# Update an existing word
npm run vocab:update -- fam_5 -f "mamie" --regenerate-audio
# Example: Replace "grand-mère" with "mamie" and regenerate French audio

# Replace text across all vocabulary
npm run vocab:replace -- "grand-mère" "mamie" -l fr
# This updates the text and regenerates audio automatically

# Delete a word and its media
npm run vocab:delete -- fam_5

# Search for words
npm run vocab:find -- "family"

# List vocabulary by category
npm run vocab:list -- -c family

# Regenerate media for a specific word
npm run vocab:regenerate -- fam_5 -t all  # Options: image, audio, all
```

### Media Generation

```bash
# Generate a standalone image
npm run media:image -- "colorful app icon with books" output/icon.webp -w 1024 -h 1024

# Generate text-to-speech audio
npm run media:tts -- "Hello world" output/hello.mp3 -l en

# Generate app icons in multiple sizes
npm run media:app-icon -- "educational app with rainbow" output/icons/
```

### Batch Operations

```bash
# Regenerate all vocabulary images
npm run batch:images -- -c animals  # Filter by category
npm run batch:images -- -s 50       # Start from index 50

# Regenerate all vocabulary audio
npm run batch:audio -- -c greetings -l fr  # French audio for greetings category
```

### YouTube Video Management

```bash
# Search YouTube and add videos to a category
npm run youtube:search -- "Unicorn drawing tutorial" --category drawing --top 3

# Import all videos from a YouTube playlist
npm run youtube:import-playlist -- "https://www.youtube.com/playlist?list=PLAYLIST_ID" --category yoga
npm run youtube:import-playlist -- "PLAYLIST_ID" --category drawing  # Playlist ID also works

# List all videos in a category
npm run youtube:list -- --category yoga
npm run youtube:list  # List all categories with video counts

# List available categories
npm run youtube:categories

# Example: Add Butterfree drawing tutorials for kids
npm run youtube:search -- "how to draw Butterfree pokemon for kids" --category drawing --top 5
npm run youtube:search -- "easy Butterfree drawing tutorial" --category drawing --top 3
```

### Using the Main CLI

```bash
# Access the full CLI with all commands
npm run cli -- vocab add -e "test" -f "test" -i "prova" -c "objects"
npm run cli -- media image "prompt" output.webp
npm run cli -- batch regenerate-images
```

### Configuration

The toolkit uses the following configuration:
- **API Keys**: Set `GEMINI_KEY` in `.env` for image generation and YouTube API access
- **Google Cloud**: Configure `gcloud` CLI for TTS generation
- **Voice Models**: Journey voices for English/Italian, Wavenet for French
- **Rate Limits**: Automatic rate limiting and batch processing
- **File Formats**: WebP for images (512x512), MP3 for audio
- **YouTube**: The GEMINI_KEY is also used for YouTube Data API v3 access

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.1.7 with App Router
- **Language**: TypeScript with strict mode
- **UI**: React 19.0.0 with CSS Modules
- **Key Libraries**: 
  - `lucide-react` for icons
  - `howler` for audio playback
  - `canvas-confetti` for celebration effects

### Application Structure

The app follows Next.js App Router conventions:

- **app/** - Page routes and layouts
  - Each game has its own route under `app/games/`
  - Uses `layout.tsx` for shared layout with header navigation
  
- **components/** - Reusable React components
  - Game-specific components (MathGame, TypingInterface)
  - Shared components (Countdown, LockProtection)
  
- **types/** - TypeScript interfaces
  - Centralized type definitions for games, characters, math problems

- **public/** - Static assets
  - `/images/characters/` - Character portraits (webp format)
  - `/images/coloring/` - Coloring pages (4 per character)
  - `/sounds/alphabet/` - Letter pronunciation audio files

### Key Architectural Patterns

1. **Game State Management**: Each game component manages its own state with React hooks
2. **Audio System**: Centralized audio playback using Howler.js for success/failure sounds
3. **Visual Feedback**: Consistent use of canvas-confetti for celebrations
4. **Progress Tracking**: Uses localStorage for persistence (e.g., unlocked characters)
5. **Child Safety**: LockProtection component for parental controls

### Data Structure

Characters are organized by franchise in `types/characters.ts`:
- Disney Princesses
- Pokémon
- Avatar: The Last Airbender
- Nintendo (Mario series)
- Educational shows (Bluey, Curious George, etc.)

Each character has:
- `id`: Unique identifier matching image filenames
- `name`: Display name
- `locked`: Boolean for unlock progression

### Adding New Features

When adding new games or characters:
1. Add character data to `types/characters.ts`
2. Place images in appropriate `/public/images/` subdirectories
3. Create game component in `/components/`
4. Add route in `/app/games/[game-name]/`
5. Update navigation in `app/layout.tsx`
6. Follow existing CSS Module patterns for styling

### Adding New Characters

There's a helper script to quickly scaffold new characters:

```bash
# Usage: ./copy_blank_images.sh <character_name> [franchise_name]
./copy_blank_images.sh pikachu Pokemon
./copy_blank_images.sh elsa Disney  # Franchise defaults to "Misc" if not provided
```

This script will:
- Create a character portrait at `/public/images/characters/[name].webp`
- Create 4 coloring pages at `/public/images/coloring/[name]1-4.webp`
- Add the character entry to `types/characters.ts` with proper structure
- All images are placeholder blanks that should be replaced with actual images