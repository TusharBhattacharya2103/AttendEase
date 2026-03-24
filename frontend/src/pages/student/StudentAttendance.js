import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import CircularProgress from '../../components/shared/CircularProgress';

export function StudentAttendance() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    axios.get('/student/dashboard').then(r => {
      setClasses(r.data.data.classAttendance || []);
      if (r.data.data.classAttendance?.length > 0) {
        const first = r.data.data.classAttendance[0];
        setSelected(first);
        fetchDetails(first.class._id);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const fetchDetails = (classId) => {
    setDetailLoading(true);
    axios.get(`/student/attendance/${classId}`)
      .then(r => setDetails(r.data.data))
      .catch(console.error)
      .finally(() => setDetailLoading(false));
  };

  const selectClass = (item) => {
    setSelected(item);
    fetchDetails(item.class._id);
  };

  if (loading) return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <div className="spinner" />
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">My Attendance</h1>
        <p className="page-subtitle">Detailed attendance for all enrolled classes</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px' }}>
        {/* Class list sidebar */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {classes.map(item => {
              const pct = item.attendance.percentage;
              const isSelected = selected?.class._id === item.class._id;
              return (
                <div
                  key={item.class._id}
                  onClick={() => selectClass(item)}
                  style={{
                    padding: '14px',
                    background: isSelected ? 'var(--bg-elevated)' : 'var(--bg-card)',
                    border: `1px solid ${isSelected ? 'var(--border-bright)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    display: 'flex', alignItems: 'center', gap: '12px'
                  }}
                  onMouseEnter={e => !isSelected && (e.currentTarget.style.borderColor = 'var(--border-bright)')}
                  onMouseLeave={e => !isSelected && (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <CircularProgress percentage={pct} size={50} strokeWidth={5} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.class.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.class.code}</div>
                  </div>
                  {pct < 75 && <span style={{ fontSize: '16px' }}>⚠️</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div>
          {selected && (
            <>
              <div className="card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                  <CircularProgress percentage={selected.attendance.percentage} size={110} strokeWidth={11} />
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {selected.class.name}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>{selected.class.code} · {selected.class.subject}</p>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {[
                        { label: 'Present', count: selected.attendance.present, color: '#4ade80' },
                        { label: 'Absent', count: selected.attendance.absent, color: '#f87171' },
                        { label: 'Leave', count: selected.attendance.leave, color: '#fbbf24' },
                        { label: 'Total', count: selected.attendance.total, color: '#638cff' },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700', color: s.color }}>{s.count}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {selected.attendance.isAtRisk && (
                    <div style={{
                      padding: '12px 16px',
                      background: 'rgba(248,113,113,0.08)',
                      border: '1px solid rgba(248,113,113,0.25)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px', color: '#f87171',
                      maxWidth: '240px'
                    }}>
                      ⚠️ {selected.attendance.consecutiveAbsent} consecutive absences. Your attendance is below the minimum requirement.
                    </div>
                  )}
                </div>
              </div>

              {/* Record table */}
              <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
                  <span className="card-title">Attendance History</span>
                </div>
                {detailLoading ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                  </div>
                ) : (
                  <div className="table-container" style={{ border: 'none' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Day</th>
                          <th>Status</th>
                          <th>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details?.records?.map((rec, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                              {format(new Date(rec.date), 'dd MMM yyyy')}
                            </td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                              {format(new Date(rec.date), 'EEEE')}
                            </td>
                            <td>
                              <span className={`badge badge-${rec.status}`}>{rec.status}</span>
                            </td>
                            <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {rec.remarks || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function StudentSchedule() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/student/schedule')
      .then(r => setClasses(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const getClassesForDay = (day) => {
    const result = [];
    classes.forEach(cls => {
      cls.schedule?.filter(s => s.day === day).forEach(slot => {
        result.push({ ...cls, slot });
      });
    });
    return result.sort((a, b) => a.slot.startTime.localeCompare(b.slot.startTime));
  };

  if (loading) return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <div className="spinner" />
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Class Schedule</h1>
        <p className="page-subtitle">Your weekly timetable</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {days.map(day => {
          const dayClasses = getClassesForDay(day);
          const isToday = day === today;
          return (
            <div key={day} style={{
              background: isToday ? 'rgba(99,140,255,0.04)' : 'var(--bg-card)',
              border: `1px solid ${isToday ? 'rgba(99,140,255,0.25)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '12px 20px',
                background: isToday ? 'rgba(99,140,255,0.08)' : 'var(--bg-secondary)',
                display: 'flex', alignItems: 'center', gap: '10px',
                borderBottom: '1px solid var(--border)'
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px', fontWeight: '700',
                  color: isToday ? '#638cff' : 'var(--text-primary)'
                }}>{day}</span>
                {isToday && <span className="badge badge-blue" style={{ fontSize: '10px' }}>Today</span>}
                <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
                </span>
              </div>
              {dayClasses.length === 0 ? (
                <div style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  No classes scheduled
                </div>
              ) : (
                <div style={{ padding: '12px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {dayClasses.map((cls, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 14px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      minWidth: '260px', flex: '1'
                    }}>
                      <div style={{
                        padding: '8px 10px',
                        background: 'rgba(99,140,255,0.1)',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'center', minWidth: '60px'
                      }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#638cff' }}>{cls.slot.startTime}</div>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', margin: '1px 0' }}>to</div>
                        <div style={{ fontSize: '11px', color: '#638cff' }}>{cls.slot.endTime}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)' }}>{cls.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span>📍 {cls.slot.roomNumber}, Block {cls.slot.block}</span>
                          <span>🏫 {cls.slot.campus}</span>
                        </div>
                        {cls.professor && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            👨‍🏫 {cls.professor.firstName} {cls.professor.lastName}
                          </div>
                        )}
                      </div>
                      <span className="badge badge-blue" style={{ fontFamily: 'monospace', fontSize: '10px' }}>{cls.code}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StudentLeave() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ classId: '', startDate: '', endDate: '', reason: '', type: 'medical' });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('apply');

  useEffect(() => {
    Promise.all([
      axios.get('/student/schedule'),
      axios.get('/student/leave/history')
    ]).then(([c, l]) => {
      setClasses(c.data.data);
      setLeaves(l.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.classId || !form.startDate || !form.endDate || !form.reason) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const res = await axios.post('/student/leave/request', form);
      toast.success('Leave request submitted!');
      setLeaves(prev => [res.data.data, ...prev]);
      setForm({ classId: '', startDate: '', endDate: '', reason: '', type: 'medical' });
      setTab('history');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Leave Management</h1>
        <p className="page-subtitle">Apply for leave and track your requests</p>
      </div>

      <div className="tab-nav" style={{ maxWidth: '280px', marginBottom: '20px' }}>
        <button className={`tab-btn ${tab === 'apply' ? 'active' : ''}`} onClick={() => setTab('apply')}>Apply for Leave</button>
        <button className={`tab-btn ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
          History {leaves.filter(l => l.status === 'pending').length > 0 && (
            <span style={{ marginLeft: '4px', background: '#fbbf24', color: '#0a0a0a', borderRadius: '100px', fontSize: '10px', padding: '1px 5px', fontWeight: '700' }}>
              {leaves.filter(l => l.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {tab === 'apply' ? (
        <div className="card" style={{ maxWidth: '560px' }}>
          <h3 className="card-title" style={{ marginBottom: '20px' }}>New Leave Request</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Class *</label>
              <select className="form-select" value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })} required>
                <option value="">-- Select Class --</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
              </select>
            </div>
            <div className="two-col" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Date *</label>
                <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required min={form.startDate} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Leave Type</label>
              <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {['medical', 'personal', 'family', 'academic', 'other'].map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Reason *</label>
              <textarea className="form-textarea" rows={3} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Describe the reason for your leave..." required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
              {saving ? 'Submitting...' : '📤 Submit Leave Request'}
            </button>
          </form>
        </div>
      ) : (
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="spinner" />
            </div>
          ) : leaves.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-text">No leave requests yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {leaves.map(leave => (
                <div key={leave._id} className="card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span className="badge badge-blue">{leave.class?.code}</span>
                        <span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>{leave.type}</span>
                        <span className={`badge badge-${leave.status}`}>{leave.status}</span>
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{leave.reason}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                        {leave.startDate && format(new Date(leave.startDate), 'dd MMM yyyy')} — {leave.endDate && format(new Date(leave.endDate), 'dd MMM yyyy')}
                        · Applied {format(new Date(leave.createdAt), 'dd MMM yyyy')}
                      </div>
                      {leave.reviewNote && (
                        <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)', padding: '6px 10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                          Review note: {leave.reviewNote}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentAttendance;
