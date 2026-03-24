import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdPerson, MdSchool, MdAdminPanelSettings, MdClose } from 'react-icons/md';

const ROLE_OPTIONS = ['student', 'professor', 'admin'];

const emptyForm = {
  firstName: '', lastName: '', email: '', password: '',
  role: 'student', mobile: '', address: '',
  rollCode: '', parentMobile: '', department: '', semester: '', batch: '',
  professorCode: '', qualification: '', specialization: ''
};

const roleColors = { admin: '#a78bfa', professor: '#22d3ee', student: '#4ade80' };
const roleIcons = { admin: MdAdminPanelSettings, professor: MdSchool, student: MdPerson };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    axios.get('/admin/users', { params })
      .then(r => setUsers(r.data.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openAdd = () => { setEditUser(null); setForm(emptyForm); setModal(true); };
  const openEdit = (user) => {
    setEditUser(user);
    setForm({ ...emptyForm, ...user, password: '' });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editUser) {
        await axios.put(`/admin/users/${editUser._id}`, form);
        toast.success('User updated');
      } else {
        await axios.post('/admin/users', form);
        toast.success('User created');
      }
      setModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await axios.delete(`/admin/users/${id}`);
      toast.success('User deactivated');
      fetchUsers();
    } catch {
      toast.error('Failed to deactivate');
    }
  };

  const initials = (u) => `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage students, professors, and admins</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <MdAdd size={18} /> Add User
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: '1', minWidth: '220px' }}>
          <MdSearch className="search-icon" />
          <input
            className="form-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Search by name, email, roll code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="tab-nav" style={{ minWidth: '320px' }}>
          <button className={`tab-btn ${roleFilter === '' ? 'active' : ''}`} onClick={() => setRoleFilter('')}>All</button>
          <button className={`tab-btn ${roleFilter === 'student' ? 'active' : ''}`} onClick={() => setRoleFilter('student')}>Students</button>
          <button className={`tab-btn ${roleFilter === 'professor' ? 'active' : ''}`} onClick={() => setRoleFilter('professor')}>Professors</button>
          <button className={`tab-btn ${roleFilter === 'admin' ? 'active' : ''}`} onClick={() => setRoleFilter('admin')}>Admins</button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Code</th>
                <th>Department</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-icon">👤</div>
                    <div className="empty-state-text">No users found</div>
                  </div>
                </td></tr>
              ) : users.map(u => {
                const RIcon = roleIcons[u.role];
                const rc = roleColors[u.role];
                return (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar" style={{ background: `${rc}18`, color: rc }}>
                          {initials(u)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '13px' }}>
                            {u.firstName} {u.lastName}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: `${rc}18`, color: rc, border: `1px solid ${rc}30` }}>
                        <RIcon size={10} /> {u.role}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {u.rollCode || u.professorCode || '—'}
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{u.department || '—'}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{u.mobile || '—'}</td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-icon btn-secondary" onClick={() => openEdit(u)} title="Edit">
                          <MdEdit size={15} />
                        </button>
                        <button className="btn btn-icon" onClick={() => handleDelete(u._id)} title="Deactivate"
                          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>
                          <MdDelete size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editUser ? 'Edit User' : 'Add New User'}</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setModal(false)}><MdClose /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="two-col" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input className="form-input" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input className="form-input" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              {!editUser && (
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Password *</label>
                  <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editUser} minLength={6} />
                </div>
              )}
              <div className="two-col" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile</label>
                  <input className="form-input" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
                </div>
              </div>

              {form.role === 'student' && (
                <>
                  <div className="two-col" style={{ marginBottom: '14px' }}>
                    <div className="form-group">
                      <label className="form-label">Roll Code</label>
                      <input className="form-input" value={form.rollCode} onChange={e => setForm({ ...form, rollCode: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Parent Mobile</label>
                      <input className="form-input" value={form.parentMobile} onChange={e => setForm({ ...form, parentMobile: e.target.value })} />
                    </div>
                  </div>
                  <div className="two-col" style={{ marginBottom: '14px' }}>
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <input className="form-input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Semester</label>
                      <input className="form-input" type="number" min={1} max={8} value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label className="form-label">Batch (e.g. 2022-2026)</label>
                    <input className="form-input" value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} />
                  </div>
                </>
              )}

              {form.role === 'professor' && (
                <>
                  <div className="two-col" style={{ marginBottom: '14px' }}>
                    <div className="form-group">
                      <label className="form-label">Professor Code</label>
                      <input className="form-input" value={form.professorCode} onChange={e => setForm({ ...form, professorCode: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <input className="form-input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                    </div>
                  </div>
                  <div className="two-col" style={{ marginBottom: '14px' }}>
                    <div className="form-group">
                      <label className="form-label">Qualification</label>
                      <input className="form-input" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Specialization</label>
                      <input className="form-input" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} />
                    </div>
                  </div>
                </>
              )}

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Address</label>
                <textarea className="form-textarea" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2} />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
