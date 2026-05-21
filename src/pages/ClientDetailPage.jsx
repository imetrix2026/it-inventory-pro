import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import {
  fetchClient, upsertClient, fetchEquipment,
  fetchVisits, insertVisit, deleteVisit, fetchProfiles
} from '../lib/supabase'
import {
  Loader, StatusTag, IconBack, IconSave, IconPlus, IconTrash,
  SectionLabel, useToast
} from '../components/UI'
import EquipmentTab from '../components/EquipmentTab'

const TABS = [
  { id: 'general',      label: 'Στοιχεία' },
  { id: 'contract',     label: 'Σύμβαση' },
  { id: 'network',      label: 'Δίκτυο' },
  { id: 'servers',      label: 'Servers' },
  { id: 'workstations', label: 'Σταθμοί' },
  { id: 'ups',          label: 'UPS' },
  { id: 'phones',       label: 'Τηλεφωνία' },
  { id: 'history',      label: 'Ιστορικό' },
]

const SLA_OPTS = ['','4h on-site','8h on-site','NBD','24x7','Best effort']
const STATUS_OPTS = [
  { value: 'ok',   label: 'Κανονική' },
  { value: 'warn', label: 'Εκκρεμότητες' },
  { value: 'err',  label: 'Πρόβλημα' },
]
const VISIT_TYPES = ['Προληπτική','Διορθωτική','Εγκατάσταση','Αναβάθμιση','Αντικατάσταση','Τηλεφωνική']

function Field({ label, children, full }) {
  return (
    <div className={`field${full ? ' form-full' : ''}`}>
      <label>{label}</label>
      {children}
    </div>
  )
}

