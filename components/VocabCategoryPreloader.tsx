'use client';

import React, { useState, useEffect } from 'react';
import styles from './VocabCategoryPreloader.module.css';
import { vocabularyWords } from '@/types/vocabulary';

interface VocabCategoryPreloaderProps {
  category: string;
  onComplete: () => void;
}

const VocabCategoryPreloader: React.FC<VocabCategoryPreloaderProps> = ({ 
  category, 
  onComplete 
}) => {
  const [progress, setProgress] = useState(0);
  const [currentAsset, setCurrentAsset] = useState<string>('');
  const [loadedAssets, setLoadedAssets] = useState(0);
  const [totalAssets, setTotalAssets] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'loading' | 'complete' | 'fadeout'>('loading');

  // Get category display info
  const getCategoryInfo = (categoryId: string) => {
    const categoryMap: { [key: string]: { name: string; icon: string; color: string } } = {
      greetings: { name: 'Greetings', icon: '👋', color: '#FF6B6B' },
      numbers: { name: 'Numbers', icon: '🔢', color: '#4ECDC4' },
      colors: { name: 'Colors', icon: '🎨', color: '#95E1D3' },
      family: { name: 'Family', icon: '👨‍👩‍👧‍👦', color: '#F38181' },
      animals: { name: 'Animals', icon: '🐾', color: '#FFEAA7' },
      food: { name: 'Food & Drink', icon: '🍎', color: '#FAB1A0' },
      body: { name: 'Body Parts', icon: '👤', color: '#A8E6CF' },
      clothing: { name: 'Clothing', icon: '👕', color: '#FFD3B6' },
      house: { name: 'House & Home', icon: '🏠', color: '#FF8B94' },
      nature: { name: 'Nature', icon: '🌳', color: '#A0E7E5' },
      emotions: { name: 'Emotions', icon: '😊', color: '#B4F8C8' },
      actions: { name: 'Actions', icon: '🏃', color: '#FBE7C6' },
      time: { name: 'Time & Days', icon: '⏰', color: '#C9B1FF' },
      people: { name: 'People', icon: '👥', color: '#FDCB6E' },
      objects: { name: 'Objects', icon: '📦', color: '#FF9FF3' },
      transport: { name: 'Transport', icon: '🚗', color: '#54A0FF' },
      school: { name: 'School', icon: '📚', color: '#48DBFB' },
      kitchen: { name: 'Kitchen', icon: '🍴', color: '#F8B500' },
      furniture: { name: 'Furniture', icon: '🪑', color: '#EE5A6F' },
      descriptions: { name: 'Descriptions', icon: '📝', color: '#C44569' },
      expressions: { name: 'Expressions', icon: '💬', color: '#F8B195' },
      seasons: { name: 'Seasons', icon: '🌸', color: '#C06C84' },
    };
    
    return categoryMap[categoryId] || { name: categoryId, icon: '📚', color: '#667eea' };
  };

  const categoryInfo = getCategoryInfo(category);

  useEffect(() => {
    let isMounted = true;
    
    const preloadCategoryAssets = async () => {
      // Get all words for this category
      const categoryWords = vocabularyWords.filter(word => word.category === category);
      
      if (categoryWords.length === 0) {
        onComplete();
        return;
      }

      // Create asset list for this category
      const assetsToLoad: { type: 'image' | 'audio'; src: string; name: string }[] = [];
      
      // Add vocabulary images and audio for each word
      categoryWords.forEach(word => {
        // Add image
        assetsToLoad.push({
          type: 'image',
          src: `/images/vocabulary/${word.id}.webp`,
          name: `${word.english} Image`
        });
        
        // Add audio for all languages
        assetsToLoad.push(
          {
            type: 'audio',
            src: `/sounds/vocabulary/en/${word.id}.mp3`,
            name: `${word.english} (English)`
          },
          {
            type: 'audio',
            src: `/sounds/vocabulary/fr/${word.id}.mp3`,
            name: `${word.french} (French)`
          },
          {
            type: 'audio',
            src: `/sounds/vocabulary/it/${word.id}.mp3`,
            name: `${word.italian} (Italian)`
          }
        );
      });

      if (!isMounted) return;
      
      setTotalAssets(assetsToLoad.length);
      let loaded = 0;

      const loadAsset = (asset: { type: 'image' | 'audio'; src: string; name: string }): Promise<void> => {
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
        await new Promise(resolve => setTimeout(resolve, 30));
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
            }, 300);
          }
        }, 800);
      }
    };

    preloadCategoryAssets();

    return () => {
      isMounted = false;
    };
  }, [category, onComplete]);

  return (
    <div 
      className={`${styles.preloader} ${styles[animationPhase]}`}
      style={{ '--category-color': categoryInfo.color } as React.CSSProperties}
    >
      <div className={styles.content}>
        {/* Category Icon and Title */}
        <div className={styles.categoryHeader}>
          <div className={styles.categoryIcon}>
            {categoryInfo.icon}
          </div>
          <h2 className={styles.categoryTitle}>
            Loading {categoryInfo.name}
          </h2>
          <p className={styles.subtitle}>
            Preparing vocabulary cards and audio...
          </p>
        </div>

        {/* Progress Section */}
        <div className={styles.progressSection}>
          <div className={styles.progressContainer}>
            <div className={styles.progressTrack}>
              <div 
                className={styles.progressBar}
                style={{ '--progress': `${progress}%` } as React.CSSProperties}
              />
            </div>
            
            <div className={styles.progressInfo}>
              <span className={styles.percentage}>{progress}%</span>
              <div className={styles.assetDetails}>
                <div className={styles.currentAsset}>{currentAsset}</div>
                <div className={styles.assetCount}>
                  {loadedAssets} / {totalAssets} items
                </div>
              </div>
            </div>
          </div>

          {/* Loading Dots */}
          <div className={styles.loadingDots}>
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className={styles.dot}
                style={{ '--delay': `${i * 0.2}s` } as React.CSSProperties}
              />
            ))}
          </div>
        </div>

        {/* Completion Message */}
        {animationPhase === 'complete' && (
          <div className={styles.completionMessage}>
            <div className={styles.successIcon}>🎉</div>
            <span>Ready to explore!</span>
          </div>
        )}
      </div>

      {/* Background Pattern */}
      <div className={styles.backgroundPattern}>
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className={styles.patternDot}
            style={{
              '--delay': `${i * 0.1}s`,
              '--x': `${(i % 5) * 20}%`,
              '--y': `${Math.floor(i / 5) * 25}%`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
};

export default VocabCategoryPreloader;