/**
 * MemberCard.jsx
 *
 * Renders one team member's form card.
 *
 * Props:
 *   index         {number}   – 0-based index
 *   member        {object}   – { fullName, registrationNumber, collegeEmail, phoneNumber }
 *   errors        {object}   – parallel error strings (empty = no error)
 *   onChange      {function} – (index, field, value) => void
 *   onRemove      {function} – (index) => void
 *   canRemove     {boolean}  – false when at minimum count or member is leader
 */

import styles from "./MemberCard.module.css";

const FIELDS = [
  {
    key: "fullName",
    label: "Full Name",
    placeholder: "Enter full name",
    type: "text",
  },
  {
    key: "registrationNumber",
    label: "Registration Number",
    placeholder: "e.g. 22BCE1234",
    type: "text",
  },
  {
    key: "collegeEmail",
    label: "College Email",
    placeholder: "name@university.edu",
    type: "email",
  },
  {
    key: "phoneNumber",
    label: "Phone Number",
    placeholder: "+91 98765 43210",
    type: "tel",
  },
];

export default function MemberCard({ index, member, errors, onChange, onRemove, canRemove }) {
  const isLeader = index === 0;
  const displayNumber = index + 1;

  function handleChange(e) {
    onChange(index, e.target.name, e.target.value);
  }

  return (
    <div className={styles.card}>
      {/* ── Card header ─────────────────────────────────── */}
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          Member {displayNumber}
          {isLeader && (
            <span className={styles.leaderNote}>* Member 1 will be the Team Leader.</span>
          )}
        </h3>

        {!isLeader && (
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => onRemove(index)}
            disabled={!canRemove}
            aria-label={`Remove Member ${displayNumber}`}
          >
            Remove
          </button>
        )}
      </div>

      {/* ── Fields ──────────────────────────────────────── */}
      <div className={styles.grid}>
        {FIELDS.map(({ key, label, placeholder, type }) => {
          const hasError = Boolean(errors?.[key]);
          return (
            <div className={styles.fieldGroup} key={key}>
              <label className={styles.label} htmlFor={`member-${index}-${key}`}>
                {label}
                <span className={styles.required} aria-hidden="true">*</span>
              </label>
              <input
                id={`member-${index}-${key}`}
                name={key}
                type={type}
                className={`${styles.input} ${hasError ? styles.inputError : ""}`}
                value={member[key]}
                onChange={handleChange}
                placeholder={placeholder}
                autoComplete="off"
              />
              {hasError && (
                <span className={styles.errorMsg} role="alert">
                  {errors[key]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
