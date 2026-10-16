
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/blood-requests/public";

function BloodRequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(API_URL);
      setRequests(response.data.requests);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load blood requests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <section className="requests-section">
      <div className="requests-heading">
        <div>
          <p className="eyebrow">COMMUNITY REQUESTS</p>
          <h2>Blood Requests</h2>
          <p>
            View submitted requests and their current status.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={fetchRequests}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading && (
        <p className="requests-message">Loading blood requests...</p>
      )}

      {!loading && error && (
        <div className="error">
          <p>{error}</p>
          <button type="button" onClick={fetchRequests}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="result-count">
            {requests.length} request
            {requests.length !== 1 ? "s" : ""} found
          </p>

          {requests.length === 0 ? (
            <p className="empty-state">
              No blood requests yet. Submitted requests will appear here.
            </p>
          ) : (
            <div className="request-grid">
              {requests.map((request) => (
                <article
                  className="request-item"
                  key={request._id}
                >
                  <div className="request-item-top">
                    <span className="blood-badge">
                      {request.bloodGroup}
                    </span>

                    <span
                      className={`urgency urgency-${request.urgency.toLowerCase()}`}
                    >
                      {request.urgency}
                    </span>
                  </div>

                  <h3>{request.bloodGroup} Blood Request</h3>
                  

                  <p className="request-city">
                    {request.city}
                  </p>

                  <div className="request-details">
                    <p>
                      <strong>Units required:</strong>{" "}
                      {request.units}
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}
                      <span className="status-badge">
                        {request.status}
                      </span>
                    </p>

                    <p>
                      <strong>Submitted:</strong>{" "}
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default BloodRequestList;
