import React from "react";
import { BRAND_INFO, NAV_LINKS } from "../config/landingConfig";
import styles from "./Header.module.css";

export default function Header() {
  const handleNavClick = (e, href) => {
    e.preventDefault();
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className={styles.header}>
      {/* Top Left: Metaversity Club Logo Placeholder */}
      <div
        className={styles.logoPlaceholder}
        title="Metaversity Club Official Logo Placeholder"
        aria-label="Metaversity Club Logo"
      >
        <span className={styles.logoName}>{BRAND_INFO.metaversityClub}</span>
        <span className={styles.logoTag}>LOGO</span>
      </div>

      {/* Top Right: VIT Bhopal Logo Placeholder + Navigation */}
      <div className={styles.rightSection}>
        <div
          className={styles.logoPlaceholder}
          title="VIT Bhopal University Official Logo Placeholder"
          aria-label="VIT Bhopal Logo"
        >
          <span className={styles.logoName}>{BRAND_INFO.vitBhopal}</span>
          <span className={styles.logoTag}>LOGO</span>
        </div>

        {/* Navigation Bar */}
        <nav className={styles.nav} aria-label="Main Navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={styles.navLink}
              onClick={(e) => handleNavClick(e, link.href)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
