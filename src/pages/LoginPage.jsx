import React, { useState } from 'react'
import { signIn } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (err) {
      setError('Λάθος email ή κωδικός πρόσβασης.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--navy)',
    }}>
      {/* Grid background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.5,
      }} />

      <div style={{ width: '100%', maxWidth: 380, padding: '0 20px', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 52, height: 52, margin: '0 auto 16px',
            background: 'var(--navy-3)', border: '1px solid var(--border-h)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)"
              strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2"/>
              <rect x="2" y="14" width="20" height="8" rx="2"/>
              <line x1="6" y1="6" x2="6.01" y2="6"/>
              <line x1="6" y1="18" x2="6.01" y2="18"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em' }}>IT Inventory Pro</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Σύστημα Καταγραφής Εξοπλισμού</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '28px 24px' }}>
          <form onSubmit={handleSubmit}>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Email</label>
              <input
                type="email" autoComplete="email" required
                placeholder="technician@company.gr"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="field" style={{ marginBottom: 20 }}>
              <label>Κωδικός πρόσβασης</label>
              <input
                type="password" autoComplete="current-password" required
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div style={{
                marginBottom: 14, padding: '8px 12px',
                background: 'var(--err-bg)', border: '1px solid var(--err)',
                borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--err)',
              }}>
                {error}
              </div>
            )}
            <button
              type="submit" disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
            >
              {loading ? 'Σύνδεση...' : 'Σύνδεση'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--muted)' }}>
          Για δημιουργία λογαριασμού επικοινωνήστε με τον διαχειριστή.
        </p>
      </div>
    </div>
  )
}
