import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../UI/LoginModal';

const Navbar = () => {
  const { user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="d-flex justify-content-end align-items-center p-3 border-bottom border-secondary" style={{ height: '70px', background: '#1a1b2e' }}>
      {user ? (
        <div className="d-flex align-items-center gap-3">
          <div className="text-end">
            <div className="text-white fw-bold">{user.name}</div>
            <div className="text-secondary small" style={{ fontSize: '0.8rem' }}>{user.entry_number}</div>
          </div>
          <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: '40px', height: '40px' }}>
            {user.name.charAt(0)}
          </div>
        </div>
      ) : (
        <button className="btn btn-purple" onClick={() => setIsLoginOpen(true)}>Login</button>
      )}
      
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default Navbar;