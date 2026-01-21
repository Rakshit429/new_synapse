import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, ShieldAlert, Trash2, UserCheck } from 'lucide-react';
import Loader from '../components/UI/Loader';
import ConfirmationModal from '../components/UI/ConfirmationModal';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Authorization State
  const [selectedUser, setSelectedUser] = useState(null);
  const [authForm, setAuthForm] = useState({ org_name: '', role_name: 'club_head', org_type: 'Club' });
  
  // Revoke State
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [roleToRevoke, setRoleToRevoke] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const results = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      toast.error("Failed to fetch users. Are you an admin?");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorize = async (e) => {
    e.preventDefault();
    if (!selectedUser) return toast.error("Select a user first");

    try {
      // Structure matches backend schema schemas/user.py AuthRoleSchema
      const payload = {
        org_name: authForm.org_name,
        role_name: authForm.role_name,
        org_type: authForm.org_type
      };

      // Backend endpoint: /admin/authorize?email=...
      await api.post(`/admin/authorize?email=${selectedUser.email}`, payload);
      
      toast.success(`Authorized ${selectedUser.name} for ${authForm.org_name}`);
      setAuthForm({ org_name: '', role_name: 'club_head', org_type: 'Club' });
      fetchUsers(); // Refresh list to show new roles
    } catch (err) {
      toast.error(err.response?.data?.detail || "Authorization failed");
    }
  };

  const confirmRevoke = (user, roleId) => {
    setRoleToRevoke(roleId); // Assuming role object has ID
    setRevokeModalOpen(true);
  };

  const handleRevoke = async () => {
    if (!roleToRevoke) return;
    try {
      // Backend needs DELETE /admin/authorize/{id}
      await api.delete(`/admin/authorize/${roleToRevoke}`);
      toast.success("Role revoked successfully");
      setRevokeModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to revoke role");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container-fluid">
      <h2 className="text-white fw-bold mb-4">Admin Control Panel</h2>

      <div className="row g-4">
        {/* Left Col: Authorization Form */}
        <div className="col-md-4">
          <div className="glass-card p-4 sticky-top" style={{ top: '90px' }}>
            <h5 className="text-white mb-3 d-flex align-items-center gap-2">
              <ShieldAlert className="text-accent" /> Grant Access
            </h5>
            
            <form onSubmit={handleAuthorize}>
              <div className="mb-3">
                <label className="text-secondary small">Selected User</label>
                <input 
                  type="text" 
                  className="form-control bg-dark text-white border-secondary" 
                  value={selectedUser ? `${selectedUser.name} (${selectedUser.email})` : "Click a user from the list ->"} 
                  disabled 
                />
              </div>

              <div className="mb-3">
                <label className="text-secondary small">Organization Type</label>
                <select 
                  className="form-select bg-dark text-white border-secondary"
                  value={authForm.org_type}
                  onChange={e => setAuthForm({...authForm, org_type: e.target.value})}
                >
                  <option value="Club">Club</option>
                  <option value="Fest">Fest</option>
                  <option value="Department">Department</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="text-secondary small">Organization Name</label>
                <input 
                  type="text" 
                  className="form-control bg-dark text-white border-secondary" 
                  placeholder="e.g. DevClub, Rendezvous"
                  value={authForm.org_name}
                  onChange={e => setAuthForm({...authForm, org_name: e.target.value})}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="text-secondary small">Role</label>
                <select 
                  className="form-select bg-dark text-white border-secondary"
                  value={authForm.role_name}
                  onChange={e => setAuthForm({...authForm, role_name: e.target.value})}
                >
                  <option value="club_head">Head / Secretary</option>
                  <option value="coordinator">Coordinator (Backend access)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-purple w-100" disabled={!selectedUser}>
                Authorize User
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: User List */}
        <div className="col-md-8">
          <div className="glass-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white m-0">All Users</h5>
              <div className="position-relative" style={{ width: '300px' }}>
                <Search className="position-absolute text-muted" size={18} style={{ top: '10px', left: '10px' }} />
                <input 
                  type="text" 
                  className="form-control bg-dark text-white border-secondary ps-5" 
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive" style={{ maxHeight: '70vh' }}>
              <table className="table table-dark table-hover align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Active Roles</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr 
                      key={user.id} 
                      className={selectedUser?.id === user.id ? "table-active" : ""}
                      onClick={() => setSelectedUser(user)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {user.authorizations && user.authorizations.length > 0 ? (
                            user.authorizations.map(auth => (
                              <span key={auth.id} className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 d-flex align-items-center gap-1">
                                {auth.org_name} ({auth.role_name})
                                <Trash2 
                                  size={12} 
                                  className="text-danger cursor-pointer ms-1" 
                                  onClick={(e) => { e.stopPropagation(); confirmRevoke(user, auth.id); }}
                                />
                              </span>
                            ))
                          ) : (
                            <span className="text-muted small">Student</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedUser(user)}>
                          <UserCheck size={16} /> Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={revokeModalOpen} 
        onClose={() => setRevokeModalOpen(false)} 
        onConfirm={handleRevoke}
        title="Revoke Access"
        message="Are you sure you want to remove this role? The user will lose access to the organization dashboard immediately."
      />
    </div>
  );
};

export default AdminDashboard;