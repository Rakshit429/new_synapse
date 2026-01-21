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
    <div className="container-fluid">
      <div className="row g-4">
        {/* Profile Card */}
        <div className="col-md-4">
          <div className="glass-card p-4 text-center h-100">
            <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white display-4 fw-bold mx-auto mb-3" style={{ width: '100px', height: '100px' }}>
              {user.name.charAt(0)}
            </div>
            <h3 className="text-white fw-bold">{user.name}</h3>
            <p className="text-secondary">{user.email}</p>
            <p className="badge bg-dark border border-secondary text-light px-3 py-2">{user.entry_number}</p>
            
            <hr className="border-secondary my-4" />
            
            <div className="text-start">
              <h6 className="text-white mb-3">Your Interests</h6>
              <div className="d-flex flex-wrap gap-2">
                {user.interests.map(i => <span key={i} className="badge bg-purple">{i}</span>)}
                {user.interests.length === 0 && <span className="text-muted small">No interests selected</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar / Registered Events */}
        <div className="col-md-8">
          <div className="glass-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="text-white fw-bold m-0">My Schedule</h4>
              <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2" onClick={handleCopyICS}>
                <Copy size={16} /> Sync Calendar
              </button>
            </div>

            {loading ? <Loader /> : (
              <div className="d-flex flex-column gap-3">
                {calendarEvents.length > 0 ? (
                  calendarEvents.map(event => (
                    <div key={event.id} className="p-3 rounded bg-dark border border-secondary d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-white mb-1 fw-bold">{event.name}</h6>
                        <div className="text-secondary small d-flex gap-3">
                          <span><Calendar size={14}/> {new Date(event.date).toLocaleDateString()}</span>
                          <span className="text-accent">{event.org_name}</span>
                        </div>
                      </div>
                      <span className="badge bg-success bg-opacity-25 text-success">Registered</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-secondary py-5">
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