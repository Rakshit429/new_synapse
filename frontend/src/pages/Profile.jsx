import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Loader from '../components/UI/Loader';
import toast from 'react-hot-toast';
import { Camera, Edit3, Save, X, GraduationCap, MapPin, Calendar, Heart } from 'lucide-react';

// Import the constants you defined in constants.js
import { DEPARTMENTS, HOSTELS, YEARS } from '../utils/constants';

const ALL_INTERESTS = [
  "AI", "Web Development", "Machine Learning", "Robotics", 
  "Design", "Blockchain", "Competitive Programming", "Cyber Security"
];

const Profile = () => {
  const { user, setUser } = useAuth();
  const [editMode, setEditMode] = useState(false);

  // Form state tracking local changes
  const [form, setForm] = useState({
    hostel: user?.hostel || "",
    department: user?.department || "",
    current_year: user?.current_year || "",
    interests: user?.interests || [],
    photo_url: user?.photo_url || ""
  });

  if (!user) return <Loader />;

  const toggleInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      // NOTE: For 2MB+ images, this may cause storage errors. 
      // Consider adding compression here in the future.
      setForm({ ...form, photo_url: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    try {
      const res = await api.put('/user/profile', form);
      // This call relies on setUser being exported in AuthContext.js
      setUser(res.data); 
      toast.success("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      console.error("Profile Save Error:", err);
      toast.error("Failed to update profile");
    }
  };

  const cancelEdit = () => {
    setForm({
      hostel: user.hostel,
      department: user.department,
      current_year: user.current_year,
      interests: user.interests,
      photo_url: user.photo_url
    });
    setEditMode(false);
  };

  return (
    <div className="container-fluid profile-page py-4">
      
      {/* 1. HERO IDENTITY SECTION */}
      <div className="profile-hero-card mb-4 p-4 p-md-5">
        <div className="d-flex flex-column flex-md-row align-items-center gap-4">
          <div className="position-relative">
            <div className="profile-avatar-large shadow-lg">
              {form.photo_url ? (
                <img src={form.photo_url} alt="profile" className="w-100 h-100 object-fit-cover rounded-inherit" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            {editMode && (
              <button className="avatar-edit-fab shadow" onClick={() => document.getElementById("photoInput").click()}>
                <Camera size={18} />
              </button>
            )}
            <input type="file" hidden id="photoInput" accept="image/*" onChange={handlePhotoChange} />
          </div>

          <div className="text-center text-md-start flex-grow-1">
            <h1 className="display-6 fw-bold text-white mb-1">{user.name}</h1>
            <p className="text-secondary fs-5 mb-2">{user.email}</p>
            <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2">
              <span className="entry-pill px-3 py-1">{user.entry_number}</span>
            </div>
          </div>

          <div className="mt-3 mt-md-0">
            {!editMode ? (
              <button className="btn btn-purple-outline d-flex align-items-center gap-2 px-4 py-2" onClick={() => setEditMode(true)}>
                <Edit3 size={18} /> Edit Profile
              </button>
            ) : (
              <div className="d-flex gap-2">
                <button className="btn btn-outline-danger d-flex align-items-center gap-2" onClick={cancelEdit}>
                  <X size={18} /> Discard
                </button>
                <button className="btn btn-purple d-flex align-items-center gap-2 px-4" onClick={saveProfile}>
                  <Save size={18} /> Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4">
        
        {/* 2. ACADEMIC DETAILS WITH DROPDOWNS */}
        <div className="col-lg-5">
          <div className="profile-glass-card h-100 p-4">
            <h5 className="section-title mb-4 d-flex align-items-center gap-2">
              <GraduationCap size={20} className="text-purple" /> Academic Info
            </h5>
            
            <div className="info-group mb-4">
              <label className="text-secondary small text-uppercase fw-bold mb-2">Department</label>
              {!editMode ? (
                <p className="text-white fs-5 border-start border-purple border-3 ps-3">{user.department || "Not set"}</p>
              ) : (
                <select 
                  className="form-select glass-input" 
                  value={form.department} 
                  onChange={e => setForm({ ...form, department: e.target.value })}
                >
                  <option value="" disabled>Select your department</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="info-group mb-4">
              <label className="text-secondary small text-uppercase fw-bold mb-2">Hostel</label>
              {!editMode ? (
                <p className="text-white fs-5 border-start border-purple border-3 ps-3">
                  <MapPin size={16} className="me-2 text-purple" />
                  {user.hostel || "Not set"}
                </p>
              ) : (
                <select 
                  className="form-select glass-input" 
                  value={form.hostel} 
                  onChange={e => setForm({ ...form, hostel: e.target.value })}
                >
                  <option value="" disabled>Select your hostel</option>
                  {HOSTELS.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="info-group">
              <label className="text-secondary small text-uppercase fw-bold mb-2">Current Year</label>
              {!editMode ? (
                <p className="text-white fs-5 border-start border-purple border-3 ps-3">
                  <Calendar size={16} className="me-2 text-purple" />
                  Year {user.current_year || "N/A"}
                </p>
              ) : (
                <select 
                  className="form-select glass-input" 
                  value={form.current_year} 
                  onChange={e => setForm({ ...form, current_year: e.target.value })}
                >
                  <option value="" disabled>Select year</option>
                  {YEARS.map(y => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* 3. INTERESTS SELECTION SECTION */}
        <div className="col-lg-7">
          <div className="profile-glass-card h-100 p-4">
            <h5 className="section-title mb-4 d-flex align-items-center gap-2">
              <Heart size={20} className="text-purple" /> Your Interests
            </h5>
            <p className="text-secondary small mb-3">
              {editMode ? "Select topics to customize your campus experience." : "These interests help customize your event feed."}
            </p>

            <div className="d-flex flex-wrap gap-2">
              {(editMode ? ALL_INTERESTS : user.interests).map(interest => {
                const isSelected = form.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    disabled={!editMode}
                    className={`interest-chip selectable ${isSelected ? "active" : ""} ${!editMode ? "view-only" : ""}`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {editMode && <span className="status-dot">{isSelected ? "●" : "○"}</span>}
                    {interest}
                  </button>
                );
              })}
              
              {!editMode && user.interests.length === 0 && (
                <div className="text-center w-100 py-4 opacity-50 italic">
                  No interests selected. Click edit to add some!
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