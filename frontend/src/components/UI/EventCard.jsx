import React, { useState } from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import EventRegistrationModal from '../Forms/EventRegistrationModal';
import LoginModal from './LoginModal';

const EventCard = ({ event, refreshEvents }) => {
  const { user } = useAuth();
  const [showRegModal, setShowRegModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleRegisterClick = () => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      setShowRegModal(true);
    }
  };

  // Parsing date for display
  const eventDate = new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const eventTime = new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="col-md-4 mb-4">
      <div className="card h-100 border-0 shadow-sm" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
        <img 
          src={event.image_url ? `http://localhost:8000/uploads/${event.image_url}` : "https://via.placeholder.com/300x150"} 
          className="card-img-top" 
          alt={event.name} 
          style={{ height: '180px', objectFit: 'cover' }}
        />
        <div className="card-body p-4 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25">{event.org_name}</span>
            {event.tags && event.tags.length > 0 && <span className="badge bg-dark text-secondary">{event.tags[0]}</span>}
          </div>
          
          <h5 className="card-title text-white fw-bold mb-3">{event.name}</h5>
          
          <div className="text-secondary small mb-3 flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-1"><Calendar size={14}/> {eventDate} at {eventTime}</div>
            <div className="d-flex align-items-center gap-2 mb-1"><MapPin size={14}/> {event.venue}</div>
          </div>

          {event.is_registered ? (
            <button className="btn btn-success w-100 disabled" style={{ opacity: 0.8 }}>
              Registered
            </button>
          ) : (
            <button className="btn btn-purple w-100" onClick={handleRegisterClick}>
              Register Now
            </button>
          )}
        </div>
      </div>

      <EventRegistrationModal 
        isOpen={showRegModal} 
        onClose={() => setShowRegModal(false)}
        eventId={event.id}
        onSuccess={refreshEvents}
      />
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
};

export default EventCard;