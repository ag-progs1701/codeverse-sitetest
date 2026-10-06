import React from "react";
import { BRAND_INFO } from "../config/landingConfig";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer id="footer-contact" className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.title}>{BRAND_INFO.title}</div>
        <div className={styles.subtext}>{BRAND_INFO.footerSubtext}</div>
        <div className={styles.copyright}>
          © 2026 CodeVerse Hackathon. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
