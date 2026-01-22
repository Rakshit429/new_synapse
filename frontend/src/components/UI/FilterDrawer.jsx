import React from "react";
import { X } from "lucide-react";

const FILTER_MAPPING = {
  Clubs: {
    CAIC: [
      "DevClub", "iGEM", "Robotics Club", "Axlr8r Formula Racing",
      "PAC", "BnC", "Aeromodelling Club", "Economics Club",
      "ANCC", "Aries", "IGTS", "BlocSoc", "Hyperloop"
    ],
    BRCA: [
      "Drama", "Design", "PFC", "FACC", "Dance",
      "Hindi Samiti", "Literary", "DebSoc", "QC",
      "Music", "Spic Macay", "Envogue"
    ]
  },
  Fests: ["Rendezvous", "Beacon", "Literati", "Tryst", "Kaizen"],
  Departments: [
    "Applied Mechanics", "Biochemical Engineering", "Chemical",
    "Chemistry", "Civil", "CSE", "Design", "Electrical",
    "Mathematics", "Mechanical", "Physics"
  ]
};

const FilterDrawer = ({
  isOpen,
  onClose,
  orgType,
  setOrgType,
  selectedBoard,
  setSelectedBoard,
  selectedItem,
  setSelectedItem
}) => {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <div className={`filter-sidebar ${isOpen ? "open" : ""}`}>
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 className="mb-0 fw-bold text-white">Filter Events</h5>
          <button className="btn text-white" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className="p-4">

          {/* BY ORGANIZATION */}
          <div className="mb-4">
            <label className="text-secondary small fw-bold mb-3 d-block">
              BY ORGANIZATION
            </label>
            <div className="filter-options">
              {["Clubs", "Fests", "Departments"].map(type => (
                <button
                  key={type}
                  className={`filter-chip ${orgType === type ? "active" : ""}`}
                  onClick={() => {
                    setOrgType(type);
                    setSelectedBoard("");
                    setSelectedItem("");
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* BOARD (ONLY FOR CLUBS) */}
          {orgType === "Clubs" && (
            <div className="mb-4">
              <label className="text-secondary small fw-bold mb-3 d-block">
                BY BOARD
              </label>
              <div className="filter-options">
                {Object.keys(FILTER_MAPPING.Clubs).map(board => (
                  <button
                    key={board}
                    className={`filter-chip ${selectedBoard === board ? "active" : ""}`}
                    onClick={() => {
                      setSelectedBoard(board);
                      setSelectedItem("");
                    }}
                  >
                    {board}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FINAL LEVEL */}
          {(orgType === "Fests" ||
            orgType === "Departments" ||
            selectedBoard) && (
            <div className="mb-4">
              <label className="text-secondary small fw-bold mb-3 d-block">
                {orgType === "Clubs"
                  ? "BY CLUB"
                  : `BY ${orgType.slice(0, -1).toUpperCase()}`}
              </label>

              <div className="filter-options">
                {(orgType === "Clubs"
                  ? FILTER_MAPPING.Clubs[selectedBoard]
                  : FILTER_MAPPING[orgType]
                )?.map(item => (
                  <button
                    key={item}
                    className={`filter-chip ${selectedItem === item ? "active" : ""}`}
                    onClick={() => setSelectedItem(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="mt-5 pt-4 border-top">
            <button className="btn btn-purple w-100 mb-2" onClick={onClose}>
              Apply Filters
            </button>
            <button
              className="btn btn-link w-100 text-secondary"
              onClick={() => {
                setOrgType("");
                setSelectedBoard("");
                setSelectedItem("");
              }}
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
