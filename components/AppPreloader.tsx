'use client';

import React, { useState, useEffect } from 'react';
import styles from './AppPreloader.module.css';

interface PreloaderProps {
  onComplete: () => void;
}

interface AssetType {
  type: 'image' | 'audio';
  src: string;
  name: string;
}

const AppPreloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentAsset, setCurrentAsset] = useState<string>('');
  const [loadedAssets, setLoadedAssets] = useState(0);
  const [totalAssets, setTotalAssets] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'loading' | 'complete' | 'fadeout'>('loading');

  useEffect(() => {
    let isMounted = true;
    
    const preloadAssets = async () => {
      // Define all assets to preload
      const assetsToLoad: AssetType[] = [
        // Game thumbnail images
        { type: 'image', src: '/images/games/characterlist.webp', name: 'Character List' },
        { type: 'image', src: '/images/games/choice.webp', name: 'Character Recognition' },
        { type: 'image', src: '/images/games/coloring.webp', name: 'Coloring Search' },
        { type: 'image', src: '/images/games/writing.webp', name: 'Character Writing' },
        { type: 'image', src: '/images/games/math.webp', name: 'Math Game' },
        { type: 'image', src: '/images/games/weather.webp', name: 'Weather' },
        { type: 'image', src: '/images/games/youtube.png', name: 'Videos' },
        { type: 'image', src: '/images/games/vocabulary.webp', name: 'Vocabulary' },
        { type: 'image', src: '/images/games/coupon.webp', name: 'Coupon' },
        
        // Background images
        { type: 'image', src: '/images/backgrounds/floral-pattern.webp', name: 'Floral Background' },
        { type: 'image', src: '/images/backgrounds/page-background.webp', name: 'Page Background' },
        { type: 'image', src: '/images/backgrounds/rainbow-bokeh.webp', name: 'Rainbow Background' },

        // Category images
        { type: 'image', src: '/images/categories/animals.webp', name: 'Animals Category' },
        { type: 'image', src: '/images/categories/colors.webp', name: 'Colors Category' },
        { type: 'image', src: '/images/categories/family.webp', name: 'Family Category' },
        { type: 'image', src: '/images/categories/food.webp', name: 'Food Category' },
        { type: 'image', src: '/images/categories/greetings.webp', name: 'Greetings Category' },
        { type: 'image', src: '/images/categories/numbers.webp', name: 'Numbers Category' },

        // Letters and numbers audio (English)
        ...Array.from({ length: 26 }, (_, i) => ({
          type: 'audio' as const,
          src: `/sounds/alphabet/english/${String.fromCharCode(65 + i)}.mp3`,
          name: `Letter ${String.fromCharCode(65 + i)}`
        })),
        ...Array.from({ length: 11 }, (_, i) => ({
          type: 'audio' as const,
          src: `/sounds/alphabet/english/${i}.mp3`,
          name: `Number ${i}`
        })),
        { type: 'audio', src: '/sounds/alphabet/english/plus.mp3', name: 'Plus Sign' },

        // System sounds
        { type: 'audio', src: '/sounds/success.mp3', name: 'Success Sound' },
        { type: 'audio', src: '/sounds/reject.mp3', name: 'Reject Sound' },
        { type: 'audio', src: '/sounds/reset.mp3', name: 'Reset Sound' },

        // Solar system audio
        { type: 'audio', src: '/sounds/solar-system/sun.mp3', name: 'Sun' },
        { type: 'audio', src: '/sounds/solar-system/earth.mp3', name: 'Earth' },
        { type: 'audio', src: '/sounds/solar-system/mars.mp3', name: 'Mars' },
        { type: 'audio', src: '/sounds/solar-system/jupiter.mp3', name: 'Jupiter' },
      ];

      if (!isMounted) return;
      
      setTotalAssets(assetsToLoad.length);
      let loaded = 0;

      const loadAsset = (asset: AssetType): Promise<void> => {
        return new Promise((resolve) => {
          if (asset.type === 'image') {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Continue even if asset fails to load
            img.src = asset.src;
          } else if (asset.type === 'audio') {
            const audio = new Audio();
            audio.oncanplaythrough = () => resolve();
            audio.onerror = () => resolve(); // Continue even if asset fails to load
            audio.src = asset.src;
            audio.load();
          }
        });
      };

      // Load assets with progress tracking
      for (let i = 0; i < assetsToLoad.length; i++) {
        if (!isMounted) break;
        
        const asset = assetsToLoad[i];
        setCurrentAsset(asset.name);
        
        await loadAsset(asset);
        
        if (!isMounted) break;
        
        loaded++;
        setLoadedAssets(loaded);
        const progressPercent = Math.round((loaded / assetsToLoad.length) * 100);
        setProgress(progressPercent);
        
        // Small delay to show the progress animation
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      if (isMounted) {
        setAnimationPhase('complete');
        
        // Wait for completion animation
        setTimeout(() => {
          if (isMounted) {
            setAnimationPhase('fadeout');
            setTimeout(() => {
              if (isMounted) {
                onComplete();
              }
            }, 500);
          }
        }, 1000);
      }
    };

    preloadAssets();

    return () => {
      isMounted = false;
    };
  }, [onComplete]);

  return (
    <div className={`${styles.preloader} ${styles[animationPhase]}`}>
      <div className={styles.content}>
        {/* Animated logo/title */}
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <span className={styles.logoText}>MadeleineOS</span>
            <div className={styles.logoSubtitle}>Learning Platform</div>
          </div>
          
          {/* Floating particles */}
          <div className={styles.particles}>
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className={styles.particle}
                style={{
                  '--delay': `${i * 0.2}s`,
                  '--x': `${Math.sin(i * 0.5) * 100}px`,
                  '--y': `${Math.cos(i * 0.3) * 100}px`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>

        {/* Loading section */}
        <div className={styles.loadingSection}>
          <div className={styles.progressContainer}>
            <div className={styles.progressTrack}>
              <div 
                className={styles.progressBar}
                style={{ '--progress': `${progress}%` } as React.CSSProperties}
              />
              <div className={styles.progressGlow} />
            </div>
            
            <div className={styles.progressText}>
              <span className={styles.percentage}>{progress}%</span>
              <div className={styles.assetInfo}>
                <span className={styles.currentAsset}>{currentAsset}</span>
                <span className={styles.assetCount}>
                  {loadedAssets} / {totalAssets} assets loaded
                </span>
              </div>
            </div>
          </div>

          {/* Loading animation */}
          <div className={styles.loadingAnimation}>
            <div className={styles.spinner}>
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className={styles.spinnerDot}
                  style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Completion message */}
        {animationPhase === 'complete' && (
          <div className={styles.completionMessage}>
            <div className={styles.checkmark}>✓</div>
            <span>Ready to learn!</span>
          </div>
        )}
      </div>

      {/* Background effects */}
      <div className={styles.backgroundEffect}>
        <div className={styles.wave}></div>
        <div className={styles.wave}></div>
        <div className={styles.wave}></div>
      </div>
    </div>
  );
};

export default AppPreloader;