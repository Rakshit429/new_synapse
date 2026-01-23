import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Calendar, MapPin, ArrowLeft, Clock, Info } from 'lucide-react';
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuth(); // ✅ CHANGE

  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${eventId}`);
        setEvent(res.data);
      } catch (err) {
        console.error(err);
        setError("Event not found");
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleRegister = async () => {
    // 🔐 NOT LOGGED IN → OPEN LOGIN MODAL
    if (!user) {
      openLoginModal();        // ✅ THIS IS THE FIX
      return;
    }

    try {
      setRegistering(true);
      await api.post(`/events/${eventId}/register`, {});
      toast.success("Registered successfully!");

      setEvent(prev => ({
        ...prev,
        is_registered: true
      }));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  if (error) {
    return (
      <div className="p-5 text-center">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-5 text-center text-secondary">
        Loading event details...
      </div>
    );
  }

  const eventDate = new Date(event.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const eventTime = new Date(event.date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="event-detail-page">
      {/* Back Button */}
      <button
        className="btn text-secondary d-flex align-items-center gap-2 mb-4 p-0 border-0"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} /> Back to Events
      </button>

      <div className="event-detail-card">
        {/* Banner */}
        <div className="position-relative">
          <img
            src={
              event.image_url
                ? `http://localhost:8000/uploads/${event.image_url}`
                : "https://via.placeholder.com/800x400"
            }
            alt={event.name}
            className="event-detail-image shadow"
          />
          <span className="board-badge position-absolute top-0 start-0 m-3">
            {event.org_name}
          </span>
        </div>

        <div className="mt-4">
          <h1 className="event-detail-title">{event.name}</h1>
          <p className="event-detail-org">
            Organized by <span className="text-accent">{event.org_name}</span>
          </p>

          <div className="divider mb-4"></div>

          {/* Metadata */}
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-3 text-secondary">
                <div className="icon-box-purple"><Calendar size={20} /></div>
                <div>
                  <small className="d-block text-uppercase fw-bold opacity-50">Date</small>
                  <span className="text-white">{eventDate}</span>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="d-flex align-items-center gap-3 text-secondary">
                <div className="icon-box-purple"><Clock size={20} /></div>
                <div>
                  <small className="d-block text-uppercase fw-bold opacity-50">Time</small>
                  <span className="text-white">{eventTime}</span>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="d-flex align-items-center gap-3 text-secondary">
                <div className="icon-box-purple"><MapPin size={20} /></div>
                <div>
                  <small className="d-block text-uppercase fw-bold opacity-50">Venue</small>
                  <span className="text-white">{event.venue}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="section-title mb-3 d-flex align-items-center gap-2">
            <Info size={16} /> About Event
          </div>

          <div className="event-detail-description mb-5">
            {event.description}
          </div>

          {/* Actions */}
          <div className="d-flex gap-3 mt-4">
            <button
              className={`btn px-5 py-2 fw-bold flex-grow-1 ${
                event.is_registered ? "btn-registered" : "btn-purple"
              }`}
              disabled={event.is_registered || registering}
              onClick={handleRegister}
            >
              {event.is_registered ? "Registered" : "Register Now"}
            </button>

            <button className="btn btn-outline-secondary text-white px-4 border-opacity-25">
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
