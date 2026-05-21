import React, { useState } from 'react'
import { upsertEquipmentItem, deleteEquipmentItem } from '../lib/supabase'
import { EqStatusTag, IconPlus, IconTrash, IconEdit, IconSave, SectionLabel } from './UI'

const EQ_STATUS_OPTS = ['Λειτουργεί','Προβληματικό','Εκτός Λειτουργίας','Αντικατάσταση']

// Field configs per category
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
      { key: 'warranty', label: 'Εγγύηση έως',  placeholder: '2027-12', type: 'month' },
      { key: 'notes',    label: 'Σημειώσεις',   placeholder: '', full: true },
    ],
    cols: ['Τύπος','Κατ/στής','Μοντέλο','S/N','IP','Θέση','Κατάσταση'],
    colKeys: ['type','maker','model','sn','ip','location','status'],
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
      { key: 'warranty', label: 'Εγγύηση έως',     placeholder: '2027-12', type: 'month' },
    ],
    cols: ['Hostname','Τύπος','OS','CPU','RAM','IP','Κατάσταση'],
    colKeys: ['hostname','type','os','cpu','ram','ip','status'],
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
      { key: 'warranty',label: 'Εγγύηση έως',    placeholder: '', type: 'month' },
    ],
    cols: ['Τύπος','Χρήστης','Μοντέλο','OS','IP','Κατάσταση'],
    colKeys: ['type','user','model','os','ip','status'],
  },
  ups: {
    label: 'UPS & Υποδομή Ρεύματος',
    fields: [
      { key: 'maker',    label: 'Κατ/στής',           placeholder: 'APC, Eaton' },
      { key: 'model',    label: 'Μοντέλο',             placeholder: '' },
      { key: 'va',       label: 'Ισχύς (VA)',           placeholder: '3000' },
      { key: 'battery',  label: 'Τύπος Μπαταρίας',     placeholder: '' },
      { key: 'lastBat',  label: 'Τελ. Αντ/ση Μπατ.',  placeholder: '', type: 'month' },
      { key: 'nextBat',  label: 'Επόμ. Αντ/ση',        placeholder: '', type: 'month' },
      { key: 'load',     label: 'Φορτίο %',             placeholder: '40' },
      { key: 'status',   label: 'Κατάσταση',            select: EQ_STATUS_OPTS },
      { key: 'notes',    label: 'Σημειώσεις',           placeholder: '', full: true },
    ],
    cols: ['Κατ/στής','Μοντέλο','VA','Τελ. Μπατ.','Φορτίο','Κατάσταση'],
    colKeys: ['maker','model','va','lastBat','load','status'],
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
    cols: ['Κατηγορία','Κατ/στής','Μοντέλο','Τοποθεσία','IP','Κατάσταση'],
    colKeys: ['cat','maker','model','location','ip','status'],
  },
}

function blankItem(category) {
  const base = {}
  CONFIGS[category]?.fields.forEach(f => { base[f.key] = '' })
  base.status = 'Λειτουργεί'
  return base
}

function EditForm({ item, onSave, onCancel }) {
  const [data, setData] = useState({ ...item })
  const cfg = CONFIGS[item._category] || CONFIGS.network

  function set(key, val) { setData(d => ({ ...d, [key]: val })) }

  return (
    <div style={{
      background: 'var(--navy-3)', border: '1px solid var(--border-h)',
      borderRadius: 'var(--r-md)', padding: 16, marginBottom: 12,
    }}>
      <div className="form-grid">
        {cfg.fields.map(f => (
          <div key={f.key} className={`field${f.full ? ' form-full' : ''}`}>
            <label>{f.label}</label>
            {f.select ? (
              <select value={data[f.key] || ''} onChange={e => set(f.key, e.target.value)}>
                {f.select.map(o => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type={f.type || 'text'}
                placeholder={f.placeholder}
                value={data[f.key] || ''}
                onChange={e => set(f.key, e.target.value)}
                style={f.mono ? { fontFamily: 'var(--font-mono)', fontSize: 12 } : {}}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex-center gap-8" style={{ marginTop: 12, justifyContent: 'flex-end' }}>
        <button className="btn btn-sm" onClick={onCancel}>Ακύρωση</button>
        <button className="btn btn-sm btn-primary" onClick={() => onSave(data)}>
          <IconSave size={12} /> Αποθήκευση
        </button>
      </div>
    </div>
  )
}

export default function EquipmentTab({ category, clientId, items = [], onChange, showToast }) {
  const cfg = CONFIGS[category]
  const [editing, setEditing] = useState(null) // null | index | 'new'
  const [saving, setSaving] = useState(false)

  async function handleSave(data) {
    setSaving(true)
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
    } finally {
      setSaving(false)
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

  const newItemBase = { ...blankItem(category), _category: category }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 14 }}>
        <SectionLabel>{cfg.label}</SectionLabel>
        {editing === null && (
          <button className="btn btn-sm btn-primary" onClick={() => setEditing('new')}>
            <IconPlus size={12} /> Προσθήκη
          </button>
        )}
      </div>

      {editing === 'new' && (
        <EditForm
          item={newItemBase}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {items.length === 0 && editing !== 'new' && (
        <div className="empty" style={{ padding: '24px', fontSize: 12 }}>
          Δεν υπάρχει καταγεγραμμένος εξοπλισμός
        </div>
      )}

      {items.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {cfg.cols.map(c => <th key={c}>{c}</th>)}
                <th style={{ width: 70 }}></th>
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
                        <EditForm
                          item={{ ...item, _category: category }}
                          onSave={handleSave}
                          onCancel={() => setEditing(null)}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
