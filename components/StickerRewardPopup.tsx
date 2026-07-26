"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./StickerRewardPopup.module.css";
import { challengeService, celebrationService, audioService } from "@/services";
import { Sticker, stickerImageUrl } from "@/types/stickers";

type Phase = "silhouette" | "revealed";

const SHAKE_MS = 1600;

export default function StickerRewardPopup() {
  const [sticker, setSticker] = useState<Sticker | null>(null);
  const [phase, setPhase] = useState<Phase>("silhouette");

  useEffect(() => {
    return challengeService.subscribeToCompletion((earned) => {
      if (!earned) return;
      setSticker(earned);
      setPhase("silhouette");
    });
  }, []);

  useEffect(() => {
    if (!sticker || phase !== "silhouette") return;
    const timer = setTimeout(() => {
      setPhase("revealed");
      audioService.playSuccess();
      celebrationService.bigCelebration();
    }, SHAKE_MS);
    return () => clearTimeout(timer);
  }, [sticker, phase]);

  if (!sticker) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <h2 className={styles.title}>Challenge complete!</h2>
        <p className={styles.subtitle}>You earned a new sticker!</p>
        <div
          className={`${styles.stickerWrap} ${
            phase === "silhouette" ? styles.shaking : styles.revealed
          }`}
        >
          <Image
            src={stickerImageUrl(sticker.id)}
            alt={phase === "revealed" ? sticker.name : "Mystery sticker"}
            fill
            sizes="260px"
            className={styles.stickerImage}
            priority
          />
        </div>
        <p className={styles.stickerName}>
          {phase === "revealed" ? sticker.name : "???"}
        </p>
        <button
          className={styles.closeButton}
          onClick={() => setSticker(null)}
          disabled={phase !== "revealed"}
        >
          Yay!
        </button>
      </div>
    </div>
  );
}
