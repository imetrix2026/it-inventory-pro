// src/components/JiraTab.jsx
import React, { useState, useEffect } from 'react'
import { fetchJiraWorklogs } from '../lib/jiraService'
import { IconRefresh } from './UI'

function HoursBar({ used, total }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0
  const remaining = total - used
  const color = pct > 90 ? 'var(--err)' : pct > 70 ? 'var(--warn)' : 'var(--ok)'

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '14px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 300, fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>{total}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>Προαγορασμένες</div>
        </div>
        <div style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '14px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 300, fontFamily: 'var(--font-mono)', color }}>
            {Math.round(used * 100) / 100}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>Χρησιμοποιημένες</div>
        </div>
        <div style={{ background: 'var(--navy-3)', border: `1px solid ${remaining < 0 ? 'var(--err)' : 'var(--border)'}`, borderRadius: 'var(--r-md)', padding: '14px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 300, fontFamily: 'var(--font-mono)', color: remaining < 0 ? 'var(--err)' : remaining < total * 0.2 ? 'var(--warn)' : 'var(--ok)' }}>
            {Math.round(remaining * 100) / 100}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>Υπόλοιπο</div>
        </div>
      </div>

      <div style={{ background: 'var(--navy-3)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{Math.round(pct)}% χρησιμοποιημένο</span>
        {remaining < 0 && <span style={{ fontSize: 11, color: 'var(--err)', fontWeight: 500 }}>⚠ Υπέρβαση {Math.abs(Math.round(remaining * 100) / 100)}h</span>}
      </div>
    </div>
  )
}

export default function JiraTab({ client, onUpdate }) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [editHours, setEditHours] = useState(false)
  const [newHours, setNewHours] = useState(client.prepaid_hours || 0)
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toISOString().split('T')[0]
  })
  const [expandedTicket, setExpandedTicket] = useState(null)

  const hasCredentials = client.jira_url && client.jira_email && client.jira_api_token && client.jira_project_key

  async function loadJira() {
    if (!hasCredentials) return
    setLoading(true)
    setError('')
    try {
      const result = await fetchJiraWorklogs(
        client.jira_url,
        client.jira_email,
        client.jira_api_token,
        client.jira_project_key,
        dateFrom
      )
      setData(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasCredentials) loadJira()
  }, [])

  const sortedTickets = data
    ? [...data.tickets].sort((a, b) => {
        const latestA = a.worklogs.reduce((max, wl) => wl.date > max ? wl.date : max, '')
        const latestB = b.worklogs.reduce((max, wl) => wl.date > max ? wl.date : max, '')
        return latestB.localeCompare(latestA)
      })
    : []

  return (
    <div>
      {/* ── Ρυθμίσεις Jira ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
          Ρυθμίσεις Jira
        </div>
        <div className="form-grid">
          <div className="field">
            <label>Jira URL</label>
            <input value={client.jira_url || ''} placeholder="https://yourcompany.atlassian.net"
              onChange={e => onUpdate('jira_url', e.target.value)} />
          </div>
          <div className="field">
            <label>Jira Project Key</label>
            <input value={client.jira_project_key || ''} placeholder="π.χ. KANTOR"
              onChange={e => onUpdate('jira_project_key', e.target.value.toUpperCase())}
              style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }} />
          </div>
          <div className="field">
            <label>Email λογαριασμού Jira</label>
            <input value={client.jira_email || ''} placeholder="admin@company.gr"
              onChange={e => onUpdate('jira_email', e.target.value)} />
          </div>
          <div className="field">
            <label>API Token <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noreferrer" style={{ fontSize: 10, marginLeft: 4 }}>→ Δημιουργία</a></label>
            <input type="password" value={client.jira_api_token || ''} placeholder="••••••••••••••••"
              onChange={e => onUpdate('jira_api_token', e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{ width: 'auto', padding: '7px 10px' }} />
          </div>
          <button className="btn btn-primary btn-sm" onClick={loadJira} disabled={!hasCredentials || loading}>
            <IconRefresh size={12} /> {loading ? 'Φόρτωση...' : 'Συγχρονισμός Jira'}
          </button>
          {!hasCredentials && <span style={{ fontSize: 12, color: 'var(--muted)' }}>Συμπληρώστε τα στοιχεία Jira πρώτα</span>}
        </div>
      </div>

      {/* ── Ώρες ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Ώρες Υποστήριξης</span>
          <button className="btn btn-sm" onClick={() => setEditHours(!editHours)} style={{ fontSize: 11 }}>
            {editHours ? 'Ακύρωση' : '✏️ Ενημέρωση ωρών'}
          </button>
        </div>

        {editHours && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'flex-end' }}>
            <div className="field" style={{ marginBottom: 0, flex: 1, maxWidth: 200 }}>
              <label>Προαγορασμένες ώρες</label>
              <input type="number" min="0" step="0.5" value={newHours}
                onChange={e => setNewHours(parseFloat(e.target.value) || 0)} />
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => {
              onUpdate('prepaid_hours', newHours)
              setEditHours(false)
            }}>Αποθήκευση</button>
          </div>
        )}

        <HoursBar used={data?.totalHours || 0} total={client.prepaid_hours || 0} />
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ background: 'var(--err-bg)', border: '1px solid var(--err)', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 13, color: 'var(--err)', marginBottom: 16 }}>
          ⚠ {error}
        </div>
      )}
 
      {/* ── Tickets ── */}
      {data && sortedTickets.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
            Tickets με καταγεγραμμένες ώρες ({sortedTickets.length})
          </div>
          {sortedTickets.map((ticket, i) => (
            <div key={ticket.key} style={{
              background: 'var(--navy-3)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)', marginBottom: 6, overflow: 'hidden'
            }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer' }}
                onClick={() => setExpandedTicket(expandedTicket === i ? null : i)}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--cyan)', flexShrink: 0 }}>{ticket.key}</span>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.summary}</span>
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 2, background: 'var(--navy-2)', border: '1px solid var(--border-h)', color: 'var(--muted)', flexShrink: 0 }}>{ticket.status}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--warn)', flexShrink: 0 }}>{ticket.timeSpentHours}h</span>
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>{expandedTicket === i ? '▲' : '▼'}</span>
              </div>
              {expandedTicket === i && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '10px 14px' }}>
                  {[...ticket.worklogs]
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((wl, j) => (
                      <div key={j} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: j < ticket.worklogs.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'flex-start' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', flexShrink: 0, minWidth: 80 }}>{wl.date}</span>
                        <span style={{ fontSize: 12, color: 'var(--muted)', flexShrink: 0 }}>{wl.author}</span>
                        <span style={{ flex: 1, fontSize: 12, color: 'var(--white)' }}>{wl.comment || '—'}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--warn)', flexShrink: 0 }}>{wl.timeSpentHours}h</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data && sortedTickets.length === 0 && !loading && (
        <div className="empty" style={{ fontSize: 13 }}>Δεν βρέθηκαν tickets με worklogs για την επιλεγμένη περίοδο.</div>
      )}
    </div>
  )
}
