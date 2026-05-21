import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { fetchClients } from '../lib/supabase'
import { Loader, StatusTag, Avatar, IconSearch, IconPlus } from '../components/UI'

export default function ClientsPage() {
  const { isAdmin, session } = useAuth()
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchClients().then(data => { setClients(data); setLoading(false) })
  }, [])

  if (loading) return <Loader />

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(query.toLowerCase()) ||
    c.contact?.toLowerCase().includes(query.toLowerCase()) ||
    c.address?.toLowerCase().includes(query.toLowerCase()) ||
    c.sla?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 400, letterSpacing: '-0.02em' }}>Πελάτες</h1>
          <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>{clients.length} καταγεγραμμένοι</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/clients/new')}>
            <IconPlus size={13} /> Νέος πελάτης
          </button>
        )}
      </div>

      <div className="search-wrap">
        <IconSearch size={14} />
        <input placeholder="Αναζήτηση πελάτη, υπευθύνου, SLA..." value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      {filtered.length === 0 && <div className="empty">Δεν βρέθηκαν αποτελέσματα</div>}

      {filtered.map(c => (
        <div key={c.id} className="client-row" onClick={() => navigate(`/clients/${c.id}`)}>
          <Avatar name={c.name} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
              {[c.address, c.contact, c.sla && `SLA: ${c.sla}`].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
            <StatusTag status={c.status} />
            {c.last_visit && (
              <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                {c.last_visit}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
