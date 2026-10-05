# teamReview

This folder contains assets, components, and documentation related to the **Team Review** page of the CodeVerse Hackathon registration flow.

## Purpose
The Team Review page (`/register/review`) displays all team details entered during the Team Registration step for the user to verify before final submission.

## Route
`/register/review` — navigated to automatically after a successful form submission on `/register`.

## Data Flow
Registration data is passed via React Router state (`location.state.registration`) from `RegisterPage` to `ReviewPage`.

## UI/UX
Matches the dark blue & black aesthetic of the registration page (`#030711` background, `#08111e` card background, `#38bdf8` accent).
