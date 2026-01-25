import React, { useState, useEffect } from "react";
import api from "../api/axios";
import EventCard from "../components/UI/EventCard";
import FilterDrawer from "../components/UI/FilterDrawer";
import Loader from "../components/UI/Loader";
import LoginModal from "../components/UI/LoginModal";
import { Filter, Search, ArrowUpDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// ✅ IMPORT THE REGISTRATION MODAL
import EventRegistrationModal from "../components/Forms/EventRegistrationModal";

const LIMIT = 6;

const Home = () => {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // ✅ STATE FOR REGISTRATION MODAL
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const [orgType, setOrgType] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedItem, setSelectedItem] = useState("");

  // 🔍 SEARCH
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 🔁 SORT
  const [sortBy, setSortBy] = useState("date");

  // 🔁 PAGINATION
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset pagination on filters/search/sort change
  useEffect(() => {
    setSkip(0);
    setEvents([]);
    setHasMore(true);
    fetchEvents(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgType, selectedBoard, selectedItem, debouncedSearch, sortBy]);

  const fetchEvents = async (reset = false) => {
    try {
      reset ? setLoading(true) : setLoadingMore(true);
      const params = {
        skip: reset ? 0 : skip,
        limit: LIMIT,
        sort_by: sortBy,
      };

      if (orgType) params.org_type = orgType;
      if (selectedBoard) params.board = selectedBoard;
      if (selectedItem) params.item = selectedItem;
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await api.get("/events", { params });

      if (reset) {
        setEvents(res.data);
      } else {
        setEvents((prev) => [...prev, ...res.data]);
      }

      if (res.data.length < LIMIT) {
        setHasMore(false);
      }

      setSkip((prev) => prev + LIMIT);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // ✅ FIX: OPEN MODAL INSTEAD OF DIRECT API CALL
  const handleRegisterClick = (event) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    // Set the event ID and open the modal
    setSelectedEventId(event.id);
    setIsRegisterModalOpen(true);
  };

  // ✅ CALLBACK FOR SUCCESSFUL REGISTRATION
  const handleRegistrationSuccess = () => {
    setIsRegisterModalOpen(false);
    setSelectedEventId(null);
    // Refresh the list so the button turns to "Registered"
    // Passing 'false' to keep current list but we probably want to reload to update status
    // For simplicity, we can just reload the current view or re-fetch
    fetchEvents(true); 
  };

  return (
    <>
      {/* HEADER */}
      <div className="container mt-4 mb-4">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 className="fw-bold text-white mb-1">Upcoming Events</h2>
            <p className="text-secondary mb-0">
              Find and register for club activities
            </p>
          </div>

          {/* SEARCH + SORT + FILTER */}
          <div className="d-flex align-items-center gap-3">
            {/* Search */}
            <div className="search-glass">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Sort */}
            <div className="sort-glass">
              <ArrowUpDown size={16} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Sort by Date</option>
                <option value="popularity" disabled>
                  Popularity (coming soon)
                </option>
              </select>
            </div>

            {/* Filter */}
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
          <>
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

            {/* LOAD MORE */}
            {hasMore && (
              <div className="d-flex justify-content-center mt-5">
                <button
                  className="btn btn-outline-secondary text-white px-5"
                  onClick={() => fetchEvents(false)}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}

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

        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
        />

        {/* ✅ RENDER THE REGISTRATION MODAL */}
        <EventRegistrationModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          eventId={selectedEventId}
          onSuccess={handleRegistrationSuccess}
        />
      </div>
    </>
  );
};

export default Home;