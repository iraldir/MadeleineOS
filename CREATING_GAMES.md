# 🎮 Creating New Games - Developer Guide

This guide walks you through creating a new educational game for Madeleine's Learning Games.

## Game Design Principles

Before coding, consider these pedagogical elements:

### 1. **Age Appropriateness** (3-7 years old)
- Simple, clear instructions
- Large, easy-to-tap buttons (min 60px)
- Bright, engaging colors
- Minimal text (use icons where possible)

### 2. **Learning Objectives**
- What skill does the game teach?
- How does it reinforce learning?
- Can difficulty scale with the child's progress?

### 3. **Positive Reinforcement**
- Celebrate successes with confetti/sounds
- Never punish wrong answers
- Provide encouraging feedback
- Track progress to show improvement

### 4. **Session Length**
- Design for 5-10 minute play sessions
- Include natural break points
- Don't make games too repetitive

## Step-by-Step Game Creation

### Step 1: Plan Your Game

Create a brief design document:

```markdown
## Game Name: Shape Matching

### Learning Objective
- Teach shape recognition (circle, square, triangle, etc.)

### Mechanics
1. Show a target shape at the top
2. Display 4 shape options below
3. Child clicks the matching shape
4. Celebrate correct answer, try again for incorrect
5. Track score and show after 10 rounds

### Assets Needed
- Shape SVGs or images
- Success sound
- Background image
- Game thumbnail
```

### Step 2: Create Game Directory

```bash
# Create the game directory structure
mkdir -p app/games/shape-matching
touch app/games/shape-matching/page.tsx
touch app/games/shape-matching/page.module.css
```

### Step 3: Create Basic Game Component

**`app/games/shape-matching/page.tsx`**

```tsx
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from './page.module.css';
import { useAudio } from '@/hooks/useAudio';
import { useCelebration } from '@/hooks/useCelebration';
import PageBackground from '@/components/PageBackground';

// Define shapes
const SHAPES = ['circle', 'square', 'triangle', 'star', 'heart'];

export default function ShapeMatching() {
  const [currentShape, setCurrentShape] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  
  const { playSuccess, playFailure } = useAudio();
  const celebrate = useCelebration();

  // Initialize game
  useEffect(() => {
    generateRound();
  }, []);

  const generateRound = () => {
    // Pick a random target shape
    const target = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    setCurrentShape(target);

    // Create options with correct answer and 3 random shapes
    const wrongShapes = SHAPES.filter(s => s !== target);
    const shuffled = [
      target,
      wrongShapes[Math.floor(Math.random() * wrongShapes.length)],
      wrongShapes[Math.floor(Math.random() * wrongShapes.length)],
      wrongShapes[Math.floor(Math.random() * wrongShapes.length)]
    ].sort(() => Math.random() - 0.5);
    
    setOptions(shuffled);
  };

  const handleShapeClick = (shape: string) => {
    if (shape === currentShape) {
      // Correct answer!
      playSuccess();
      celebrate();
      setScore(score + 1);
      
      if (round >= 10) {
        setGameOver(true);
      } else {
        setRound(round + 1);
        setTimeout(generateRound, 1000);
      }
    } else {
      // Wrong answer - try again
      playFailure();
    }
  };

  const handleRestart = () => {
    setScore(0);
    setRound(1);
    setGameOver(false);
    generateRound();
  };

  return (
    <main className={styles.main}>
      <PageBackground type="simple" color="#E3F2FD" />
      
      {/* Header */}
      <header className={styles.header}>
        <Link href="/" className={styles.backButton}>
          <ArrowLeft size={24} />
          <span>Home</span>
        </Link>
        <h1 className={styles.title}>Shape Matching</h1>
        <div className={styles.scoreDisplay}>
          Score: {score} | Round: {round}/10
        </div>
      </header>

      {/* Game Area */}
      {!gameOver ? (
        <div className={styles.gameArea}>
          {/* Target Shape */}
          <div className={styles.targetArea}>
            <p className={styles.instruction}>Find this shape:</p>
            <div className={`${styles.shape} ${styles[currentShape]}`} />
          </div>

          {/* Options */}
          <div className={styles.optionsGrid}>
            {options.map((shape, index) => (
              <button
                key={index}
                className={styles.optionButton}
                onClick={() => handleShapeClick(shape)}
              >
                <div className={`${styles.shape} ${styles[shape]}`} />
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Game Over Screen */
        <div className={styles.gameOver}>
          <h2>Great Job! 🎉</h2>
          <p className={styles.finalScore}>Your Score: {score}/10</p>
          <button 
            className={styles.restartButton}
            onClick={handleRestart}
          >
            Play Again
          </button>
          <Link href="/" className={styles.homeLink}>
            Back to Home
          </Link>
        </div>
      )}
    </main>
  );
}
```

