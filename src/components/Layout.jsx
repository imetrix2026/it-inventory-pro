import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { signOut } from '../lib/supabase'
import {
  IconDash, IconBuilding, IconCalendar,
  IconUsers, IconLogout, IconServer
} from './UI'

const navItems = [
  { path: '/',         label: 'Dashboard',  Icon: IconDash },
  { path: '/clients',  label: 'Πελάτες',    Icon: IconBuilding },
  { path: '/history',  label: 'Ιστορικό',   Icon: IconCalendar },
]
const adminItems = [
  { path: '/admin',    label: 'Χρήστες',    Icon: IconUsers },
]

export default function Layout({ children }) {
  const { profile, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
  }

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const allNavItems = [...navItems, ...(isAdmin ? adminItems : [])]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* Topbar */}
      <header style={{
        height: 'var(--topbar-h)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
        background: 'var(--navy-2)',
        borderBottom: '1px solid var(--border)',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Hamburger για mobile */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              display: 'none', background: 'none', border: 'none',
              color: 'var(--white)', cursor: 'pointer', padding: '4px',
              fontSize: 20, lineHeight: 1,
            }}
            className="hamburger-btn"
            aria-label="Menu"
          >
            ☰
          </button>
          <div style={{
            width: 28, height: 28, background: 'var(--navy-3)',
            border: '1px solid var(--border-h)', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconServer size={14} color="var(--cyan)" />
          </div>
          <span style={{ fontWeight: 500, fontSize: 14, letterSpacing: '-0.01em' }}>IT Inventory Pro</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {profile && (
            <div style={{ textAlign: 'right' }} className="user-info-desktop">
              <div style={{ fontSize: 13, fontWeight: 500 }}>{profile.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {profile.role === 'admin' ? 'Admin' : 'Τεχνικός'}
              </div>
            </div>
          )}
          <button className="btn btn-sm" onClick={handleSignOut} style={{ gap: 5 }}>
            <IconLogout size={13} /> <span className="logout-text">Έξοδος</span>
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>

        {/* Mobile overlay */}
        {menuOpen && (
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              zIndex: 49, display: 'none',
            }}
            className="mobile-overlay"
          />
        )}

        {/* Sidebar */}
        <nav
          className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}
          style={{
            width: 'var(--sidebar-w)', flexShrink: 0,
            background: 'var(--navy-2)',
            borderRight: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column',
            padding: '12px 10px',
            overflowY: 'auto',
          }}
        >
          {/* Mobile header στο sidebar */}
          <div className="sidebar-mobile-header" style={{ display: 'none', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{profile?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{profile?.role === 'admin' ? 'Admin' : 'Τεχνικός'}</div>
          </div>

          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--muted)', padding: '4px 8px 8px', marginBottom: 2 }}>
            Κύριο μενού
          </div>
          {navItems.map(({ path, label, Icon }) => (
            <div key={path}
              className={`nav-item ${isActive(path) ? 'active' : ''}`}
              onClick={() => { navigate(path); setMenuOpen(false) }}
            >
              <Icon size={15} /> {label}
            </div>
          ))}

          {isAdmin && (
            <>
              <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--muted)', padding: '0 8px 8px' }}>
                Διαχείριση
              </div>
              {adminItems.map(({ path, label, Icon }) => (
                <div key={path}
                  className={`nav-item ${isActive(path) ? 'active' : ''}`}
                  onClick={() => { navigate(path); setMenuOpen(false) }}
                >
                  <Icon size={15} /> {label}
                </div>
              ))}
            </>
          )}
        </nav>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px' }} className="main-content">
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hamburger-btn { display: block !important; }
          .user-info-desktop { display: none !important; }
          .logout-text { display: none; }
          .sidebar {
            position: fixed !important;
            left: -240px !important;
            top: var(--topbar-h) !important;
            height: calc(100vh - var(--topbar-h)) !important;
            z-index: 50 !important;
            transition: left 0.25s ease !important;
            width: 240px !important;
          }
          .sidebar.sidebar-open {
            left: 0 !important;
          }
          .sidebar-mobile-header { display: block !important; }
          .mobile-overlay { display: block !important; }
          .main-content { padding: 12px !important; }
        }
        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr !important; }
          .form-grid-3 { grid-template-columns: 1fr !important; }
          .form-full { grid-column: 1 !important; }
          .stat-grid { grid-template-columns: 1fr 1fr !important; }
          .tabs { gap: 0 !important; }
          .tab { padding: 8px 10px !important; font-size: 11px !important; }
        }
      `}</style>
    </div>
  )
}
