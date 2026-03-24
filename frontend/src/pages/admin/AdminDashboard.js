import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { MdPeople, MdClass, MdBeachAccess, MdCheckCircle, MdTrendingUp, MdSchool } from 'react-icons/md';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/admin/dashboard').then(r => {
      setData(r.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <div className="spinner" />
      </div>
    </div>
  );

  const todayTotal = (data?.today.present || 0) + (data?.today.absent || 0) + (data?.today.leave || 0);

  const barData = {
    labels: ['Present', 'Absent', 'On Leave'],
    datasets: [{
      label: "Today's Attendance",
      data: [data?.today.present || 0, data?.today.absent || 0, data?.today.leave || 0],
      backgroundColor: ['rgba(74,222,128,0.7)', 'rgba(248,113,113,0.7)', 'rgba(251,191,36,0.7)'],
      borderColor: ['#4ade80', '#f87171', '#fbbf24'],
      borderWidth: 1.5,
      borderRadius: 8,
    }]
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e2540',
        borderColor: 'rgba(99,140,255,0.2)',
        borderWidth: 1,
        titleColor: '#e8ecf5',
        bodyColor: '#8b95b3',
        padding: 10,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8b95b3', font: { size: 12 } },
        border: { display: false }
      },
      y: {
        grid: { color: 'rgba(99,140,255,0.06)', drawBorder: false },
        ticks: { color: '#8b95b3', font: { size: 11 } },
        border: { display: false }
      }
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Overview of the entire institution</p>
      </div>

      {/* Stat cards */}
      <div className="stats-grid" style={{ marginBottom: '28px' }}>
        {[
          {
            label: 'Total Students', value: data?.stats.totalStudents || 0,
            icon: MdPeople, color: '#638cff', bg: 'rgba(99,140,255,0.1)'
          },
          {
            label: 'Total Professors', value: data?.stats.totalProfessors || 0,
            icon: MdSchool, color: '#22d3ee', bg: 'rgba(34,211,238,0.1)'
          },
          {
            label: 'Active Classes', value: data?.stats.totalClasses || 0,
            icon: MdClass, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)'
          },
          {
            label: 'Pending Leaves', value: data?.stats.pendingLeaves || 0,
            icon: MdBeachAccess, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'
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

      <div className="two-col">
        {/* Today's attendance bar chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Today's Attendance</span>
            <span className="badge badge-blue">{todayTotal} records</span>
          </div>
          <Bar data={barData} options={barOptions} height={200} />
        </div>

        {/* Today's summary */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Today's Summary</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {format(new Date(), 'dd MMM yyyy')}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            {[
              { label: 'Present', count: data?.today.present || 0, color: '#4ade80', pct: todayTotal > 0 ? Math.round((data?.today.present / todayTotal) * 100) : 0 },
              { label: 'Absent', count: data?.today.absent || 0, color: '#f87171', pct: todayTotal > 0 ? Math.round((data?.today.absent / todayTotal) * 100) : 0 },
              { label: 'On Leave', count: data?.today.leave || 0, color: '#fbbf24', pct: todayTotal > 0 ? Math.round((data?.today.leave / todayTotal) * 100) : 0 },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                    {item.label}
                  </span>
                  <span style={{ fontWeight: '600', color: item.color }}>{item.count} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({item.pct}%)</span></span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Overall Attendance Rate</span>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700',
              color: todayTotal > 0 && (data?.today.present / todayTotal) >= 0.75 ? '#4ade80' : '#fbbf24'
            }}>
              {todayTotal > 0 ? Math.round((data?.today.present / todayTotal) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <span className="card-title">Recent Attendance Records</span>
          <span className="badge badge-blue">Latest 5</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Class</th>
                <th>Code</th>
                <th>Marked By</th>
                <th>Date</th>
                <th>Students</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentActivity?.length > 0 ? data.recentActivity.map(a => (
                <tr key={a._id}>
                  <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{a.class?.name || '—'}</td>
                  <td><span className="badge badge-blue">{a.class?.code || '—'}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{a.markedBy ? `${a.markedBy.firstName} ${a.markedBy.lastName}` : '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    {format(new Date(a.date), 'dd MMM yyyy')}
                  </td>
                  <td>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '14px', fontWeight: '600',
                      color: 'var(--accent-blue)'
                    }}>{a.records?.length || 0}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📋</div>
                      <div className="empty-state-text">No recent records</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