export default function ClientDetailPage() {
  const { id } = useParams()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const { session, profile, isAdmin } = useAuth()
  const { showToast, ToastNode } = useToast()

  const [tab, setTab]           = useState('general')
  const [client, setClient]     = useState(null)
  const [equipment, setEquipment] = useState({})
  const [visits, setVisits]     = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading]   = useState(false)
  const [saving, setSaving]     = useState(false)

 useEffect(() => {
if (isNew) {
    setClient({
      name:'', afm:'', address:'', phone:'', email:'', contact:'', contact_mobile:'',
      server_room:'', wifi:'', isp:'', isp_type:'', public_ip:'',
      sla:'', contract:'', contract_start:'', contract_end:'', support_hours:'', billing:'',
      tech_id: session?.user?.id || '',
      status: 'ok', last_visit:'', notes:'',
    })
    return
  }
  Promise.all([
    fetchClient(id),
    fetchEquipment(id),
    fetchVisits(id),
    isAdmin ? fetchProfiles() : Promise.resolve([]),
  ]).then(([cl, eq, vi, pr]) => {
    setClient(cl)
    setEquipment(eq)
    setVisits(vi)
    setProfiles(pr)
    setLoading(false)
  })
}, [id])

  const set = (key, val) => setClient(c => ({ ...c, [key]: val }))

  async function handleSave() {
    if (!client.name?.trim()) { showToast('Το όνομα είναι υποχρεωτικό', 'err'); return }
    setSaving(true)
    try {
      const saved = await upsertClient(client)
      if (isNew) navigate(`/clients/${saved.id}`, { replace: true })
      else setClient(saved)
      showToast('Αποθηκεύτηκε επιτυχώς')
    } catch (e) {
      showToast(e.message, 'err')
    } finally {
      setSaving(false)
    }
  }

  async function addVisit() {
    try {
      const v = await insertVisit({
        client_id: id,
        tech_id: session.user.id,
        tech_name: profile?.name || '',
        visit_date: new Date().toISOString().split('T')[0],
        visit_type: 'Προληπτική',
        work_done: '',
        status: 'Ολοκληρώθηκε',
        pending: '',
      })
      setVisits(vs => [v, ...vs])
    } catch (e) { showToast(e.message, 'err') }
  }

  async function removeVisit(vid) {
    await deleteVisit(vid)
    setVisits(vs => vs.filter(v => v.id !== vid))
    showToast('Διαγράφηκε')
  }

  const handleEquipmentChange = useCallback((category, items) => {
    setEquipment(eq => ({ ...eq, [category]: items }))
  }, [])

  if (loading) return <Loader />
  if (!client) return <Loader />

  return (
    <div>
      {/* Header */}
      <div className="flex-center gap-12" style={{ marginBottom: 20 }}>
        <button className="btn-icon" onClick={() => navigate('/clients')} title="Πίσω">
          <IconBack size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 400, letterSpacing: '-0.02em' }}>
            {isNew ? 'Νέος Πελάτης' : client.name}
          </h1>
          {!isNew && (
            <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>
              {[client.address, client.sla && `SLA: ${client.sla}`].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        {!isNew && <StatusTag status={client.status} />}
        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
          <IconSave size={12} /> {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}
        </button>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="tabs">
          {TABS.map(t => (
            <div key={t.id} className={`tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}>
              {t.label}
            </div>
          ))}
        </div>

        <div style={{ padding: '20px 20px 24px' }}>

          {/* ── General ── */}
          {tab === 'general' && (
            <div>
              <SectionLabel>Γενικά Στοιχεία</SectionLabel>
              <div className="form-grid">
                <Field label="Επωνυμία *"><input value={client.name||''} onChange={e=>set('name',e.target.value)} /></Field>
                <Field label="ΑΦΜ"><input value={client.afm||''} onChange={e=>set('afm',e.target.value)} /></Field>
                <Field label="Διεύθυνση" full><input value={client.address||''} onChange={e=>set('address',e.target.value)} /></Field>
                <Field label="Τηλέφωνο"><input value={client.phone||''} onChange={e=>set('phone',e.target.value)} /></Field>
                <Field label="Email"><input type="email" value={client.email||''} onChange={e=>set('email',e.target.value)} /></Field>
                <Field label="Υπεύθυνος Επικοινωνίας"><input value={client.contact||''} onChange={e=>set('contact',e.target.value)} /></Field>
                <Field label="Κινητό Υπευθύνου"><input value={client.contact_mobile||''} onChange={e=>set('contact_mobile',e.target.value)} /></Field>
              </div>

              <div className="divider" />
              <SectionLabel>Πληροφορίες Εγκατάστασης</SectionLabel>
              <div className="form-grid">
                <Field label="Τοποθεσία Server Room"><input value={client.server_room||''} onChange={e=>set('server_room',e.target.value)} /></Field>
                <Field label="WiFi SSID / Password"><input value={client.wifi||''} onChange={e=>set('wifi',e.target.value)} /></Field>
                <Field label="Πάροχος Internet"><input value={client.isp||''} onChange={e=>set('isp',e.target.value)} /></Field>
                <Field label="Τύπος / Ταχύτητα"><input value={client.isp_type||''} onChange={e=>set('isp_type',e.target.value)} /></Field>
                <Field label="Public IP"><input value={client.public_ip||''} placeholder="x.x.x.x" onChange={e=>set('public_ip',e.target.value)} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} /></Field>
              </div>

              <div className="divider" />
              <SectionLabel>Κατάσταση</SectionLabel>
              <div className="form-grid">
                <Field label="Κατάσταση">
                  <select value={client.status||'ok'} onChange={e=>set('status',e.target.value)}>
                    {STATUS_OPTS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
                <Field label="Τελευταία Επίσκεψη"><input type="date" value={client.last_visit||''} onChange={e=>set('last_visit',e.target.value)} /></Field>
                <Field label="Σημειώσεις" full>
                  <textarea value={client.notes||''} onChange={e=>set('notes',e.target.value)} />
                </Field>
              </div>
            </div>
          )}

          {/* ── Contract ── */}
          {tab === 'contract' && (
            <div>
              <SectionLabel>Στοιχεία Σύμβασης & SLA</SectionLabel>
              <div className="form-grid">
                <Field label="Αριθμός Σύμβασης"><input value={client.contract||''} onChange={e=>set('contract',e.target.value)} /></Field>
                <Field label="Επίπεδο SLA">
                  <select value={client.sla||''} onChange={e=>set('sla',e.target.value)}>
                    {SLA_OPTS.map(o=><option key={o} value={o}>{o||'— Επιλογή —'}</option>)}
                  </select>
                </Field>
                <Field label="Ημ. Έναρξης"><input type="date" value={client.contract_start||''} onChange={e=>set('contract_start',e.target.value)} /></Field>
                <Field label="Ημ. Λήξης"><input type="date" value={client.contract_end||''} onChange={e=>set('contract_end',e.target.value)} /></Field>
                <Field label="Ώρες Υποστήριξης"><input value={client.support_hours||''} placeholder="Δευ-Παρ 09:00-18:00" onChange={e=>set('support_hours',e.target.value)} /></Field>
                <Field label="Τρόπος Χρέωσης"><input value={client.billing||''} placeholder="Μηνιαίο πάγιο" onChange={e=>set('billing',e.target.value)} /></Field>
              </div>
              {isAdmin && profiles.length > 0 && (
                <>
                  <div className="divider" />
                  <SectionLabel>Υπεύθυνος Τεχνικός</SectionLabel>
                  <div className="form-grid">
                    <Field label="Τεχνικός">
                      <select value={client.tech_id||''} onChange={e=>set('tech_id',e.target.value)}>
                        {profiles.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </Field>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Equipment tabs ── */}
          {['network','servers','workstations','ups','phones'].includes(tab) && !isNew && (
            <EquipmentTab
              key={tab}
              category={tab}
              clientId={id}
              items={equipment[tab] || []}
              onChange={handleEquipmentChange}
              showToast={showToast}
            />
          )}
          {['network','servers','workstations','ups','phones'].includes(tab) && isNew && (
            <div className="empty">Αποθηκεύστε πρώτα τον πελάτη για να προσθέσετε εξοπλισμό.</div>
          )}

          {/* ── History ── */}
          {tab === 'history' && !isNew && (
            <div>
              <div className="flex-between" style={{ marginBottom: 14 }}>
                <SectionLabel>Ιστορικό Επισκέψεων</SectionLabel>
                <button className="btn btn-sm btn-primary" onClick={addVisit}>
                  <IconPlus size={12} /> Νέα Επίσκεψη
                </button>
              </div>

              {visits.length === 0 && <div className="empty" style={{ fontSize: 12 }}>Δεν υπάρχει ιστορικό</div>}

              {visits.map((v, i) => (
                <VisitRow key={v.id} visit={v} onDelete={() => removeVisit(v.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {ToastNode}
    </div>
  )
}

function VisitRow({ visit, onDelete }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState({ ...visit })
  const { showToast } = useToast()
  const VISIT_TYPES = ['Προληπτική','Διορθωτική','Εγκατάσταση','Αναβάθμιση','Αντικατάσταση','Τηλεφωνική']
  const VISIT_STATUS = ['Ολοκληρώθηκε','Εκκρεμεί','Σε Εξέλιξη','Ακυρώθηκε']

  return (
    <div style={{ marginBottom: 8, background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
      <div className="flex-between" style={{ padding: '10px 14px', cursor: 'pointer' }} onClick={() => setOpen(o=>!o)}>
        <div>
          <span style={{ fontWeight: 500, fontSize: 13 }}>{data.visit_date}</span>
          <span style={{ color: 'var(--muted)', fontSize: 12, marginLeft: 10 }}>{data.tech_name} · {data.visit_type}</span>
          {data.pending && <span style={{ color: 'var(--warn)', fontSize: 11, marginLeft: 10 }}>⚠ {data.pending}</span>}
        </div>
        <div className="flex-center gap-8">
          <span style={{ fontSize: 10, color: data.status === 'Ολοκληρώθηκε' ? 'var(--ok)' : 'var(--warn)',
            border: `1px solid`, borderColor: data.status === 'Ολοκληρώθηκε' ? 'var(--ok)' : 'var(--warn)',
            padding: '1px 6px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {data.status}
          </span>
          <button className="btn-icon danger" onClick={e => { e.stopPropagation(); onDelete() }}>
            <IconTrash size={13} />
          </button>
        </div>
      </div>
      {open && (
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)' }}>
          <div className="form-grid">
            <div className="field">
              <label>Ημερομηνία</label>
              <input type="date" value={data.visit_date||''} onChange={e=>setData(d=>({...d,visit_date:e.target.value}))} />
            </div>
            <div className="field">
              <label>Τύπος</label>
              <select value={data.visit_type||''} onChange={e=>setData(d=>({...d,visit_type:e.target.value}))}>
                {VISIT_TYPES.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Κατάσταση</label>
              <select value={data.status||''} onChange={e=>setData(d=>({...d,status:e.target.value}))}>
                {VISIT_STATUS.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Εκκρεμότητες</label>
              <input value={data.pending||''} onChange={e=>setData(d=>({...d,pending:e.target.value}))} />
            </div>
            <div className="field form-full">
              <label>Εργασίες που Εκτελέστηκαν</label>
              <textarea value={data.work_done||''} onChange={e=>setData(d=>({...d,work_done:e.target.value}))} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
