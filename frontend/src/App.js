import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Layout
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';

// Pages
import Home from './pages/Home';
import Profile from './pages/Profile';
import StudentDashboard from './pages/StudentDashboard';
import OrgDashboard from './pages/OrgDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AuthCallback from './pages/AuthCallback';
import EventDetail from './pages/EventDetail';

// UI
import Loader from './components/UI/Loader';
import LoginModal from './components/UI/LoginModal'; // 🔥 IMPORTANT

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-dark">
        <Loader />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  return children;
};

const AppLayout = () => {
  const { showLoginModal, closeLoginModal } = useAuth(); // 🔥 NEW

  return (
    <div className="container-fluid vh-100 overflow-hidden p-0">
      <div className="row g-0 h-100">

        {/* Sidebar */}
        <nav
          className="col-md-2 d-none d-md-block h-100 border-end border-secondary border-opacity-10"
          style={{ background: '#111222', overflowY: 'auto' }}
        >
          <Sidebar />
        </nav>

        {/* Main Content */}
        <main className="col-md-10 d-flex flex-column h-100">
          {/* Navbar */}
          <div
            className="w-100 border-bottom border-secondary border-opacity-10"
            style={{ zIndex: 100 }}
          >
            <Navbar />
          </div>

          {/* Scrollable Content */}
          <div
            className="flex-grow-1 overflow-y-auto custom-scrollbar px-md-4 py-4"
            style={{ background: '#1a1b2e' }}
          >
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/events/:eventId" element={<EventDetail />} />

              {/* Protected routes */}
              <Route
                path="/profile"
                element={<ProtectedRoute><Profile /></ProtectedRoute>}
              />
              <Route
                path="/dashboard"
                element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>}
              />
              <Route
                path="/org/dashboard"
                element={<ProtectedRoute><OrgDashboard /></ProtectedRoute>}
              />
              <Route
                path="/admin"
                element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* 🔥 GLOBAL LOGIN MODAL */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={closeLoginModal}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e222d', color: '#fff' }
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
