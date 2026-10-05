import React from "react";
import { Link } from "react-router-dom";
import styles from "./RegisterButton.module.css";

export default function RegisterButton() {
  return (
    <div className={styles.ctaContainer}>
      <Link
        to="/register"
        className={styles.registerBtn}
        aria-label="Navigate to Team Registration"
      >
        <span>REGISTER NOW</span>
        <svg
          className={styles.arrowIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </Link>
    </div>
  );
}
