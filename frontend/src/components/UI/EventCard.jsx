import React from 'react';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';

const EventCard = ({ event }) => {
  return (
    <div className="col-md-4 mb-4">
      <div className="card event-card h-100 p-3">

        {/* Event Banner */}
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

          {/* ✅ BOARD BADGE (FIXED) */}
          {event.board && (
            <span className="board-badge mb-2 d-inline-block">
              {event.board}
            </span>
          )}

          <h5 className="card-title fw-bold text-white">
            {event.name}
          </h5>

          {/* Club / Org name */}
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

          <button className="btn btn-purple w-100 d-flex align-items-center justify-content-center gap-2">
            Register <ExternalLink size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
