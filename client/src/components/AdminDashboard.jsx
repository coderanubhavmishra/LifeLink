
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const STATUSES = [
  "Pending",
  "In Progress",
  "Fulfilled",
  "Cancelled",
];

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const admin = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser") || "null");
    } catch {
      return null;
    }
  })();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/blood-requests");
      setRequests(response.data.requests);
    } catch (err) {
      if (err.response?.status === 401 ||
          err.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin", { replace: true });
        return;
      }

      setError("Unable to load blood requests.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) {
      navigate("/admin", { replace: true });
      return;
    }

    fetchRequests();
  }, [navigate, fetchRequests]);

  const updateStatus = async (requestId, status) => {
    setUpdatingId(requestId);
    setError("");
    setMessage("");

    try {
      const response = await api.patch(
        `/blood-requests/${requestId}/status`,
        { status }
      );

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request._id === requestId
            ? response.data.request
            : request
        )
      );

      setMessage("Request status updated successfully.");
    } catch (err) {
      if (err.response?.status === 401 ||
          err.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin", { replace: true });
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to update request status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin", { replace: true });
  };

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">LIFELINK ADMINISTRATION</p>
          <h1>Blood Request Dashboard</h1>
          <p>
            Welcome, {admin?.name || "Administrator"}
          </p>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={logout}
        >
          Log Out
        </button>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-title-row">
          <div>
            <h2>Manage Requests</h2>
            <p>Review requests and update their status.</p>
          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={fetchRequests}
            disabled={loading}
          >
            Refresh
          </button>
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

        {loading ? (
          <p>Loading requests...</p>
        ) : error ? (
          <button type="button" onClick={fetchRequests}>
            Try Again
          </button>
        ) : requests.length === 0 ? (
          <p className="empty-state">
            No blood requests have been submitted yet.
          </p>
        ) : (
          <div className="admin-request-list">
            {requests.map((request) => (
              <article
                className="admin-request-card"
                key={request._id}
              >
                <div className="admin-request-top">
                  <span className="blood-badge">
                    {request.bloodGroup}
                  </span>

                  <span
                    className={`urgency urgency-${request.urgency.toLowerCase()}`}
                  >
                    {request.urgency}
                  </span>
                </div>

                <h3>{request.hospital}</h3>
                <p>{request.city}</p>
                <p>
                  <strong>Units:</strong> {request.units}
                </p>
                <p>
                  <strong>Submitted:</strong>{" "}
                  {new Date(request.createdAt).toLocaleDateString()}
                </p>

                <label htmlFor={`status-${request._id}`}>
                  Request Status
                </label>

                <select
                  id={`status-${request._id}`}
                  value={request.status}
                  disabled={updatingId === request._id}
                  onChange={(event) =>
                    updateStatus(request._id, event.target.value)
                  }
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                {updatingId === request._id && (
                  <p>Updating status...</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;
