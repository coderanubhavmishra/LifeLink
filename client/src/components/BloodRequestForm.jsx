
import { useState } from "react";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/blood-requests`;

const initialForm = {
  requesterName: "",
  bloodGroup: "",
  units: "1",
  hospital: "",
  city: "",
  contact: "",
  urgency: "Normal",
};

function BloodRequestForm() {
  const [formData, setFormData] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    setLoading(true);

    try {
      const response = await axios.post(API_URL, {
        ...formData,
        units: Number(formData.units),
      });

      setMessage(response.data.message);
      setFormData(initialForm);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit the blood request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="request-card">
      <div className="request-heading">
        
        <h2>Request Blood</h2>
        <p>
          Submit a blood requirement for follow-up.
          Availability must be confirmed by a blood bank.
        </p>
      </div>

      {message && (
        <p className="success" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="requesterName">Requester Name</label>
        <input
          id="requesterName"
          name="requesterName"
          value={formData.requesterName}
          onChange={handleChange}
          placeholder="Enter your name"
          required
        />

        <label htmlFor="requestBloodGroup">Required Blood Group</label>
        <select
          id="requestBloodGroup"
          name="bloodGroup"
          value={formData.bloodGroup}
          onChange={handleChange}
          required
        >
          <option value="">Select blood group</option>
          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
            (group) => (
              <option key={group} value={group}>
                {group}
              </option>
            )
          )}
        </select>

        <label htmlFor="units">Units Required</label>
        <input
          id="units"
          name="units"
          type="number"
          min="1"
          max="20"
          step="1"
          value={formData.units}
          onChange={handleChange}
          required
        />

        <label htmlFor="hospital">Hospital / Healthcare Facility</label>
        <input
          id="hospital"
          name="hospital"
          value={formData.hospital}
          onChange={handleChange}
          placeholder="Enter hospital name"
          required
        />

        <label htmlFor="requestCity">City</label>
        <input
          id="requestCity"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="Enter city"
          required
        />

        <label htmlFor="requestContact">Contact Number</label>
        <input
          id="requestContact"
          name="contact"
          type="tel"
          value={formData.contact}
          onChange={handleChange}
          placeholder="Enter 10-digit phone number"
          pattern="[0-9]{10}"
          title="Enter a 10-digit phone number"
          required
        />

        <label htmlFor="urgency">Urgency</label>
        <select
          id="urgency"
          name="urgency"
          value={formData.urgency}
          onChange={handleChange}
          required
        >
          <option value="Normal">Normal</option>
          <option value="Urgent">Urgent</option>
          <option value="Emergency">Emergency</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Blood Request"}
        </button>
      </form>
    </section>
  );
}

export default BloodRequestForm;
