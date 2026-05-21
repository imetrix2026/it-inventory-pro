import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { fetchClients, fetchAllVisits } from '../lib/supabase'
import { Loader, StatusTag, Avatar } from '../components/UI'

export default function DashboardPage() {
  const { profile, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [visits, setVisits]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [cl, vi] = await Promise.all([fetchClients(), fetchAllVisits()])
      setClients(cl)
      setVisits(vi.slice(0, 8))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <Loader />

  const total = clients.length
  const ok    = clients.filter(c => c.status === 'ok').length
  const warn  = clients.filter(c => c.status === 'warn').length
  const err   = clients.filter(c => c.status === 'err').length
  const pending = clients.filter(c => c.status !== 'ok')

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 400, letterSpacing: '-0.02em' }}>
          Καλημέρα, <span style={{ fontWeight: 500 }}>{profile?.name?.split(' ')[0]}</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>
          {new Date().toLocaleDateString('el-GR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card cyan">
          <div className="num">{total}</div>
          <div className="lbl">Σύνολο πελατών</div>
        </div>
        <div className="stat-card ok">
          <div className="num">{ok}</div>
          <div className="lbl">Κανονική κατάσταση</div>
        </div>
        <div className="stat-card warn">
          <div className="num">{warn}</div>
          <div className="lbl">Εκκρεμότητες</div>
        </div>
        <div className="stat-card" style={{ '--num-color': 'var(--err)' }}>
          <div className="num" style={{ color: 'var(--err)' }}>{err}</div>
          <div className="lbl">Προβλήματα</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Pending clients */}
        <div>
          <div className="flex-between" style={{ marginBottom: 12 }}>
            <h2 style={{ fontSize: 13, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>
              Εκκρεμότητες
            </h2>
            <button className="btn btn-sm" onClick={() => navigate('/clients')}>Όλοι →</button>
          </div>
          {pending.length === 0 && (
            <div className="empty" style={{ height: 80 }}>Καμία εκκρεμότητα</div>
          )}
          {pending.map(c => (
            <div key={c.id} className="client-row" onClick={() => navigate(`/clients/${c.id}`)}>
              <Avatar name={c.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{c.notes || c.sla || '—'}</div>
              </div>
              <StatusTag status={c.status} />
            </div>
          ))}
        </div>

        {/* Recent visits */}
        <div>
          <div className="flex-between" style={{ marginBottom: 12 }}>
            <h2 style={{ fontSize: 13, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>
              Τελευταίες επισκέψεις
            </h2>
            <button className="btn btn-sm" onClick={() => navigate('/history')}>Όλες →</button>
          </div>
          {visits.length === 0 && <div className="empty" style={{ height: 80 }}>Δεν υπάρχει ιστορικό</div>}
          {visits.map(v => (
            <div key={v.id} style={{
              padding: '10px 12px', borderRadius: 'var(--r-md)',
              background: 'var(--navy-2)', border: '1px solid var(--border)',
              marginBottom: 6,
            }}>
              <div className="flex-between">
                <span style={{ fontWeight: 500, fontSize: 13 }}>{v.clients?.name || '—'}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{v.visit_date}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                {v.tech_name} · {v.visit_type}
                {v.pending && <span style={{ color: 'var(--warn)', marginLeft: 6 }}>⚠ {v.pending}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
