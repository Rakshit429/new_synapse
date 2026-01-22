// import React from 'react';
// import { X } from 'lucide-react';

// const LoginModal = ({ isOpen, onClose }) => {
//   if (!isOpen) return null;

//     const handleMicrosoftLogin = () => {
//         const CLIENT_ID = process.env.REACT_APP_MS_CLIENT_ID;
//         const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;
//         // CHANGED: Use your specific IIT Delhi Tenant ID instead of 'common'
//         const TENANT_ID = "624d5c4b-45c5-4122-8cd0-44f0f84e945d"; 
        
//         const targetUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&response_mode=query&scope=User.Read`;
        
//         window.location.href = targetUrl;
//     };

//   return (
//     <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//       <div className="login-glass-container p-4 rounded-4" style={{ background: '#1e222d', width: '400px', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
//         <div className="d-flex justify-content-between align-items-center mb-4">
//           <h3 className="text-white fw-bold m-0">Login</h3>
//           <button className="btn text-white p-0" onClick={onClose}><X size={24} /></button>
//         </div>
        
//         <p className="text-secondary mb-4">Sign in with your IIT Delhi email to continue.</p>
        
//         <button onClick={handleMicrosoftLogin} className="btn btn-light w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2">
//           <img src="https://authjs.dev/img/providers/microsoft.svg" alt="MS" width="20" />
//           Sign in with Microsoft
//         </button>
//       </div>
//     </div>
//   );
// };

// export default LoginModal;

import React from 'react';
import { X, User } from 'lucide-react';

const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleMicrosoftLogin = () => {
    const CLIENT_ID = process.env.REACT_APP_MS_CLIENT_ID;
    const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;
    const TENANT_ID = "624d5c4b-45c5-4122-8cd0-44f0f84e945d";

    const targetUrl =
      `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize` +
      `?client_id=${CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_mode=query` +
      `&scope=User.Read`;

    window.location.href = targetUrl;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="login-glass-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-modal-btn" onClick={onClose}>
          <X size={24} />
        </button>

        {/* LEFT SIDE */}
        <div className="login-brand-side">
          <div className="brand-content">
            <div className="synapse-logo">Synapse</div>
            <h1>Welcome to Synapse</h1>
            <p>Your complete event management software solution</p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-form-side">
          <div className="form-wrapper">
            <h2 className="mb-4 fw-bold text-white">Login</h2>

            <div className="input-group-custom">
              <label>
                <User size={16} /> Select Your Role
              </label>
              <select className="select-custom">
                <option>Student</option>
                <option>Admin</option>
              </select>
            </div>

            <div className="microsoft-btn-container">
              <button
                className="btn-microsoft-login"
                onClick={handleMicrosoftLogin}
              >
                <img
                  src="https://authjs.dev/img/providers/microsoft.svg"
                  alt="Microsoft"
                  className="ms-logo"
                />
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
