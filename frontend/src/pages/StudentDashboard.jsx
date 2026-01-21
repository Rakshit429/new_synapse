import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../api/axios';
import Loader from '../components/UI/Loader';
import { Star, MessageSquare } from 'lucide-react';

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [feedbackNeeded, setFeedbackNeeded] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch User's Registered Events for Calendar
      const calRes = await api.get('/user/calendar');
      
      // Format for FullCalendar
      const formattedEvents = calRes.data.map(event => ({
        title: event.name,
        start: event.date, // Ensure backend sends ISO format
        backgroundColor: '#7c3aed',
        borderColor: '#7c3aed',
        extendedProps: { venue: event.venue }
      }));
      setCalendarEvents(formattedEvents);

      // Fetch Recommendations
      const recRes = await api.get('/events/recommendations');
      setRecommendations(recRes.data);

      // Fetch Feedback Needed (Logic: Past events with no feedback)
      // Note: You might need a specific API for this or filter client-side
      const feedbackRes = await api.get('/user/feedback-pending'); 
      setFeedbackNeeded(feedbackRes.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container-fluid p-4">
      <div className="row g-4">
        {/* LEFT COLUMN: CALENDAR (Main Focus) */}
        <div className="col-lg-8">
          <div className="glass-card p-4 h-100">
            <h4 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
              <i className='bx bxs-calendar'></i> Your Calendar
            </h4>
            
            <div className="calendar-wrapper bg-white rounded-3 p-3 text-dark">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,listWeek'
                }}
                events={calendarEvents}
                height="500px"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WIDGETS */}
        <div className="col-lg-4 d-flex flex-column gap-4">
          
          {/* Recommendations Widget */}
          <div className="glass-card p-4">
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <Star size={20} className="text-warning"/> Recommended For You
            </h5>
            {recommendations.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {recommendations.slice(0, 3).map(event => (
                  <div key={event.id} className="p-3 rounded bg-dark border border-secondary">
                    <h6 className="text-white mb-1">{event.name}</h6>
                    <small className="text-secondary">{new Date(event.date).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary small">
                No recommendations available. Explore and register for events to get personalized suggestions!
              </p>
            )}
          </div>

          {/* Feedback Widget */}
          <div className="glass-card p-4">
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <MessageSquare size={20} className="text-info"/> Feedback Needed
            </h5>
            {feedbackNeeded.length > 0 ? (
              <ul className="list-group list-group-flush bg-transparent">
                {feedbackNeeded.map(event => (
                  <li key={event.id} className="list-group-item bg-transparent text-white border-secondary px-0">
                    {event.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-secondary small">
                You're all caught up! No events are awaiting your feedback.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
