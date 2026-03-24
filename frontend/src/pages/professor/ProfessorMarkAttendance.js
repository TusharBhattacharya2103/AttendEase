import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import CircularProgress from '../../components/shared/CircularProgress';
import { MdArrowBack, MdSave, MdEdit, MdWarning, MdCheckCircle, MdCancel, MdHourglassEmpty, MdCalendarToday } from 'react-icons/md';

export default function ProfessorMarkAttendance() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [cls, setCls] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [editMode, setEditMode] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editStudentId, setEditStudentId] = useState('');
  const [editStatus, setEditStatus] = useState('present');
  const [editReason, setEditReason] = useState('');
  const [existingRecord, setExistingRecord] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    axios.get(`/professor/classes/${classId}/students`)
      .then(r => {
        setCls(r.data.data.class);
        const studs = r.data.data.students;
        setStudents(studs);
        // Initialize all as present
        const init = {};
        studs.forEach(s => { init[s._id] = 'present'; });
        setAttendance(init);
      })
      .catch(() => toast.error('Failed to load class data'))
      .finally(() => setLoading(false));
  }, [classId]);

  // Check if attendance already marked for selected date
  useEffect(() => {
    if (!classId) return;
    axios.get(`/professor/attendance/${classId}`, { params: { date: selectedDate } })
      .then(r => {
        if (r.data.data.length > 0) {
          const existing = r.data.data[0];
          setExistingRecord(existing);
          const map = {};
          existing.records.forEach(rec => {
            map[rec.student?._id || rec.student] = rec.status;
          });
          setAttendance(map);
        } else {
          setExistingRecord(null);
          const init = {};
          students.forEach(s => { init[s._id] = 'present'; });
          setAttendance(init);
        }
      })
      .catch(console.error);
  }, [selectedDate, classId, students]);

  const markAll = (status) => {
    const updated = {};
    students.forEach(s => { updated[s._id] = status; });
    setAttendance(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    const records = students.map(s => ({
      student: s._id,
      status: attendance[s._id] || 'absent'
    }));
    try {
      await axios.post('/professor/attendance/mark', {
        classId,
        date: selectedDate,
        records,
        sessionInfo: cls?.schedule?.[0] || {}
      });
      toast.success('Attendance saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editStudentId || !editDate) { toast.error('Please fill all fields'); return; }
    try {
      await axios.put('/professor/attendance/edit', {
        classId,
        date: editDate,
        studentId: editStudentId,
        newStatus: editStatus,
        reason: editReason
      });
      toast.success('Attendance updated');
      setEditMode(false);
      // Refresh
      const r = await axios.get(`/professor/attendance/${classId}`, { params: { date: selectedDate } });
      if (r.data.data.length > 0) {
        const map = {};
        r.data.data[0].records.forEach(rec => {
          map[rec.student?._id || rec.student] = rec.status;
        });
        setAttendance(map);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;
  const leaveCount = Object.values(attendance).filter(s => s === 'leave').length;
  const total = students.length;
  const pct = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  const filteredStudents = students.filter(s => {
    if (filter === 'all') return true;
    return attendance[s._id] === filter;
  });

  if (loading) return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <div className="spinner" />
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button className="btn btn-ghost btn-icon" onClick={() => navigate('/professor')}><MdArrowBack /></button>
        <div>
          <h1 className="page-title">{cls?.name}</h1>
          <p className="page-subtitle">{cls?.code} · {cls?.subject} · {total} students</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MdCalendarToday size={16} color="var(--text-muted)" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
          <button className="btn btn-secondary" onClick={() => setEditMode(true)}>
            <MdEdit size={15} /> Edit Past
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <MdSave size={15} /> {saving ? 'Saving...' : existingRecord ? 'Update' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {existingRecord && (
        <div style={{
          padding: '10px 16px', marginBottom: '20px',
          background: 'rgba(99,140,255,0.08)',
          border: '1px solid rgba(99,140,255,0.2)',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px', color: '#638cff',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <MdCheckCircle size={15} />
          Attendance already recorded for {format(new Date(selectedDate), 'dd MMM yyyy')}. You can update it.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
        {/* Left: Student list */}
        <div>
          {/* Quick actions */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Mark all:</span>
            <button className="btn btn-sm" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }} onClick={() => markAll('present')}>
              ✓ All Present
            </button>
            <button className="btn btn-sm" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }} onClick={() => markAll('absent')}>
              ✗ All Absent
            </button>
            <div style={{ marginLeft: 'auto' }}>
              <div className="tab-nav">
                {[
                  { key: 'all', label: `All (${total})` },
                  { key: 'present', label: `P (${presentCount})` },
                  { key: 'absent', label: `A (${absentCount})` },
                  { key: 'leave', label: `L (${leaveCount})` },
                ].map(f => (
                  <button key={f.key} className={`tab-btn ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Student cards */}
          <div className="card" style={{ padding: 0 }}>
            <div className="table-container" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Roll Code</th>
                    <th>Attendance %</th>
                    <th style={{ textAlign: 'center' }}>Mark Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => {
                    const isAtRisk = student.attendance?.isAtRisk;
                    const consecutiveAbsent = student.attendance?.consecutiveAbsent || 0;
                    const status = attendance[student._id] || 'absent';
                    const pct = student.attendance?.percentage || 0;

                    return (
                      <tr key={student._id} className={isAtRisk ? 'at-risk' : ''}>
                        <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{idx + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="avatar" style={{
                              background: isAtRisk ? 'rgba(248,113,113,0.15)' : 'rgba(99,140,255,0.1)',
                              color: isAtRisk ? '#f87171' : '#638cff',
                              fontSize: '11px'
                            }}>
                              {student.firstName?.[0]}{student.lastName?.[0]}
                            </div>
                            <div>
                              <div className={`student-name`} style={{
                                fontWeight: '600',
                                fontSize: '13px',
                                color: isAtRisk ? 'var(--accent-red)' : 'var(--text-primary)',
                                display: 'flex', alignItems: 'center', gap: '6px'
                              }}>
                                {student.firstName} {student.lastName}
                                {isAtRisk && (
                                  <span title={`${consecutiveAbsent} consecutive absences`}>
                                    <MdWarning size={14} color="#f87171" />
                                  </span>
                                )}
                              </div>
                              {isAtRisk && (
                                <div style={{ fontSize: '11px', color: '#f87171' }}>
                                  ⚠️ {consecutiveAbsent} consecutive absences
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <code style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                            {student.rollCode || '—'}
                          </code>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="progress-bar" style={{ width: '60px' }}>
                              <div className="progress-fill" style={{
                                width: `${pct}%`,
                                background: pct >= 75 ? '#4ade80' : pct >= 50 ? '#fbbf24' : '#f87171'
                              }} />
                            </div>
                            <span style={{
                              fontSize: '12px', fontWeight: '600',
                              color: pct >= 75 ? '#4ade80' : pct >= 50 ? '#fbbf24' : '#f87171'
                            }}>{pct}%</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button
                              className={`att-btn ${status === 'present' ? 'active-present' : ''}`}
                              onClick={() => setAttendance(a => ({ ...a, [student._id]: 'present' }))}
                              title="Present"
                            >P</button>
                            <button
                              className={`att-btn ${status === 'absent' ? 'active-absent' : ''}`}
                              onClick={() => setAttendance(a => ({ ...a, [student._id]: 'absent' }))}
                              title="Absent"
                            >A</button>
                            <button
                              className={`att-btn ${status === 'leave' ? 'active-leave' : ''}`}
                              onClick={() => setAttendance(a => ({ ...a, [student._id]: 'leave' }))}
                              title="Leave"
                            >L</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div style={{ position: 'sticky', top: '80px' }}>
          <div className="card" style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
              {format(new Date(selectedDate), 'EEEE, dd MMMM yyyy')}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <CircularProgress percentage={pct} size={130} strokeWidth={12} label="Present" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '4px' }}>
              {[
                { label: 'Present', count: presentCount, color: '#4ade80' },
                { label: 'Absent', count: absentCount, color: '#f87171' },
                { label: 'Leave', count: leaveCount, color: '#fbbf24' },
              ].map(item => (
                <div key={item.label} style={{
                  padding: '10px 6px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', color: item.color }}>{item.count}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Class schedule info */}
          {cls?.schedule?.length > 0 && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: '12px' }}>Schedule</div>
              {cls.schedule.map((s, i) => (
                <div key={i} className="schedule-slot" style={{ marginBottom: '8px', fontSize: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{s.day}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{s.startTime} – {s.endTime}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>{s.roomNumber}</div>
                    <div style={{ color: 'var(--text-muted)' }}>Block {s.block}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Past Attendance Modal */}
      {editMode && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditMode(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Edit Past Attendance</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setEditMode(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Select Date *</label>
                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} max={format(new Date(), 'yyyy-MM-dd')} />
              </div>
              <div className="form-group">
                <label className="form-label">Select Student *</label>
                <select className="form-select" value={editStudentId} onChange={e => setEditStudentId(e.target.value)}>
                  <option value="">-- Select Student --</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.rollCode})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">New Status *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['present', 'absent', 'leave'].map(st => (
                    <button
                      key={st}
                      type="button"
                      className={`att-btn ${editStatus === st ? `active-${st}` : ''}`}
                      style={{ flex: 1, height: '40px', borderRadius: '8px', textTransform: 'capitalize', fontSize: '13px' }}
                      onClick={() => setEditStatus(st)}
                    >
                      {st[0].toUpperCase()}. {st}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Reason for Change</label>
                <input className="form-input" value={editReason} onChange={e => setEditReason(e.target.value)} placeholder="e.g. Data entry correction" />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleEdit}>Update Attendance</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
