import React from "react";
import { BRAND_INFO } from "../config/landingConfig";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <section className={styles.heroContainer} aria-label="Hero Section">
      {/* Atmosphere Glow Behind Hero */}
      <div className={styles.subtleGlowOrb} aria-hidden="true" />

      {/* Pill Badge */}
      <div className={styles.badge}>
        <span className={styles.badgeDot} />
        <span>24-Hour National Hackathon</span>
      </div>

      {/* Main Focus: CODEVERSE */}
      <h1 className={styles.mainTitle}>{BRAND_INFO.title}</h1>

      {/* Tagline */}
      <p className={styles.tagline}>
        <span>Code. </span>
        <span className={styles.taglineHighlight}>Create. </span>
        <span>Conquer.</span>
      </p>
    </section>
  );
}
