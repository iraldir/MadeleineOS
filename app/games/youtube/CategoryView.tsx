'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Category, Video } from '@/services/youtubeService';
import { currencyService } from '@/services';

interface CategoryViewProps {
  category: Category;
  videos: Video[];
  onSelectVideo: (videoId: string) => void;
}

export default function CategoryView({ category, videos, onSelectVideo }: CategoryViewProps) {
  const [currentCoins, setCurrentCoins] = useState(0);

  useEffect(() => {
    setCurrentCoins(currencyService.getCoins());
    
    const unsubscribe = currencyService.subscribe((coins) => {
      setCurrentCoins(coins);
    });
    
    return unsubscribe;
  }, []);

  return (
    <>
      <div className={styles.categoryHeader}>
        <div className={styles.categoryHeaderIcon}>
          <img src={category.icon} alt={category.name} />
        </div>
        <h1 className={styles.categoryTitle}>{category.name} Videos</h1>
      </div>
      
      <div className={styles.videosGrid}>
        {videos.map(video => (
          <button
            key={video.id}
            onClick={() => onSelectVideo(video.id)}
            className={`${styles.videoCard} ${currentCoins < 1 ? styles.disabled : ''}`}
            disabled={currentCoins < 1}
          >
            <div className={styles.videoThumbnail}>
              <img src={video.thumbnail} alt={video.title} />
              {video.duration && (
                <span className={styles.videoDuration}>{video.duration}</span>
              )}
              <div className={styles.coinCost}>
                <span>🪙 1</span>
              </div>
            </div>
            <div className={styles.videoTitle}>{video.title}</div>
          </button>
        ))}
      </div>
      
      {currentCoins < 1 && (
        <div className={styles.insufficientCoinsMessage}>
          <p>You need coins to watch videos! 🪙</p>
          <p>Play Math or Writing games to earn more!</p>
        </div>
      )}
    </>
  );
}