### Step 4: Style Your Game

**`app/games/shape-matching/page.module.css`**

```css
.main {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.backButton {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #FF6B9D;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: transform 0.2s;
}

.backButton:hover {
  transform: scale(1.05);
}

.title {
  font-size: 2rem;
  color: #FF6B9D;
  margin: 0;
}

.scoreDisplay {
  font-size: 1.2rem;
  font-weight: bold;
  color: #4D96FF;
}

.gameArea {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rem;
  padding: 2rem;
}

.targetArea {
  text-align: center;
}

.instruction {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
}

.shape {
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

/* Shape styles */
.circle {
  background: #FF6B9D;
  border-radius: 50%;
}

.square {
  background: #FFD93D;
  border-radius: 8px;
}

.triangle {
  width: 0;
  height: 0;
  background: transparent;
  border-left: 60px solid transparent;
  border-right: 60px solid transparent;
  border-bottom: 120px solid #6BCB77;
}

.star {
  background: #4D96FF;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}

.heart {
  background: #FF6B9D;
  position: relative;
  width: 100px;
  height: 100px;
  transform: rotate(-45deg);
}

.heart::before,
.heart::after {
  content: "";
  background: #FF6B9D;
  border-radius: 50%;
  position: absolute;
  width: 100px;
  height: 100px;
}

.heart::before {
  top: -50px;
  left: 0;
}

.heart::after {
  top: 0;
  left: 50px;
}

.optionsGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.optionButton {
  background: white;
  border: 4px solid #ddd;
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 180px;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.optionButton:hover {
  transform: scale(1.05);
  border-color: #4D96FF;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.optionButton:active {
  transform: scale(0.95);
}

.gameOver {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  text-align: center;
}

.gameOver h2 {
  font-size: 3rem;
  color: #6BCB77;
  margin: 0;
}

.finalScore {
  font-size: 2rem;
  font-weight: bold;
  color: #4D96FF;
}

.restartButton {
  padding: 1rem 3rem;
  font-size: 1.5rem;
  font-weight: bold;
  background: #FF6B9D;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}

.restartButton:hover {
  transform: scale(1.05);
}

.homeLink {
  color: #4D96FF;
  text-decoration: none;
  font-size: 1.2rem;
  font-weight: bold;
}

.homeLink:hover {
  text-decoration: underline;
}

/* Responsive design */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .optionsGrid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .optionButton {
    min-width: 150px;
    min-height: 150px;
    padding: 1rem;
  }

  .shape {
    width: 80px;
    height: 80px;
  }
}
```

### Step 5: Add Game to Menu

**Edit `types/games.ts`:**

```typescript
export const games: Game[] = [
  // ... existing games
  {
    id: "shape-matching",
    title: "Shape Matching",
    thumbnailUrl: "/images/games/shape-matching.webp",
    path: "/games/shape-matching",
  },
  // ... more games
];
```

### Step 6: Create Game Thumbnail

Generate or design a 400x300px thumbnail and save it as:
`/public/images/games/shape-matching.webp`

You can use the CLI to generate it:

```bash
npm run media:image -- "colorful shapes (circle, square, triangle, star, heart) arranged in a fun pattern for children" public/images/games/shape-matching.webp -w 400 -h 300
```

## Best Practices

### State Management
```tsx
// Use meaningful state names
const [currentQuestion, setCurrentQuestion] = useState(0);
const [userAnswer, setUserAnswer] = useState('');
const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

// Don't use cryptic names like x, y, temp
```

### Audio Feedback
```tsx
import { useAudio } from '@/hooks/useAudio';

const { playSuccess, playFailure } = useAudio();

// Play on correct answer
playSuccess();

// Play on wrong answer (but don't punish!)
playFailure();
```

