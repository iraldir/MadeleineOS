"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import VocabularyCard from "@/components/VocabularyCard";
import { vocabularyWords } from "@/types/vocabulary";
import PageBackground from "@/components/PageBackground";
import VocabCategoryPreloader from "@/components/VocabCategoryPreloader";

type ViewState = "menu" | "categories" | "preloading" | "cards";

interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  count: number;
  difficulty: number;
  color: string;
}

const VocabularyGame: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>("categories");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const categoryInfo: CategoryInfo[] = useMemo(() => {
    const counts: { [key: string]: number } = {};
    vocabularyWords.forEach((word) => {
      counts[word.category] = (counts[word.category] || 0) + 1;
    });

    const categoryDetails: CategoryInfo[] = [
      {
        id: "greetings",
        name: "Greetings",
        icon: "👋",
        count: counts.greetings || 0,
        difficulty: 1,
        color: "#FF6B6B",
      },
      {
        id: "numbers",
        name: "Numbers",
        icon: "🔢",
        count: counts.numbers || 0,
        difficulty: 1,
        color: "#4ECDC4",
      },
      {
        id: "colors",
        name: "Colors",
        icon: "🎨",
        count: counts.colors || 0,
        difficulty: 1,
        color: "#95E1D3",
      },
      {
        id: "family",
        name: "Family",
        icon: "👨‍👩‍👧‍👦",
        count: counts.family || 0,
        difficulty: 2,
        color: "#F38181",
      },
      {
        id: "animals",
        name: "Animals",
        icon: "🐾",
        count: counts.animals || 0,
        difficulty: 2,
        color: "#FFEAA7",
      },
      {
        id: "food",
        name: "Food & Drink",
        icon: "🍎",
        count: counts.food || 0,
        difficulty: 2,
        color: "#FAB1A0",
      },
      {
        id: "body",
        name: "Body Parts",
        icon: "👤",
        count: counts.body || 0,
        difficulty: 3,
        color: "#A8E6CF",
      },
      {
        id: "clothing",
        name: "Clothing",
        icon: "👕",
        count: counts.clothing || 0,
        difficulty: 3,
        color: "#FFD3B6",
      },
      {
        id: "house",
        name: "House & Home",
        icon: "🏠",
        count: counts.house || 0,
        difficulty: 3,
        color: "#FF8B94",
      },
      {
        id: "nature",
        name: "Nature",
        icon: "🌳",
        count: counts.nature || 0,
        difficulty: 3,
        color: "#A0E7E5",
      },
      {
        id: "emotions",
        name: "Emotions",
        icon: "😊",
        count: counts.emotions || 0,
        difficulty: 3,
        color: "#B4F8C8",
      },
      {
        id: "actions",
        name: "Actions",
        icon: "🏃",
        count: counts.actions || 0,
        difficulty: 4,
        color: "#FBE7C6",
      },
      {
        id: "time",
        name: "Time & Days",
        icon: "⏰",
        count: counts.time || 0,
        difficulty: 4,
        color: "#C9B1FF",
      },
      {
        id: "people",
        name: "People",
        icon: "👥",
        count: counts.people || 0,
        difficulty: 4,
        color: "#FDCB6E",
      },
      {
        id: "objects",
        name: "Objects",
        icon: "📦",
        count: counts.objects || 0,
        difficulty: 4,
        color: "#FF9FF3",
      },
      {
        id: "transport",
        name: "Transport",
        icon: "🚗",
        count: counts.transport || 0,
        difficulty: 5,
        color: "#54A0FF",
      },
      {
        id: "school",
        name: "School",
        icon: "📚",
        count: counts.school || 0,
        difficulty: 5,
        color: "#48DBFB",
      },
      {
        id: "kitchen",
        name: "Kitchen",
        icon: "🍴",
        count: counts.kitchen || 0,
        difficulty: 5,
        color: "#F8B500",
      },
      {
        id: "furniture",
        name: "Furniture",
        icon: "🪑",
        count: counts.furniture || 0,
        difficulty: 5,
        color: "#EE5A6F",
      },
      {
        id: "descriptions",
        name: "Descriptions",
        icon: "📝",
        count: counts.descriptions || 0,
        difficulty: 6,
        color: "#C44569",
      },
      {
        id: "expressions",
        name: "Expressions",
        icon: "💬",
        count: counts.expressions || 0,
        difficulty: 6,
        color: "#F8B195",
      },
      {
        id: "seasons",
        name: "Seasons",
        icon: "🌸",
        count: counts.seasons || 0,
        difficulty: 6,
        color: "#C06C84",
      },
    ];

    return categoryDetails
      .filter((cat) => cat.count > 0)
      .sort((a, b) => {
        if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
        return b.count - a.count;
      });
  }, []);

  const filteredWords = useMemo(() => {
    if (!selectedCategory || !vocabularyWords) return [];
    return vocabularyWords.filter((word) => word.category === selectedCategory);
  }, [selectedCategory]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setViewState("preloading");
  };

  const handlePreloadingComplete = () => {
    setViewState("cards");
  };

  const handleBackButton = () => {
    if (viewState === "cards" || viewState === "preloading") {
      setViewState("categories");
      setSelectedCategory("");
    } else if (viewState === "categories") {
      // Go back to main menu
      window.location.href = "/";
    }
  };

  return (
    <div className={styles.container}>
      <PageBackground type="subtleRainbow" animated={true} />

      {/* Back button */}
      <button className={styles.backButton} onClick={handleBackButton}>
        ← Back
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>Vocabulary Explorer</h1>
        <p className={styles.subtitle}>
          Learn words in English, French, and Italian!
        </p>
      </div>

      {viewState === "categories" && (
        <>
          <div className={styles.categoryGrid}>
            {categoryInfo.map((category) => (
              <button
                key={category.id}
                className={styles.categoryCard}
                onClick={() => handleCategorySelect(category.id)}
                style={
                  {
                    "--category-color": category.color,
                    "--hover-color": category.color + "DD",
                  } as React.CSSProperties
                }
              >
                <div className={styles.categoryImageContainer}>
                  <Image
                    src={`/images/categories/${category.id}.webp`}
                    alt={category.name}
                    width={180}
                    height={140}
                    className={styles.categoryImage}
                    onError={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement("div");
                        fallback.className = styles.categoryImageFallback;
                        fallback.textContent = category.icon;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                </div>
                <div className={styles.categoryInfo}>
                  <h3 className={styles.categoryName}>{category.name}</h3>
                  <span className={styles.categoryCount}>
                    {category.count} words
                  </span>
                  <div className={styles.difficultyDots}>
                    {Array.from({ length: 6 }, (_, i) => (
                      <span
                        key={i}
                        className={`${styles.dot} ${
                          i < category.difficulty ? styles.filled : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {viewState === "preloading" && (
        <VocabCategoryPreloader 
          category={selectedCategory} 
          onComplete={handlePreloadingComplete} 
        />
      )}

      {viewState === "cards" && (
        <>
          <div className={styles.categoryHeader}>
            <h2 className={styles.categoryTitle}>
              {categoryInfo.find((c) => c.id === selectedCategory)?.icon}{" "}
              {categoryInfo.find((c) => c.id === selectedCategory)?.name}
            </h2>
            <span className={styles.wordCount}>
              {filteredWords.length} words
            </span>
          </div>

          <div className={styles.cardGrid}>
            {filteredWords.map((word) => (
              <VocabularyCard key={word.id} word={word} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VocabularyGame;
