import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { Calendar, Users, BarChart3, Plus, Download, Eye, Lock, Globe, Trash2, UserPlus, X } from 'lucide-react';
import DynamicFormBuilder from '../components/Forms/DynamicFormBuilder';
import DemographicsChart from '../components/Charts/DemographicsChart';
import Loader from '../components/UI/Loader';
import toast from 'react-hot-toast';

// Import Constants
import { DEPARTMENTS, HOSTELS, YEARS } from '../utils/constants';

// --- HELPER COMPONENT: MultiSelect ---
const MultiSelect = ({ label, options, selected, onChange, placeholder }) => {
  const handleSelect = (e) => {
    const value = e.target.value;
    if (value && !selected.includes(value)) {
      onChange([...selected, value]);
    }
    // Reset select to default
    e.target.value = ""; 
  };

  const removeOption = (valueToRemove) => {
    onChange(selected.filter(item => item !== valueToRemove));
  };

  return (
    <div className="mb-3">
      <label className="text-secondary small mb-2">{label}</label>
      <select 
        className="form-select bg-dark text-white border-secondary mb-2" 
        onChange={handleSelect}
        defaultValue=""
      >
        <option value="" disabled>{placeholder || "Select to add..."}</option>
        {options.map(opt => (
          <option key={opt} value={opt} disabled={selected.includes(opt)}>
            {opt}
          </option>
        ))}
      </select>
      
      {/* Selected Chips */}
      <div className="d-flex flex-wrap gap-2">
        {selected.length > 0 ? (
          selected.map(item => (
            <span key={item} className="badge bg-purple bg-opacity-25 text-white border border-secondary d-flex align-items-center gap-2 px-3 py-2">
              {item}
              <X 
                size={14} 
                className="cursor-pointer text-secondary hover-text-white" 
                onClick={() => removeOption(item)}
              />
            </span>
          ))
        ) : (
          <small className="text-muted fst-italic">Open to everyone</small>
        )}
      </div>
    </div>
  );
};

