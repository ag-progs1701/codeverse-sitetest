/**
 * constants.js
 * Registration form configuration constants.
 */

export const MIN_MEMBERS = 4;
export const MAX_MEMBERS = 6;

/** Returns a blank member object. */
export function createEmptyMember() {
  return {
    fullName: "",
    registrationNumber: "",
    collegeEmail: "",
    phoneNumber: "",
  };
}

/** Returns the initial form state with MIN_MEMBERS empty members. */
export function createInitialFormState() {
  return {
    teamName: "",
    members: Array.from({ length: MIN_MEMBERS }, createEmptyMember),
  };
}
