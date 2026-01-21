import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, Users, BarChart3, Plus } from 'lucide-react';
import DynamicFormBuilder from '../components/Forms/DynamicFormBuilder';
import DemographicsChart from '../components/Charts/DemographicsChart';
import Loader from '../components/UI/Loader';
import toast from 'react-hot-toast';

const OrgDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Create Event State
  const [newEvent, setNewEvent] = useState({ name: '', date: '', venue: '', description: '', tags: '' });
  const [formSchema, setFormSchema] = useState([]);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/org/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    // Append standard fields
    Object.keys(newEvent).forEach(key => formData.append(key, newEvent[key]));
    // Append complex fields (JSON stringify required for arrays/objects in FormData)
    formData.append('custom_form_schema', JSON.stringify(formSchema));
    formData.append('tags', JSON.stringify(newEvent.tags.split(',')));
    if (imageFile) formData.append('photo', imageFile);

    try {
      await api.post('/org/events', formData); // Header multipart/form-data handled by browser automatically
      toast.success("Event Created Successfully!");
      setNewEvent({ name: '', date: '', venue: '', description: '', tags: '' });
      setFormSchema([]);
      setActiveTab('dashboard');
      fetchDashboard(); // Refresh stats
    } catch (err) {
      toast.error("Failed to create event");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-white fw-bold">{stats?.org_name} Dashboard</h2>
          <p className="text-secondary mb-0">Role: <span className="badge bg-purple">{stats?.your_role}</span></p>
        </div>
        <div className="btn-group">
          <button className={`btn ${activeTab === 'dashboard' ? 'btn-purple' : 'btn-outline-secondary'}`} onClick={() => setActiveTab('dashboard')}>
            <BarChart3 size={18} className="me-2"/> Overview
          </button>
          <button className={`btn ${activeTab === 'create' ? 'btn-purple' : 'btn-outline-secondary'}`} onClick={() => setActiveTab('create')}>
            <Plus size={18} className="me-2"/> Create Event
          </button>
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="row g-4">
          {/* Stats Cards */}
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

          {/* Charts Area (Placeholder logic for V1) */}
          <div className="col-12 mt-4">
            <h5 className="text-white mb-3">Quick Analytics</h5>
            <div className="row g-4">
              <div className="col-md-6" style={{ height: '300px' }}>
                {/* Mock data passed for demo - replace with real API data later */}
                <DemographicsChart type="bar" title="Recent Event Performance" data={{ "Orientation": 40, "Workshop": 25, "Hackathon": 60 }} />
              </div>
              <div className="col-md-6" style={{ height: '300px' }}>
                <DemographicsChart type="doughnut" title="Audience by Dept" data={{ "CSE": 50, "EE": 30, "ME": 20 }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE EVENT TAB */}
      {activeTab === 'create' && (
        <div className="glass-card p-4 rounded-4 mx-auto" style={{ maxWidth: '800px' }}>
          <h4 className="text-white fw-bold mb-4">Create New Event</h4>
          <form onSubmit={handleCreateEvent}>
            <div className="row g-3">
              <div className="col-md-12">
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

            {/* Dynamic Form Builder */}
            <DynamicFormBuilder schema={formSchema} setSchema={setFormSchema} />

            <button type="submit" className="btn btn-purple w-100 mt-4 py-2 fw-bold">Publish Event</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default OrgDashboard;