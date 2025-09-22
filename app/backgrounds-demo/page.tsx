'use client';

import React, { useState } from 'react';
import PageBackground, { BackgroundType } from '@/components/PageBackground';
import styles from './page.module.css';
import '../../../styles/background-presets.css';

const backgroundTypes: { type: BackgroundType; name: string; description: string }[] = [
  {
    type: 'dreamyFloral',
    name: 'Dreamy Floral',
    description: 'Soft floral background with shimmer effect'
  },
  {
    type: 'subtleRainbow',
    name: 'Subtle Rainbow',
    description: 'Gradient rainbow with bokeh bubbles'
  },
  {
    type: 'floralWithPetals',
    name: 'Floral with Petals',
    description: 'Animated falling petals over floral pattern'
  },
  {
    type: 'bokehRainbow',
    name: 'Bokeh Rainbow',
    description: 'Rainbow gradient with bokeh and floral overlay'
  },
  {
    type: 'minimal',
    name: 'Minimal',
    description: 'Very subtle background for minimal distraction'
  }
];

export default function BackgroundsDemo() {
  const [currentBg, setCurrentBg] = useState<BackgroundType>('dreamyFloral');
  const [animated, setAnimated] = useState(true);

  return (
    <div className={styles.container}>
      <PageBackground type={currentBg} animated={animated} />
      
      <div className={styles.content}>
        <h1 className={styles.title}>Background Styles Demo</h1>
        <p className={styles.subtitle}>
          Subtle, flowery, and rainbow-themed backgrounds for Madeleine&apos;s Learning Games
        </p>

        <div className={styles.controls}>
          <label className={styles.animationToggle}>
            <input
              type="checkbox"
              checked={animated}
              onChange={(e) => setAnimated(e.target.checked)}
            />
            <span>Enable Animations</span>
          </label>
        </div>

        <div className={styles.backgroundGrid}>
          {backgroundTypes.map(({ type, name, description }) => (
            <button
              key={type}
              className={`${styles.backgroundCard} ${currentBg === type ? styles.active : ''}`}
              onClick={() => setCurrentBg(type)}
            >
              <div className={styles.preview}>
                <PageBackground type={type} animated={false} />
              </div>
              <h3>{name}</h3>
              <p>{description}</p>
            </button>
          ))}
        </div>

        <div className={styles.cssExamples}>
          <h2>CSS Class Examples</h2>
          <div className={styles.exampleGrid}>
            <div className="bg-dreamy-floral" style={{ padding: '20px', borderRadius: '8px' }}>
              <h3>bg-dreamy-floral</h3>
              <p>Floral background with soft blur</p>
            </div>
            
            <div className="bg-rainbow-subtle" style={{ padding: '20px', borderRadius: '8px' }}>
              <h3>bg-rainbow-subtle</h3>
              <p>Subtle rainbow gradient</p>
            </div>
            
            <div className="bg-watercolor" style={{ padding: '20px', borderRadius: '8px' }}>
              <h3>bg-watercolor</h3>
              <p>Watercolor wash effect</p>
            </div>
            
            <div className="bg-pastel-minimal" style={{ padding: '20px', borderRadius: '8px' }}>
              <h3>bg-pastel-minimal</h3>
              <p>Minimal pastel gradient</p>
            </div>
          </div>
        </div>

        <div className={styles.usage}>
          <h2>How to Use</h2>
          
          <div className={styles.codeBlock}>
            <h3>React Component:</h3>
            <pre>{`import PageBackground from '@/components/PageBackground';

<PageBackground type="dreamyFloral" animated={true} />`}</pre>
          </div>
          
          <div className={styles.codeBlock}>
            <h3>CSS Classes:</h3>
            <pre>{`<div className="bg-rainbow-subtle">
  Your content here
</div>`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}