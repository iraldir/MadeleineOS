import Link from 'next/link';
import styles from "./page.module.css";
import { games } from '@/types/games';
import PageBackground from '@/components/PageBackground';

export default function Home() {
  return (
    <main className={styles.main}>
      <PageBackground type="floralWithPetals" animated={true} />
      <h1 className={styles.title}>Madeleine&apos;s Learning Games</h1>
      
      <div className={styles.gameGrid}>
        {games.map((game) => (
          game.path === '#' ? (
            <div key={game.id} className={styles.gameCard}>
              <div className={styles.gameCardInner}>
                <div className={styles.gameThumbnail} />
                <p className={styles.gameTitle}>{game.title}</p>
              </div>
            </div>
          ) : (
            <Link key={game.id} href={game.path} className={styles.gameCard}>
              <div className={styles.gameCardInner}>
                <div 
                  className={styles.gameThumbnail}
                  style={{ backgroundImage: `url(${game.thumbnailUrl})` }}
                />
                <p className={styles.gameTitle}>{game.title}</p>
              </div>
            </Link>
          )
        ))}
      </div>
    </main>
  );
}
