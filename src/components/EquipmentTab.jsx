import React, { useState, useEffect } from 'react'
import { upsertEquipmentItem, deleteEquipmentItem } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { EqStatusTag, IconPlus, IconTrash, IconEdit, IconSave, SectionLabel } from './UI'

const EQ_STATUS_OPTS = ['Λειτουργεί','Προβληματικό','Εκτός Λειτουργίας','Αντικατάσταση']

const CONFIGS = {
  network: {
    label: 'Δικτυακός Εξοπλισμός',
    fields: [
      { key: 'type',     label: 'Τύπος',       placeholder: 'Switch, Firewall, AP...' },
      { key: 'maker',    label: 'Κατ/στής',     placeholder: 'Cisco, Ubiquiti...' },
      { key: 'model',    label: 'Μοντέλο',      placeholder: '' },
      { key: 'sn',       label: 'S/N',          placeholder: '', mono: true },
      { key: 'ip',       label: 'IP Διαχ/σης',  placeholder: '192.168.1.x', mono: true },
      { key: 'location', label: 'Θέση/Rack',    placeholder: 'Rack 1' },
      { key: 'firmware', label: 'Firmware',      placeholder: '' },
      { key: 'status',   label: 'Κατάσταση',    select: EQ_STATUS_OPTS },
      { key: 'warranty', label: 'Εγγύηση έως',  placeholder: '2027-12' },
      { key: 'notes',    label: 'Σημειώσεις',   placeholder: '', full: true },
    ],
    cols: ['Τύπος','Κατ/στής','Μοντέλο','IP','Θέση','Κατάσταση'],
    colKeys: ['type','maker','model','ip','location','status'],
    cardTitle: (item) => item.type || '—',
    cardSub: (item) => [item.maker, item.model].filter(Boolean).join(' '),
    cardDetails: (item) => [
      item.sn && { label: 'S/N', value: item.sn, mono: true },
      item.ip && { label: 'IP', value: item.ip, mono: true },
      item.location && { label: 'Θέση', value: item.location },
      item.firmware && { label: 'Firmware', value: item.firmware },
      item.warranty && { label: 'Εγγύηση', value: item.warranty },
      item.notes && { label: 'Σημ.', value: item.notes },
    ].filter(Boolean),
  },
  servers: {
    label: 'Servers & Εικονικές Μηχανές',
    fields: [
      { key: 'hostname', label: 'Hostname',        placeholder: 'SRV-01' },
      { key: 'type',     label: 'Τύπος',           placeholder: 'Physical, VM, NAS' },
      { key: 'maker',    label: 'Κατ/στής',        placeholder: 'Dell, HP, Lenovo' },
      { key: 'model',    label: 'Μοντέλο',         placeholder: '' },
      { key: 'sn',       label: 'S/N',             placeholder: '', mono: true },
      { key: 'cpu',      label: 'CPU',             placeholder: 'Xeon E5-2680' },
      { key: 'ram',      label: 'RAM (GB)',         placeholder: '64' },
      { key: 'storage',  label: 'Storage',         placeholder: '2TB RAID10' },
      { key: 'os',       label: 'OS/Hypervisor',   placeholder: 'VMware ESXi 7' },
      { key: 'ip',       label: 'IP Address',      placeholder: '192.168.1.10', mono: true },
      { key: 'role',     label: 'Ρόλος/Services',  placeholder: 'AD, DNS, Files...' },
      { key: 'status',   label: 'Κατάσταση',       select: EQ_STATUS_OPTS },
      { key: 'warranty', label: 'Εγγύηση έως',     placeholder: '2027-12' },
    ],
    cols: ['Hostname','Τύπος','OS','IP','Κατάσταση'],
    colKeys: ['hostname','type','os','ip','status'],
    cardTitle: (item) => item.hostname || item.type || '—',
    cardSub: (item) => [item.maker, item.model].filter(Boolean).join(' '),
    cardDetails: (item) => [
      item.cpu && { label: 'CPU', value: item.cpu },
      item.ram && { label: 'RAM', value: item.ram + ' GB' },
      item.storage && { label: 'Storage', value: item.storage },
      item.os && { label: 'OS', value: item.os },
      item.ip && { label: 'IP', value: item.ip, mono: true },
      item.role && { label: 'Ρόλος', value: item.role },
    ].filter(Boolean),
  },
  workstations: {
    label: 'Σταθμοί Εργασίας & Περιφερειακά',
    fields: [
      { key: 'type',    label: 'Τύπος',          placeholder: 'Desktop, Laptop, Printer' },
      { key: 'user',    label: 'Χρήστης/Τμήμα', placeholder: '' },
      { key: 'maker',   label: 'Κατ/στής',       placeholder: '' },
      { key: 'model',   label: 'Μοντέλο',        placeholder: '' },
      { key: 'sn',      label: 'S/N',            placeholder: '', mono: true },
      { key: 'os',      label: 'OS',             placeholder: 'Windows 11' },
      { key: 'cpu',     label: 'CPU/RAM',        placeholder: '' },
      { key: 'ip',      label: 'IP/Hostname',    placeholder: '', mono: true },
      { key: 'domain',  label: 'Domain',         placeholder: '' },
      { key: 'status',  label: 'Κατάσταση',      select: EQ_STATUS_OPTS },
      { key: 'warranty',label: 'Εγγύηση έως',    placeholder: '' },
    ],
    cols: ['Τύπος','Χρήστης','Μοντέλο','OS','Κατάσταση'],
    colKeys: ['type','user','model','os','status'],
    cardTitle: (item) => item.type || '—',
    cardSub: (item) => item.user || '',
    cardDetails: (item) => [
      item.maker && { label: 'Κατ/στής', value: item.maker },
      item.model && { label: 'Μοντέλο', value: item.model },
      item.os && { label: 'OS', value: item.os },
      item.ip && { label: 'IP', value: item.ip, mono: true },
    ].filter(Boolean),
  },
  ups: {
    label: 'UPS & Υποδομή Ρεύματος',
    fields: [
      { key: 'maker',    label: 'Κατ/στής',           placeholder: 'APC, Eaton' },
      { key: 'model',    label: 'Μοντέλο',             placeholder: '' },
      { key: 'va',       label: 'Ισχύς (VA)',           placeholder: '3000' },
      { key: 'battery',  label: 'Τύπος Μπαταρίας',     placeholder: '' },
      { key: 'lastBat',  label: 'Τελ. Αντ/ση Μπατ.',  placeholder: '' },
      { key: 'nextBat',  label: 'Επόμ. Αντ/ση',        placeholder: '' },
      { key: 'load',     label: 'Φορτίο %',             placeholder: '40' },
      { key: 'status',   label: 'Κατάσταση',            select: EQ_STATUS_OPTS },
      { key: 'notes',    label: 'Σημειώσεις',           placeholder: '', full: true },
    ],
    cols: ['Κατ/στής','Μοντέλο','VA','Φορτίο','Κατάσταση'],
    colKeys: ['maker','model','va','load','status'],
    cardTitle: (item) => [item.maker, item.model].filter(Boolean).join(' ') || '—',
    cardSub: (item) => item.va ? item.va + ' VA' : '',
    cardDetails: (item) => [
      item.lastBat && { label: 'Τελ. Αντ/ση', value: item.lastBat },
      item.nextBat && { label: 'Επόμ. Αντ/ση', value: item.nextBat },
      item.load && { label: 'Φορτίο', value: item.load + '%' },
    ].filter(Boolean),
  },
  phones: {
    label: 'Τηλεφωνία & Κάμερες',
    fields: [
      { key: 'cat',      label: 'Κατηγορία',      placeholder: 'PBX, IP Phone, Camera, NVR' },
      { key: 'maker',    label: 'Κατ/στής',       placeholder: '' },
      { key: 'model',    label: 'Μοντέλο',        placeholder: '' },
      { key: 'sn',       label: 'S/N',            placeholder: '', mono: true },
      { key: 'location', label: 'Τοποθεσία',      placeholder: '' },
      { key: 'ip',       label: 'IP/Εσωτ. Αρ.',  placeholder: '', mono: true },
      { key: 'firmware', label: 'Firmware',        placeholder: '' },
      { key: 'status',   label: 'Κατάσταση',      select: EQ_STATUS_OPTS },
      { key: 'notes',    label: 'Σημειώσεις',     placeholder: '', full: true },
    ],
    cols: ['Κατηγορία','Κατ/στής','Μοντέλο','IP','Κατάσταση'],
    colKeys: ['cat','maker','model','ip','status'],
    cardTitle: (item) => item.cat || '—',
    cardSub: (item) => [item.maker, item.model].filter(Boolean).join(' '),
    cardDetails: (item) => [
      item.location && { label: 'Θέση', value: item.location },
      item.ip && { label: 'IP', value: item.ip, mono: true },
      item.firmware && { label: 'Firmware', value: item.firmware },
    ].filter(Boolean),
  },
}

