import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MdDashboard, MdPeople, MdClass, MdAssignment, MdBarChart,
  MdLogout, MdMenu, MdClose, MdCalendarToday, MdBeachAccess,
  MdCheckCircle, MdAdminPanelSettings, MdPerson, MdNotifications
} from 'react-icons/md';

const navByRole = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: MdDashboard, exact: true },
    { to: '/admin/users', label: 'Users', icon: MdPeople },
    { to: '/admin/classes', label: 'Classes', icon: MdClass },
    { to: '/admin/leaves', label: 'Leave Requests', icon: MdBeachAccess },
    { to: '/admin/reports', label: 'Reports', icon: MdBarChart },
  ],
  professor: [
    { to: '/professor', label: 'Dashboard', icon: MdDashboard, exact: true },
    { to: '/professor/classes', label: 'My Classes', icon: MdClass },
    { to: '/professor/leaves', label: 'Leave Requests', icon: MdBeachAccess },
  ],
  student: [
    { to: '/student', label: 'Dashboard', icon: MdDashboard, exact: true },
    { to: '/student/attendance', label: 'My Attendance', icon: MdCheckCircle },
    { to: '/student/schedule', label: 'Class Schedule', icon: MdCalendarToday },
    { to: '/student/leave', label: 'Leave Request', icon: MdBeachAccess },
  ],
};

const roleColors = {
  admin: '#a78bfa',
  professor: '#22d3ee',
  student: '#4ade80',
};

const roleIcons = {
  admin: MdAdminPanelSettings,
  professor: MdAssignment,
  student: MdPerson,
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = navByRole[user?.role] || [];
  const roleColor = roleColors[user?.role] || '#638cff';
  const RoleIcon = roleIcons[user?.role] || MdPerson;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  const avatarColors = {
    admin: 'rgba(167,139,250,0.15)',
    professor: 'rgba(34,211,238,0.15)',
    student: 'rgba(74,222,128,0.15)',
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 40, backdropFilter: 'blur(4px)'
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '260px' : '72px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        flexShrink: 0,
        zIndex: 50,
        position: 'relative'
      }}>
        {/* Logo */}
        <div style={{
          padding: sidebarOpen ? '20px 20px 16px' : '20px 14px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minHeight: '72px'
        }}>
          <div style={{
            width: '36px', height: '36px', flexShrink: 0,
            background: 'var(--gradient-accent)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: '800',
            fontFamily: 'var(--font-display)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(99,140,255,0.3)'
          }}>A</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                AttendEase
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Portal v1.0</div>
            </div>
          )}
        </div>

        {/* Role badge */}
        {sidebarOpen && (
          <div style={{ padding: '12px 16px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px',
              background: avatarColors[user?.role],
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${roleColor}25`
            }}>
              <div className="avatar" style={{ background: `${roleColor}20`, color: roleColor, width: '32px', height: '32px', fontSize: '11px' }}>
                {initials}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                  <RoleIcon size={10} color={roleColor} />
                  <span style={{ fontSize: '11px', color: roleColor, textTransform: 'capitalize', fontWeight: '600' }}>{user?.role}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {!sidebarOpen && (
            <div style={{ padding: '8px 4px', marginBottom: '8px' }}>
              <div className="avatar" style={{
                background: `${roleColor}20`, color: roleColor,
                width: '36px', height: '36px', margin: '0 auto', fontSize: '12px'
              }}>
                {initials}
              </div>
            </div>
          )}
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: sidebarOpen ? '10px 14px' : '10px',
                marginBottom: '2px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                background: isActive ? 'var(--bg-elevated)' : 'transparent',
                borderLeft: isActive ? `3px solid ${roleColor}` : '3px solid transparent',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '400',
                transition: 'var(--transition)',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                position: 'relative'
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={19} color={isActive ? roleColor : undefined} style={{ flexShrink: 0 }} />
                  {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse + Logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-ghost"
            style={{
              width: '100%', justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: '10px', marginBottom: '6px', padding: '9px 12px'
            }}
          >
            {sidebarOpen ? <MdClose size={17} /> : <MdMenu size={17} />}
            {sidebarOpen && <span>Collapse</span>}
          </button>
          <button
            onClick={handleLogout}
            className="btn"
            style={{
              width: '100%', justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: '10px', background: 'rgba(248,113,113,0.08)',
              color: '#f87171', border: '1px solid rgba(248,113,113,0.2)',
              padding: '9px 12px'
            }}
          >
            <MdLogout size={17} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-primary)' }}>
        {/* Top bar */}
        <div style={{
          height: '60px', background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          padding: '0 28px', gap: '16px',
          position: 'sticky', top: 0, zIndex: 30
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              padding: '4px 12px',
              background: `${roleColor}15`,
              border: `1px solid ${roleColor}30`,
              borderRadius: '100px',
              fontSize: '12px',
              color: roleColor,
              fontWeight: '600',
              textTransform: 'capitalize'
            }}>
              {user?.role}
            </div>
            {user?.rollCode && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '4px 10px', borderRadius: '100px' }}>
                {user.rollCode}
              </div>
            )}
            {user?.professorCode && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '4px 10px', borderRadius: '100px' }}>
                {user.professorCode}
              </div>
            )}
          </div>
        </div>
        <div>
          {children}
        </div>
      </main>
    </div>
  );
}
