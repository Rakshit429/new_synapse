import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, ShieldAlert, Trash2, UserCheck, PlusCircle, X } from 'lucide-react';
import Loader from '../components/UI/Loader';
import ConfirmationModal from '../components/UI/ConfirmationModal';
import toast from 'react-hot-toast';

import { ORG_TYPES, HEAD_ROLES, ALL_ORGS } from '../utils/constants';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Authorization State
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [authForm, setAuthForm] = useState({ 
    org_type: 'club', 
    org_name: 'devclub', 
    role_name: 'overall coordinator' 
  });
  
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
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorize = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await api.post(`/admin/authorize?email=${selectedUser.email}`, authForm);
      toast.success(`Role assigned to ${selectedUser.name}`);
      setSelectedUser(null);
      fetchUsers(); 
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to authorize user");
    }
  };

  // ✅ NOW USED: Prepares the revocation
  const confirmRevoke = (user, authId) => {
    setRoleToRevoke({ user_id: user.id, auth_id: authId });
    setRevokeModalOpen(true);
  };

  // ✅ NOW USED: Handles the actual API call (Stubbed for now)
  const handleRevoke = async () => {
    try {
      // If you implement a revoke endpoint in backend/admin.py, call it here:
      // await api.delete(`/admin/revoke/${roleToRevoke.auth_id}`);
      toast.success("Role revoked (Simulation)"); 
      
      // Refresh UI
      fetchUsers();
      setRevokeModalOpen(false);
      setRoleToRevoke(null);
    } catch (err) {
      toast.error("Failed to revoke role");
    }
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    const availableOrgs = ALL_ORGS[newType] || [];
    setAuthForm({ 
      ...authForm, 
      org_type: newType, 
      org_name: availableOrgs[0] || ''
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="container-fluid">
      <h2 className="text-white fw-bold mb-4">Admin Control Center</h2>

      <div className="row g-4">
        {/* LEFT: USER LIST */}
        <div className="col-md-8">
          <div className="glass-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white m-0">All Users</h5>
              <div className="position-relative">
                <Search size={18} className="text-secondary position-absolute top-50 start-0 translate-middle-y ms-3" />
                <input 
                  type="text" 
                  className="form-control bg-dark text-white border-secondary ps-5 rounded-pill"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive custom-scrollbar" style={{ maxHeight: '600px' }}>
              <table className="table table-dark table-hover align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Current Roles</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className={selectedUser?.id === user.id ? "table-active" : ""}>
                      <td>
                        <div className="fw-bold">{user.name}</div>
                        <div className="small text-secondary">{user.entry_number}</div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {user.authorizations?.length > 0 ? (
                            user.authorizations.map(auth => (
                              <span key={auth.id} className="badge bg-warning text-dark bg-opacity-75 d-flex align-items-center gap-1">
                                {auth.org_name} 
                                <span className="opacity-75">({auth.role_name})</span>
                                
                                {/* ✅ FIXED: Trash Icon now used to trigger revoke */}
                                <button 
                                  className="btn btn-link p-0 text-dark ms-1" 
                                  onClick={(e) => { e.stopPropagation(); confirmRevoke(user, auth.id); }}
                                  title="Revoke Role"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </span>
                            ))
                          ) : (
                            <span className="text-muted small">Student</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-purple" onClick={() => setSelectedUser(user)}>
                          <UserCheck size={16} /> Assign Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT: AUTHORIZE FORM */}
        <div className="col-md-4">
          <div className="glass-card p-4 position-sticky" style={{ top: '20px' }}>
            <h5 className="text-white mb-3 d-flex align-items-center gap-2">
              <ShieldAlert size={20} className="text-purple" /> Grant Access
            </h5>
            
            {!selectedUser ? (
              <div className="text-center py-5 text-secondary border border-dashed rounded-3">
                <UserCheck size={40} className="mb-3 opacity-50" />
                <p>Select a user from the list to assign a leadership role.</p>
              </div>
            ) : (
              <form onSubmit={handleAuthorize}>
                <div className="alert alert-info d-flex align-items-center gap-3 mb-3">
                  <div className="bg-white text-primary rounded-circle fw-bold d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="fw-bold">{selectedUser.name}</div>
                    <div className="small">{selectedUser.email}</div>
                  </div>
                  <button type="button" className="btn-close ms-auto" onClick={() => setSelectedUser(null)}></button>
                </div>

                <div className="mb-3">
                  <label className="small text-secondary mb-1">Organization Type</label>
                  <select 
                    className="form-select bg-dark text-white border-secondary"
                    value={authForm.org_type}
                    onChange={handleTypeChange}
                  >
                    {ORG_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="small text-secondary mb-1">Organization Name</label>
                  <select 
                    className="form-select bg-dark text-white border-secondary"
                    value={authForm.org_name}
                    onChange={(e) => setAuthForm({ ...authForm, org_name: e.target.value })}
                  >
                    {(ALL_ORGS[authForm.org_type] || []).map(org => (
                      <option key={org} value={org}>
                        {org.charAt(0).toUpperCase() + org.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="small text-secondary mb-1">Role Title</label>
                  <select 
                    className="form-select bg-dark text-white border-secondary"
                    value={authForm.role_name}
                    onChange={(e) => setAuthForm({ ...authForm, role_name: e.target.value })}
                  >
                    {HEAD_ROLES.map(role => (
                      <option key={role} value={role}>
                         {role.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-purple w-100 fw-bold">
                  <PlusCircle size={18} className="me-2" /> Assign
                </button>
              </form>
            )}
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