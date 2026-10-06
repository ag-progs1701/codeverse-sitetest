import React from "react";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import SponsorsSection from "../components/SponsorsSection";
import RegisterButton from "../components/RegisterButton";
import InfoAccordion from "../components/InfoAccordion";
import CountdownTimer from "../components/CountdownTimer";
import Footer from "../components/Footer";
import MetaverseBackground from "../components/MetaverseBackground";
import styles from "./HomePage.module.css";

export default function HomePage() {
  return (
    <div className={styles.pageWrapper}>
      {/* Animated Metaverse Background: perspective grid + wireframes + avatars + particles */}
      <MetaverseBackground />

      {/* Dark gradient overlay for readability */}
      <div className={styles.darkOverlay} aria-hidden="true" />

      {/* Foreground Content */}
      <div className={styles.contentArea}>
        {/* Top Header */}
        <Header />

        {/* Main Content Area */}
        <main className={styles.mainContainer}>
          {/* Hero Section */}
          <HeroSection />

          {/* Sponsors Section */}
          <SponsorsSection />

          {/* Prominent Register CTA */}
          <RegisterButton />

          {/* Exactly Four Expandable Information Buttons */}
          <InfoAccordion />

          {/* Countdown Timer to 3 November 2026 IST */}
          <CountdownTimer />
        </main>

        {/* Clean Footer */}
        <Footer />
      </div>
    </div>
  );
}
