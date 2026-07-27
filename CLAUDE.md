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

### Adding Characters from Google/Web Images (agent workflow)

When the user says "Add <character>" (e.g. "Add Ron Weasley"), follow this pipeline. It sources real images from the web (DuckDuckGo image search — full-res URLs, no captchas), lets Claude pick candidates visually, and installs them in the game's formats.

```bash
# 1. Search: fetches 25 candidates each for the character portrait and for
#    printable coloring pages. Produces numbered contact sheets.
npm run char:search -- "Ron Weasley"
# Optional: --type thumbnail|coloring|both, -n <count>,
#           --thumbnail-query / --coloring-query to override the default queries
#           ("<name> character" and "<name> coloring page printable")

# 2. Review: Read these PNGs with vision and choose candidates by number.
#    .character-search/<slug>/thumbnail/sheet.png
#    .character-search/<slug>/coloring/sheet.png
#    Portrait: pick an image whose subject survives a 2:1 landscape cover-crop
#    (face-aware). For full-body art of tall/skinny characters on a plain
#    background, the crop WILL decapitate them — use --portrait-fit contain
#    (letterbox on white) in step 3 instead. If the auto-crop frames the face
#    poorly (off-center, clipped), view the original at full size and set the
#    window yourself with --portrait-crop "left,top,width" (source pixels,
#    height = width/2). Coloring: prefer high resolution
#    (printed on A4), no watermarks. Detailed/fine-lined pages are fine —
#    Madeleine punches above her age in colouring; favour a mix of simple
#    and detailed over all-chibi.
#    ALWAYS verify the final portraits in the running app (screenshot
#    /games/character-list) — crops can look fine in preview and wrong in situ.

# 3. Pick: downloads full-res, converts to game formats, stages a preview.
npm run char:pick -- "Ron Weasley" --thumbnail 2 --coloring 7,9,10,14
#    --lineart <n,n> optionally runs colour images through experimental
#    edge-detection line-art conversion (prefer real coloring pages).
#    Review .character-search/<slug>/selected/preview.png, then show the user
#    the preview and WAIT for their approval before installing.

# 4. Install (only after user approval): copies images into public/images/
#    and appends the character entry to types/characters.ts.
npm run char:install -- "Ron Weasley" --franchise "Harry Potter"
```

Formats produced: portrait 1024x512 webp (cover-crop, attention positioning), coloring pages 2480x3508 webp (A4, contained on white). Staging lives in `.character-search/` (gitignored). Implementation: `scripts/utils/character-search.ts`.

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

### Solar System Games (3D)

Two games share the planet data in `types/planets.ts`:

- `/games/solar-system` — `components/SolarSystem3D.tsx`, a three.js scene of the Sun and
  eight planets, with a strip of illustrated planet cards along the bottom. Clicking a
  planet — in the scene or on its card — flies the camera to it, keeps following it along
  its orbit, speaks its name, shows the name large in the top left, and hides every other
  planet (the Sun stays) so there is nothing else to look at. The app's back button
  returns to the whole system first, and only leaves the game on a second press.
- `/games/planet-quiz` — "which planet is this?", built on `components/PlanetSphere.tsx`,
  a small reusable spinning-planet canvas.

`components/planetShaders.ts` holds the hand-written materials. They all assume the Sun
sits at the world origin, which lets them solve lighting analytically instead of using
shadow maps:
- **Earth** — day map, city lights on the night side, ocean glint, normal-mapped relief,
  and the cloud layer shadowing the ground beneath it.
- **Sun** — two copies of the photosphere drifting across each other so it churns, with
  limb darkening; it renders above 1.0 so the bloom pass catches it.
- **Saturn** — the planet's shadow falls across the rings, and the rings' shadow falls
  across the planet, both by ray-tracing to the ring plane. Uranus uses the same path
  with a hand-painted thin ring texture (`makeThinRingTexture`); because it lies on its
  side, its rings stand up almost vertically.

There is deliberately **no atmosphere/limb glow** — it read as a coloured border drawn
around each planet rather than as air.

Both the overview framing and the framing when visiting a planet are solved by
**projecting sample points and bisecting the camera distance**, not by trigonometry:
perspective magnifies whichever edge is nearest, so an analytic fit crops Saturn's rings
and leaves the overview half empty. The overview fits Neptune's orbit across the width
only — the near edge of the outer orbits runs off the bottom on purpose.

The tour renders through an `EffectComposer` (bloom on a half-float target with 4x MSAA).
The quiz deliberately does **not** — a bloom pass forces the canvas opaque and paints a
black box over the page, so the halo there is a CSS radial gradient instead.

Assets:
- Textures live in `public/textures/planets/` — 4K equirectangular maps from
  [Solar System Scope](https://www.solarsystemscope.com/textures/) (CC BY 4.0), downscaled
  from their 8K originals and converted to WebP (~14 MB total). Uranus and Neptune are
  only published at 2K, which is plenty for two featureless balls. The credit line on the
  game page is required by that licence.
- Spoken names live in `public/sounds/planets/<id>.mp3`, generated with Google Cloud TTS
  (`en-GB-Journey-F`), same voice family as the vocabulary audio.
- The illustrated cards live in `public/images/planets/<id>.webp` — painted storybook
  drawings, deliberately not photoreal, since the 3D scene already shows the real thing.
  Regenerate with `npm run planets:illustrate [-- --only <id>] [-- --force]`; the script
  follows the sticker pipeline (Vertex AI + gcloud token, magenta background chroma-keyed
  to transparency). Prompts live in `SUBJECTS` in the script. Two things worth knowing:
  the script rejects a generation whose background is not actually magenta, or whose
  centre comes out see-through — otherwise the key silently punches holes through a
  planet whose colours sit near magenta (this is what made Mars look muddy for a long
  time, and it was the key, not the model). `--best-of <n>` draws several and keeps
  whichever average colour is closest to that planet's 3D texture.
- The two home-screen cards are painted too: `npm run games:thumbnails`.

Scene distances and sizes in `types/planets.ts` are deliberately compressed — real ratios
would make Mercury a single pixel. Rotation directions (retrograde Venus and Uranus) and
the facts shown in the panel are accurate.

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