import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Loader from '../components/UI/Loader';
import { Calendar, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCalendar();
  }, []);

  const fetchMyCalendar = async () => {
    try {
      const res = await api.get('/user/calendar');
      setCalendarEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyICS = async () => {
    try {
      const res = await api.post('/user/calendar/share');
      navigator.clipboard.writeText(res.data.ics_url);
      toast.success("Calendar Link Copied to Clipboard!");
    } catch (err) {
      toast.error("Failed to generate link");
    }
  };

  if (!user) return <Loader />;

  return (
  <div className="container-fluid profile-page">
    <div className="row g-4">

      {/* LEFT: PROFILE CARD */}
      <div className="col-lg-4">
        <div className="profile-glass-card h-100 text-center p-4">
          
          <div className="profile-avatar mx-auto mb-3">
            {user.name.charAt(0)}
          </div>

          <h3 className="fw-bold text-white mb-1">{user.name}</h3>
          <p className="text-secondary mb-2">{user.email}</p>

          <span className="entry-pill">{user.entry_number}</span>

          <div className="divider my-4" />

          <div className="text-start">
            <h6 className="section-title">Your Interests</h6>

            <div className="d-flex flex-wrap gap-2 mt-2">
              {user.interests.length > 0 ? (
                user.interests.map(i => (
                  <span key={i} className="interest-chip">{i}</span>
                ))
              ) : (
                <span className="text-secondary small">
                  No interests selected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: MY SCHEDULE */}
      <div className="col-lg-8">
        <div className="profile-glass-card h-100 p-4">

          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold text-white m-0">My Schedule</h4>

            <button
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
              onClick={handleCopyICS}
            >
              <Copy size={16} /> Sync Calendar
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <div className="schedule-list">
              {calendarEvents.length > 0 ? (
                calendarEvents.map(event => (
                  <div key={event.id} className="schedule-item">
                    <div>
                      <h6 className="fw-bold text-white mb-1">
                        {event.name}
                      </h6>
                      <div className="schedule-meta">
                        <span>
                          <Calendar size={14} />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span className="text-accent">
                          {event.org_name}
                        </span>
                      </div>
                    </div>

                    <span className="status-pill">Registered</span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  You haven't registered for any events yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  </div>
);

};

export default Profile;