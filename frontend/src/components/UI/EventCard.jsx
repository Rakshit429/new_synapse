import React from 'react';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event, onRegisterClick }) => {
  const navigate = useNavigate();
  const isRegistered = event.is_registered;

  const goToDetail = () => {
    navigate(`/events/${event.id}`);
  };

  return (
    <div className="col-md-4 mb-4">
      <div
        className="card event-card h-100 p-3 cursor-pointer"
        onClick={goToDetail}
      >
        <img
          src={
            event.image_url
              ? `http://localhost:8000/uploads/${event.image_url}`
              : "https://via.placeholder.com/300x150"
          }
          className="card-img-top rounded-4 mb-3"
          alt="event"
        />

        <div className="card-body p-0">
          <h5 className="card-title fw-bold text-white">
            {event.name}
          </h5>

          <p className="text-accent small mb-3">
            <strong>{event.org_name}</strong>
          </p>

          <div className="d-flex align-items-center mb-2 text-secondary small">
            <Calendar size={14} className="me-2" />
            {new Date(event.date).toLocaleDateString()}
          </div>

          <div className="d-flex align-items-center mb-4 text-secondary small">
            <MapPin size={14} className="me-2" />
            {event.venue}
          </div>

          {/* IMPORTANT: stopPropagation prevents navigation */}
          <button
            className={`btn w-100 d-flex align-items-center justify-content-center gap-2 ${
              isRegistered ? "btn-registered" : "btn-purple"
            }`}
            disabled={isRegistered}
            onClick={(e) => {
              e.stopPropagation();
              onRegisterClick(event);
            }}
          >
            {isRegistered ? "Registered" : "Register"}
            {!isRegistered && <ExternalLink size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
