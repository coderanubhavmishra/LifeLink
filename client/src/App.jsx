
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import DonorForm from "./components/DonorForm";
import DonorList from "./components/DonorList";
import BloodRequestForm from "./components/BloodRequestForm";
import BloodRequestList from "./components/BloodRequestList";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import "./index.css";

function HomePage() {
  return (
    <div className="app">
      <header className="navbar">
        <h1>LifeLink</h1>
        <span>Blood Donation Management</span>
        <Link className="admin-link" to="/admin">
          Admin Login
        </Link>
      </header>

      <main className="main-content">
        <div className="hero">
          <p className="eyebrow">GIVE BLOOD. HELP SAVE LIVES.</p>
          <h2>Every Donor Can Make a Difference</h2>
          <p>
            Register as a donor or submit a blood request.
          </p>
        </div>

        <div className="forms-grid">
  <DonorForm />
  <BloodRequestForm />
</div>

<DonorList />
<BloodRequestList />
      </main>

      <footer>
        LifeLink — Blood Donation Management System
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
