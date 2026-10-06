/**
 * App.jsx  —  FrontEnd/homePage/src/App.jsx
 *
 * Root router. Three folders, one connected flow:
 *
 *   FrontEnd/homePage        → owns route "/"
 *   FrontEnd/teamRegistration → owns route "/register"
 *   FrontEnd/teamReview       → owns route "/register/review"
 *
 * Each page component lives in its own folder and is imported here.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";

// Home page — lives here in homePage
import HomePage from "./pages/HomePage";

// Registration form — lives in teamRegistration folder
import RegisterPage from "../../teamRegistration/src/pages/RegisterPage";

// Review / preview page — lives in teamReview folder
import ReviewPage from "../../teamReview/src/pages/ReviewPage";

// Payment page — lives in Payment folder
import PaymentPage from "../../Payment/src/components/PaymentPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ① Landing page */}
        <Route path="/" element={<HomePage />} />

        {/* ② Team Registration form */}
        <Route path="/register" element={<RegisterPage />} />

        {/* ③ Team Review / Preview */}
        <Route path="/register/review" element={<ReviewPage />} />
        
        {/* ④ Payment Page */}
        <Route path="/register/payment" element={<PaymentPage />} />
      </Routes>
    </BrowserRouter>
  );
}
