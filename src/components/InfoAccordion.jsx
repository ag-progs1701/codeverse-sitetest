import React, { useState } from "react";
import { ACCORDION_ITEMS } from "../config/landingConfig";
import styles from "./InfoAccordion.module.css";

export default function InfoAccordion() {
  const [openId, setOpenId] = useState(null);

  const toggleItem = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="info-accordion"
      className={styles.accordionContainer}
      aria-label="Hackathon Details Accordion"
    >
      {ACCORDION_ITEMS.map((item) => {
        const isOpen = openId === item.id;
        const contentId = `content-${item.id}`;

        return (
          <div
            key={item.id}
            id={item.anchorId}
            className={styles.accordionItem}
          >
            {/* Clickable Header Button */}
            <button
              type="button"
              className={`${styles.accordionButton} ${
                isOpen ? styles.activeButton : ""
              }`}
              onClick={() => toggleItem(item.id)}
              aria-expanded={isOpen}
              aria-controls={contentId}
            >
              <span className={styles.buttonTitle}>{item.title}</span>
              <svg
                className={`${styles.chevronIcon} ${
                  isOpen ? styles.chevronOpen : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Expandable Content Area (pushes lower elements downward) */}
            <div
              id={contentId}
              className={`${styles.contentWrapper} ${
                isOpen ? styles.contentWrapperOpen : ""
              }`}
              role="region"
              aria-labelledby={item.id}
            >
              <div className={styles.contentInner}>
                <div className={styles.contentBox}>
                  <p className={styles.contentText}>{item.content}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
