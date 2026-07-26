"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import styles from "./page.module.css";
import { stickers, stickerImageUrl } from "@/types/stickers";
import { stickerService } from "@/services";
import PageBackground from "@/components/PageBackground";

export default function StickerBook() {
  const [ownedIds, setOwnedIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return stickerService.subscribe(setOwnedIds);
  }, []);

  return (
    <main className={styles.main}>
      <PageBackground type="floralWithPetals" animated={true} />
      <nav className={styles.nav}>
        <Link href="/" className={styles.backButton}>
          <ArrowLeft size={32} />
        </Link>
      </nav>

      <h1 className={styles.title}>Sticker Book</h1>
      <p className={styles.count}>
        {isMounted ? `${ownedIds.length} / ${stickers.length}` : ""}
      </p>

      <div className={styles.grid}>
        {stickers.map((sticker) => {
          const owned = isMounted && ownedIds.includes(sticker.id);
          return (
            <div
              key={sticker.id}
              className={`${styles.cell} ${owned ? styles.owned : styles.missing}`}
            >
              <div className={styles.stickerWrap}>
                <Image
                  src={stickerImageUrl(sticker.id)}
                  alt={owned ? sticker.name : "Mystery sticker"}
                  fill
                  sizes="(max-width: 768px) 25vw, 140px"
                  className={styles.stickerImage}
                />
              </div>
              <span className={styles.name}>{owned ? sticker.name : "???"}</span>
            </div>
          );
        })}
      </div>
    </main>
  );
}
