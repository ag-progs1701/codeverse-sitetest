/**
 * ReviewPage.jsx
 *
 * Route: /register/review
 *
 * PLACEHOLDER — not yet implemented.
 * Receives registration data from RegisterPage via router state.
 * Styled in matching solid dark blue and black theme.
 */

import { useLocation, useNavigate } from "react-router-dom";

export default function ReviewPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const registration = state?.registration;

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#030711",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#08111e",
          border: "1px solid #14243b",
          borderRadius: 12,
          padding: "40px 44px",
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>🚀</div>
        <h1
          style={{
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: 8,
            letterSpacing: "0.04em",
          }}
        >
          REGISTRATION PREVIEW
        </h1>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#7dd3fc",
            marginBottom: 24,
            lineHeight: 1.5,
          }}
        >
          Team details have been validated and collected successfully.
        </p>

        {registration && (
          <div
            style={{
              textAlign: "left",
              backgroundColor: "#040914",
              border: "1px solid #162a45",
              borderRadius: 8,
              padding: "16px 20px",
              marginBottom: 24,
              fontSize: "0.86rem",
              color: "#e2e8f0",
              lineHeight: 1.8,
            }}
          >
            <div>
              <span style={{ color: "#94a3b8" }}>Team Name: </span>
              <strong style={{ color: "#38bdf8" }}>{registration.teamName}</strong>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Members: </span>
              <strong style={{ color: "#f8fafc" }}>
                {registration.members.length} / 6
              </strong>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Team Leader: </span>
              <strong style={{ color: "#f8fafc" }}>
                {registration.members[0]?.fullName || "N/A"}
              </strong>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/register")}
          style={{
            padding: "12px 26px",
            backgroundColor: "#0077b6",
            color: "#ffffff",
            border: "1px solid #00b4d8",
            borderRadius: 7,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "0.9rem",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            boxShadow: "0 4px 18px rgba(0, 119, 182, 0.4)",
            transition: "all 0.2s ease",
          }}
        >
          ← Edit Details
        </button>
      </div>
    </main>
  );
}
