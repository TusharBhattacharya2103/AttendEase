import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdPeople, MdSchedule, MdClose, MdPersonAdd, MdPersonRemove, MdSearch } from 'react-icons/md';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const emptyForm = {
  name: '', code: '', subject: '', department: '',
  semester: 1, credits: 3, professor: '', description: '',
  academicYear: '2024-2025', schedule: []
};

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Class create/edit modal
  const [modal, setModal] = useState(false);
  const [editClass, setEditClass] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Enrollment modal
  const [enrollModal, setEnrollModal] = useState(false);
  const [enrollClass, setEnrollClass] = useState(null);
  const [enrolled, setEnrolled] = useState([]);
  const [available, setAvailable] = useState([]);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [searchEnrolled, setSearchEnrolled] = useState('');
  const [searchAvailable, setSearchAvailable] = useState('');

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      axios.get('/admin/classes'),
      axios.get('/admin/users', { params: { role: 'professor' } }),
    ]).then(([c, p]) => {
      setClasses(c.data.data);
      setProfessors(p.data.data);
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Class modal ──────────────────────────────────────────
  const openAdd = () => { setEditClass(null); setForm(emptyForm); setModal(true); };
  const openEdit = (cls) => {
    setEditClass(cls);
    setForm({ ...emptyForm, ...cls, professor: cls.professor?._id || '' });
    setModal(true);
  };

  const addScheduleSlot = () => setForm(f => ({
    ...f,
    schedule: [...f.schedule, { day: 'Monday', startTime: '09:00', endTime: '10:00', roomNumber: '', block: '', campus: 'Main Campus' }]
  }));

  const updateSlot = (idx, field, value) =>
    setForm(f => ({ ...f, schedule: f.schedule.map((s, i) => i === idx ? { ...s, [field]: value } : s) }));

  const removeSlot = (idx) =>
    setForm(f => ({ ...f, schedule: f.schedule.filter((_, i) => i !== idx) }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editClass) {
        await axios.put(`/admin/classes/${editClass._id}`, form);
        toast.success('Class updated');
      } else {
        await axios.post('/admin/classes', form);
        toast.success('Class created');
      }
      setModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Enrollment modal ─────────────────────────────────────
  const openEnroll = async (cls) => {
    setEnrollClass(cls);
    setSelectedToAdd([]);
    setSearchEnrolled('');
    setSearchAvailable('');
    setEnrollLoading(true);
    setEnrollModal(true);
    try {
      const r = await axios.get(`/admin/classes/${cls._id}/students`);
      setEnrolled(r.data.data.enrolled);
      setAvailable(r.data.data.available);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setEnrollLoading(false);
    }
  };

  const refreshEnrollment = async () => {
    const r = await axios.get(`/admin/classes/${enrollClass._id}/students`);
    setEnrolled(r.data.data.enrolled);
    setAvailable(r.data.data.available);
    fetchData();
  };

  const toggleSelect = (id) =>
    setSelectedToAdd(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleEnroll = async () => {
    if (selectedToAdd.length === 0) { toast.error('Select at least one student'); return; }
    try {
      await axios.post(`/admin/classes/${enrollClass._id}/enroll`, { studentIds: selectedToAdd });
      toast.success(`${selectedToAdd.length} student(s) enrolled`);
      setSelectedToAdd([]);
      await refreshEnrollment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const handleUnenroll = async (studentId, studentName) => {
    if (!window.confirm(`Remove ${studentName} from this class?`)) return;
    try {
      await axios.delete(`/admin/classes/${enrollClass._id}/enroll/${studentId}`);
      toast.success(`${studentName} removed`);
      await refreshEnrollment();
    } catch {
      toast.error('Failed to remove student');
    }
  };

  const filteredEnrolled = enrolled.filter(s =>
    `${s.firstName} ${s.lastName} ${s.rollCode}`.toLowerCase().includes(searchEnrolled.toLowerCase())
  );
  const filteredAvailable = available.filter(s =>
    `${s.firstName} ${s.lastName} ${s.rollCode}`.toLowerCase().includes(searchAvailable.toLowerCase())
  );

  const initials = (s) => `${s.firstName?.[0] || ''}${s.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px' }}>
        <div>
          <h1 className="page-title">Class Management</h1>
          <p className="page-subtitle">Create classes, assign professors, and manage student enrollments</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><MdAdd size={18} /> Add Class</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" />
        </div>
      ) : classes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <div className="empty-state-text">No classes yet. Click "Add Class" to create one.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {classes.map(cls => (
            <div key={cls._id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-blue" style={{ fontFamily: 'monospace' }}>{cls.code}</span>
                    <span className="badge badge-purple">Sem {cls.semester}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '6px' }}>
                    {cls.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{cls.subject}</p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-icon btn-secondary" onClick={() => openEdit(cls)} title="Edit">
                    <MdEdit size={14} />
                  </button>
                  <button
                    className="btn btn-icon"
                    title="Deactivate"
                    onClick={() => {
                      if (window.confirm('Deactivate this class?')) {
                        axios.delete(`/admin/classes/${cls._id}`)
                          .then(() => { toast.success('Deactivated'); fetchData(); });
                      }
                    }}
                    style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}
                  >
                    <MdDelete size={14} />
                  </button>
                </div>
              </div>

              <div className="section-divider" style={{ margin: '12px 0' }} />

              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <MdPeople size={14} color="#638cff" />
                  <span>{cls.students?.length || 0} students</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <MdSchedule size={14} color="#22d3ee" />
                  <span>{cls.schedule?.length || 0} sessions/week</span>
                </div>
              </div>

              {cls.professor && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 12px', background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)', fontSize: '12px', marginBottom: '10px'
                }}>
                  <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '9px', background: 'rgba(34,211,238,0.15)', color: '#22d3ee' }}>
                    {`${cls.professor.firstName?.[0]}${cls.professor.lastName?.[0]}`}
                  </div>
                  <span style={{ color: 'var(--text-secondary)' }}>{cls.professor.firstName} {cls.professor.lastName}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>{cls.professor.professorCode}</span>
                </div>
              )}

              {cls.schedule?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                  {cls.schedule.map((s, i) => (
                    <span key={i} className="chip" style={{ fontSize: '11px' }}>
                      {s.day.slice(0, 3)} · {s.startTime} · {s.roomNumber}
                    </span>
                  ))}
                </div>
              )}

              <button
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', borderColor: 'rgba(99,140,255,0.25)', color: '#638cff' }}
                onClick={() => openEnroll(cls)}
              >
                <MdPeople size={15} /> Manage Enrollment ({cls.students?.length || 0})
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ═══ CLASS CREATE / EDIT MODAL ═══ */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editClass ? 'Edit Class' : 'Create New Class'}</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setModal(false)}><MdClose /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="two-col" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Class Name *</label>
                  <input className="form-input" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required placeholder="e.g. Data Structures" />
                </div>
                <div className="form-group">
                  <label className="form-label">Class Code *</label>
                  <input className="form-input" value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    required placeholder="e.g. CS301" />
                </div>
              </div>
              <div className="two-col" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input className="form-input" value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-input" value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })} />
                </div>
              </div>
              <div className="two-col" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <select className="form-select" value={form.semester}
                    onChange={e => setForm({ ...form, semester: +e.target.value })}>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Credits</label>
                  <input className="form-input" type="number" min={1} max={6} value={form.credits}
                    onChange={e => setForm({ ...form, credits: +e.target.value })} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Assign Professor</label>
                <select className="form-select" value={form.professor}
                  onChange={e => setForm({ ...form, professor: e.target.value })}>
                  <option value="">-- Select Professor --</option>
                  {professors.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.firstName} {p.lastName} ({p.professorCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Schedule builder */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <label className="form-label">Schedule</label>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addScheduleSlot}>
                    + Add Slot
                  </button>
                </div>
                {form.schedule.length === 0 && (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    No slots yet — click "Add Slot"
                  </div>
                )}
                {form.schedule.map((slot, i) => (
                  <div key={i} style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 90px 90px 90px 90px 36px',
                    gap: '8px', marginBottom: '8px', alignItems: 'end'
                  }}>
                    <div className="form-group">
                      {i === 0 && <label className="form-label">Day</label>}
                      <select className="form-select" value={slot.day}
                        onChange={e => updateSlot(i, 'day', e.target.value)}>
                        {DAYS.map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      {i === 0 && <label className="form-label">Start</label>}
                      <input type="time" className="form-input" value={slot.startTime}
                        onChange={e => updateSlot(i, 'startTime', e.target.value)} />
                    </div>
                    <div className="form-group">
                      {i === 0 && <label className="form-label">End</label>}
                      <input type="time" className="form-input" value={slot.endTime}
                        onChange={e => updateSlot(i, 'endTime', e.target.value)} />
                    </div>
                    <div className="form-group">
                      {i === 0 && <label className="form-label">Room</label>}
                      <input className="form-input" placeholder="LH-101" value={slot.roomNumber}
                        onChange={e => updateSlot(i, 'roomNumber', e.target.value)} />
                    </div>
                    <div className="form-group">
                      {i === 0 && <label className="form-label">Block</label>}
                      <input className="form-input" placeholder="A" value={slot.block}
                        onChange={e => updateSlot(i, 'block', e.target.value)} />
                    </div>
                    <button type="button" className="btn btn-icon" onClick={() => removeSlot(i)}
                      style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', alignSelf: 'flex-end' }}>
                      <MdClose size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editClass ? 'Update Class' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ ENROLLMENT MODAL ═══ */}
      {enrollModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEnrollModal(false)}>
          <div className="modal" style={{ maxWidth: '820px', width: '95vw' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Manage Enrollment</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '3px' }}>
                  {enrollClass?.name} &nbsp;·&nbsp;
                  <span className="badge badge-blue" style={{ fontFamily: 'monospace', fontSize: '11px', verticalAlign: 'middle' }}>
                    {enrollClass?.code}
                  </span>
                </p>
              </div>
              <button className="btn btn-icon btn-ghost" onClick={() => setEnrollModal(false)}><MdClose /></button>
            </div>

            {enrollLoading ? (
              <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
                <div className="spinner" />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                {/* LEFT — Currently Enrolled */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Currently Enrolled</label>
                    <span style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', padding: '1px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: '700' }}>
                      {enrolled.length}
                    </span>
                  </div>
                  <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <MdSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '15px' }} />
                    <input className="form-input" style={{ paddingLeft: '34px' }}
                      placeholder="Search enrolled..."
                      value={searchEnrolled}
                      onChange={e => setSearchEnrolled(e.target.value)} />
                  </div>
                  <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {filteredEnrolled.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        {enrolled.length === 0 ? 'No students enrolled yet' : 'No results'}
                      </div>
                    ) : filteredEnrolled.map(s => (
                      <div key={s._id} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 12px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)'
                      }}>
                        <div className="avatar" style={{ width: '30px', height: '30px', fontSize: '10px', background: 'rgba(74,222,128,0.12)', color: '#4ade80', flexShrink: 0 }}>
                          {initials(s)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {s.firstName} {s.lastName}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {s.rollCode || s.email}
                          </div>
                        </div>
                        <button
                          className="btn btn-icon"
                          onClick={() => handleUnenroll(s._id, `${s.firstName} ${s.lastName}`)}
                          title="Remove from class"
                          style={{ width: '28px', height: '28px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', flexShrink: 0 }}
                        >
                          <MdPersonRemove size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT — Add Students */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label className="form-label" style={{ margin: 0 }}>Add Students</label>
                      <span style={{ background: 'rgba(99,140,255,0.15)', color: '#638cff', padding: '1px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: '700' }}>
                        {available.length}
                      </span>
                    </div>
                    {selectedToAdd.length > 0 && (
                      <button className="btn btn-primary btn-sm" onClick={handleEnroll}>
                        <MdPersonAdd size={13} /> Enroll {selectedToAdd.length}
                      </button>
                    )}
                  </div>
                  <div style={{ position: 'relative', marginBottom: '8px' }}>
                    <MdSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '15px' }} />
                    <input className="form-input" style={{ paddingLeft: '34px' }}
                      placeholder="Search available students..."
                      value={searchAvailable}
                      onChange={e => setSearchAvailable(e.target.value)} />
                  </div>

                  {filteredAvailable.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: '11px' }}
                        onClick={() => setSelectedToAdd(filteredAvailable.map(s => s._id))}>
                        Select All
                      </button>
                      {selectedToAdd.length > 0 && (
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: '11px' }}
                          onClick={() => setSelectedToAdd([])}>
                          Deselect All
                        </button>
                      )}
                    </div>
                  )}

                  <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {filteredAvailable.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        {available.length === 0 ? 'All students already enrolled' : 'No results'}
                      </div>
                    ) : filteredAvailable.map(s => {
                      const isSelected = selectedToAdd.includes(s._id);
                      return (
                        <div
                          key={s._id}
                          onClick={() => toggleSelect(s._id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '9px 12px',
                            background: isSelected ? 'rgba(99,140,255,0.08)' : 'var(--bg-secondary)',
                            border: `1px solid ${isSelected ? 'rgba(99,140,255,0.4)' : 'var(--border)'}`,
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            transition: 'var(--transition)',
                            userSelect: 'none'
                          }}
                        >
                          {/* Custom checkbox */}
                          <div style={{
                            width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                            border: `2px solid ${isSelected ? '#638cff' : 'var(--border-bright)'}`,
                            background: isSelected ? '#638cff' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'var(--transition)'
                          }}>
                            {isSelected && (
                              <span style={{ color: 'white', fontSize: '10px', fontWeight: '700', lineHeight: 1 }}>✓</span>
                            )}
                          </div>
                          <div className="avatar" style={{ width: '30px', height: '30px', fontSize: '10px', background: 'rgba(99,140,255,0.1)', color: '#638cff', flexShrink: 0 }}>
                            {initials(s)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {s.firstName} {s.lastName}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {s.rollCode || '—'} &nbsp;·&nbsp; Sem {s.semester || '?'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedToAdd.length > 0 && (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
                      onClick={handleEnroll}
                    >
                      <MdPersonAdd size={16} /> Enroll {selectedToAdd.length} Student{selectedToAdd.length > 1 ? 's' : ''}
                    </button>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}