### Visual Celebration
```tsx
import { useCelebration } from '@/hooks/useCelebration';

const celebrate = useCelebration();

// Trigger confetti on success
celebrate();
```

### Progress Tracking
```tsx
import { useProgress } from '@/hooks/useProgress';

const { saveProgress, getProgress } = useProgress();

// Save game completion
saveProgress('shape-matching', {
  completed: true,
  score: finalScore,
  date: new Date().toISOString()
});

// Load previous progress
useEffect(() => {
  const previous = getProgress('shape-matching');
  if (previous?.highScore) {
    setHighScore(previous.highScore);
  }
}, []);
```

### Accessibility
```tsx
// Always include ARIA labels
<button aria-label="Select circle shape">
  <div className={styles.circle} />
</button>

// Use semantic HTML
<main>
  <header>
    <h1>Game Title</h1>
  </header>
  <section aria-label="Game area">
    {/* game content */}
  </section>
</main>

// Keyboard navigation
<button 
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</button>
```

### Mobile Responsiveness
```css
/* Always test on mobile */
@media (max-width: 768px) {
  .gameArea {
    padding: 1rem;
    gap: 2rem;
  }
  
  .button {
    min-height: 60px; /* Touch-friendly */
    font-size: 1.2rem;
  }
}

/* Prevent text selection on buttons */
.button {
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
```

## Testing Checklist

Before considering your game complete:

- [ ] Game works on desktop (Chrome, Safari, Firefox)
- [ ] Game works on mobile (iOS Safari, Android Chrome)
- [ ] Touch targets are at least 60px for children
- [ ] Audio plays on correct/incorrect answers
- [ ] Confetti triggers on success
- [ ] Navigation back to home works
- [ ] Game can be restarted
- [ ] No console errors
- [ ] Text is readable (min 16px font size)
- [ ] Colors have good contrast
- [ ] Game saves progress if applicable
- [ ] Loading states are handled
- [ ] No crashes on rapid clicking
- [ ] Keyboard navigation works

## Advanced Features

### Difficulty Levels
```tsx
const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

const getQuestionCount = () => {
  switch (difficulty) {
    case 'easy': return 5;
    case 'medium': return 10;
    case 'hard': return 15;
  }
};
```

### Timed Challenges
```tsx
import { useEffect, useState } from 'react';

const [timeLeft, setTimeLeft] = useState(60); // 60 seconds

useEffect(() => {
  if (timeLeft > 0 && !gameOver) {
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  } else if (timeLeft === 0) {
    setGameOver(true);
  }
}, [timeLeft, gameOver]);
```

### Character Rewards
```tsx
import { useProgress } from '@/hooks/useProgress';

const { unlockCharacter } = useProgress();

// After game completion
if (score >= 8) {
  unlockCharacter('pikachu');
}
```

## Common Pitfalls

### ❌ Don't Do This
```tsx
// Hard-coded values
const TOTAL_ROUNDS = 10;

// Negative feedback
<p>Wrong! Try again dummy!</p>

// Tiny buttons
<button style={{ width: '30px' }}>Click</button>

// No loading states
const [data, setData] = useState(null);
return <div>{data.value}</div>; // Crash!
```

### ✅ Do This Instead
```tsx
// Configurable values
const TOTAL_ROUNDS = 10; // Could be adjusted based on settings

// Positive feedback
<p>Not quite! Keep trying! 💪</p>

// Touch-friendly buttons
<button style={{ minWidth: '60px', minHeight: '60px' }}>Click</button>

// Handle loading
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

if (loading) return <LoadingSpinner />;
return <div>{data.value}</div>;
```

## Getting Help

- Check existing games for reference: `/app/games/math/page.tsx`
- Review reusable components: `/components/`
- Test hooks in isolation: `/hooks/`
- Ask for code review before finalizing

## Publishing Your Game

Once your game is ready:

1. Test thoroughly (use the checklist above)
2. Add to `types/games.ts`
3. Create thumbnail image
4. Update this documentation if you created reusable patterns
5. Consider adding to WARP.md if there are CLI utilities

---

Happy game building! 🎮✨
