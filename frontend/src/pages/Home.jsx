import React, { useState, useEffect } from "react";
import api from "../api/axios";
import EventCard from "../components/UI/EventCard";
import FilterDrawer from "../components/UI/FilterDrawer";
import Loader from "../components/UI/Loader";
import LoginModal from "../components/UI/LoginModal";
import { Filter, Search, ArrowUpDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const LIMIT = 6;

const Home = () => {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

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
        sort_by: sortBy
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
      fetchEvents(true);
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
    </>
  );
};

export default Home;
