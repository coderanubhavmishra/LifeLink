
import { useState } from "react";
import axios from "axios";

const initialForm = {
  name: "",
  age: "",
  bloodGroup: "",
  phone: "",
  city: "",
};

function DonorForm() {
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
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/donors`,
        {
          ...formData,
          age: Number(formData.age),
        }
      );

      setMessage(response.data.message);
      setFormData(initialForm);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to register donor. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-card">
      <h2>Become a Blood Donor</h2>
      <p className="form-description">
        Register as a donor and help connect people
        with potential blood donors.
      </p>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          required
        />

        <label htmlFor="age">Age</label>
        <input
          id="age"
          name="age"
          type="number"
          min="18"
          max="65"
          value={formData.age}
          onChange={handleChange}
          placeholder="Enter your age"
          required
        />

        <label htmlFor="bloodGroup">Blood Group</label>
        <select
          id="bloodGroup"
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

        <label htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
          pattern="[0-9]{10}"
          title="Enter a 10-digit phone number"
          required
        />

        <label htmlFor="city">City</label>
        <input
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="Enter your city"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register as Donor"}
        </button>
      </form>
    </section>
  );
}

export default DonorForm;
