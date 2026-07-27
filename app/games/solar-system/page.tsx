"use client";

import SolarSystem3D from "@/components/SolarSystem3D";
import styles from "./page.module.css";

export default function SolarSystemPage() {
  return (
    <main className={styles.main}>
      <SolarSystem3D />
      <p className={styles.credit}>
        Planet textures by Solar System Scope (CC BY 4.0)
      </p>
    </main>
  );
}
