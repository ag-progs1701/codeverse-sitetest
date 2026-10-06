/**
 * ReviewPage.jsx
 *
 * Route: /register/review
 * Purpose: Review registration details before submitting.
 */

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ReviewPage.module.css";

export default function ReviewPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const registration = state?.registration;

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (!registration) {
    return (
      <main className={styles.page}>
        <div className={styles.guardBox}>
          <span className={styles.guardIcon}>⚠️</span>
          <h2 className={styles.guardTitle}>No registration data found.</h2>
          <p className={styles.guardSub}>
            Please complete the registration form first.
          </p>

          <button
            className={styles.btnPrimary}
            onClick={() => navigate("/register")}
          >
            ← Back to Registration
          </button>
        </div>
      </main>
    );
  }

  const { teamName, members } = registration;

  async function handleConfirmSubmit() {
    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamName,
          members,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      // Registration successfully created in Supabase.
      // Pass the returned teamId to the payment page.
      window.location.href = `http://localhost:5174/?teamId=${encodeURIComponent(
        data.teamId
      )}`;
    } catch (error) {
      console.error("Registration error:", error);

      setSubmitError(
        error.message || "Unable to submit registration. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        {/* Top label */}
        <p className={styles.topLabel}>
          ✦ CodeVerse Hackathon · Registration Preview
        </p>

        {/* Preview Card */}
        <div className={styles.previewCard}>

          {/* Glowing top bar */}
          <div className={styles.cardGlow} />

          {/* Team banner */}
          <div className={styles.teamBanner}>
            <div className={styles.teamIconWrap}>
              <span className={styles.teamIcon}>⚡</span>
            </div>

            <div className={styles.teamInfo}>
              <span className={styles.teamLabel}>TEAM NAME</span>
              <h1 className={styles.teamName}>{teamName}</h1>
            </div>

            <div className={styles.teamStatBadge}>
              <span className={styles.statNum}>{members.length}</span>
              <span className={styles.statLabel}>Members</span>
            </div>
          </div>

          <div className={styles.cardDivider} />

          {/* Members */}
          <div className={styles.membersLabel}>
            <span className={styles.sectionTag}>Team Members</span>
          </div>

          <div className={styles.membersGrid}>
            {members.map((member, idx) => (
              <div
                key={idx}
                className={`${styles.memberChip} ${idx === 0 ? styles.leaderChip : ""
                  }`}
              >
                {/* Avatar */}
                <div className={styles.avatar}>
                  {member.fullName
                    ? member.fullName.trim().charAt(0).toUpperCase()
                    : "?"}
                </div>

                {/* Details */}
                <div className={styles.chipDetails}>

                  <div className={styles.chipNameRow}>
                    <span className={styles.chipName}>
                      {member.fullName || (
                        <em className={styles.empty}>No name</em>
                      )}
                    </span>

                    {idx === 0 && (
                      <span className={styles.leaderTag}>
                        👑 Leader
                      </span>
                    )}
                  </div>

                  <div className={styles.infoPills}>
                    <span className={styles.pill}>
                      <span className={styles.pillIcon}>🎓</span>
                      {member.registrationNumber || "—"}
                    </span>

                    <span className={styles.pill}>
                      <span className={styles.pillIcon}>✉️</span>
                      {member.collegeEmail || "—"}
                    </span>

                    <span className={styles.pill}>
                      <span className={styles.pillIcon}>📞</span>
                      {member.phoneNumber || "—"}
                    </span>
                  </div>
                </div>

                {/* Member number */}
                <span className={styles.memberNum}>
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className={styles.cardFooter}>
            <span className={styles.footerNote}>
              🔒 Please verify all details before submitting.
            </span>
          </div>
        </div>

        {/* Error */}
        {submitError && (
          <div
            role="alert"
            style={{
              marginTop: "16px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "#ffe5e5",
              color: "#b00020",
            }}
          >
            {submitError}
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.btnSecondary}
            onClick={() =>
              navigate("/register", {
                state: { registration },
              })
            }
            disabled={submitting}
          >
            ← Edit Details
          </button>

          <button
            className={styles.btnPrimary}
            onClick={handleConfirmSubmit}
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : "Confirm & Submit →"}
          </button>
        </div>

      </div>
    </main>
  );
}