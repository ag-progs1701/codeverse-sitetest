import { useLocation, useNavigate } from "react-router-dom";

export default function ReviewPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const registration = state?.registration;

  if (!registration) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>No registration data found.</h2>
        <button onClick={() => navigate("/register")}>
          Back to Registration
        </button>
      </div>
    );
  }

  const { teamName, members } = registration;

  async function handleConfirmSubmit() {
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamName,
          members,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      window.location.href =
        `http://localhost:5174/?teamId=${encodeURIComponent(data.teamId)}`;

    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Review Registration</h1>

      <h2>Team: {teamName}</h2>

      {members.map((member, index) => (
        <div key={index} style={{ marginBottom: "20px" }}>
          <h3>
            Member {index + 1}
            {index === 0 ? " (Leader)" : ""}
          </h3>

          <p>Name: {member.fullName}</p>
          <p>Registration No: {member.registrationNumber}</p>
          <p>Email: {member.collegeEmail}</p>
          <p>Phone: {member.phoneNumber}</p>
        </div>
      ))}

      <button onClick={() => navigate("/register")}>
        ← Edit Details
      </button>

      <button
        onClick={handleConfirmSubmit}
        style={{ marginLeft: "20px" }}
      >
        Confirm & Submit →
      </button>
    </div>
  );
}