const OrgDashboard = () => {
  const { orgId } = useParams();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Event State
  const [newEvent, setNewEvent] = useState({ 
    name: '', date: '', venue: '', description: '', tags: '', isPrivate: false 
  });
  // 🔥 Targeting Arrays
  const [targetDepts, setTargetDepts] = useState([]);
  const [targetHostels, setTargetHostels] = useState([]);
  const [targetYears, setTargetYears] = useState([]);

  const [formSchema, setFormSchema] = useState([]);
  const [imageFile, setImageFile] = useState(null);

  // Add Member State
  const [newMember, setNewMember] = useState({ email: '', role: 'Coordinator' });

  useEffect(() => {
    fetchData();
  }, [orgId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, eventsRes, teamRes] = await Promise.all([
        api.get(`/org/${orgId}/dashboard`),
        api.get(`/org/${orgId}/events`),
        api.get(`/org/${orgId}/team`)
      ]);
      setStats(dashRes.data);
      setEvents(eventsRes.data);
      setTeam(teamRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    // Standard fields
    formData.append('name', newEvent.name);
    formData.append('date', newEvent.date);
    formData.append('venue', newEvent.venue);
    formData.append('description', newEvent.description);
    formData.append('tags', JSON.stringify(newEvent.tags.split(',').map(t => t.trim()).filter(Boolean)));
    formData.append('custom_form_schema', JSON.stringify(formSchema));
    formData.append('is_private', newEvent.isPrivate);
    if (imageFile) formData.append('photo', imageFile);
    
    // 🔥 Construct Target Audience JSON from Arrays
    const audience = {
      depts: targetDepts,
      hostels: targetHostels,
      years: targetYears.map(y => parseInt(y)) // Ensure years are ints
    };
    formData.append('target_audience', JSON.stringify(audience));

    try {
      await api.post(`/org/${orgId}/events`, formData);
      toast.success("Event Created Successfully!");
      
      // Reset Form
      setNewEvent({ name: '', date: '', venue: '', description: '', tags: '', isPrivate: false });
      setTargetDepts([]); setTargetHostels([]); setTargetYears([]);
      setFormSchema([]);
      setActiveTab('events');
      fetchData();
    } catch (err) {
      toast.error("Failed to create event");
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/org/${orgId}/team`, newMember);
      toast.success(`${newMember.role} added successfully`);
      setNewMember({ email: '', role: 'Coordinator' });
      fetchData(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add member");
    }
  };

  const handleRemoveMember = async (userId) => {
    if(!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await api.delete(`/org/${orgId}/team/${userId}`);
      toast.success("Member removed");
      fetchData();
    } catch (err) {
      toast.error("Failed to remove member");
    }
  };

  if (loading) return <Loader />;
  {console.log(stats);}
  // Permission Check for Team Management
  const isOverallCoordinator = stats?.your_role === "club_head";

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-white fw-bold">{stats?.org_name} Dashboard</h2>
          <p className="text-secondary mb-0">
            Role: <span className="badge bg-purple">{stats?.your_role}</span>
          </p>
        </div>
        <div className="btn-group">
          <button className={`btn ${activeTab === 'dashboard' ? 'btn-purple' : 'btn-outline-secondary'}`} onClick={() => setActiveTab('dashboard')}>
            <BarChart3 size={18} className="me-2"/> Overview
          </button>
          <button className={`btn ${activeTab === 'events' ? 'btn-purple' : 'btn-outline-secondary'}`} onClick={() => setActiveTab('events')}>
            <Eye size={18} className="me-2"/> Events
          </button>
          <button className={`btn ${activeTab === 'team' ? 'btn-purple' : 'btn-outline-secondary'}`} onClick={() => setActiveTab('team')}>
            <Users size={18} className="me-2"/> Team
          </button>
          <button className={`btn ${activeTab === 'create' ? 'btn-purple' : 'btn-outline-secondary'}`} onClick={() => setActiveTab('create')}>
            <Plus size={18} className="me-2"/> Create
          </button>
        </div>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'dashboard' && (
        <div className="row g-4">
          <div className="col-md-6">
            <div className="glass-card p-4 d-flex align-items-center justify-content-between">
              <div>
                <h3 className="text-white fw-bold mb-0">{stats?.total_events}</h3>
                <p className="text-secondary mb-0">Total Events</p>
              </div>
              <div className="bg-primary bg-opacity-25 p-3 rounded-circle text-primary"><Calendar size={32}/></div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="glass-card p-4 d-flex align-items-center justify-content-between">
              <div>
                <h3 className="text-white fw-bold mb-0">{stats?.total_registrations}</h3>
                <p className="text-secondary mb-0">Total Registrations</p>
              </div>
              <div className="bg-success bg-opacity-25 p-3 rounded-circle text-success"><Users size={32}/></div>
            </div>
          </div>
          <div className="col-12 mt-4">
            <h5 className="text-white mb-3">Quick Analytics</h5>
            <div className="row g-4">
              <div className="col-md-6" style={{ height: '300px' }}>
                <DemographicsChart type="doughnut" title="Audience by Dept" data={stats?.dept_analytics || {}} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. EVENTS TAB */}
      {activeTab === 'events' && (
        <div className="glass-card p-4">
          <h5 className="text-white mb-4">Your Events</h5>
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Date</th>
                  <th>Visibility</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.id}>
                    <td>{ev.name}</td>
                    <td>{new Date(ev.date).toLocaleDateString()}</td>
                    <td>{ev.is_private ? <span className="badge bg-secondary"><Lock size={12}/> Private</span> : <span className="badge bg-success"><Globe size={12}/> Public</span>}</td>
                    <td>
                      {/* You can add a CSV download call here */}
                      <button className="btn btn-sm btn-outline-success">
                         <Download size={14} /> CSV
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. TEAM TAB (NEW) */}
      {activeTab === 'team' && (
        <div className="row g-4">
          {/* Add Member Form (Only for Overall Coordinator) */}
          {isOverallCoordinator && (
            <div className="col-md-4">
              <div className="glass-card p-4 h-100">
                <h5 className="text-white mb-3"><UserPlus size={18}/> Add Member</h5>
                <form onSubmit={handleAddMember}>
                  <div className="mb-3">
                    <label className="small text-secondary">IITD Email</label>
                    <input 
                      type="email" 
                      className="form-control bg-dark text-white border-secondary"
                      placeholder="e.g. cs1230001@iitd.ac.in"
                      value={newMember.email}
                      onChange={e => setNewMember({...newMember, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="small text-secondary">Role</label>
                    <select 
                      className="form-select bg-dark text-white border-secondary"
                      value={newMember.role}
                      onChange={e => setNewMember({...newMember, role: e.target.value})}
                    >
                      <option value="Coordinator">Coordinator</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-purple w-100">Add to Team</button>
                </form>
              </div>
            </div>
          )}

          {/* Team List */}
          <div className={isOverallCoordinator ? "col-md-8" : "col-12"}>
            <div className="glass-card p-4">
              <h5 className="text-white mb-4">Team Members</h5>
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      {isOverallCoordinator && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {team.map(member => (
                      <tr key={member.user_id}>
                        <td>{member.name}</td>
                        <td>{member.email}</td>
                        <td>
                          <span className={`badge ${member.role === 'Overall Coordinator' ? 'bg-danger' : member.role === 'Coordinator' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                            {member.role}
                          </span>
                        </td>
                        {isOverallCoordinator && (
                          <td>
                            {member.role !== 'Overall Coordinator' && (
                              <button 
                                className="btn btn-sm btn-outline-danger" 
                                onClick={() => handleRemoveMember(member.user_id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CREATE EVENT TAB (Updated with Multi-Select) */}
      {activeTab === 'create' && (
        <div className="glass-card p-4 rounded-4 mx-auto" style={{ maxWidth: '800px' }}>
          <h4 className="text-white fw-bold mb-4">Create New Event</h4>
          <form onSubmit={handleCreateEvent}>
            <div className="row g-3">
              <div className="col-12">
                <label className="text-secondary small">Event Name</label>
                <input type="text" className="form-control bg-dark text-white border-secondary" required 
                  value={newEvent.name} onChange={e => setNewEvent({...newEvent, name: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="text-secondary small">Date & Time</label>
                <input type="datetime-local" className="form-control bg-dark text-white border-secondary" required 
                  value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="text-secondary small">Venue</label>
                <input type="text" className="form-control bg-dark text-white border-secondary" required 
                  value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})} />
              </div>
              <div className="col-12">
                <label className="text-secondary small">Description</label>
                <textarea className="form-control bg-dark text-white border-secondary" rows="3" required 
                  value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
              </div>
              
              {/* 🔥 UPDATED TARGETING SECTION 🔥 */}
              <div className="col-12 border-top border-secondary pt-3 mt-3">
                <h6 className="text-white mb-3">Audience Targeting</h6>
              </div>

              <div className="col-md-6">
                <MultiSelect 
                  label="Target Departments"
                  options={DEPARTMENTS}
                  selected={targetDepts}
                  onChange={setTargetDepts}
                  placeholder="Select departments..."
                />
              </div>

              <div className="col-md-6">
                <MultiSelect 
                  label="Target Hostels"
                  options={HOSTELS}
                  selected={targetHostels}
                  onChange={setTargetHostels}
                  placeholder="Select hostels..."
                />
              </div>

              <div className="col-md-6">
                <MultiSelect 
                  label="Target Years"
                  options={YEARS.map(String)} // Convert numbers to string for select
                  selected={targetYears}
                  onChange={setTargetYears}
                  placeholder="Select years..."
                />
              </div>

              <div className="col-md-6 d-flex align-items-center">
                <div className="form-check form-switch mt-3">
                  <input className="form-check-input" type="checkbox" id="privateSwitch" 
                    checked={newEvent.isPrivate} onChange={e => setNewEvent({...newEvent, isPrivate: e.target.checked})} />
                  <label className="form-check-label text-white" htmlFor="privateSwitch">Member-Only (Hidden from feed)</label>
                </div>
              </div>

              {/* MEDIA */}
              <div className="col-12 border-top border-secondary pt-3 mt-3">
                <h6 className="text-white mb-3">Media & Metadata</h6>
              </div>

              <div className="col-md-6">
                <label className="text-secondary small">Poster Image</label>
                <input type="file" className="form-control bg-dark text-white border-secondary" accept="image/*"
                  onChange={e => setImageFile(e.target.files[0])} />
              </div>
              <div className="col-md-6">
                <label className="text-secondary small">Tags (comma separated)</label>
                <input type="text" className="form-control bg-dark text-white border-secondary" placeholder="Tech, Fun"
                  value={newEvent.tags} onChange={e => setNewEvent({...newEvent, tags: e.target.value})} />
              </div>
            </div>

            <DynamicFormBuilder schema={formSchema} setSchema={setFormSchema} />

            <button type="submit" className="btn btn-purple w-100 mt-4 py-2 fw-bold">Publish Event</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default OrgDashboard;