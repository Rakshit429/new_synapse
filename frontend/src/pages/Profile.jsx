import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Loader from "../components/UI/Loader";
import toast from "react-hot-toast";
import {
  Camera,
  Edit3,
  Save,
  X,
  GraduationCap,
  MapPin,
  Calendar,
} from "lucide-react";

const ALL_INTERESTS = [
  "AI",
  "Web Development",
  "Machine Learning",
  "Robotics",
  "Design",
  "Blockchain",
  "Competitive Programming",
  "Cyber Security",
];

const Profile = () => {
  const { user, setUser } = useAuth();
  const [editMode, setEditMode] = useState(false);

  // Initialize form with user data
  const [form, setForm] = useState({
    hostel: user?.hostel || "",
    department: user?.department || "",
    current_year: user?.current_year || "",
    interests: user?.interests || [],
    photo_url: user?.photo_url || "",
  });

  if (!user) return <Loader />;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm({ ...form, photo_url: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const toggleInterest = (interest) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const saveProfile = async () => {
    try {
      const res = await api.put("/user/profile", form);
      setUser(res.data);
      toast.success("Profile updated successfully");
      setEditMode(false);
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  const cancelEdit = () => {
    setForm({
      hostel: user.hostel,
      department: user.department,
      current_year: user.current_year,
      interests: user.interests,
      photo_url: user.photo_url,
    });
    setEditMode(false);
  };

  return (
    <div className="container-fluid profile-page py-4">
      {/* 1. HERO SECTION: Identity & Actions */}
      <div className="profile-hero-card mb-4 p-4 p-md-5">
        <div className="d-flex flex-column flex-md-row align-items-center gap-4">
          {/* Avatar with FAB */}
          <div className="position-relative">
            <div className="profile-avatar-large shadow-lg">
              {form.photo_url ? (
                <img
                  src={form.photo_url}
                  alt="profile"
                  className="w-100 h-100 object-fit-cover rounded-inherit"
                />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            {editMode && (
              <button
                className="avatar-edit-fab shadow"
                onClick={() => document.getElementById("photoInput").click()}
              >
                <Camera size={18} />
              </button>
            )}
            <input
              type="file"
              hidden
              id="photoInput"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Name & Contact */}
          <div className="text-center text-md-start flex-grow-1">
            <h1 className="display-6 fw-bold text-white mb-1">{user.name}</h1>
            <p className="text-secondary fs-5 mb-2">{user.email}</p>
            <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2">
              <span className="entry-pill px-3 py-1">{user.entry_number}</span>
              <span className="entry-pill px-3 py-1 bg-purple-soft border-purple">
                Active Student
              </span>
            </div>
          </div>

          {/* Global Toggle Buttons */}
          <div className="mt-3 mt-md-0">
            {!editMode ? (
              <button
                className="btn btn-purple-outline d-flex align-items-center gap-2 px-4 py-2"
                onClick={() => setEditMode(true)}
              >
                <Edit3 size={18} /> Edit Profile
              </button>
            ) : (
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-danger d-flex align-items-center gap-2"
                  onClick={cancelEdit}
                >
                  <X size={18} /> Discard
                </button>
                <button
                  className="btn btn-purple d-flex align-items-center gap-2 px-4"
                  onClick={saveProfile}
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* 2. ACADEMIC INFO CARD */}
        <div className="col-lg-4">
          <div className="profile-glass-card h-100 p-4">
            <h5 className="section-title mb-4 d-flex align-items-center gap-2">
              <GraduationCap size={18} /> Academic Details
            </h5>

            <div className="info-group mb-4">
              <label className="text-secondary small text-uppercase fw-bold">
                Department
              </label>
              {!editMode ? (
                <p className="text-white fs-5">
                  {user.department || "Not specified"}
                </p>
              ) : (
                <input
                  className="form-control glass-input mt-1"
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                />
              )}
            </div>

            <div className="info-group mb-4">
              <label className="text-secondary small text-uppercase fw-bold">
                Hostel
              </label>
              <div className="d-flex align-items-center gap-2">
                {!editMode ? (
                  <p className="text-white fs-5 mb-0">
                    <MapPin size={16} className="me-1 text-purple" />{" "}
                    {user.hostel || "Not specified"}
                  </p>
                ) : (
                  <input
                    className="form-control glass-input mt-1"
                    value={form.hostel}
                    onChange={(e) =>
                      setForm({ ...form, hostel: e.target.value })
                    }
                  />
                )}
              </div>
            </div>

            <div className="info-group">
              <label className="text-secondary small text-uppercase fw-bold">
                Current Year
              </label>
              {!editMode ? (
                <p className="text-white fs-5">
                  <Calendar size={16} className="me-1 text-purple" /> Year{" "}
                  {user.current_year || "N/A"}
                </p>
              ) : (
                <input
                  type="number"
                  className="form-control glass-input mt-1"
                  value={form.current_year}
                  onChange={(e) =>
                    setForm({ ...form, current_year: e.target.value })
                  }
                />
              )}
            </div>
          </div>
        </div>
        {/* 3. INTERESTS CARD */}
        <div className="col-lg-8">
          <div className="profile-glass-card h-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="section-title mb-0">
                Personal Interests & Skills
              </h5>
              {editMode && (
                <span className="badge bg-purple-soft border-purple text-xs">
                  {form.interests.length} Selected
                </span>
              )}
            </div>

            <p className="text-secondary small mb-3">
              {editMode
                ? "Tap to add or remove interests from your profile."
                : "Interests help us suggest relevant campus events."}
            </p>

            <div className="d-flex flex-wrap gap-2">
              {/* LOGIC: 
         If editing, show ALL possible interests so user can toggle.
         If viewing, show ONLY what the user has saved.
      */}
              {(editMode ? ALL_INTERESTS : user.interests).map((i) => {
                const isSelected = form.interests.includes(i);
                return (
                  <button
                    key={i}
                    disabled={!editMode}
                    className={`interest-chip selectable ${isSelected ? "active" : ""} ${!editMode ? "no-hover" : ""}`}
                    onClick={() => toggleInterest(i)}
                  >
                    {/* Visual indicator in edit mode */}
                    {editMode && (
                      <span className="me-1">{isSelected ? "●" : "○"}</span>
                    )}
                    {i}
                  </button>
                );
              })}

              {!editMode && user.interests.length === 0 && (
                <div className="empty-state-mini py-4 text-center w-100">
                  <p className="text-secondary italic mb-0">
                    No interests selected yet. Click 'Edit' to add some!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
