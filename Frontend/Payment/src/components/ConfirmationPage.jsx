import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import '../index.css'

export default function ConfirmationPage() {
  const location = useLocation()

  // Retrieve confirmation state from navigation or fallback sessionStorage
  const [confirmation] = useState(() => {
    if (location.state?.uniqueId || location.state?.teamName) {
      return location.state
    }
    try {
      const stored = sessionStorage.getItem('codeverse_confirmation')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  const { teamName = 'Your Team', uniqueId = 'CV26-PENDING', status = 'payment_submitted' } =
    confirmation

  return (
    <main className="page">
      <div className="container">
        <h1 className="pageTitle">Registration Confirmed</h1>
        <p className="pageSubtitle">
          CodeVerse Hackathon — Your registration and payment details have been recorded.
        </p>

        {/* ── Main Confirmation Section Card ────────────────────────── */}
        <section className="section" aria-label="Registration confirmation">
          {/* Success Banner */}
          <div className="successBanner">
            <span>✅</span>
            <span>Your team registration and payment sequence has been successfully recorded!</span>
          </div>

          {/* Highlighted CodeVerse ID Card */}
          <div className="idHighlightCard">
            <div className="idHighlightLabel">CodeVerse Unique ID</div>
            <div className="idHighlightValue">{uniqueId}</div>
            <p className="idHighlightHint">
              Please save or screenshot this ID. You will need it for hackathon check-in and communications.
            </p>
          </div>

          <hr className="divider" />

          {/* Details Grid */}
          <div className="grid" style={{ marginBottom: '24px' }}>
            <div className="card">
              <span className="label">Registered Team</span>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f1f5f9', marginTop: '6px' }}>
                {teamName}
              </div>
            </div>

            <div className="card">
              <span className="label">Payment Verification</span>
              <div style={{ marginTop: '8px' }}>
                <span className="statusPill">
                  ● {status === 'payment_submitted' ? 'Submitted (Pending Verification)' : status}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps Guidance */}
          <div className="card" style={{ marginBottom: '28px' }}>
            <h3 className="sectionTitle" style={{ fontSize: '1rem', marginBottom: '10px' }}>
              What Happens Next?
            </h3>
            <ul style={{ paddingLeft: '20px', color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.7' }}>
              <li>Our organizers will verify your transaction screenshot within 24 hours.</li>
              <li>A verification email will be dispatched to the team leader’s college email address.</li>
              <li>Prepare your hackathon project and be ready for the opening ceremony!</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid">
            <button
              type="button"
              className="editBtn"
              onClick={() => window.print()}
            >
              🖨 Print Confirmation
            </button>

            <button
              type="button"
              className="submitBtn"
              onClick={() => {
                // Clear session storage if registering anew
                try {
                  sessionStorage.removeItem('codeverse_registration')
                  sessionStorage.removeItem('codeverse_team')
                  sessionStorage.removeItem('codeverse_confirmation')
                } catch {
                  // ignore
                }
                window.location.href = 'http://localhost:5173/register'
              }}
            >
              Register Another Team →
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
