/**
 * landingConfig.js
 * Central configuration for the CodeVerse Hackathon landing page.
 * All dates, copy, links, sponsor placeholders, and accordion items can be updated here.
 */

// Target date: 3 November 2026, 00:00:00 IST (Indian Standard Time: UTC+5:30)
export const COUNTDOWN_TARGET_DATE_IST = "2026-11-03T00:00:00+05:30";

// Background image path (subtle Milky Way galaxy)
export const BACKGROUND_IMAGE_PATH = "/galaxy-bg.jpg";

export const BRAND_INFO = {
  title: "CODEVERSE",
  tagline: "Code. Create. Conquer.",
  metaversityClub: "METAVERSITY",
  vitBhopal: "VIT BHOPAL",
  footerSubtext: "Metaversity Club • VIT Bhopal",
};

export const NAV_LINKS = [
  { label: "ABOUT", href: "#about-section" },
  { label: "FAQ", href: "#info-accordion" },
  { label: "CONTACT", href: "#footer-contact" },
];

export const SPONSORS_LIST = [
  { id: 1, name: "Alpha Partner", category: "Title Sponsor", tier: "Platinum" },
  { id: 2, name: "Cloud Partner", category: "Infrastructure", tier: "Gold" },
  { id: 3, name: "Dev Platform", category: "Tooling & APIs", tier: "Gold" },
  { id: 4, name: "AI Innovation", category: "AI & Machine Learning", tier: "Silver" },
  { id: 5, name: "Community Partner", category: "Outreach & Network", tier: "Silver" },
  { id: 6, name: "Ecosystem Partner", category: "Student Community", tier: "Bronze" },
];

export const ACCORDION_ITEMS = [
  {
    id: "about-codeverse",
    title: "1. ABOUT CODEVERSE",
    anchorId: "about-section",
    content:
      "CodeVerse is the flagship 24-hour national hackathon presented by the Metaversity Club at VIT Bhopal University. Designed for visionary creators, programmers, and designers, CodeVerse brings together passionate minds to push the boundaries of technology, collaborate in teams of 4 to 6 members, and engineer transformative solutions for pressing real-world challenges.",
  },
  {
    id: "hackathon-rules",
    title: "2. HACKATHON RULES",
    anchorId: "faq",
    content:
      "• Eligibility: Open to all undergraduate and postgraduate college students.\n• Team Composition: Each team must comprise 4 to 6 members, led by a designated Team Leader.\n• Fresh Work: All source code, design assets, and implementations must be developed within the official 24-hour hackathon window.\n• Conduct: Academic integrity and respectful collaboration are strictly enforced. Plagiarism or pre-packaged repositories result in immediate disqualification.",
  },
  {
    id: "timeline",
    title: "3. TIMELINE",
    anchorId: "timeline",
    content:
      "• Phase 1: Team Registration & Domain Selection (Open Now)\n• Phase 2: Registration Review & Confirmation Briefing\n• Phase 3: Opening Ceremony & 24-Hour Hackathon Kickoff\n• Phase 4: Mentorship & Progress Evaluation Checkpoints\n• Phase 5: Code Freeze, Project Submission & Live Demonstrations\n• Phase 6: Grand Finale & Prize Distribution Ceremony",
  },
  {
    id: "prizes",
    title: "4. PRIZES",
    anchorId: "prizes",
    content:
      "• Grand Winner: Attractive cash bounty, trophy, winner certificates, and fast-track incubation interviews.\n• First Runner-Up: Prestigious cash award, certificates, and curated developer perks.\n• Second Runner-Up: Cash prize, certificates, and premium developer subscriptions.\n• Category Bounties: Best AI Project, Best Web3/Decentralized Solution, Best Beginner Team, and Best UI/UX Design.\n• All Participants: Official participation certificates, exclusive CodeVerse swag kits, and sponsor credits.",
  },
];
