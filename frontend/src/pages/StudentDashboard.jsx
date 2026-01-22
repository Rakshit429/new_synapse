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
  <div className="container-fluid student-dashboard">
    <div className="row g-4">

      {/* LEFT: CALENDAR */}
      <div className="col-lg-8">
        <div className="dashboard-glass-card p-4 h-100">
          <h4 className="section-heading mb-4">
            Your Calendar
          </h4>

          <div className="calendar-shell">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,listWeek'
              }}
              events={calendarEvents}
              height="520px"
            />
          </div>
        </div>
      </div>

      {/* RIGHT: SIDE WIDGETS */}
      <div className="col-lg-4 d-flex flex-column gap-4">

        {/* RECOMMENDATIONS */}
        <div className="dashboard-glass-card p-4">
          <h5 className="section-heading-sm mb-3">
            <Star size={18} className="text-warning" /> Recommended For You
          </h5>

          {recommendations.length > 0 ? (
            <div className="recommendation-list">
              {recommendations.slice(0, 3).map(event => (
                <div key={event.id} className="recommendation-item">
                  <h6 className="mb-1">{event.name}</h6>
                  <span className="text-secondary small">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-widget">
              No recommendations yet.
            </div>
          )}
        </div>

        {/* FEEDBACK */}
        <div className="dashboard-glass-card p-4">
          <h5 className="section-heading-sm mb-3">
            <MessageSquare size={18} className="text-info" /> Feedback Needed
          </h5>

          {feedbackNeeded.length > 0 ? (
            <div className="feedback-list">
              {feedbackNeeded.map(event => (
                <div key={event.id} className="feedback-item">
                  {event.name}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-widget">
              You’re all caught up 
            </div>
          )}
        </div>

      </div>
    </div>
  </div>
);

};

export default StudentDashboard;
