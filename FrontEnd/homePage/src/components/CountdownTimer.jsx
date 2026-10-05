import React, { useState, useEffect } from "react";
import { COUNTDOWN_TARGET_DATE_IST } from "../config/landingConfig";
import styles from "./CountdownTimer.module.css";

function calculateTimeRemaining() {
  const targetEpoch = new Date(COUNTDOWN_TARGET_DATE_IST).getTime();
  const currentEpoch = Date.now();
  const diff = targetEpoch - currentEpoch;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isLive: true,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    isLive: false,
  };
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeRemaining);

  useEffect(() => {
    // Dynamically update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeLeft(remaining);
      if (remaining.isLive) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeUnits = [
    { label: "DAYS", value: String(timeLeft.days).padStart(2, "0") },
    { label: "HOURS", value: String(timeLeft.hours).padStart(2, "0") },
    { label: "MINUTES", value: String(timeLeft.minutes).padStart(2, "0") },
    { label: "SECONDS", value: String(timeLeft.seconds).padStart(2, "0") },
  ];

  return (
    <section className={styles.timerSection} aria-label="Event Countdown">
      <div className={styles.headingWrapper}>
        <div className={styles.headingLine} aria-hidden="true" />
        <h2 className={styles.timerLabel}>HACKATHON COUNTDOWN</h2>
        <div className={styles.headingLineRight} aria-hidden="true" />
      </div>

      {timeLeft.isLive ? (
        <div className={styles.liveBanner} role="status" aria-live="polite">
          <span className={styles.liveDot} aria-hidden="true" />
          <span className={styles.liveText}>CODEVERSE IS LIVE</span>
        </div>
      ) : (
        <div className={styles.timerCardsGrid} role="timer" aria-live="off">
          {timeUnits.map((unit, index) => (
            <React.Fragment key={unit.label}>
              <div className={styles.timerCard}>
                <span className={styles.timeValue}>{unit.value}</span>
                <span className={styles.timeUnit}>{unit.label}</span>
              </div>
              {index < timeUnits.length - 1 && (
                <span className={styles.separator} aria-hidden="true">
                  :
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </section>
  );
}
