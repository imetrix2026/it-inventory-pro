import React, { useEffect } from 'react'

// ── SVG Icons (inline, no dep) ────────────────────────────────────────────────
const I = (path, vb = '0 0 24 24') => ({ size = 16, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox={vb} fill="none" stroke={color}
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={style}>
    {path}
  </svg>
)

export const IconDash     = I(<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>)
export const IconBuilding = I(<><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4"/></>)
export const IconCalendar = I(<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>)
export const IconUsers    = I(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>)
export const IconServer   = I(<><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></>)
export const IconNetwork  = I(<><circle cx="12" cy="5" r="3"/><circle cx="4" cy="19" r="3"/><circle cx="20" cy="19" r="3"/><path d="M12 8v4M8.7 16.3L6 17M15.3 16.3L18 17M12 12l-3.3 4.3M12 12l3.3 4.3"/></>)
export const IconMonitor  = I(<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>)
export const IconBolt     = I(<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>)
export const IconPhone    = I(<><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></>)
export const IconHistory  = I(<><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.02"/></>)
export const IconPlus     = I(<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>)
export const IconTrash    = I(<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></>)
export const IconEdit     = I(<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>)
export const IconSearch   = I(<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>)
export const IconSave     = I(<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>)
export const IconBack     = I(<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>)
export const IconLogout   = I(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>)
export const IconCheck    = I(<><polyline points="20 6 9 17 4 12"/></>)
export const IconAlert    = I(<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>)
export const IconRefresh  = I(<><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.69-9.75"/></>)

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ message, type = 'ok', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className={`toast ${type}`}>
      {type === 'ok' ? <IconCheck size={14} /> : <IconAlert size={14} />}
      {message}
    </div>
  )
}

// ── useToast hook ─────────────────────────────────────────────────────────────
export function useToast() {
  const [toast, setToast] = React.useState(null)
  const showToast = (message, type = 'ok') => setToast({ message, type })
  const ToastNode = toast ? <Toast {...toast} onDone={() => setToast(null)} /> : null
  return { showToast, ToastNode }
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
export function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 900,
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: 340, padding: '20px 24px' }}>
        <p style={{ marginBottom: 20, fontSize: 14 }}>{message}</p>
        <div className="flex-center gap-8" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-sm" onClick={onCancel}>Ακύρωση</button>
          <button className="btn btn-sm btn-primary" onClick={onConfirm} style={{ background: 'var(--err)', borderColor: 'var(--err)' }}>Διαγραφή</button>
        </div>
      </div>
    </div>
  )
}

// ── StatusTag ─────────────────────────────────────────────────────────────────
export function StatusTag({ status }) {
  const map = {
    'ok':  { cls: 'tag-ok',   label: 'Κανονική' },
    'warn':{ cls: 'tag-warn', label: 'Εκκρεμότητες' },
    'err': { cls: 'tag-err',  label: 'Πρόβλημα' },
  }
  const s = map[status] || { cls: 'tag-info', label: status }
  return <span className={`tag ${s.cls}`}>{s.label}</span>
}

export function EqStatusTag({ status }) {
  const map = {
    'Λειτουργεί':       { cls: 'tag-ok' },
    'Προβληματικό':     { cls: 'tag-warn' },
    'Εκτός Λειτουργίας':{ cls: 'tag-err' },
    'Αντικατάσταση':    { cls: 'tag-err' },
  }
  const s = map[status] || {}
  return status ? <span className={`tag ${s.cls || 'tag-info'}`}>{status}</span> : null
}

// ── Loader ────────────────────────────────────────────────────────────────────
export function Loader({ text = 'Φόρτωση...' }) {
  return <div className="loader"><div className="spinner" />{text}</div>
}

// ── Initials avatar ───────────────────────────────────────────────────────────
export function Avatar({ name, size = 36 }) {
  const initials = name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '??'
  return (
    <div className="client-avatar" style={{ width: size, height: size, fontSize: size * 0.33 }}>
      {initials}
    </div>
  )
}

// ── Section divider ───────────────────────────────────────────────────────────
export function SectionLabel({ children }) {
  return <div className="section-label">{children}</div>
}
