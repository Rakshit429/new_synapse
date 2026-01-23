import React, { useState, useEffect } from "react";
import api from "../api/axios";
import EventCard from "../components/UI/EventCard";
import FilterDrawer from "../components/UI/FilterDrawer";
import Loader from "../components/UI/Loader";
import LoginModal from "../components/UI/LoginModal";
import { Filter, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Home = () => {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const [orgType, setOrgType] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedItem, setSelectedItem] = useState("");

  // 🔍 SEARCH STATE
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 🔁 Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchEvents();
  }, [orgType, selectedBoard, selectedItem, debouncedSearch]);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const params = {};
      if (orgType) params.org_type = orgType;
      if (selectedBoard) params.board = selectedBoard;
      if (selectedItem) params.item = selectedItem;
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await api.get("/events", { params });
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = async (event) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }

    try {
      await api.post(`/events/${event.id}/register`, {
        custom_answers: {}
      });

      toast.success("Registered successfully");
      fetchEvents(); // refresh is_registered
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error("Already registered");
      } else {
        toast.error("Registration failed");
      }
    }
  };

  return (
    <>
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="h2 fw-bold text-white mb-0">Upcoming Events</h1>
          <p className="text-secondary mb-0">
            Find and register for club activities
          </p>
        </div>

        {/* 🔍 SEARCH + FILTER */}
        <div className="d-flex align-items-center gap-3">
          <div className="search-glass">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            className={`btn d-flex align-items-center gap-2 ${
              orgType ? "btn-purple" : "btn-outline-secondary text-white"
            }`}
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter size={18} />
            Filter
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <Loader />
        </div>
      ) : (
        <div className="row g-4">
          {events.length > 0 ? (
            events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRegisterClick={handleRegisterClick}
              />
            ))
          ) : (
            <div className="col-12 text-center py-5">
              <h4 className="text-secondary">No events found</h4>
            </div>
          )}
        </div>
      )}

      {/* FILTER DRAWER */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        orgType={orgType}
        setOrgType={setOrgType}
        selectedBoard={selectedBoard}
        setSelectedBoard={setSelectedBoard}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
      />

      {/* LOGIN MODAL */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  );
};

export default Home;
