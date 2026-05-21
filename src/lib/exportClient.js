// exportClient.js — Εξαγωγή καρτέλας πελάτη σε Excel
// Τοποθετήστε στο: src/lib/exportClient.js

import * as XLSX from 'xlsx'

function toGR(val) {
  if (!val) return ''
  const parts = val.split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return val
}

export function exportClientToExcel(client, equipment, visits) {
  const wb = XLSX.utils.book_new()

  // ── Sheet 1: Στοιχεία Πελάτη ──
  const info = [
    ['ΚΑΡΤΕΛΑ ΠΕΛΑΤΗ', ''],
    ['', ''],
    ['Επωνυμία', client.name || ''],
    ['ΑΦΜ', client.afm || ''],
    ['Διεύθυνση', client.address || ''],
    ['Τηλέφωνο', client.phone || ''],
    ['Email', client.email || ''],
    ['Υπεύθυνος', client.contact || ''],
    ['Κινητό', client.contact_mobile || ''],
    ['', ''],
    ['ΕΓΚΑΤΑΣΤΑΣΗ', ''],
    ['Server Room', client.server_room || ''],
    ['WiFi', client.wifi || ''],
    ['Πάροχος', client.isp || ''],
    ['Σύνδεση', client.isp_type || ''],
    ['Public IP', client.public_ip || ''],
    ['', ''],
    ['ΣΥΜΒΑΣΗ', ''],
    ['Αριθμός', client.contract || ''],
    ['SLA', client.sla || ''],
    ['Έναρξη', toGR(client.contract_start)],
    ['Λήξη', toGR(client.contract_end)],
    ['Ώρες', client.support_hours || ''],
    ['Χρέωση', client.billing || ''],
    ['', ''],
    ['Κατάσταση', client.status === 'ok' ? 'Κανονική' : client.status === 'warn' ? 'Εκκρεμότητες' : 'Πρόβλημα'],
    ['Τελ. Επίσκεψη', toGR(client.last_visit)],
    ['Σημειώσεις', client.notes || ''],
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(info)
  ws1['!cols'] = [{ wch: 22 }, { wch: 45 }]
  ws1['A1'].s = { font: { bold: true, sz: 14 } }
  XLSX.utils.book_append_sheet(wb, ws1, '📋 Στοιχεία')

  // ── Sheet 2: Δικτυακός Εξοπλισμός ──
  const netHeaders = ['Τύπος', 'Κατ/στής', 'Μοντέλο', 'S/N', 'IP', 'Θέση', 'Firmware', 'Κατάσταση', 'Εγγύηση', 'Σημειώσεις']
  const netRows = (equipment.network || []).map(e => [
    e.type||'', e.maker||'', e.model||'', e.sn||'', e.ip||'',
    e.location||'', e.firmware||'', e.status||'', e.warranty||'', e.notes||''
  ])
  const ws2 = XLSX.utils.aoa_to_sheet([netHeaders, ...netRows])
  ws2['!cols'] = netHeaders.map(() => ({ wch: 18 }))
  XLSX.utils.book_append_sheet(wb, ws2, '🌐 Δίκτυο')

  // ── Sheet 3: Servers ──
  const srvHeaders = ['Hostname', 'Τύπος', 'Κατ/στής', 'Μοντέλο', 'CPU', 'RAM', 'Storage', 'OS', 'IP', 'Ρόλος', 'Κατάσταση', 'Εγγύηση']
  const srvRows = (equipment.servers || []).map(e => [
    e.hostname||'', e.type||'', e.maker||'', e.model||'',
    e.cpu||'', e.ram||'', e.storage||'', e.os||'',
    e.ip||'', e.role||'', e.status||'', e.warranty||''
  ])
  const ws3 = XLSX.utils.aoa_to_sheet([srvHeaders, ...srvRows])
  ws3['!cols'] = srvHeaders.map(() => ({ wch: 16 }))
  XLSX.utils.book_append_sheet(wb, ws3, '🖥️ Servers')

  // ── Sheet 4: Σταθμοί ──
  const wsHeaders = ['Τύπος', 'Χρήστης', 'Κατ/στής', 'Μοντέλο', 'S/N', 'OS', 'CPU/RAM', 'IP', 'Domain', 'Κατάσταση', 'Εγγύηση']
  const wsRows = (equipment.workstations || []).map(e => [
    e.type||'', e.user||'', e.maker||'', e.model||'', e.sn||'',
    e.os||'', e.cpu||'', e.ip||'', e.domain||'', e.status||'', e.warranty||''
  ])
  const ws4 = XLSX.utils.aoa_to_sheet([wsHeaders, ...wsRows])
  ws4['!cols'] = wsHeaders.map(() => ({ wch: 16 }))
  XLSX.utils.book_append_sheet(wb, ws4, '💻 Σταθμοί')

  // ── Sheet 5: UPS ──
  const upsHeaders = ['Κατ/στής', 'Μοντέλο', 'Ισχύς (VA)', 'Μπαταρία', 'Τελ. Αντ/ση', 'Επόμ. Αντ/ση', 'Φορτίο %', 'Κατάσταση', 'Σημειώσεις']
  const upsRows = (equipment.ups || []).map(e => [
    e.maker||'', e.model||'', e.va||'', e.battery||'',
    e.lastBat||'', e.nextBat||'', e.load||'', e.status||'', e.notes||''
  ])
  const ws5 = XLSX.utils.aoa_to_sheet([upsHeaders, ...upsRows])
  ws5['!cols'] = upsHeaders.map(() => ({ wch: 16 }))
  XLSX.utils.book_append_sheet(wb, ws5, '⚡ UPS')

  // ── Sheet 6: Τηλεφωνία ──
  const phHeaders = ['Κατηγορία', 'Κατ/στής', 'Μοντέλο', 'S/N', 'Τοποθεσία', 'IP/Αρ.', 'Firmware', 'Κατάσταση', 'Σημειώσεις']
  const phRows = (equipment.phones || []).map(e => [
    e.cat||'', e.maker||'', e.model||'', e.sn||'',
    e.location||'', e.ip||'', e.firmware||'', e.status||'', e.notes||''
  ])
  const ws6 = XLSX.utils.aoa_to_sheet([phHeaders, ...phRows])
  ws6['!cols'] = phHeaders.map(() => ({ wch: 16 }))
  XLSX.utils.book_append_sheet(wb, ws6, '📞 Τηλεφωνία')

  // ── Sheet 7: Ιστορικό ──
  const histHeaders = ['Ημερομηνία', 'Τεχνικός', 'Τύπος', 'Εργασίες', 'Εκκρεμότητες', 'Κατάσταση']
  const histRows = (visits || []).map(v => [
    toGR(v.visit_date), v.tech_name||'', v.visit_type||'',
    v.work_done||'', v.pending||'', v.status||''
  ])
  const ws7 = XLSX.utils.aoa_to_sheet([histHeaders, ...histRows])
  ws7['!cols'] = [{ wch: 14 }, { wch: 20 }, { wch: 16 }, { wch: 40 }, { wch: 30 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(wb, ws7, '📅 Ιστορικό')

  // ── Αποθήκευση ──
  const filename = `${(client.name || 'pelatis').replace(/[^a-zA-Zα-ωΑ-Ω0-9\s]/g, '').trim()}_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, filename)
}
