import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import EventCard from './components/EventCard';
import FilterDrawer from './components/FilterDrawer';
import axios from 'axios';
import LoginModal from './components/LoginModal';
import './App.css';

const API_BASE_URL = "http://localhost:8000"; 

function App() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedClub, setSelectedClub] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // Auth States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  // 1. Check for existing token on load
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      verifyToken(token);
    }
  }, []);

  // 2. Verify token via /auth/me
  const verifyToken = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setIsLoggedIn(true);
    } catch (err) {
      localStorage.removeItem('access_token');
      setIsLoggedIn(false);
    }
  };

  // 3. Trigger Microsoft SSO
  const handleLogin = () => {
    setShowLoginOptions(false);
    // Redirect to Microsoft as per API logic
    window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize...`; 
  };

  const [events] = useState([
    { id: 1, name: "AI Workshop", board: "CAIC", club: "DevClub", date: "25 Jan 2026", location: "LHC 101" },
    { id: 2, name: "Dance Faceoff", board: "BRCA", club: "Dance", date: "28 Jan 2026", location: "OAT" },
    { id: 3, name: "Code Sprint", board: "CAIC", club: "ACM", date: "02 Feb 2026", location: "Virtual" }
  ]);

  const filteredEvents = events.filter(event => {
    const boardMatch = selectedBoard ? event.board === selectedBoard : true;
    const clubMatch = selectedClub ? event.club === selectedClub : true;
    return boardMatch && clubMatch;
  });

  return (
    <div className="container-fluid">
      <div className="row">
        <nav className="col-md-2 d-none d-md-block sidebar">
          <h4 className="p-3 fw-bold text-purple">SYNAPSE</h4>
          <ul className="nav flex-column mt-4">
            <li className="nav-item mb-2"><a href="#" className="nav-link text-white active">Events</a></li>
          </ul>
        </nav>

        <main className="col-md-10 ms-sm-auto px-md-4 py-4">
          <div className="d-flex justify-content-between align-items-center mb-5">
            <div>
              <h1 className="h2 fw-bold text-white mb-0">Upcoming Events</h1>
              <p className="text-secondary mb-0">Find and register for club activities</p>
            </div>
            
            <div className="d-flex gap-3 align-items-center position-relative">
              {/* Filter Button */}
              <button 
                className={`btn d-flex align-items-center gap-2 ${selectedBoard || selectedClub ? 'btn-purple' : 'btn-outline-secondary text-white'}`}
                onClick={() => setIsFilterOpen(true)}
              >
                <Filter size={18} />
                Filter {filteredEvents.length < events.length && `(${filteredEvents.length})`}
              </button>

              {/* Cool Login Dropdown */}
              {!isLoggedIn ? (
        <button 
          className="btn btn-purple px-4 fw-bold shadow-sm"
          onClick={() => setIsLoginModalOpen(true)}
        >
          Login
        </button>
      ) : (
        <div className="user-profile-circle">
          {user?.name?.substring(0, 2).toUpperCase() || 'SM'}
        </div>
      )}

      {/* Place the Modal at the bottom of the JSX */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={handleLogin}
      />
            </div>
          </div>

          <div className="row">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  isLoggedIn={isLoggedIn} 
                  onLoginRequired={handleLogin} 
                />
              ))
            ) : (
              <div className="col-12 text-center py-5 glass-card rounded-4">
                <h4 className="text-secondary">No events found for this selection</h4>
                <button className="btn btn-link text-purple" onClick={() => {setSelectedBoard(""); setSelectedClub("");}}>
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <FilterDrawer 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedBoard={selectedBoard}
        setSelectedBoard={setSelectedBoard}
        selectedClub={selectedClub}
        setSelectedClub={setSelectedClub}
      />
    </div>
  );
}

export default App;