import confetti from 'canvas-confetti';

interface CelebrationOptions {
  duration?: number;
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
}

class CelebrationService {
  private static instance: CelebrationService;

  private constructor() {}

  public static getInstance(): CelebrationService {
    if (!CelebrationService.instance) {
      CelebrationService.instance = new CelebrationService();
    }
    return CelebrationService.instance;
  }

  public celebrate(options?: CelebrationOptions): void {
    const defaults: CelebrationOptions = {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    };

    const config = { ...defaults, ...options };

    confetti({
      particleCount: config.particleCount,
      spread: config.spread,
      origin: config.origin,
      colors: config.colors,
    });
  }

  public bigCelebration(): void {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount: Math.floor(particleCount),
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2
        }
      });
      
      confetti({
        ...defaults,
        particleCount: Math.floor(particleCount),
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2
        }
      });
    }, 250);
  }

  public levelComplete(): void {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    
    fire(0.2, {
      spread: 60,
    });
    
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }

  public quickBurst(): void {
    confetti({
      particleCount: 50,
      spread: 45,
      origin: { y: 0.7 }
    });
  }
}

export const celebrationService = CelebrationService.getInstance();