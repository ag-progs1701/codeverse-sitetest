/**
 * App.jsx
 * Root router configuration.
 * Only the /register and /register/review routes are implemented now.
 * Additional routes (home, admin, etc.) can be added here later.
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import ReviewPage from "./pages/ReviewPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect to registration */}
        <Route path="/" element={<Navigate to="/register" replace />} />

        {/* Team Registration */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Placeholder review step */}
        <Route path="/register/review" element={<ReviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}
