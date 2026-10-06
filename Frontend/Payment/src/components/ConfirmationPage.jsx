import { useLocation } from 'react-router-dom'
import '../index.css'

export default function ConfirmationPage() {
    const location = useLocation()

    const { teamName, uniqueId } = location.state || {}

    return (
        <div className="payment-page">
            <div className="scanlines"></div>

            <div className="payment-container">
                <div
                    className="success-modal"
                    style={{ margin: '100px auto' }}
                >
                    <div className="success-modal__icon">
                        ✅
                    </div>

                    <h1 className="success-modal__title">
                        Registration Confirmed!
                    </h1>

                    <p className="success-modal__text">
                        Your team registration and payment details have
                        been submitted successfully.
                    </p>

                    <div style={{ marginTop: '24px' }}>
                        <p>
                            <strong>Team Name</strong>
                        </p>

                        <p>{teamName}</p>
                    </div>

                    <div style={{ marginTop: '24px' }}>
                        <p>
                            <strong>CodeVerse ID</strong>
                        </p>

                        <h2>{uniqueId}</h2>
                    </div>

                    <div style={{ marginTop: '24px' }}>
                        <p>
                            <strong>Payment Status</strong>
                        </p>

                        <p>Submitted</p>
                    </div>
                </div>
            </div>
        </div>
    )
}