import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import EventCard from '../components/UI/EventCard';
import FilterDrawer from '../components/UI/FilterDrawer';
import Loader from '../components/UI/Loader';
import { Filter } from 'lucide-react';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', org_type: '' });

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.org_type) params.append('org_type', filters.org_type);
      
      const res = await api.get(`/events?${params.toString()}`);
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-white fw-bold">Upcoming Events</h2>
        <button 
          className="btn btn-outline-light d-flex align-items-center gap-2"
          onClick={() => setIsFilterOpen(true)}
        >
          <Filter size={18} /> Filters
        </button>
      </div>

      {loading ? <Loader /> : (
        <div className="row g-4">
          {events.length > 0 ? (
            events.map(event => (
              <EventCard key={event.id} event={event} refreshEvents={fetchEvents} />
            ))
          ) : (
            <div className="text-center text-secondary mt-5">No events found.</div>
          )}
        </div>
      )}

      <FilterDrawer 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)}
        setFilters={setFilters}
      />
    </div>
  );
};

export default Home;