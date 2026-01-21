import React from 'react';
import { X } from 'lucide-react';

const FilterDrawer = ({ isOpen, onClose, setFilters }) => {
  const handleOrgType = (type) => {
    setFilters(prev => ({ ...prev, org_type: type }));
    onClose();
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1040 }} />}
      <div className={`filter-sidebar ${isOpen ? 'open' : ''}`} style={{ 
        position: 'fixed', top: 0, right: isOpen ? 0 : '-350px', width: '300px', height: '100vh', 
        background: '#111222', zIndex: 1050, transition: '0.3s ease', borderLeft: '1px solid #333' 
      }}>
        <div className="p-4">
          <div className="d-flex justify-content-between mb-4">
            <h5 className="text-white">Filters</h5>
            <button className="btn text-white p-0" onClick={onClose}><X /></button>
          </div>
          
          <label className="text-secondary small text-uppercase mb-2">Organization Type</label>
          <div className="d-flex flex-column gap-2">
            <button className="btn btn-outline-secondary text-start text-white" onClick={() => handleOrgType('Club')}>Clubs</button>
            <button className="btn btn-outline-secondary text-start text-white" onClick={() => handleOrgType('Fest')}>Fests</button>
            <button className="btn btn-outline-secondary text-start text-white" onClick={() => handleOrgType('Department')}>Departments</button>
            <button className="btn btn-outline-primary text-start" onClick={() => handleOrgType('')}>Show All</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterDrawer;