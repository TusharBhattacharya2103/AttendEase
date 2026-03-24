import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { MdClass, MdPeople, MdCheckCircle, MdSchedule, MdArrowForward } from 'react-icons/md';

export default function ProfessorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/professor/dashboard')
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <div className="spinner" />
      </div>
    </div>
  );

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Good {getGreeting()}, Professor!</h1>
        <p className="page-subtitle">
          {format(new Date(), 'EEEE, MMMM d yyyy')} — {data?.todayClasses?.length || 0} classes today
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '28px' }}>
        {[
          { label: 'My Classes', value: data?.totalClasses || 0, icon: MdClass, color: '#638cff', bg: 'rgba(99,140,255,0.1)' },
          { label: 'Total Students', value: data?.totalStudents || 0, icon: MdPeople, color: '#22d3ee', bg: 'rgba(34,211,238,0.1)' },
          { label: "Today's Classes", value: data?.todayClasses?.length || 0, icon: MdSchedule, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
          {
            label: 'Attendance Pending',
            value: data?.todayClasses?.filter(c => !c.attendanceMarked).length || 0,
            icon: MdCheckCircle, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'
          },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <s.icon size={24} color={s.color} />
            </div>
            <div className="stat-info">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Classes */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <span className="card-title">Today's Classes — {today}</span>
        </div>
        {data?.todayClasses?.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
            <div className="empty-state-icon">🎉</div>
            <div className="empty-state-text">No classes scheduled for today</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data?.todayClasses?.map(cls => (
              <div key={cls._id} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  width: '48px', height: '48px', flexShrink: 0,
                  background: cls.attendanceMarked ? 'rgba(74,222,128,0.1)' : 'rgba(99,140,255,0.1)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: '700',
                  color: cls.attendanceMarked ? '#4ade80' : '#638cff'
                }}>
                  {cls.code?.slice(-3)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>{cls.name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '4px' }}>
                    {cls.todaySchedule?.map((s, i) => (
                      <span key={i} style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        🕐 {s.startTime}–{s.endTime} &nbsp;|&nbsp; 📍 {s.roomNumber}, Block {s.block}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="chip"><MdPeople size={12} /> {cls.students?.length || 0}</span>
                  {cls.attendanceMarked ? (
                    <span className="badge badge-approved"><MdCheckCircle size={12} /> Marked</span>
                  ) : (
                    <span className="badge badge-pending">Pending</span>
                  )}
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/professor/attendance/${cls._id}`)}
                  >
                    {cls.attendanceMarked ? 'View' : 'Mark'} <MdArrowForward size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All classes quick view */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">All My Classes</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/professor/classes')}>
            View All <MdArrowForward size={13} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
          {data?.classes?.map(cls => (
            <div
              key={cls._id}
              onClick={() => navigate(`/professor/attendance/${cls._id}`)}
              style={{
                padding: '14px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="badge badge-blue" style={{ fontFamily: 'monospace', fontSize: '11px' }}>{cls.code}</span>
                <span className="chip" style={{ fontSize: '11px' }}>{cls.students?.length || 0} students</span>
              </div>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '13px' }}>{cls.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{cls.subject}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
