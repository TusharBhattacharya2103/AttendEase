import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdSchool } from 'react-icons/md';

const DEMO_CREDENTIALS = [
  { role: 'Admin', email: 'admin@college.edu', password: 'admin123', color: '#a78bfa' },
  { role: 'Professor', email: 'priya.sharma@college.edu', password: 'prof123', color: '#22d3ee' },
  { role: 'Student', email: 'arjun.s@student.edu', password: 'student123', color: '#4ade80' },
];

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data.success) {
        toast.success(`Welcome back, ${data.user.firstName}!`);
        navigate(`/${data.user.role}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (cred) => {
    setForm({ email: cred.email, password: cred.password });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'stretch',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorations */}
      <div style={{
        position: 'absolute',
        width: '600px', height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,140,255,0.08) 0%, transparent 70%)',
        top: '-200px', left: '-100px',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '400px', height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)',
        bottom: '-100px', right: '20%',
        pointerEvents: 'none'
      }} />

      {/* Left panel - Branding */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        background: 'linear-gradient(145deg, rgba(99,140,255,0.06) 0%, transparent 60%)',
        borderRight: '1px solid var(--border)'
      }}>
        <div style={{ maxWidth: '480px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '48px' }}>
            <div style={{
              width: '52px', height: '52px',
              background: 'var(--gradient-accent)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: '24px', fontWeight: '800', color: 'white',
              boxShadow: '0 8px 24px rgba(99,140,255,0.35)'
            }}>A</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>
                AttendEase
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>
                College Management Portal
              </div>
            </div>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '42px',
            fontWeight: '800',
            color: 'var(--text-primary)',
            lineHeight: 1.15,
            marginBottom: '16px',
            letterSpacing: '-1px'
          }}>
            Attendance<br />
            <span style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Reimagined.
            </span>
          </h1>

          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '40px' }}>
            A unified platform for admins, professors, and students — track attendance, manage classes, and stay connected.
          </p>

          {/* Feature pills */}
          {[
            { icon: '🎯', label: 'Real-time attendance tracking' },
            { icon: '📊', label: 'Visual analytics & reports' },
            { icon: '🔔', label: 'Absence alerts & notifications' },
            { icon: '📅', label: 'Leave management system' },
          ].map(f => (
            <div key={f.label} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              marginBottom: '14px'
            }}>
              <span style={{ fontSize: '18px' }}>{f.icon}</span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Login form */}
      <div style={{
        width: '480px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 48px',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: '700',
          marginBottom: '8px',
          color: 'var(--text-primary)'
        }}>Sign In</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Enter your credentials to access the portal
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <MdEmail size={17} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                placeholder="you@college.edu"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <MdLock size={17} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '40px', paddingRight: '44px' }}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
              >
                {showPassword ? <MdVisibilityOff size={17} /> : <MdVisibility size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', height: '46px', fontSize: '15px' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Demo Accounts</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {DEMO_CREDENTIALS.map(cred => (
              <button
                key={cred.role}
                onClick={() => fillDemo(cred)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--bg-card)',
                  border: `1px solid var(--border)`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  color: 'var(--text-secondary)',
                  fontSize: '13px'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = cred.color + '50'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '28px', height: '28px',
                    borderRadius: '8px',
                    background: `${cred.color}18`,
                    border: `1px solid ${cred.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '700', color: cred.color
                  }}>
                    {cred.role[0]}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '12px' }}>{cred.role}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cred.email}</div>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: cred.color, fontWeight: '600' }}>Use →</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
