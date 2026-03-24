import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { MdCheckCircle, MdCancel } from 'react-icons/md';

export default function ProfessorLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    axios.get('/professor/leaves')
      .then(r => setLeaves(r.data.data))
      .catch(() => toast.error('Failed to load leave requests'))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (id, status) => {
    try {
      await axios.put(`/professor/leaves/${id}`, { status });
      setLeaves(prev => prev.map(l => l._id === id ? { ...l, status } : l));
      toast.success(`Leave ${status}`);
    } catch { toast.error('Action failed'); }
  };

  const filtered = filter === 'all' ? leaves : leaves.filter(l => l.status === filter);
  const pendingCount = leaves.filter(l => l.status === 'pending').length;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Leave Requests</h1>
        <p className="page-subtitle">
          {pendingCount > 0 ? (
            <span style={{ color: '#fbbf24' }}>⚠️ {pendingCount} pending request{pendingCount > 1 ? 's' : ''}</span>
          ) : 'All leave requests for your classes'}
        </p>
      </div>

      <div className="tab-nav" style={{ maxWidth: '360px', marginBottom: '20px' }}>
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && pendingCount > 0 && (
              <span style={{
                marginLeft: '6px', background: '#fbbf24', color: '#0a0a0a',
                borderRadius: '100px', fontSize: '10px', padding: '1px 6px', fontWeight: '700'
              }}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-text">No {filter === 'all' ? '' : filter} leave requests</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(leave => (
            <div key={leave._id} className="card" style={{ padding: '18px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '14px' }}>
                      {leave.student?.firstName} {leave.student?.lastName}
                    </div>
                    <code style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                      {leave.student?.rollCode}
                    </code>
                    <span className="badge badge-blue">{leave.class?.code}</span>
                    <span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>{leave.type}</span>
                    <span className={`badge badge-${leave.status}`}>{leave.status}</span>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {leave.reason}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span>
                      📅 {leave.startDate && format(new Date(leave.startDate), 'dd MMM yyyy')} — {leave.endDate && format(new Date(leave.endDate), 'dd MMM yyyy')}
                    </span>
                    <span>
                      🕐 Applied: {format(new Date(leave.createdAt), 'dd MMM yyyy')}
                    </span>
                  </div>
                </div>
                {leave.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button className="btn btn-success btn-sm" onClick={() => handleAction(leave._id, 'approved')}>
                      <MdCheckCircle size={14} /> Approve
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleAction(leave._id, 'rejected')}>
                      <MdCancel size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
