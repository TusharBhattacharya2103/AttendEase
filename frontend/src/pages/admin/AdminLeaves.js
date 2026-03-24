import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { MdCheckCircle, MdCancel, MdHourglassEmpty } from 'react-icons/md';

export function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    axios.get('/admin/leaves').then(r => setLeaves(r.data.data))
      .catch(() => toast.error('Failed to load leaves'))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (id, status) => {
    try {
      await axios.put(`/admin/leaves/${id}`, { status, reviewNote: `${status} by admin` });
      setLeaves(prev => prev.map(l => l._id === id ? { ...l, status } : l));
      toast.success(`Leave request ${status}`);
    } catch { toast.error('Action failed'); }
  };

  const filtered = filter === 'all' ? leaves : leaves.filter(l => l.status === filter);

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Leave Requests</h1>
        <p className="page-subtitle">Review and manage student leave applications</p>
      </div>

      <div className="tab-nav" style={{ maxWidth: '400px', marginBottom: '20px' }}>
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Dates</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <div className="empty-state-text">No leave requests found</div>
                  </div>
                </td></tr>
              ) : filtered.map(leave => (
                <tr key={leave._id}>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '13px' }}>
                      {leave.student?.firstName} {leave.student?.lastName}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{leave.student?.rollCode}</div>
                  </td>
                  <td><span className="badge badge-blue">{leave.class?.code}</span></td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {leave.startDate && format(new Date(leave.startDate), 'dd MMM')} –{' '}
                    {leave.endDate && format(new Date(leave.endDate), 'dd MMM yyyy')}
                  </td>
                  <td>
                    <span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>{leave.type}</span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '180px' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leave.reason}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${leave.status}`}>{leave.status}</span>
                  </td>
                  <td>
                    {leave.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-sm btn-success" onClick={() => handleAction(leave._id, 'approved')}>
                          <MdCheckCircle size={13} /> Approve
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleAction(leave._id, 'rejected')}>
                          <MdCancel size={13} /> Reject
                        </button>
                      </div>
                    )}
                    {leave.status !== 'pending' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {leave.reviewedAt && format(new Date(leave.reviewedAt), 'dd MMM')}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminReports() {
  const [report, setReport] = useState(null);
  const [classId, setClassId] = useState('');
  const [classes, setClasses] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/admin/classes').then(r => setClasses(r.data.data));
  }, []);

  const generateReport = () => {
    if (!classId) { toast.error('Please select a class'); return; }
    setLoading(true);
    const params = { classId };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    axios.get('/admin/attendance/report', { params })
      .then(r => setReport(r.data.data))
      .catch(() => toast.error('Failed to generate report'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Attendance Reports</h1>
        <p className="page-subtitle">Generate detailed attendance reports</p>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
            <label className="form-label">Select Class *</label>
            <select className="form-select" value={classId} onChange={e => setClassId(e.target.value)}>
              <option value="">-- Choose Class --</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={generateReport} disabled={loading} style={{ height: '40px' }}>
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {report && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <span className="card-title">Report Results ({report.length} records)</span>
          </div>
          <div className="table-container" style={{ border: 'none', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Leave</th>
                  <th>Total</th>
                  <th>Rate</th>
                  <th>Marked By</th>
                </tr>
              </thead>
              <tbody>
                {report.map(a => {
                  const present = a.records.filter(r => r.status === 'present').length;
                  const absent = a.records.filter(r => r.status === 'absent').length;
                  const leave = a.records.filter(r => r.status === 'leave').length;
                  const total = a.records.length;
                  const rate = total > 0 ? Math.round((present / total) * 100) : 0;
                  return (
                    <tr key={a._id}>
                      <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                        {format(new Date(a.date), 'EEE, dd MMM yyyy')}
                      </td>
                      <td><span className="badge badge-present">{present}</span></td>
                      <td><span className="badge badge-absent">{absent}</span></td>
                      <td><span className="badge badge-leave">{leave}</span></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{total}</td>
                      <td>
                        <span style={{ fontWeight: '600', color: rate >= 75 ? '#4ade80' : rate >= 50 ? '#fbbf24' : '#f87171' }}>
                          {rate}%
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {a.markedBy?.firstName} {a.markedBy?.lastName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLeaves;
