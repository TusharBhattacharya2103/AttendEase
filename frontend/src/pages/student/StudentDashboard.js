import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdArrowForward, MdWarning, MdCheckCircle, MdBeachAccess } from 'react-icons/md';
import CircularProgress from '../../components/shared/CircularProgress';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/student/dashboard')
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

  const stats = data?.overallStats || {};
  const hasLowAttendance = data?.classAttendance?.some(c => c.attendance.percentage < 75);

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">
          Welcome back, {data?.student?.firstName}! 👋
        </h1>
        <p className="page-subtitle">
          {data?.student?.rollCode} · {data?.student?.department} · Semester {data?.student?.semester}
        </p>
      </div>

      {/* Low attendance warning */}
      {hasLowAttendance && (
        <div style={{
          padding: '12px 18px', marginBottom: '20px',
          background: 'rgba(248,113,113,0.08)',
          border: '1px solid rgba(248,113,113,0.25)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: '10px',
          fontSize: '14px', color: '#f87171'
        }}>
          <MdWarning size={18} />
          <span>⚠️ Your attendance is below 75% in one or more classes. Take action to avoid academic penalties.</span>
        </div>
      )}

      {/* Overall stats */}
      <div className="stats-grid" style={{ marginBottom: '28px' }}>
        {[
          { label: 'Classes Present', value: stats.totalPresent || 0, color: '#4ade80', bg: 'rgba(74,222,128,0.1)', icon: MdCheckCircle },
          { label: 'Classes Absent', value: stats.totalAbsent || 0, color: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: MdWarning },
          { label: 'On Leave', value: stats.totalLeave || 0, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', icon: MdBeachAccess },
          { label: 'Pending Leaves', value: data?.pendingLeaves || 0, color: '#638cff', bg: 'rgba(99,140,255,0.1)', icon: MdArrowForward },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div className="stat-info">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall circular progress */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', marginBottom: '20px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '600' }}>
            Overall Attendance
          </div>
          <CircularProgress
            percentage={stats.overallPercentage || 0}
            size={150}
            strokeWidth={14}
          />
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <div style={{
              fontSize: '12px', color: 'var(--text-muted)',
              padding: '6px 14px',
              background: stats.overallPercentage >= 75 ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
              borderRadius: '100px',
              display: 'inline-block',
              color: stats.overallPercentage >= 75 ? '#4ade80' : '#f87171',
              fontWeight: '600',
              fontSize: '12px'
            }}>
              {stats.overallPercentage >= 75 ? '✓ Good Standing' : '⚠ Action Required'}
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
            {stats.totalPresent}/{stats.totalClasses} classes attended
          </div>
        </div>

        {/* Class-wise attendance */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Class-wise Attendance</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/student/attendance')}>
              View Details <MdArrowForward size={13} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {data?.classAttendance?.map(({ class: cls, attendance: att }) => (
              <div key={cls._id} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 14px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${att.percentage < 75 ? 'rgba(248,113,113,0.2)' : 'var(--border)'}`,
              }}>
                <CircularProgress
                  percentage={att.percentage}
                  size={56}
                  strokeWidth={6}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '13px' }}>{cls.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {cls.code} · {att.present}/{att.total} classes
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '12px' }}>
                  <div style={{ color: '#4ade80' }}>P: {att.present}</div>
                  <div style={{ color: '#f87171' }}>A: {att.absent}</div>
                  <div style={{ color: '#fbbf24' }}>L: {att.leave}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enrolled classes quick info */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">My Enrolled Classes</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
          {data?.student?.enrolledClasses?.map(cls => (
            <div key={cls._id} style={{
              padding: '12px 14px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                <span className="badge badge-blue" style={{ fontFamily: 'monospace', fontSize: '10px' }}>{cls.code}</span>
              </div>
              <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)' }}>{cls.name || cls.subject}</div>
              {cls.professor && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  👨‍🏫 {cls.professor.firstName} {cls.professor.lastName}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
