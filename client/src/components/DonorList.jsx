
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/donors";

function DonorList() {
  const [donors, setDonors] = useState([]);
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDonors = async (filters = {}) => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(API_URL, {
        params: filters,
      });

      setDonors(response.data.donors);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load donors. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    fetchDonors({
      ...(bloodGroup && { bloodGroup }),
      ...(city.trim() && { city: city.trim() }),
    });
  };

  const handleReset = () => {
    setBloodGroup("");
    setCity("");
    fetchDonors();
  };

  return (
    <section className="directory">
      <div className="directory-heading">
        <div>
          <p className="eyebrow">OUR DONOR COMMUNITY</p>
          <h2>Find Blood Donors</h2>
          <p>Search registered donors by blood group and city.</p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={() =>
            fetchDonors({
              ...(bloodGroup && { bloodGroup }),
              ...(city.trim() && { city: city.trim() }),
            })
          }
        >
          Refresh
        </button>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <div>
          <label htmlFor="searchBloodGroup">Blood Group</label>
          <select
            id="searchBloodGroup"
            value={bloodGroup}
            onChange={(event) => setBloodGroup(event.target.value)}
          >
            <option value="">All Blood Groups</option>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
              (group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label htmlFor="searchCity">City</label>
          <input
            id="searchCity"
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Enter city name"
          />
        </div>

        <button type="submit">Search Donors</button>
        <button
          type="button"
          className="reset-button"
          onClick={handleReset}
        >
          Reset
        </button>
      </form>

      {loading && <p className="directory-message">Loading donors...</p>}

      {!loading && error && (
        <div className="error">
          <p>{error}</p>
          <button type="button" onClick={() => fetchDonors()}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="result-count">
            {donors.length} donor{donors.length !== 1 ? "s" : ""} found
          </p>

          {donors.length === 0 ? (
            <p className="empty-state">
              No donors found. Try another blood group or city.
            </p>
          ) : (
            <div className="donor-grid">
              {donors.map((donor) => (
                <article className="donor-card" key={donor._id}>
                  <div className="donor-card-top">
                    <div className="donor-avatar">
                      {donor.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="blood-badge">
                      {donor.bloodGroup}
                    </span>
                  </div>

                  <h3>{donor.name}</h3>
                  <p className="donor-location">
                    {donor.city}
                  </p>
                  <p>Age: {donor.age}</p>
                  <p>
                    Availability indicated:{" "}
                    {donor.available ? "Yes" : "No"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default DonorList;
