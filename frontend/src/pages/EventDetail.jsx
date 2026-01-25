import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Calendar, MapPin, ArrowLeft, Clock, Info, Check } from 'lucide-react';
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

import EventRegistrationModal from "../components/Forms/EventRegistrationModal"; 

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuth();

  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  
  // State for the registration modal
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${eventId}`);
      setEvent(res.data);
    } catch (err) {
      console.error(err);
      setError("Event not found");
    }
  };

  const handleRegisterClick = () => {
    // 1. Check Login
    if (!user) {
      openLoginModal();
      return;
    }
    // 2. Open Modal instead of direct API call
    setIsRegisterModalOpen(true);
  };

  const handleRegistrationSuccess = () => {
    setIsRegisterModalOpen(false);
    // Refresh event data to update button to "Registered"
    fetchEvent(); 
  };

  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
  if (!event) return <div className="text-center mt-5 text-white">Loading...</div>;

  return (
    <div className="container py-5">
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-link text-secondary text-decoration-none mb-4 ps-0"
      >
        <ArrowLeft size={18} className="me-2" /> Back
      </button>

      <div className="row">
        {/* Left Column: Image */}
        <div className="col-md-5 mb-4">
          <img 
            src={event.image_url ? `http://localhost:8000/uploads/${event.image_url}` : "https://via.placeholder.com/600x400"} 
            className="img-fluid rounded-4 shadow-lg w-100 object-fit-cover" 
            alt={event.name} 
            style={{ height: '350px' }}
          />
        </div>

        {/* Right Column: Details */}
        <div className="col-md-7">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <span className="badge bg-purple-soft text-purple border-purple px-3 py-2 rounded-pill mb-3">
                {event.org_name}
              </span>
              <h1 className="fw-bold text-white mb-2">{event.name}</h1>
            </div>
          </div>

          <div className="row g-3 mt-2 mb-4">
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-3 text-secondary p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="icon-box-purple"><Calendar size={20} /></div>
                <div>
                  <small className="d-block text-uppercase fw-bold opacity-50">Date & Time</small>
                  <span className="text-white">{new Date(event.date).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="d-flex align-items-center gap-3 text-secondary p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="icon-box-purple"><MapPin size={20} /></div>
                <div>
                  <small className="d-block text-uppercase fw-bold opacity-50">Venue</small>
                  <span className="text-white">{event.venue}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="section-title mb-3 d-flex align-items-center gap-2 text-white">
            <Info size={18} className="text-purple" /> About Event
          </div>

          <div className="event-detail-description mb-5 text-secondary" style={{ lineHeight: '1.8' }}>
            {event.description}
          </div>

          {/* Actions */}
          <div className="d-flex gap-3 mt-4">
            <button
              className={`btn px-5 py-3 fw-bold flex-grow-1 d-flex align-items-center justify-content-center gap-2 ${
                event.is_registered ? "btn-registered" : "btn-purple"
              }`}
              disabled={event.is_registered}
              onClick={handleRegisterClick} 
            >
              {event.is_registered ? <><Check size={20} /> Registered</> : "Register Now"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Integration */}
      <EventRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        eventId={eventId}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  );
};

export default EventDetail;