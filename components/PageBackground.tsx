'use client';

import React from 'react';
import styles from '../styles/backgrounds.module.css';

export type BackgroundType = 'dreamyFloral' | 'subtleRainbow' | 'floralWithPetals' | 'bokehRainbow' | 'minimal';

interface PageBackgroundProps {
  type?: BackgroundType;
  children?: React.ReactNode;
  className?: string;
  animated?: boolean;
}

export default function PageBackground({ 
  type = 'dreamyFloral', 
  children, 
  className = '',
  animated = true 
}: PageBackgroundProps) {
  
  const renderBackground = () => {
    switch(type) {
      case 'dreamyFloral':
        return (
          <div className={styles.dreamyFloral}>
            {animated && (
              <div className={styles.rainbowShimmer} />
            )}
          </div>
        );
        
      case 'subtleRainbow':
        return (
          <div className={styles.subtleRainbow}>
            {animated && (
              <div className={styles.bokehEffect}>
                <div className={styles.bokeh} />
                <div className={styles.bokeh} />
                <div className={styles.bokeh} />
              </div>
            )}
          </div>
        );
        
      case 'floralWithPetals':
        return (
          <div className={styles.pageBackground}>
            <div className={styles.subtleFloral} />
            <div className={styles.floralPattern} />
            {animated && (
              <div className={styles.petalOverlay}>
                <div className={styles.petal} />
                <div className={styles.petal} />
                <div className={styles.petal} />
                <div className={styles.petal} />
                <div className={styles.petal} />
              </div>
            )}
          </div>
        );
        
      case 'bokehRainbow':
        return (
          <div className={styles.pageBackground}>
            <div className={styles.rainbowGradient} />
            {animated && (
              <div className={styles.bokehEffect}>
                <div className={styles.bokeh} />
                <div className={styles.bokeh} />
                <div className={styles.bokeh} />
              </div>
            )}
            <div className={styles.floralPattern} />
          </div>
        );
        
      case 'minimal':
        return (
          <div className={styles.pageBackground}>
            <div className={styles.subtleFloral} style={{ opacity: 0.08 }} />
            <div className={styles.rainbowGradient} style={{ opacity: 0.05 }} />
          </div>
        );
        
      default:
        return <div className={styles.dreamyFloral} />;
    }
  };
  
  return (
    <>
      {renderBackground()}
      {children && (
        <div className={className} style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      )}
    </>
  );
}