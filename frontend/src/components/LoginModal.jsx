import React from 'react';
import { X, User } from 'lucide-react';

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="login-glass-container" onClick={(e) => e.stopPropagation()}>
        
        {/* FIXED: The close button is now inside the container but positioned absolutely */}
        <button className="close-modal-btn" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="login-brand-side">
          <div className="brand-content">
            <div className="synapse-logo">Synapse</div>
            <h1>Welcome to Synapse</h1>
            <p>Your complete event management software solution</p>
          </div>
        </div>

        <div className="login-form-side">
          <div className="form-wrapper">
            <h2 className="mb-4 fw-bold">Login</h2>
            
            {/* Role selection is still necessary before OAuth */}
            <div className="input-group-custom">
              <label><User size={16} /> Select Your Role</label>
              <select className="select-custom">
                <option>Student</option>
              </select>
            </div>

            {/* Microsoft OAuth Button */}
            <div className="microsoft-btn-container">
            <button className="btn-microsoft-login" onClick={onLogin}>
                {/* <img 
                src="https://authjs.dev/img/providers/microsoft.svg" 
                alt="Microsoft Logo" 
                className="ms-logo"
                /> */}
                <span>Sign in with Microsoft</span>
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;