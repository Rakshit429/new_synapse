import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Calendar, LogOut, Shield, Layout } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  // Helper to determine if we should show the Management section
  const hasManagementAccess = user?.is_superuser || (user?.authorizations && user.authorizations.length > 0);

  return (
    <div className="sidebar d-flex flex-column justify-content-between p-3" style={{ backgroundColor: '#111222', minHeight: '100vh', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
      <div>
        <div className="d-flex align-items-center gap-2 mb-5 px-2">
          <h4 className="fw-bold m-0" style={{ color: 'white' }}>SYNAPSE</h4>
        </div>

        <ul className="nav flex-column gap-2">
          <li className="nav-item">
            <NavLink to="/" className={({ isActive }) => `nav-link d-flex align-items-center gap-3 ${isActive ? 'active-link' : 'text-secondary'}`}>
              <LayoutDashboard size={20} /> Events Feed
            </NavLink>
          </li>
          
          {user && (
            <li className="nav-item">
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link d-flex align-items-center gap-3 ${isActive ? 'active-link' : 'text-secondary'}`}>
                <Calendar size={20} /> My Calendar
              </NavLink>
            </li>
          )}
          
          {user && (
            <li className="nav-item">
              <NavLink to="/profile" className={({ isActive }) => `nav-link d-flex align-items-center gap-3 ${isActive ? 'active-link' : 'text-secondary'}`}>
                <User size={20} /> My Profile
              </NavLink>
            </li>
          )}

          {/* MANAGEMENT SECTION */}
          {hasManagementAccess && (
            <div className="mt-4 pt-4 border-top border-secondary">
              <small className="text-muted text-uppercase fw-bold px-3">Management</small>
              
              {/* 1. ADMIN LINK (Based on is_superuser boolean) */}
              {user?.is_superuser && (
                <NavLink 
                  to="/admin" 
                  className="nav-link d-flex align-items-center gap-3 text-danger mt-2"
                >
                  <Shield size={20} /> Admin Panel
                </NavLink>
              )}

              {/* 2. ORG LINKS (Based on authorizations list) */}
              {console.log(user)}
              {user?.authorizations?.map((auth, idx) => (
                <NavLink 
                  key={idx}
                  to="/org/dashboard" 
                  className="nav-link d-flex align-items-center gap-3 text-warning mt-2"
                >
                  <Layout size={20} /> {auth.org_name}
                </NavLink>
              ))}
            </div>
          )}
        </ul>
      </div>

      {user && (
        <button onClick={logout} className="btn btn-outline-danger d-flex align-items-center gap-2 justify-content-center w-100 mt-4">
          <LogOut size={18} /> Logout
        </button>
      )}
    </div>
  );
};

export default Sidebar;