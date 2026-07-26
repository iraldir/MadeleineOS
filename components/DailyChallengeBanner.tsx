"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trophy, Check } from "lucide-react";
import styles from "./DailyChallengeBanner.module.css";
import { challengeService } from "@/services";
import type { DailyChallenge } from "@/services/challengeService";
import { getStickerById, stickerImageUrl } from "@/types/stickers";

export default function DailyChallengeBanner() {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);

  useEffect(() => {
    setChallenge(challengeService.getChallenge());
    return challengeService.subscribe(setChallenge);
  }, []);

  if (!challenge) return null;

  const earnedSticker = challenge.stickerId
    ? getStickerById(challenge.stickerId)
    : undefined;

  return (
    <Link href={challenge.path} className={styles.banner}>
      <div className={styles.trophy}>
        <Trophy size={32} />
      </div>
      <div className={styles.text}>
        <span className={styles.heading}>Challenge of the Day</span>
        <span className={styles.label}>{challenge.label}</span>
      </div>
      {challenge.completed ? (
        <div className={styles.completed}>
          <Check size={24} strokeWidth={4} />
          {earnedSticker && (
            <Image
              src={stickerImageUrl(earnedSticker.id)}
              alt={earnedSticker.name}
              width={48}
              height={48}
              className={styles.earnedSticker}
            />
          )}
        </div>
      ) : (
        <div className={styles.progress}>
          {Array.from({ length: challenge.goal }, (_, index) => (
            <span
              key={index}
              className={`${styles.progressDot} ${
                index < challenge.progress ? styles.progressDone : ""
              }`}
            />
          ))}
          <span className={styles.progressCount}>
            {challenge.progress}/{challenge.goal}
          </span>
        </div>
      )}
    </Link>
  );
}
