import React from 'react';
import { X } from 'lucide-react';

const BOARD_CLUB_MAPPING = {
  "CAIC": ["DevClub", "iGEM", "Robotics Club", "Axlr8r Formula Racing", "PAC", "BnC", "Aeromodelling Club", "Economics Club", "ANCC", "Aries", "IGTS", "BlocSoc", "Hyperloop"],
  "BRCA": ["Drama", "Design", "PFC", "FACC", "Dance", "Hindi Samiti", "Literary", "DebSoc", "QC", "Music", "Spic Macay", "Envogue"],
};

const FilterDrawer = ({ 
  isOpen, 
  onClose, 
  selectedBoard, 
  setSelectedBoard, 
  selectedClub, 
  setSelectedClub 
}) => {
  return (
    <>
      {/* Background Blur Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      {/* Sliding Sidebar */}
      <div className={`filter-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="d-flex justify-content-between align-items-center mb-4 p-3 border-bottom border-secondary">
          <h5 className="mb-0 fw-bold text-white">Filter Events</h5>
          <button className="btn text-white" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <label className="form-label text-secondary small text-uppercase fw-bold mb-3">By Board</label>
            <div className="filter-options">
              {Object.keys(BOARD_CLUB_MAPPING).map(board => (
                <button 
                  key={board}
                  className={`filter-chip ${selectedBoard === board ? 'active' : ''}`}
                  onClick={() => { setSelectedBoard(board); setSelectedClub(""); }}
                >
                  {board}
                </button>
              ))}
            </div>
          </div>

          {selectedBoard && (
            <div className="mb-4">
              <label className="form-label text-secondary small text-uppercase fw-bold mb-3">By Club</label>
              <div className="filter-options">
                {BOARD_CLUB_MAPPING[selectedBoard].map(club => (
                  <button 
                    key={club}
                    className={`filter-chip ${selectedClub === club ? 'active' : ''}`}
                    onClick={() => setSelectedClub(club)}
                  >
                    {club}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 pt-4 border-top border-secondary">
            <button className="btn btn-purple w-100 mb-2" onClick={onClose}>Apply Filters</button>
            <button 
              className="btn btn-link w-100 text-secondary text-decoration-none" 
              onClick={() => { setSelectedBoard(""); setSelectedClub(""); }}
            >
              Reset All
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterDrawer;