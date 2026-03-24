import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminReports() {
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
        <p className="page-subtitle">Generate detailed attendance analytics</p>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="card-title" style={{ marginBottom: '16px' }}>Report Filters</h3>
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
            {loading ? 'Generating...' : '📊 Generate Report'}
          </button>
        </div>
      </div>

      {report && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">Report: {classes.find(c => c._id === classId)?.name}</span>
            <span className="badge badge-blue">{report.length} sessions</span>
          </div>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Leave</th>
                  <th>Total</th>
                  <th>Attendance Rate</th>
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
                        {format(new Date(a.date), 'dd MMM yyyy')}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                        {format(new Date(a.date), 'EEEE')}
                      </td>
                      <td><span className="badge badge-present">{present}</span></td>
                      <td><span className="badge badge-absent">{absent}</span></td>
                      <td><span className="badge badge-leave">{leave}</span></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{total}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="progress-bar" style={{ width: '80px' }}>
                            <div className="progress-fill" style={{
                              width: `${rate}%`,
                              background: rate >= 75 ? '#4ade80' : rate >= 50 ? '#fbbf24' : '#f87171'
                            }} />
                          </div>
                          <span style={{ fontWeight: '600', fontSize: '12px', color: rate >= 75 ? '#4ade80' : rate >= 50 ? '#fbbf24' : '#f87171' }}>
                            {rate}%
                          </span>
                        </div>
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

      {!report && !loading && (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">Select a class and click Generate Report to view data</div>
        </div>
      )}
    </div>
  );
}
