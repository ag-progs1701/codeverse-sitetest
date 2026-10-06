/**
 * ReviewPage.jsx  —  FrontEnd/teamReview/src/pages/
 * Route: /register/review
 *
 * Mirrors RegisterPage layout exactly — same sections, same card structure,
 * but all fields are read-only. "Edit Details" navigates back.
 */

import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ReviewPage.module.css";

const FIELDS = [
  { key: "fullName",            label: "Full Name" },
  { key: "registrationNumber", label: "Registration Number" },
  { key: "collegeEmail",       label: "College Email" },
  { key: "phoneNumber",        label: "Phone Number" },
];

export default function ReviewPage() {
  const { state }   = useLocation();
  const navigate    = useNavigate();
  const registration = state?.registration;

  if (!registration) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <p className={styles.pageSubtitle} style={{ color: "#f87171" }}>
            No registration data found.{" "}
            <button className={styles.linkBtn} onClick={() => navigate("/register")}>
              Go to Registration
            </button>
          </p>
        </div>
      </main>
    );
  }

  const { teamName, members } = registration;

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        <h1 className={styles.pageTitle}>Registration Preview</h1>
        <p className={styles.pageSubtitle}>
          CodeVerse Hackathon — Review your details before submitting.
        </p>

        {/* ── Team Information ──────────────────────────────── */}
        <section className={styles.section} aria-label="Team information">
          <h2 className={styles.sectionTitle}>Team Information</h2>
          <hr className={styles.divider} />

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Team Name</label>
            <div className={styles.valueBox}>{teamName}</div>
          </div>
        </section>

        {/* ── Team Members ──────────────────────────────────── */}
        <section className={styles.section} aria-label="Team members">
          <div className={styles.membersHeader}>
            <h2 className={styles.sectionTitle}>Team Members</h2>
            <span className={styles.membersMeta}>
              {members.length} / 6 members
            </span>
          </div>
          <hr className={styles.divider} />

          <div className={styles.memberList}>
            {members.map((member, index) => (
              <div key={index} className={styles.card}>

                {/* Card header */}
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>
                    Member {index + 1}
                    {index === 0 && (
                      <span className={styles.leaderNote}>
                        * Member 1 is the Team Leader.
                      </span>
                    )}
                  </h3>
                </div>

                {/* Fields grid — read-only */}
                <div className={styles.grid}>
                  {FIELDS.map(({ key, label }) => (
                    <div className={styles.fieldGroup} key={key}>
                      <label className={styles.label}>{label}</label>
                      <div className={styles.valueBox}>
                        {member[key] || <span className={styles.empty}>—</span>}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        </section>

        {/* ── Actions ───────────────────────────────────────── */}
        <div className={styles.actionRow}>
          <button
            className={styles.editBtn}
            onClick={() => navigate("/register", { state: { registration } })}
          >
            ← Edit Details
          </button>
          <button
            className={styles.submitBtn}
            onClick={() => navigate("/register/payment", { state: { registration } })}
          >
            Confirm &amp; Submit →
          </button>
        </div>

      </div>
    </main>
  );
}
