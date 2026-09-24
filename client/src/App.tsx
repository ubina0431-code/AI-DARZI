import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TailorDashboard from './pages/TailorDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import CreateOrderPage from './pages/CreateOrderPage';
import MeasurementForm from './pages/MeasurementForm';
import './App.css';

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'tailor' ? '/tailor/dashboard' : '/customer/dashboard'} replace />;
};

const Navigation = () => {
  const { user, logout } = useAuth();

  return (
    <nav>
      {!user ? (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      ) : (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <Link to={user.role === 'tailor' ? '/tailor/dashboard' : '/customer/dashboard'}>
            {user.role === 'tailor' ? 'Tailor Dashboard' : 'Customer Dashboard'}
          </Link>
          <Link to="/measurements/new">Measurement Form</Link>
          <button type="button" className="nav-button" onClick={logout}>Log out</button>
        </>
      )}
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/tailor/dashboard" element={<TailorDashboard />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/order/new" element={<CreateOrderPage tailorId="some-tailor-id" />} />
          <Route path="/measurements/new" element={<MeasurementForm />} />
          <Route path="/measurements/saved" element={<div className="dashboard-card"><h2>Measurements saved</h2><p>Your measurements are now linked to your profile.</p><Link to="/measurements/new">Add another profile</Link></div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
