import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MdPeople, MdSchedule, MdArrowForward } from 'react-icons/md';

export default function ProfessorClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/professor/classes')
      .then(r => setClasses(r.data.data))
      .catch(() => toast.error('Failed to load classes'))
      .finally(() => setLoading(false));
  }, []);

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
        <h1 className="page-title">My Classes</h1>
        <p className="page-subtitle">{classes.length} active classes</p>
      </div>

      {classes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <div className="empty-state-text">No classes assigned yet</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {classes.map(cls => (
            <div key={cls._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <span className="badge badge-blue" style={{ fontFamily: 'monospace' }}>{cls.code}</span>
                    <span className="badge badge-purple">Sem {cls.semester}</span>
                    <span className="badge" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
                      {cls.credits} credits
                    </span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {cls.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{cls.subject} · {cls.department}</p>
                </div>
              </div>

              <div className="section-divider" />

              {/* Stats row */}
              <div style={{ display: 'flex', gap: '20px', margin: '14px 0', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <MdPeople size={15} color="#638cff" />
                  <span>{cls.students?.length || 0} students enrolled</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <MdSchedule size={15} color="#22d3ee" />
                  <span>{cls.totalAttendanceDays || 0} sessions recorded</span>
                </div>
              </div>

              {/* Schedule chips */}
              {cls.schedule?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {cls.schedule.map((s, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '5px 10px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      fontSize: '11px', color: 'var(--text-secondary)'
                    }}>
                      <span style={{ color: 'var(--accent-blue)', fontWeight: '600' }}>{s.day.slice(0, 3)}</span>
                      <span>{s.startTime}–{s.endTime}</span>
                      <span style={{ color: 'var(--text-muted)' }}>|</span>
                      <span>{s.roomNumber}, {s.block}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate(`/professor/attendance/${cls._id}`)}
              >
                Mark Attendance <MdArrowForward size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
