"use client";
import { useEffect, useState, useCallback } from "react";
import styles from "./TypingInterface.module.css";
import { Trash2 } from "lucide-react";
import { Howl } from "howler";

interface TypingInterfaceProps {
  onTextChange?: (text: string) => void;
  onEnter?: (text: string) => void;
  cooldown?: number;
  className?: string;
  value?: string; // Add value prop to control the text from parent
}

export default function TypingInterface({
  onTextChange,
  onEnter,
  cooldown = 500,
  className = "",
  value,
}: TypingInterfaceProps) {
  const [text, setText] = useState(value || "");

  // Update text when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setText(value);
    }
  }, [value]);
  const [canType, setCanType] = useState(true);

  const playLetterSound = useCallback((letter: string) => {
    const sound = new Howl({
      src: [`/sounds/alphabet/english/${letter}.mp3`],
      volume: 1.0,
    });
    sound.play();
  }, []);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (!canType) return;

      // Handle Enter key
      if (e.key === "Enter" && onEnter) {
        onEnter(text);
        return;
      }

      // Only accept letters a-z or A-Z
      if (/^[a-zA-Z]$/.test(e.key)) {
        const upperLetter = e.key.toUpperCase();
        const newText = text + upperLetter;
        setText(newText);
        onTextChange?.(newText);
        playLetterSound(upperLetter);

        // Start cooldown
        setCanType(false);
        setTimeout(() => {
          setCanType(true);
        }, cooldown);
      }

      // Handle space key
      if (e.key === " " && text.length > 0) {
        const newText = text + " ";
        setText(newText);
        onTextChange?.(newText);

        // Start cooldown
        setCanType(false);
        setTimeout(() => {
          setCanType(true);
        }, cooldown);
      }
    },
    [canType, text, cooldown, onTextChange, onEnter, playLetterSound]
  );

  const handleClear = useCallback(() => {
    setText("");
    onTextChange?.("");
  }, [onTextChange]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  // Clear text when error animation starts
  useEffect(() => {
    if (className.includes("error")) {
      setTimeout(() => {
        setText("");
        onTextChange?.("");
      }, 500);
    }
  }, [className, onTextChange]);

  return (
    <div className={`${styles.gameArea} ${className}`}>
      <div className={styles.textDisplay}>
        {text.split("").map((letter, index) => (
          <span
            key={index}
            className={`${styles.letter} ${letter === " " ? styles.space : ""}`}
            style={{
              animationDelay: `0.1s`,
            }}
          >
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
        <span
          className={`${styles.cursor} ${!canType ? styles.waiting : ""}`}
        ></span>
      </div>
      {text && (
        <button
          onClick={handleClear}
          className={`${styles.button} ${styles.trashButton}`}
        >
          <Trash2 size={24} />
        </button>
      )}
    </div>
  );
}
