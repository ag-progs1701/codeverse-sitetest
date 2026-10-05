/**
 * validation.js
 * Pure validation helpers for the Team Registration form.
 * No side effects — each function returns an error string or empty string.
 */

/** Basic email regex (RFC-5322 relaxed) */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Phone: optional +, digits, spaces, dashes, parentheses; 7–15 digits total */
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;

export function validateTeamName(value) {
  if (!value || !value.trim()) return "Team name is required.";
  return "";
}

export function validateFullName(value) {
  if (!value || !value.trim()) return "Full name is required.";
  return "";
}

export function validateRegistrationNumber(value) {
  if (!value || !value.trim()) return "Registration number is required.";
  return "";
}

export function validateCollegeEmail(value) {
  if (!value || !value.trim()) return "College email is required.";
  if (!EMAIL_RE.test(value.trim())) return "Enter a valid email address.";
  return "";
}

export function validatePhoneNumber(value) {
  if (!value || !value.trim()) return "Phone number is required.";
  if (!PHONE_RE.test(value.trim())) return "Enter a valid phone number.";
  return "";
}

/**
 * Validate a single member object.
 * Returns an object with the same keys, each holding an error string or "".
 */
export function validateMember(member) {
  return {
    fullName: validateFullName(member.fullName),
    registrationNumber: validateRegistrationNumber(member.registrationNumber),
    collegeEmail: validateCollegeEmail(member.collegeEmail),
    phoneNumber: validatePhoneNumber(member.phoneNumber),
  };
}

/**
 * Validate the entire form.
 * Returns { teamNameError, memberErrors[] }
 * memberErrors is an array parallel to formState.members.
 */
export function validateForm(formState) {
  const teamNameError = validateTeamName(formState.teamName);
  const memberErrors = formState.members.map(validateMember);
  return { teamNameError, memberErrors };
}

/** Returns true if a memberErrors object has no errors. */
export function isMemberValid(memberError) {
  return Object.values(memberError).every((e) => e === "");
}

/** Returns true if the entire validated result is error-free. */
export function isFormValid({ teamNameError, memberErrors }) {
  if (teamNameError) return false;
  return memberErrors.every(isMemberValid);
}
