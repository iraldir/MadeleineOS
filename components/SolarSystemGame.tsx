'use client';

import { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import styles from './SolarSystemGame.module.css';

interface Planet {
  name: string;
  size: number; // relative size (1 = smallest)
  orbitRadius: number; // distance from sun in pixels
  orbitSpeed: number; // seconds for full orbit
  color?: string; // for orbit path
}

const planets: Planet[] = [
  { name: 'sun', size: 4, orbitRadius: 0, orbitSpeed: 0, color: '#FDB813' },
  { name: 'mercury', size: 0.8, orbitRadius: 80, orbitSpeed: 4, color: '#8C7A6B' },
  { name: 'venus', size: 1.2, orbitRadius: 120, orbitSpeed: 7, color: '#FFC649' },
  { name: 'earth', size: 1.3, orbitRadius: 170, orbitSpeed: 10, color: '#4A90E2' },
  { name: 'mars', size: 1, orbitRadius: 220, orbitSpeed: 15, color: '#CD5C5C' },
  { name: 'jupiter', size: 3, orbitRadius: 300, orbitSpeed: 25, color: '#C88B3A' },
  { name: 'saturn', size: 2.5, orbitRadius: 380, orbitSpeed: 35, color: '#FAD5A5' },
  { name: 'uranus', size: 1.8, orbitRadius: 450, orbitSpeed: 45, color: '#4FD0E0' },
  { name: 'neptune', size: 1.7, orbitRadius: 500, orbitSpeed: 55, color: '#4B70DD' },
];

export default function SolarSystemGame() {
  const [isCuteMode, setIsCuteMode] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPaused) {
      startTimeRef.current = Date.now() - pausedTimeRef.current;
      const animate = () => {
        if (canvasRef.current) {
          const currentTime = Date.now() - startTimeRef.current;
          
          planets.forEach((planet) => {
            if (planet.orbitRadius === 0) return; // Skip sun
            
            const planetElement = canvasRef.current?.querySelector(
              `[data-planet="${planet.name}"]`
            ) as HTMLElement;
            
            if (planetElement) {
              const angle = (currentTime / 1000 / planet.orbitSpeed) * 2 * Math.PI;
              const x = Math.cos(angle) * planet.orbitRadius;
              const y = Math.sin(angle) * planet.orbitRadius;
              
              planetElement.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
            }
          });
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      pausedTimeRef.current = Date.now() - startTimeRef.current;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused]);

  const playPlanetSound = (planetName: string) => {
    const sound = new Howl({
      src: [`/sounds/solar-system/${planetName}.mp3`],
      volume: 0.5,
    });
    sound.play();
    setSelectedPlanet(planetName);
    setTimeout(() => setSelectedPlanet(null), 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Solar System</h1>
        <div className={styles.controls}>
          <button
            className={styles.styleToggle}
            onClick={() => setIsCuteMode(!isCuteMode)}
          >
            {isCuteMode ? '🌟 Cute Mode' : '🔭 Realistic Mode'}
          </button>
          <button
            className={styles.pauseButton}
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? '▶️ Play' : '⏸️ Pause'}
          </button>
        </div>
      </div>

      <div className={styles.solarSystem} ref={canvasRef}>
        <div className={styles.centerPoint}>
          {/* Orbit paths */}
          {planets.map((planet) => (
            planet.orbitRadius > 0 && (
              <div
                key={`orbit-${planet.name}`}
                className={styles.orbit}
                style={{
                  width: `${planet.orbitRadius * 2}px`,
                  height: `${planet.orbitRadius * 2}px`,
                  borderColor: planet.color,
                  opacity: 0.2,
                }}
              />
            )
          ))}

          {/* Planets */}
          {planets.map((planet) => (
            <div
              key={planet.name}
              data-planet={planet.name}
              className={`${styles.planet} ${
                selectedPlanet === planet.name ? styles.selected : ''
              }`}
              style={{
                width: `${planet.size * 30}px`,
                height: `${planet.size * 30}px`,
                position: planet.orbitRadius === 0 ? 'relative' : 'absolute',
                zIndex: planet.name === 'saturn' ? 10 : planet.size * 10,
              }}
              onClick={() => playPlanetSound(planet.name)}
            >
              <img
                src={`/images/solar-system/${isCuteMode ? 'cute' : 'realistic'}/${planet.name}.webp`}
                alt={planet.name}
                className={styles.planetImage}
              />
              {selectedPlanet === planet.name && (
                <div className={styles.planetLabel}>
                  {planet.name.charAt(0).toUpperCase() + planet.name.slice(1)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.info}>
        <p>Click on any planet to hear its name!</p>
        {selectedPlanet && (
          <p className={styles.currentPlanet}>
            Now showing: <strong>{selectedPlanet.charAt(0).toUpperCase() + selectedPlanet.slice(1)}</strong>
          </p>
        )}
      </div>
    </div>
  );
}