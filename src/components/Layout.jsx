import React from 'react'
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

  async function handleSignOut() {
    await signOut()
  }

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* Topbar */}
      <header style={{
        height: 'var(--topbar-h)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
        background: 'var(--navy-2)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{profile.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {profile.role === 'admin' ? 'Admin' : 'Τεχνικός'}
              </div>
            </div>
          )}
          <button className="btn btn-sm" onClick={handleSignOut} style={{ gap: 5 }}>
            <IconLogout size={13} /> Έξοδος
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <nav style={{
          width: 'var(--sidebar-w)', flexShrink: 0,
          background: 'var(--navy-2)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          padding: '12px 10px',
          overflowY: 'auto',
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--muted)', padding: '4px 8px 8px', marginBottom: 2 }}>
            Κύριο μενού
          </div>
          {navItems.map(({ path, label, Icon }) => (
            <div key={path}
              className={`nav-item ${isActive(path) ? 'active' : ''}`}
              onClick={() => navigate(path)}
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
                  onClick={() => navigate(path)}
                >
                  <Icon size={15} /> {label}
                </div>
              ))}
            </>
          )}
        </nav>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
