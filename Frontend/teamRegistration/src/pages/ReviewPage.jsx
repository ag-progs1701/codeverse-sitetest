/**
 * ReviewPage.jsx
 *
 * Route: /register/review
 * Purpose: Visual review of all details entered on the Team Registration page.
 *
 * Uses the exact same design system as RegisterPage.
 */

import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ReviewPage.module.css";

const FIELDS = [
  { key: "fullName", label: "Full Name" },
  { key: "registrationNumber", label: "Registration Number" },
  { key: "collegeEmail", label: "College Email" },
  { key: "phoneNumber", label: "Phone Number" },
];

export default function ReviewPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Retrieve registration from navigation state or fallback sessionStorage
  const [registration] = useState(() => {
    if (state?.registration) return state.registration;
    try {
      const saved = sessionStorage.getItem("codeverse_registration");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const isSubmittingRef = useRef(false);

  if (!registration) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.section}>
            <div className={styles.guardBox}>
              <span className={styles.guardIcon}>⚠️</span>
              <h2 className={styles.guardTitle}>No registration data found.</h2>
              <p className={styles.guardSub}>
                Please complete the registration form first.
              </p>
              <button
                type="button"
                className={styles.submitBtn}
                style={{ width: "auto", minWidth: "200px" }}
                onClick={() => navigate("/register")}
              >
                ← Back to Registration
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const { teamName, members = [] } = registration;

  async function handleConfirmSubmit() {
    if (isSubmittingRef.current || submitting) {
      return;
    }
    isSubmittingRef.current = true;
    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("https://codeverse-sitetest.onrender.com/api/register", {
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

      // Save created team info to sessionStorage
      try {
        sessionStorage.setItem(
          "codeverse_team",
          JSON.stringify({
            teamId: data.teamId,
            teamName: data.teamName || teamName,
          })
        );
      } catch {
        // ignore storage error
      }

      // Navigate to Payment portal route preserving teamId query parameter and state
      navigate(`/register/payment?teamId=${encodeURIComponent(data.teamId)}`, {
        state: {
          teamId: data.teamId,
          teamName: data.teamName || teamName,
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      isSubmittingRef.current = false;
      setSubmitting(false);
      setSubmitError(
        error.message || "Unable to submit registration. Please try again."
      );
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Review Registration</h1>
        <p className={styles.pageSubtitle}>
          CodeVerse Hackathon — Review your team details before proceeding to payment.
        </p>

        {/* ── Team Information ────────────────────────────────────────── */}
        <section className={styles.section} aria-label="Team information">
          <h2 className={styles.sectionTitle}>Team Information</h2>
          <hr className={styles.divider} />

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Team Name</label>
            <div className={styles.valueBox}>{teamName || <span className={styles.empty}>Not specified</span>}</div>
          </div>
        </section>

        {/* ── Team Members ──────────────────────────────────────────── */}
        <section className={styles.section} aria-label="Team members">
          <div className={styles.membersHeader}>
            <h2 className={styles.sectionTitle}>Team Members</h2>
            <span className={styles.membersMeta}>
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
          </div>
          <hr className={styles.divider} />

          <div className={styles.memberList}>
            {members.map((member, index) => {
              const isLeader = index === 0;
              return (
                <div key={index} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>
                      Member {index + 1}
                      {isLeader && (
                        <span className={styles.leaderNote}>
                          * Member 1 is the Team Leader.
                        </span>
                      )}
                    </h3>
                  </div>

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
              );
            })}
          </div>
        </section>

        {/* ── Error banner ──────────────────────────────────────────── */}
        {submitError && (
          <div className={styles.formError} role="alert">
            {submitError}
          </div>
        )}

        {/* ── Action buttons ────────────────────────────────────────── */}
        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.editBtn}
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
            type="button"
            className={styles.submitBtn}
            onClick={handleConfirmSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Confirm & Submit →"}
          </button>
        </div>
      </div>
    </main>
  );
}
