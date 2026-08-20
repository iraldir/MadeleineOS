/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { youtubeService, effectiveRotationSeed, VideoCategory } from "@/services/youtubeService";
import { currencyService } from "@/services";
import CategoryView from "./CategoryView";
import VideoPlayer from "./VideoPlayer";

type ViewMode = "categories" | "videos" | "player";

export default function YouTubeApp() {
  const [viewMode, setViewMode] = useState<ViewMode>("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [_showInsufficientCoins, setShowInsufficientCoins] = useState(false);
  // Which half-day's line-up to show. Read off the clock here, in a click
  // handler, rather than during render: the page is a client component that
  // Next still prerenders, so a render that looked at the clock would bake the
  // build-time line-up into the HTML and mismatch on hydration.
  const [rotationSeed, setRotationSeed] = useState<string | null>(null);

  const handleSelectCategory = (categoryId: string) => {
    // effectiveRotationSeed folds in any terminal override (shuffle / prev /
    // next / all) for the current half-day; null means "show the whole list".
    setRotationSeed(effectiveRotationSeed(new Date()));
    setSelectedCategory(categoryId);
    setViewMode("videos");
  };

  const handleSelectVideo = (videoId: string) => {
    // Check if user has enough coins
    if (!currencyService.canAfford(1)) {
      setShowInsufficientCoins(true);
      setTimeout(() => setShowInsufficientCoins(false), 2000);
      return;
    }

    // Spend 1 coin to watch the video
    if (currencyService.spendCoins(1)) {
      setSelectedVideoId(videoId);
      setViewMode("player");
    }
  };

  const handleBackFromVideos = () => {
    setViewMode("categories");
    setSelectedCategory(null);
  };

  const handleBackFromPlayer = () => {
    setViewMode("videos");
    setSelectedVideoId(null);
  };

  const categories = youtubeService.getCategories();
  const videos = selectedCategory
    ? youtubeService.getVideosForDisplay(selectedCategory as VideoCategory, rotationSeed)
    : [];
  const currentVideo = selectedVideoId
    ? youtubeService.getVideo(selectedVideoId)
    : null;

  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        {viewMode === "categories" ? (
          <Link href="/" className={styles.backButton}>
            <ArrowLeft size={32} />
          </Link>
        ) : viewMode === "videos" ? (
          <button onClick={handleBackFromVideos} className={styles.backButton}>
            <ArrowLeft size={32} />
          </button>
        ) : (
          <button onClick={handleBackFromPlayer} className={styles.backButton}>
            <ArrowLeft size={32} />
          </button>
        )}
      </nav>

      <div className={styles.container}>
        {viewMode === "categories" && (
          <>
            <h1 className={styles.title}>Choose What to Watch! 📺</h1>
            <div className={styles.categoriesGrid}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleSelectCategory(category.id)}
                  className={styles.categoryCard}
                  style={{ backgroundColor: category.color }}
                >
                  <div className={styles.categoryIcon}>
                    <img src={category.icon} alt={category.name} />
                  </div>
                  <div className={styles.categoryName}>{category.name}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {viewMode === "videos" && selectedCategory && (
          <CategoryView
            category={youtubeService.getCategory(selectedCategory)!}
            videos={videos}
            onSelectVideo={handleSelectVideo}
          />
        )}

        {viewMode === "player" && currentVideo && (
          <VideoPlayer video={currentVideo} onBack={handleBackFromPlayer} />
        )}
      </div>
    </main>
  );
}
