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
      <div style={{ display: 'flex',
