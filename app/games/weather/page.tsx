/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { ArrowLeft, Cloud, Sun, CloudRain } from "lucide-react";
import { weatherService } from "@/services/weatherService";

export default function WeatherGame() {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      setLoading(true);
      const data = await weatherService.fetchWeather();
      setWeather(data);
    } catch (err) {
      setError("Could not load weather. Please try again later!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>
          <div className={styles.loadingIcon}>☀️</div>
          <p>Checking the weather...</p>
        </div>
      </main>
    );
  }

  if (error || !weather) {
    return (
      <main className={styles.main}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.backButton}>
            <ArrowLeft size={32} />
          </Link>
        </nav>
        <div className={styles.error}>
          <p>{error || "Something went wrong!"}</p>
          <button onClick={loadWeather} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const tempCategory = weatherService.getTemperatureCategory(
    weather.temperature
  );
  const condition = weatherService.getSimpleWeatherCondition(
    weather.weatherType
  );
  const dayOfWeek = weatherService.getDayOfWeek();
  const formattedDate = weatherService.getFormattedDate();

  // Calculate temperature gauge position (0-100%)
  // Adjusted scale: 0°C to 30°C for better UK weather representation
  const minTemp = 0;
  const maxTemp = 30;
  const gaugePosition = Math.max(
    0,
    Math.min(100, ((weather.temperature - minTemp) / (maxTemp - minTemp)) * 100)
  );

  const WeatherIcon = () => {
    switch (weather.weatherType) {
      case "sunny":
        return <Sun className={styles.weatherIcon} size={100} />;
      case "rainy":
        return <CloudRain className={styles.weatherIcon} size={100} />;
      case "cloudy":
      default:
        return <Cloud className={styles.weatherIcon} size={100} />;
    }
  };

  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.backButton}>
          <ArrowLeft size={32} />
        </Link>
      </nav>

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Today&apos;s Weather in London! 🇬🇧</h1>
          <div className={styles.dateInfo}>
            <span className={styles.day}>{dayOfWeek}</span>
            <span className={styles.date}>{formattedDate}</span>
          </div>
        </div>

        {/* Temperature Gauge - Moved to top */}
        <div className={styles.temperatureSection}>
          <div className={styles.temperatureGauge}>
            <div className={styles.gaugeContainer}>
              <div className={styles.gaugeTrack}>
                <div
                  className={styles.gaugeZone}
                  style={{
                    left: "0%",
                    width: "46.7%",
                    background: "linear-gradient(90deg, #4FC3F7, #4FC3F7)",
                  }}
                >
                  <span className={styles.gaugeLabel}>Cold</span>
                  <span className={styles.gaugeEmoji}>🥶</span>
                </div>
                <div
                  className={styles.gaugeZone}
                  style={{
                    left: "46.7%",
                    width: "36.6%",
                    background: "linear-gradient(90deg, #66BB6A, #66BB6A)",
                  }}
                >
                  <span className={styles.gaugeLabel}>Nice</span>
                  <span className={styles.gaugeEmoji}>😊</span>
                </div>
                <div
                  className={styles.gaugeZone}
                  style={{
                    left: "83.3%",
                    width: "16.7%",
                    background: "linear-gradient(90deg, #FF7043, #FF7043)",
                  }}
                >
                  <span className={styles.gaugeLabel}>Hot</span>
                  <span className={styles.gaugeEmoji}>🥵</span>
                </div>
              </div>
              <div
                className={styles.gaugePointer}
                style={{
                  left: `${gaugePosition}%`,
                }}
              >
                <div className={styles.pointerDot}>
                  <span className={styles.pointerEmoji}>
                    {tempCategory.emoji}
                  </span>
                </div>
                <div className={styles.pointerArrow} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Weather Display */}
        <div className={styles.weatherDisplay}>
          <div className={styles.weatherMain}>
            <div
              className={`${styles.weatherAnimation} ${
                styles[condition.animation]
              }`}
            >
              <WeatherIcon />
              <div className={styles.weatherEmoji}>{condition.emoji}</div>
            </div>
            <div className={styles.weatherInfo}>
              <div className={styles.temperature}>
                <span className={styles.tempNumber}>{weather.temperature}</span>
                <span className={styles.tempUnit}>°C</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
