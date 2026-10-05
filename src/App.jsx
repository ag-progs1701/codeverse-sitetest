/**
 * App.jsx
 * Root router configuration.
 *
 * Routes:
 * - / : CodeVerse Hackathon Landing / Home Page
 * - /register : Existing Team Registration Page (Preserved)
 * - /register/review : Registration Review Page (Preserved)
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import ReviewPage from "./pages/ReviewPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Landing / Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Team Registration Flow (Preserved & Accessible) */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Registration Review Step */}
        <Route path="/register/review" element={<ReviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}