function blankItem(category) {
  const base = {}
  CONFIGS[category]?.fields.forEach(f => { base[f.key] = '' })
  base.status = 'Λειτουργεί'
  return base
}

// ── File Viewer Modal ─────────────────────────────────────────────────────────
function FileViewerModal({ files, onClose }) {
  const [current, setCurrent] = useState(0)
  const file = files[current]
  const isPdf = file?.name?.toLowerCase().endsWith('.pdf') || file?.url?.includes('.pdf')

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      zIndex: 1000, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 16
    }} onClick={onClose}>
      <div style={{
        background: 'var(--navy-2)', border: '1px solid var(--border-h)',
        borderRadius: 'var(--r-lg)', width: '100%', maxWidth: 800,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--white)', fontWeight: 500 }}>{file?.name}</span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{current + 1} / {files.length}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href={file?.url} target="_blank" rel="noreferrer"
              style={{ fontSize: 12, color: 'var(--cyan)', textDecoration: 'none', padding: '4px 10px', border: '1px solid var(--cyan)', borderRadius: 'var(--r-sm)' }}>
              ↗ Άνοιγμα
            </a>
            <button onClick={onClose} style={{
              background: 'none', border: '1px solid var(--border-h)',
              borderRadius: 'var(--r-sm)', padding: '4px 10px',
              color: 'var(--muted)', cursor: 'pointer', fontSize: 12
            }}>✕</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, minHeight: 300 }}>
          {isPdf ? (
            <iframe src={file?.url} style={{ width: '100%', height: '60vh', border: 'none', borderRadius: 4 }} title={file?.name} />
          ) : (
            <img src={file?.url} alt={file?.name} style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: 4 }} />
          )}
        </div>

        {/* Thumbnails */}
        {files.length > 1 && (
          <div style={{ display: 'flex', gap: 8, padding: '10px 16px', borderTop: '1px solid var(--border)', overflowX: 'auto' }}>
            {files.map((f, i) => (
              <div key={i} onClick={() => setCurrent(i)} style={{
                width: 48, height: 48, flexShrink: 0, cursor: 'pointer',
                border: `2px solid ${i === current ? 'var(--cyan)' : 'var(--border)'}`,
                borderRadius: 'var(--r-sm)', overflow: 'hidden', background: 'var(--navy-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {f.name?.toLowerCase().endsWith('.pdf') ? (
                  <span style={{ fontSize: 18 }}>📄</span>
                ) : (
                  <img src={f.url} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── File Upload Section ───────────────────────────────────────────────────────
function FileUploadSection({ itemId, clientId, category }) {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerStart, setViewerStart] = useState(0)

  const folder = `${clientId}/${category}/${itemId}`

  async function loadFiles() {
    if (!itemId) return
    try {
      const { data, error } = await supabase.storage.from('equipment-files').list(folder)
      if (error) throw error
      const withUrls = (data || []).filter(f => f.name !== '.emptyFolderPlaceholder').map(f => ({
        name: f.name,
        url: supabase.storage.from('equipment-files').getPublicUrl(`${folder}/${f.name}`).data.publicUrl
      }))
      setFiles(withUrls)
    } catch (e) {
      console.error('Load files error:', e)
    }
  }

  useEffect(() => { loadFiles() }, [itemId])

  async function handleUpload(e) {
    const selected = Array.from(e.target.files)
    if (!selected.length || !itemId) return
    setUploading(true)
    try {
      for (const file of selected) {
        const path = `${folder}/${Date.now()}_${file.name}`
        const { error } = await supabase.storage.from('equipment-files').upload(path, file)
        if (error) throw error
      }
      await loadFiles()
    } catch (e) {
      console.error('Upload error:', e)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleDelete(fileName, e) {
    e.stopPropagation()
    try {
      await supabase.storage.from('equipment-files').remove([`${folder}/${fileName}`])
      setFiles(prev => prev.filter(f => f.name !== fileName))
    } catch (e) {
      console.error('Delete error:', e)
    }
  }

  function openViewer(index) {
    setViewerStart(index)
    setViewerOpen(true)
  }

  if (!itemId) return (
    <div style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
      Αποθηκεύστε πρώτα για να προσθέσετε αρχεία
    </div>
  )

  return (
    <div>
      {viewerOpen && files.length > 0 && (
        <FileViewerModal
          files={files}
          onClose={() => setViewerOpen(false)}
        />
      )}

      {/* Upload button */}
      <label style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 'var(--r-sm)',
        border: '1px dashed var(--border-h)', cursor: 'pointer',
        fontSize: 12, color: uploading ? 'var(--muted)' : 'var(--cyan)',
        background: 'var(--navy-3)', marginBottom: files.length > 0 ? 10 : 0
      }}>
        <input type="file" accept=".jpg,.jpeg,.png,.pdf" multiple onChange={handleUpload}
          style={{ display: 'none' }} disabled={uploading} />
        {uploading ? '⏳ Ανέβασμα...' : '📎 Προσθήκη αρχείων'}
      </label>

      {/* File list */}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {files.map((f, i) => (
            <div key={i} onClick={() => openViewer(i)} style={{
              position: 'relative', width: 64, height: 64, cursor: 'pointer',
              border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
              overflow: 'hidden', background: 'var(--navy-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {f.name?.toLowerCase().endsWith('.pdf') ? (
                <span style={{ fontSize: 28 }}>📄</span>
              ) : (
                <img src={f.url} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              <button
                onClick={(e) => handleDelete(f.name, e)}
                style={{
                  position: 'absolute', top: 2, right: 2,
                  background: 'rgba(0,0,0,0.7)', border: 'none',
                  borderRadius: '50%', width: 18, height: 18,
                  color: 'var(--err)', cursor: 'pointer', fontSize: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>✕</button>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'rgba(0,0,0,0.6)', fontSize: 9, color: '#fff',
                padding: '2px 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>{f.name.replace(/^\d+_/, '')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── View Modal ────────────────────────────────────────────────────────────────
function ViewModal({ item, category, clientId, onClose }) {
  const cfg = CONFIGS[category]
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--navy-2)', border: '1px solid var(--border-h)',
        borderRadius: 'var(--r-lg)', padding: '20px', width: '100%', maxWidth: 560,
        maxHeight: '85vh', overflowY: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--white)' }}>
              {item.type || item.hostname || item.cat || item.maker || 'Εξοπλισμός'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{cfg.label}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 8 }}>
            <EqStatusTag status={item.status} />
            <button onClick={onClose} style={{
              background: 'none', border: '1px solid var(--border-h)',
              borderRadius: 'var(--r-sm)', padding: '4px 10px',
              color: 'var(--muted)', cursor: 'pointer', fontSize: 12
            }}>✕</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {cfg.fields.filter(f => f.key !== 'status' && item[f.key]).map(f => (
            <div key={f.key} style={{ gridColumn: f.full ? '1/-1' : 'auto' }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
                {f.label}
              </div>
              <div style={{
                fontSize: 13, color: 'var(--white)',
                fontFamily: f.mono ? 'var(--font-mono)' : 'var(--font-sans)',
                background: 'var(--navy-3)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-sm)', padding: '6px 10px', wordBreak: 'break-all'
              }}>
                {item[f.key]}
              </div>
            </div>
          ))}
        </div>

        {/* Files section in ViewModal */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: 10 }}>
            Αρχεία & Φωτογραφίες
          </div>
          <FileUploadSection itemId={item._id} clientId={clientId} category={category} />
        </div>
      </div>
    </div>
  )
}

// ── Edit Form ─────────────────────────────────────────────────────────────────
function EditForm({ item, clientId, onSave, onCancel }) {
  const [data, setData] = useState({ ...item })
  const cfg = CONFIGS[item._category] || CONFIGS.network
  function set(key, val) { setData(d => ({ ...d, [key]: val })) }
  return (
    <div style={{ background: 'var(--navy-3)', border: '1px solid var(--border-h)', borderRadius: 'var(--r-md)', padding: 16, marginBottom: 12 }}>
      <div className="form-grid">
        {cfg.fields.map(f => (
          <div key={f.key} className={`field${f.full ? ' form-full' : ''}`}>
            <label>{f.label}</label>
            {f.select ? (
              <select value={data[f.key] || ''} onChange={e => set(f.key, e.target.value)}>
                {f.select.map(o => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input type="text" placeholder={f.placeholder} value={data[f.key] || ''}
                onChange={e => set(f.key, e.target.value)}
                style={f.mono ? { fontFamily: 'var(--font-mono)', fontSize: 12 } : {}} />
            )}
          </div>
        ))}
      </div>

      {/* Files in EditForm only if item already saved */}
      {item._id && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: 10 }}>
            Αρχεία & Φωτογραφίες
          </div>
          <FileUploadSection itemId={item._id} clientId={clientId} category={item._category} />
        </div>
      )}

      <div className="flex-center gap-8" style={{ marginTop: 12, justifyContent: 'flex-end' }}>
        <button className="btn btn-sm" onClick={onCancel}>Ακύρωση</button>
        <button className="btn btn-sm btn-primary" onClick={() => onSave(data)}>
          <IconSave size={12} /> Αποθήκευση
        </button>
      </div>
    </div>
  )
}

// ── Mobile Card ───────────────────────────────────────────────────────────────
function MobileCard({ item, category, index, onEdit, onDelete, onView }) {
  const cfg = CONFIGS[category]
  return (
    <div style={{
      background: 'var(--navy-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)', padding: '12px 14px', marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--white)' }}>{cfg.cardTitle(item)}</div>
          {cfg.cardSub(item) && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{cfg.cardSub(item)}</div>}
        </div>
        <EqStatusTag status={item.status} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
        {cfg.cardDetails(item).slice(0, 4).map((d, i) => (
          <div key={i}>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d.label}</div>
            <div style={{ fontSize: 12, color: 'var(--white)', fontFamily: d.mono ? 'var(--font-mono)' : 'inherit', wordBreak: 'break-all' }}>{d.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
        <button className="btn btn-sm" style={{ flex: 1, justifyContent: 'center', color: 'var(--cyan)', borderColor: 'var(--cyan)' }} onClick={() => onView(index)}>
          👁 Προβολή
        </button>
        <button className="btn btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onEdit(index)}>
          ✏️ Επεξεργασία
        </button>
        <button className="btn btn-sm" style={{ flex: 1, justifyContent: 'center', color: 'var(--err)', borderColor: 'var(--err)' }} onClick={() => onDelete(index)}>
          🗑 Διαγραφή
        </button>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function EquipmentTab({ category, clientId, items = [], onChange, showToast }) {
  const cfg = CONFIGS[category]
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  async function handleSave(data) {
    try {
      const { _category, ...item } = data
      const id = await upsertEquipmentItem(clientId, category, item)
      if (editing === 'new') {
        onChange(category, [...items, { _id: id, ...item }])
      } else {
        const updated = items.map((it, i) => i === editing ? { _id: id, ...item } : it)
        onChange(category, updated)
      }
      setEditing(null)
      showToast('Αποθηκεύτηκε')
    } catch (e) {
      showToast(e.message, 'err')
    }
  }

  async function handleDelete(index) {
    const item = items[index]
    if (!item._id) { onChange(category, items.filter((_, i) => i !== index)); return }
    try {
      await deleteEquipmentItem(item._id)
      onChange(category, items.filter((_, i) => i !== index))
      showToast('Διαγράφηκε')
    } catch (e) {
      showToast(e.message, 'err')
    }
  }

  const IconView = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  )

  const newItemBase = { ...blankItem(category), _category: category }

  return (
    <div>
      {viewing !== null && (
        <ViewModal
          item={items[viewing]}
          category={category}
          clientId={clientId}
          onClose={() => setViewing(null)}
        />
      )}

      <div className="flex-between" style={{ marginBottom: 14 }}>
        <SectionLabel>{cfg.label}</SectionLabel>
        {editing === null && (
          <button className="btn btn-sm btn-primary" onClick={() => setEditing('new')}>
            <IconPlus size={12} /> Προσθήκη
          </button>
        )}
      </div>

      {editing === 'new' && (
        <EditForm item={newItemBase} clientId={clientId} onSave={handleSave} onCancel={() => setEditing(null)} />
      )}

      {items.length === 0 && editing !== 'new' && (
        <div className="empty" style={{ padding: '24px', fontSize: 12 }}>Δεν υπάρχει καταγεγραμμένος εξοπλισμός</div>
      )}

      {items.length > 0 && (
        isMobile ? (
          <div>
            {items.map((item, i) => (
              <React.Fragment key={i}>
                {editing === i ? (
                  <EditForm item={{ ...item, _category: category }} clientId={clientId} onSave={handleSave} onCancel={() => setEditing(null)} />
                ) : (
                  <MobileCard item={item} category={category} index={i}
                    onEdit={setEditing} onDelete={handleDelete} onView={setViewing} />
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {cfg.cols.map(c => <th key={c}>{c}</th>)}
                  <th style={{ width: 120 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <React.Fragment key={i}>
                    <tr>
                      {cfg.colKeys.map(k => (
                        <td key={k}>
                          {k === 'status'
                            ? <EqStatusTag status={item[k]} />
                            : <span className={['sn','ip','mac'].includes(k) ? 'mono' : ''}>
                                {item[k] || <span style={{ color: 'var(--muted)' }}>—</span>}
                              </span>
                          }
                        </td>
                      ))}
                      <td>
                        <div className="flex-center gap-8">
                          <button className="btn-icon" onClick={() => setViewing(i)} title="Προβολή" style={{ color: 'var(--cyan)' }}>
                            <IconView />
                          </button>
                          <button className="btn-icon" onClick={() => setEditing(i)} title="Επεξεργασία">
                            <IconEdit size={13} />
                          </button>
                          <button className="btn-icon danger" onClick={() => handleDelete(i)} title="Διαγραφή">
                            <IconTrash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editing === i && (
                      <tr>
                        <td colSpan={cfg.cols.length + 1} style={{ padding: 0 }}>
                          <EditForm item={{ ...item, _category: category }} clientId={clientId} onSave={handleSave} onCancel={() => setEditing(null)} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}
