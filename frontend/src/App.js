import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';

// Components
import Loader from './components/UI/Loader';

// Pages
import Home from './pages/Home';
import AuthCallback from './pages/AuthCallback';
import Profile from './pages/Profile';
import StudentDashboard from './pages/StudentDashboard';
import OrgDashboard from './pages/OrgDashboard';
import AdminDashboard from './pages/AdminDashboard';

// --- Protected Route Wrapper ---
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-dark">
        <Loader />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// --- Main App Layout ---
const AppContent = () => {
  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        <div className="col-md-2 d-none d-md-block" style={{ position: 'sticky', top: 0, height: '100vh', zIndex: 1000 }}>
          <Sidebar />
        </div>
        
        <div className="col-md-10 col-12 d-flex flex-column h-100">
          <div style={{ position: 'sticky', top: 0, zIndex: 900 }}>
            <Navbar />
          </div>

          <div className="main-content flex-grow-1 p-4" style={{ 
            height: 'calc(100vh - 70px)', 
            overflowY: 'auto', 
            background: '#1a1b2e' 
          }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/org/dashboard" element={<ProtectedRoute><OrgDashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Toaster position="top-right" toastOptions={{ style: { background: '#1e222d', color: '#fff' } }} />
      </Router>
    </AuthProvider>
  );
}

export default App;