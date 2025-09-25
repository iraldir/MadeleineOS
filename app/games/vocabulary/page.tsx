'use client';

import React, { useState, useMemo } from 'react';
import styles from './page.module.css';
import VocabularyCard from '@/components/VocabularyCard';
import { vocabularyWords } from '@/types/vocabulary';
import PageBackground from '@/components/PageBackground';

const VocabularyGame: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = useMemo(() => {
    if (!vocabularyWords || !Array.isArray(vocabularyWords)) {
      return ['all'];
    }
    const cats = new Set(vocabularyWords.map(word => word.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const filteredWords = useMemo(() => {
    if (!vocabularyWords || !Array.isArray(vocabularyWords)) {
      return [];
    }
    let filtered = vocabularyWords;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(word => word.category === selectedCategory);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(word => 
        word.english.toLowerCase().includes(search) ||
        word.french.toLowerCase().includes(search) ||
        word.italian.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [selectedCategory, searchTerm]);

  return (
    <div className={styles.container}>
      <PageBackground type="subtleRainbow" animated={true} />
      <div className={styles.header}>
        <h1 className={styles.title}>Vocabulary Explorer</h1>
        <p className={styles.subtitle}>Learn words in English, French, and Italian!</p>
      </div>

      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search for a word in any language..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.filters}>
        {categories.map(category => (
          <button
            key={category}
            className={`${styles.filterButton} ${selectedCategory === category ? styles.active : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category === 'all' ? 'All Words' : category}
          </button>
        ))}
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          Total Words: {vocabularyWords?.length || 0}
        </div>
        <div className={styles.statItem}>
          Showing: {filteredWords.length}
        </div>
      </div>

      {filteredWords && filteredWords.length > 0 ? (
        <div className={styles.cardGrid}>
          {filteredWords.map(word => (
            <VocabularyCard key={word.id} word={word} />
          ))}
        </div>
      ) : (
        <div className={styles.noResults}>
          No words found matching your search.
        </div>
      )}
    </div>
  );
};

export default VocabularyGame;