"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from "./page.module.css";
import { games } from '@/types/games';
import PageBackground from '@/components/PageBackground';
import { X, RotateCw } from 'lucide-react';

const BLOCKED_GAMES_KEY = "madeleine_blocked_games";

export default function Home() {
  const [blockedGames, setBlockedGames] = useState<string[]>([]);

  useEffect(() => {
    // Load blocked games from localStorage
    const blocked = localStorage.getItem(BLOCKED_GAMES_KEY);
    if (blocked) {
      setBlockedGames(JSON.parse(blocked));
    }
  }, []);

  const isGameBlocked = (gamePath: string) => {
    // Extract game name from path (e.g., "/games/math" -> "math")
    const gameName = gamePath.replace('/games/', '');
    return blockedGames.includes(gameName);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <main className={styles.main}>
      <PageBackground type="floralWithPetals" animated={true} />
      
      {/* Discreet refresh button for kiosk mode */}
      <button 
        onClick={handleRefresh}
        className={styles.refreshButton}
        aria-label="Refresh page"
        title="Refresh"
      >
        <RotateCw size={20} />
      </button>
      
      <h1 className={styles.title}>Madeleine&apos;s Learning Games</h1>
      
      <div className={styles.gameGrid}>
        {games.map((game) => {
          const isBlocked = game.path !== '#' && isGameBlocked(game.path);
          
          if (game.path === '#') {
            return (
              <div key={game.id} className={styles.gameCard}>
                <div className={styles.gameCardInner}>
                  <div className={styles.gameThumbnail} />
                  <p className={styles.gameTitle}>{game.title}</p>
                </div>
              </div>
            );
          }
          
          if (isBlocked) {
            return (
              <div key={game.id} className={`${styles.gameCard} ${styles.blockedCard}`}>
                <div className={styles.gameCardInner}>
                  <div 
                    className={styles.gameThumbnail}
                    style={{ backgroundImage: `url(${game.thumbnailUrl})` }}
                  />
                  <div className={styles.blockedOverlay}>
                    <X size={80} color="#ff0000" strokeWidth={4} />
                  </div>
                  <p className={styles.gameTitle}>{game.title}</p>
                </div>
              </div>
            );
          }
          
          return (
            <Link key={game.id} href={game.path} className={styles.gameCard}>
              <div className={styles.gameCardInner}>
                <div 
                  className={styles.gameThumbnail}
                  style={{ backgroundImage: `url(${game.thumbnailUrl})` }}
                />
                <p className={styles.gameTitle}>{game.title}</p>
              </div>
            </Link>
          );
        })}
        
        {/* Terminal - hidden but accessible */}
        <Link href="/games/terminal" className={`${styles.gameCard} ${styles.hiddenTerminal}`}>
          <div className={styles.gameCardInner}>
            <div className={styles.gameThumbnail} style={{ backgroundColor: '#0a0a0a' }}>
              <span style={{ color: '#00ff00', fontSize: '2rem', fontFamily: 'monospace' }}>_</span>
            </div>
            <p className={styles.gameTitle}>Terminal</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
