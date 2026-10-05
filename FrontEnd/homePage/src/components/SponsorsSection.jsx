import React from "react";
import { SPONSORS_LIST } from "../config/landingConfig";
import styles from "./SponsorsSection.module.css";

export default function SponsorsSection() {
  return (
    <section className={styles.sponsorsSection} aria-label="Sponsors Section">
      <div className={styles.headingWrapper}>
        <div className={styles.headingLine} aria-hidden="true" />
        <h2 className={styles.sectionHeading}>OUR SPONSORS</h2>
        <div className={styles.headingLineRight} aria-hidden="true" />
      </div>

      <div className={styles.sponsorsGrid}>
        {SPONSORS_LIST.map((sponsor) => (
          <div key={sponsor.id} className={styles.sponsorCard}>
            <div className={styles.logoBox} aria-label={`Placeholder logo for ${sponsor.name}`}>
              <span className={styles.logoText}>LOGO</span>
            </div>
            <p className={styles.sponsorName}>{sponsor.name}</p>
            <span className={styles.sponsorCategory}>{sponsor.category}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
