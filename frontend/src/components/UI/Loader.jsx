import React from 'react';

const Loader = () => {
  return (
    <div className="d-flex justify-content-center align-items-center p-5">
      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem', color: '#7c3aed' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;