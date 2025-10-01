# 🎮 Madeleine's Learning Games

An educational web application designed for young children (ages 3-7) featuring interactive games for character recognition, writing practice, coloring, math, vocabulary learning, and more. Built with Next.js 15 and TypeScript.

![Version](https://img.shields.io/badge/version-0.1.1-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)

## 🌟 Features

### Educational Games
- **Character Recognition** - Learn to identify letters and characters
- **Character Writing** - Practice writing skills with touch/mouse
- **Math Games** - Interactive addition and subtraction
- **Vocabulary Cards** - Multilingual word learning (English, French, Italian)
- **Coloring Pages** - Creative expression with favorite characters
- **YouTube Videos** - Curated kid-friendly yoga and drawing tutorials
- **Weather** - Learn about daily weather patterns

### Parental Controls
- **Game Blocking** - Lock specific games via hidden terminal
- **Safe Content** - All YouTube videos with strict safe search
- **Progress Tracking** - Unlock characters as children progress

## 🎯 Pedagogical Approach

### Multi-Sensory Learning
The application combines **visual**, **auditory**, and **kinesthetic** learning styles:
- **Visual**: Colorful characters, animations, and feedback
- **Auditory**: Native speaker pronunciation in multiple languages
- **Kinesthetic**: Touch/mouse interaction for writing practice

### Positive Reinforcement
- ✨ **Celebration animations** with confetti for correct answers
- 🎵 **Success sounds** to encourage continued engagement
- 🏆 **Progressive unlocking** of characters as rewards
- 💬 **Encouraging feedback** instead of punitive responses

### Multilingual Exposure
Vocabulary cards include three languages:
- 🇬🇧 **English** - Journey-F voice (Google Cloud TTS)
- 🇫🇷 **French** - Wavenet-C voice (native pronunciation)
- 🇮🇹 **Italian** - Journey-F voice (native pronunciation)

### Adaptive Difficulty
- Math problems scale from simple (1+1) to more complex operations
- Character unlocking creates a sense of progression
- Games can be blocked/unblocked by parents based on child's readiness

### Screen Time Balance
- Yoga videos for physical movement breaks
- Drawing tutorials for creative offline activities
- Quick games designed for 5-10 minute sessions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (recommended: 20+)
- npm or pnpm package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd MadeleineOS
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```bash
GEMINI_KEY=your_google_gemini_api_key_here
GCLOUD_PROJECT=your_google_cloud_project_id  # Optional, for TTS
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open the app**

Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Customization Guide

### Adding New Characters

Use the helper script to quickly add new characters:

```bash
# Usage: ./copy_blank_images.sh <character_name> [franchise_name]
./copy_blank_images.sh pikachu Pokemon
./copy_blank_images.sh elsa Disney
```

This creates:
- Portrait: `/public/images/characters/[name].webp`
- Coloring pages: `/public/images/coloring/[name]1-4.webp`
- Entry in `types/characters.ts`

Replace the placeholder images with actual character artwork.

### Managing Vocabulary

The app includes a powerful CLI toolkit for vocabulary management:

#### Add New Words
```bash
npm run vocab:add -- -e "house" -f "maison" -i "casa" -c "objects" -p "cozy house illustration"
```

#### Update Existing Words
```bash
npm run vocab:update -- obj_5 -f "maison" --regenerate-audio
```

#### Replace Text Across All Words
```bash
npm run vocab:replace -- "old-text" "new-text" -l fr
```

#### List Vocabulary
```bash
npm run vocab:list -- -c animals  # List by category
npm run vocab:list                 # List all categories
```

Available categories:
- `numbers`, `greetings`, `family`, `people`, `animals`, `food`, `body`
- `colors`, `clothing`, `house`, `furniture`, `objects`, `kitchen`
- `transport`, `nature`, `time`, `actions`, `emotions`, `expressions`
- `school`, `seasons`, `descriptions`

### Managing YouTube Videos

#### Search and Add Videos
```bash
npm run youtube:search -- "Unicorn drawing tutorial" --category drawing --top 3
```

#### Import Entire Playlists
```bash
npm run youtube:import-playlist -- "https://www.youtube.com/playlist?list=PLAYLIST_ID" --category yoga
```

#### List Videos
```bash
npm run youtube:list -- --category yoga  # List yoga videos
npm run youtube:list                      # List all categories
npm run youtube:categories                # Show available categories
```

Currently supported categories:
- `yoga` - Kid-friendly yoga and movement videos
- `drawing` - Step-by-step drawing tutorials

**To add new categories:**
1. Edit `services/youtubeService.ts`
2. Update the `Video` interface category type
3. Add category to the `categories` array with icon and color

### Generating Images and Audio

The CLI toolkit uses AI to generate custom content:

#### Generate Images
```bash
# Standalone image generation
npm run media:image -- "colorful app icon" output/icon.webp -w 512 -h 512

# Regenerate vocabulary images
npm run batch:images -- -c animals  # Specific category
npm run batch:images -- -s 50        # Start from index 50
```

**Image Settings** (configured in `scripts/config.ts`):
- **Model**: Gemini 2.5 Flash Image Preview
- **Style**: Cute cartoon style for children ages 3-7
- **Size**: 512x512 pixels (vocabulary)
- **Format**: WebP for optimal file size
- **Background**: Clean white or soft pastels

#### Generate Audio (Text-to-Speech)
```bash
# Single audio file
npm run media:tts -- "Hello world" output/hello.mp3 -l en

# Regenerate all vocabulary audio
npm run batch:audio -- -c greetings -l fr  # French audio only
npm run batch:audio                        # All languages, all words
```

**TTS Settings** (configured in `scripts/config.ts`):
- **English**: `en-US-Journey-F` (Google Cloud)
- **French**: `fr-FR-Wavenet-C` (Google Cloud)
- **Italian**: `it-IT-Journey-F` (Google Cloud)
- **Rate**: 1.0 (adjustable)
- **Format**: MP3

**Rate Limiting**:
- Images: 3s delay between requests, 10 per batch
- Audio: 2s delay between requests, 5 per batch
- Automatic batch delays to prevent API throttling

### Creating New Games

Follow Next.js App Router conventions:

1. **Create game directory**
```bash
mkdir -p app/games/my-game
```

2. **Create game page** (`app/games/my-game/page.tsx`)
```tsx
"use client";
import { useState } from 'react';
import styles from './page.module.css';

export default function MyGame() {
  const [score, setScore] = useState(0);
  
  return (
    <main className={styles.main}>
      <h1>My New Game</h1>
      {/* Game logic here */}
    </main>
  );
}
```

3. **Create styles** (`app/games/my-game/page.module.css`)
```css
.main {
  min-height: 100vh;
  padding: 2rem;
}
```

4. **Add game to menu** (`types/games.ts`)
```typescript
export const games: Game[] = [
  // ... existing games
  {
    id: "my-game",
    title: "My Game",
    thumbnailUrl: "/images/games/my-game.webp",
    path: "/games/my-game",
  },
];
```

5. **Add game thumbnail**

Place a 400x300px image at `/public/images/games/my-game.webp`

**Useful hooks and components:**
- `useAudio()` - Play success/failure sounds
- `useCelebration()` - Trigger confetti animations
- `useProgress()` - Track and save game progress
- `LockProtection` - Require PIN for sensitive features
- `PageBackground` - Consistent themed backgrounds

### Customizing Styles

The app uses CSS Modules with a consistent color palette:

**Primary Colors:**
- `#FF6B9D` - Pink (primary accent)
- `#FFD93D` - Yellow (secondary)
- `#6BCB77` - Green (success)
- `#4D96FF` - Blue (info)

**Typography:**
- Font: System fonts (optimized for each OS)
- Headings: Bold, large, colorful
- Body: Clear, legible, 16px minimum

**Global styles:** `app/globals.css`  
**Component styles:** `[component].module.css` (scoped)

### Parental Controls

#### Blocking Games

1. Access the hidden terminal (triple-click anywhere on home screen)
2. Enter PIN (default: check `types/lock.ts`)
3. Use terminal commands:
```bash
block-game math        # Block math game
unblock-game math      # Unblock math game
list-blocked           # Show blocked games
```

#### Changing PIN

Edit `types/lock.ts`:
```typescript
export const CORRECT_PIN = "your-new-pin"; // Change this
```

## 📁 Project Structure

```
MadeleineOS/
├── app/                    # Next.js App Router
│   ├── games/             # Game pages
│   │   ├── character-list/
│   │   ├── character-recognition/
│   │   ├── character-writing/
│   │   ├── coloring-search/
│   │   ├── math/
│   │   ├── vocabulary/
│   │   ├── youtube/
│   │   └── ...
│   ├── layout.tsx         # Root layout with navigation
│   └── page.tsx           # Home page (game menu)
│
├── components/            # Reusable React components
│   ├── Countdown.tsx
│   ├── LockProtection.tsx
│   ├── MathGame.tsx
│   ├── PageBackground.tsx
│   └── ...
│
├── hooks/                 # Custom React hooks
│   ├── useAudio.ts       # Sound effects
│   ├── useCelebration.ts # Confetti animations
│   ├── useProgress.ts    # Progress tracking
│   └── ...
│
├── scripts/               # CLI toolkit
│   ├── cli.ts            # Main CLI entry point
│   ├── config.ts         # Configuration
│   └── utils/
│       ├── vocabulary-manager.ts
│       ├── media-generator.ts
│       ├── youtube-search.ts
│       └── youtube-manager.ts
│
├── types/                 # TypeScript definitions
│   ├── characters.ts     # Character data
│   ├── games.ts          # Game definitions
│   ├── vocabulary.ts     # Vocabulary words
│   └── ...
│
├── public/                # Static assets
│   ├── images/
│   │   ├── characters/   # Character portraits
│   │   ├── coloring/     # Coloring pages
│   │   ├── games/        # Game thumbnails
│   │   ├── vocabulary/   # Word illustrations
│   │   └── youtube/      # Category icons
│   └── sounds/
│       ├── alphabet/     # Letter sounds
│       └── vocabulary/   # Word pronunciations
│           ├── en/
│           ├── fr/
│           └── it/
│
└── services/              # Business logic
    └── youtubeService.ts # YouTube video data
```

## 🔧 Configuration Files

### Environment Variables (`.env`)
```bash
GEMINI_KEY=              # Required for image generation and YouTube API
GCLOUD_PROJECT=          # Optional, for Google Cloud TTS
```

### Configuration (`scripts/config.ts`)
- API keys and project settings
- Voice models for each language
- Rate limiting for API calls
- Image/audio generation settings
- File paths and formats
- Allowed vocabulary categories

### Game Settings (`types/games.ts`)
- Game metadata (title, thumbnail, path)
- Game order on home screen
- Coming soon placeholders

## 🧪 Development

### Commands
```bash
npm run dev          # Start development server (with Turbopack)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Adding Dependencies
```bash
npm install package-name
```

### TypeScript
The project uses strict TypeScript. Type definitions are in `/types`.

## 📱 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Setup
Ensure production environment has:
- `GEMINI_KEY` set in environment variables
- Node.js 18+ runtime
- File system access for static assets

### Recommended Platforms
- **Vercel** - Optimal for Next.js (automatic deployments)
- **Netlify** - Good alternative with easy setup
- **Self-hosted** - Use `npm run build && npm run start`

### Kiosk Mode (Tablet Setup)

For dedicated children's tablets:

1. Deploy to production URL
2. Use browser kiosk mode (Chrome, Safari, Firefox)
3. Disable browser navigation (address bar, back button)
4. Set app as home page
5. Use parental controls to restrict other apps
6. The hidden refresh button (top-right) allows page reload without navigation

## 🤝 Contributing

This is a personal educational project for children. While not open for general contributions, feel free to fork and adapt for your own family's needs!

## 📄 License

Private/Personal Use

## 🙏 Credits

- **Character artwork** - Various franchises (Disney, Nintendo, etc.)
- **Yoga videos** - Teacher Mister Alonso, Cosmic Kids Yoga
- **Drawing tutorials** - Art for Kids Hub and various creators
- **Voices** - Google Cloud Text-to-Speech
- **Images** - Google Gemini AI (Gemini 2.5 Flash)

## 📞 Support

For issues or questions, check the `WARP.md` file for detailed CLI documentation.

---

**Built with ❤️ for Madeleine**
