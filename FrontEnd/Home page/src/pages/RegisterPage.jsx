/**
 * RegisterPage.jsx
 *
 * Route: /register
 * Purpose: Team Registration form for the CodeVerse Hackathon.
 *
 * State shape:
 * {
 *   teamName: string,
 *   members: Array<{ fullName, registrationNumber, collegeEmail, phoneNumber }>
 * }
 *
 * Member 0 is always the Team Leader.
 * Min members: 4  |  Max members: 6
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import MemberCard from "../components/MemberCard";
import { MIN_MEMBERS, MAX_MEMBERS, createEmptyMember, createInitialFormState } from "../utils/constants";
import {
  validateForm,
  isFormValid,
  validateTeamName,
  validateFullName,
  validateRegistrationNumber,
  validateCollegeEmail,
  validatePhoneNumber,
} from "../utils/validation";

import styles from "./RegisterPage.module.css";

/** Map field key → its individual validator */
const FIELD_VALIDATORS = {
  fullName: validateFullName,
  registrationNumber: validateRegistrationNumber,
  collegeEmail: validateCollegeEmail,
  phoneNumber: validatePhoneNumber,
};

/** Empty per-member error object */
function emptyMemberError() {
  return { fullName: "", registrationNumber: "", collegeEmail: "", phoneNumber: "" };
}

export default function RegisterPage() {
  const navigate = useNavigate();

  // ── Form state ─────────────────────────────────────────────────────
  const [formState, setFormState] = useState(createInitialFormState);

  // ── Validation errors (only shown after first submit attempt) ─────
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({ teamNameError: "", memberErrors: [] });

  // ── Derived ────────────────────────────────────────────────────────
  const memberCount = formState.members.length;
  const atMin = memberCount <= MIN_MEMBERS;
  const atMax = memberCount >= MAX_MEMBERS;

  // ── Handlers ────────────────────────────────────────────────────────

  function handleTeamNameChange(e) {
    const value = e.target.value;
    setFormState((prev) => ({ ...prev, teamName: value }));
    if (submitted) {
      setErrors((prev) => ({ ...prev, teamNameError: validateTeamName(value) }));
    }
  }

  function handleMemberChange(index, field, value) {
    setFormState((prev) => ({
      ...prev,
      members: prev.members.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      ),
    }));

    if (submitted) {
      setErrors((prev) => {
        const memberErrors = prev.memberErrors.map((err, i) => {
          if (i !== index) return err;
          const validator = FIELD_VALIDATORS[field];
          return { ...err, [field]: validator ? validator(value) : "" };
        });
        return { ...prev, memberErrors };
      });
    }
  }

  function handleAddMember() {
    if (atMax) return;
    setFormState((prev) => ({
      ...prev,
      members: [...prev.members, createEmptyMember()],
    }));
    if (submitted) {
      setErrors((prev) => ({
        ...prev,
        memberErrors: [...prev.memberErrors, emptyMemberError()],
      }));
    }
  }

  function handleRemoveMember(index) {
    if (index === 0 || atMin) return;
    setFormState((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
    if (submitted) {
      setErrors((prev) => ({
        ...prev,
        memberErrors: prev.memberErrors.filter((_, i) => i !== index),
      }));
    }
  }

  function handleNext(e) {
    e.preventDefault();
    setSubmitted(true);

    const validationResult = validateForm(formState);
    setErrors(validationResult);

    if (!isFormValid(validationResult)) return;

    // Pass collected registration data to the next step via router state
    navigate("/register/review", { state: { registration: formState } });
  }

  // ── Render ────────────────────────────────────────────────────────────
  const showTeamNameError = submitted && Boolean(errors.teamNameError);
  const formHasErrors = submitted && !isFormValid(errors);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link to="/" className={styles.backLink} aria-label="Back to CodeVerse Home">
          ← Back to Home
        </Link>
        <h1 className={styles.pageTitle}>Team Registration</h1>
        <p className={styles.pageSubtitle}>
          CodeVerse Hackathon — Fill in your team details to continue.
        </p>

        <form onSubmit={handleNext} noValidate>

          {/* ── Team Name ─────────────────────────────────────────── */}
          <section className={styles.section} aria-label="Team information">
            <h2 className={styles.sectionTitle}>Team Information</h2>
            <hr className={styles.divider} />

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="teamName">
                Team Name
                <span className={styles.required} aria-hidden="true">*</span>
              </label>
              <input
                id="teamName"
                name="teamName"
                type="text"
                className={`${styles.input} ${showTeamNameError ? styles.inputError : ""}`}
                value={formState.teamName}
                onChange={handleTeamNameChange}
                placeholder="Enter your team name"
                autoComplete="off"
              />
              {showTeamNameError && (
                <span className={styles.errorMsg} role="alert">
                  {errors.teamNameError}
                </span>
              )}
            </div>
          </section>

          {/* ── Team Members ──────────────────────────────────────── */}
          <section className={styles.section} aria-label="Team members">
            <div className={styles.membersHeader}>
              <h2 className={styles.sectionTitle}>Team Members</h2>
              <span className={styles.membersMeta}>
                Minimum 4 members&nbsp;•&nbsp;Maximum 6 members
              </span>
            </div>
            <hr className={styles.divider} />

            <div className={styles.memberList}>
              {formState.members.map((member, index) => (
                <MemberCard
                  key={index}
                  index={index}
                  member={member}
                  errors={submitted ? errors.memberErrors[index] : {}}
                  onChange={handleMemberChange}
                  onRemove={handleRemoveMember}
                  canRemove={!atMin && index !== 0}
                />
              ))}
            </div>

            {/* Add Member button */}
            <button
              type="button"
              className={styles.addBtn}
              onClick={handleAddMember}
              disabled={atMax}
              aria-label="Add a new team member"
            >
              <span aria-hidden="true">＋</span>
              {atMax ? "Maximum members reached" : "Add Member"}
            </button>

            <p className={styles.countHint}>
              {memberCount} of {MAX_MEMBERS} members added
            </p>
          </section>

          {/* ── Form-level error summary ──────────────────────────── */}
          {formHasErrors && (
            <div className={styles.formError} role="alert">
              Please fix the errors highlighted above before continuing.
            </div>
          )}

          {/* ── Next ──────────────────────────────────────────────── */}
          <button type="submit" className={styles.nextBtn}>
            Next →
          </button>
        </form>
      </div>
    </main>
  );
}
