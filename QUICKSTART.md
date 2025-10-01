# 🚀 Quick Start Guide

## First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env and add your GEMINI_KEY

# 3. Start development
npm run dev

# 4. Open browser
# http://localhost:3000
```

## Common Tasks

### Adding Vocabulary Words
```bash
# Add a new word with automatic image/audio generation
npm run vocab:add -- \
  -e "cat" \
  -f "chat" \
  -i "gatto" \
  -c "animals" \
  -p "cute cartoon cat for children"
```

### Managing YouTube Videos
```bash
# Search and add top 3 videos
npm run youtube:search -- "drawing tutorial" --category drawing --top 3

# Import entire playlist
npm run youtube:import-playlist -- "PLAYLIST_URL" --category yoga

# List all videos
npm run youtube:list
```

### Adding New Characters
```bash
# Create character scaffolding
./copy_blank_images.sh pikachu Pokemon

# Then replace the blank images in:
# - /public/images/characters/pikachu.webp
# - /public/images/coloring/pikachu1-4.webp
```

### Generating Content
```bash
# Generate single image
npm run media:image -- "rainbow unicorn" output/unicorn.webp

# Generate TTS audio
npm run media:tts -- "Hello world" output/hello.mp3 -l en

# Batch regenerate all vocabulary images
npm run batch:images
```

### Parental Controls
```bash
# On home screen:
# 1. Triple-click anywhere
# 2. Enter PIN
# 3. Use terminal:

block-game math      # Block a game
unblock-game math    # Unblock a game
list-blocked         # Show blocked games
```

## File Locations

### Adding Game Assets
- Game thumbnails: `/public/images/games/`
- Character portraits: `/public/images/characters/`
- Coloring pages: `/public/images/coloring/`
- Vocabulary images: `/public/images/vocabulary/`

### Audio Files
- Letter sounds: `/public/sounds/alphabet/`
- Vocabulary audio:
  - English: `/public/sounds/vocabulary/en/`
  - French: `/public/sounds/vocabulary/fr/`
  - Italian: `/public/sounds/vocabulary/it/`

### Code Structure
- Games: `/app/games/[game-name]/page.tsx`
- Components: `/components/`
- Hooks: `/hooks/`
- Types: `/types/`
- CLI Scripts: `/scripts/`

## Troubleshooting

### API Key Issues
```bash
# Check if .env file exists
cat .env

# Verify GEMINI_KEY is set
echo $GEMINI_KEY  # Should not be empty
```

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### Audio Not Playing
- Check browser console for errors
- Ensure audio files exist in `/public/sounds/`
- Try clicking "Play" button multiple times (browser autoplay restrictions)

### YouTube Videos Not Loading
- Verify GEMINI_KEY in .env
- Check video IDs are correct in `services/youtubeService.ts`
- Ensure videos are embeddable (not restricted)

## Development Tips

### Hot Reload
- Changes to `.tsx` files: Instant reload
- Changes to `.css` files: Instant reload
- Changes to `/types`: May require manual refresh
- Changes to `/public`: May require hard refresh (Cmd+Shift+R)

### VS Code Extensions (Recommended)
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- CSS Modules

### Browser DevTools
- Open with F12 or Cmd+Option+I
- Check Console for errors
- Check Network tab for failed requests
- Use React DevTools extension

## Production Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings > Environment Variables > Add GEMINI_KEY
```

### Tablet Kiosk Setup
1. Use a dedicated tablet (iPad, Android)
2. Install browser kiosk app (Kiosk Pro, Fully Kiosk)
3. Set app URL as home page
4. Enable parental controls on device
5. Hide navigation bars and buttons
6. Use the in-app refresh button (top-right) as needed

## Need More Help?

- **README.md** - Full documentation with pedagogical approach
- **WARP.md** - Detailed CLI toolkit reference
- **scripts/config.ts** - Configuration options and settings

---

Happy learning! 🎓
