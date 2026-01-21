import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card p-4 rounded-4" style={{ background: '#1e222d', width: '400px', border: '1px solid rgba(239, 68, 68, 0.3)' }} onClick={e => e.stopPropagation()}>
        
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="bg-danger bg-opacity-25 p-2 rounded-circle text-danger">
            <AlertTriangle size={24} />
          </div>
          <h5 className="text-white fw-bold m-0">{title || "Confirm Action"}</h5>
          <button className="btn text-secondary ms-auto p-0" onClick={onClose}><X size={20} /></button>
        </div>

        <p className="text-secondary mb-4">{message || "Are you sure you want to proceed? This action cannot be undone."}</p>

        <div className="d-flex gap-2 justify-content-end">
          <button className="btn btn-outline-secondary" onClick={onClose} disabled={isLoading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;