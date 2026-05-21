import React, { useEffect, useState } from 'react'
import { fetchAllVisits } from '../lib/supabase'
import { Loader } from '../components/UI'

export function HistoryPage() {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchAllVisits().then(v => { setVisits(v); setLoading(false) })
  }, [])

  if (loading) return <Loader />

  const filtered = visits.filter(v =>
    (v.clients?.name || '').toLowerCase().includes(query.toLowerCase()) ||
    (v.tech_name || '').toLowerCase().includes(query.toLowerCase()) ||
    (v.visit_type || '').toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 400, letterSpacing: '-0.02em' }}>Ιστορικό Επισκέψεων</h1>
        <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>{visits.length} επισκέψεις</p>
      </div>

      <div className="search-wrap" style={{ marginBottom: 16 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input placeholder="Αναζήτηση..." value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ημερομηνία</th>
              <th>Πελάτης</th>
              <th>Τεχνικός</th>
              <th>Τύπος</th>
              <th>Εργασίες</th>
              <th>Εκκρεμεί</th>
              <th>Κατάσταση</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>Δεν βρέθηκαν αποτελέσματα</td></tr>
            )}
            {filtered.map(v => (
              <tr key={v.id}>
                <td className="mono" style={{ whiteSpace: 'nowrap' }}>{v.visit_date}</td>
                <td style={{ fontWeight: 500 }}>{v.clients?.name || '—'}</td>
                <td style={{ color: 'var(--muted)' }}>{v.tech_name}</td>
                <td>
                  <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 2,
                    background: 'var(--navy-3)', border: '1px solid var(--border-h)' }}>
                    {v.visit_type}
                  </span>
                </td>
                <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: 'var(--muted)' }}>
                  {v.work_done || '—'}
                </td>
                <td style={{ color: v.pending ? 'var(--warn)' : 'var(--muted)', fontSize: 12 }}>
                  {v.pending || '—'}
                </td>
                <td>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.04em',
                    color: v.status === 'Ολοκληρώθηκε' ? 'var(--ok)' : 'var(--warn)',
                    border: `1px solid`, borderColor: v.status === 'Ολοκληρώθηκε' ? 'var(--ok)' : 'var(--warn)' }}>
                    {v.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Admin Page ─────────────────────────────────────────────────────────────────
import { fetchProfiles, fetchClients } from '../lib/supabase'

export function AdminPage() {
  const [profiles, setProfiles] = useState([])
  const [clients, setClients]   = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([fetchProfiles(), fetchClients()]).then(([p, c]) => {
      setProfiles(p); setClients(c); setLoading(false)
    })
  }, [])

  if (loading) return <Loader />

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 400, letterSpacing: '-0.02em' }}>Διαχείριση</h1>
        <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>Χρήστες & στατιστικά</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Technicians */}
        <div className="card">
          <div className="card-header"><h3>Τεχνικοί</h3></div>
          <div style={{ padding: '8px 0' }}>
            {profiles.map(p => {
              const myClients = clients.filter(c => c.tech_id === p.id)
              const warn = myClients.filter(c => c.status !== 'ok').length
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 16px', borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--navy-3)', border: '1px solid var(--border-h)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan)', flexShrink: 0,
                  }}>
                    {p.name?.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.email}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>
                      {myClients.length}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>πελάτες</div>
                  </div>
                  {warn > 0 && (
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 2,
                      background: 'var(--warn-bg)', color: 'var(--warn)', border: '1px solid var(--warn)' }}>
                      {warn} εκκρ.
                    </span>
                  )}
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 2,
                    background: p.role==='admin' ? 'rgba(30,111,217,0.15)' : 'var(--navy-3)',
                    color: p.role==='admin' ? 'var(--blue-h)' : 'var(--muted)',
                    border: `1px solid`, borderColor: p.role==='admin' ? 'var(--blue)' : 'var(--border-h)',
                    textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {p.role}
                  </span>
                </div>
              )
            })}
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>
              Για προσθήκη/διαγραφή χρηστών χρησιμοποιήστε το{' '}
              <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">Supabase Dashboard</a>
              {' '}→ Authentication → Users.
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="card">
          <div className="card-header"><h3>Στατιστικά</h3></div>
          <div className="card-body">
            <div className="stat-grid">
              <div className="stat-card cyan"><div className="num">{clients.length}</div><div className="lbl">Πελάτες</div></div>
              <div className="stat-card ok"><div className="num">{clients.filter(c=>c.status==='ok').length}</div><div className="lbl">OK</div></div>
              <div className="stat-card warn"><div className="num">{clients.filter(c=>c.status==='warn').length}</div><div className="lbl">Εκκρεμ.</div></div>
              <div className="stat-card"><div className="num" style={{color:'var(--err)'}}>{clients.filter(c=>c.status==='err').length}</div><div className="lbl">Πρόβλημα</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="card">
        <div className="card-header"><h3>Πληροφορίες Συστήματος</h3></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
            {[
              ['Backend', 'Supabase (PostgreSQL)'],
              ['Auth', 'Supabase Auth (JWT)'],
              ['Ασφάλεια', 'Row Level Security (RLS)'],
              ['Frontend', 'React + Vite'],
              ['Hosting', 'Vercel'],
              ['Κόστος', '€0/μήνα (δωρεάν tier)'],
            ].map(([k,v]) => (
              <div key={k} style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--muted)', minWidth: 90 }}>{k}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--cyan)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
