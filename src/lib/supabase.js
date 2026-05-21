import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars. Copy .env.example to .env and fill in your project credentials.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Auth helpers ──────────────────────────────────────────────────────────────

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

// ── Clients ───────────────────────────────────────────────────────────────────

export async function fetchClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function fetchClient(id) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function upsertClient(client) {
  const { data, error } = await supabase
    .from('clients')
    .upsert(client)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteClient(id) {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw error
}

// ── Equipment ─────────────────────────────────────────────────────────────────

export async function fetchEquipment(clientId) {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('client_id', clientId)
    .order('category')
  if (error) throw error
  // Convert array of rows into { category: [items] } map
  return (data || []).reduce((acc, row) => {
    if (!acc[row.category]) acc[row.category] = []
    acc[row.category].push({ _id: row.id, ...row.data })
    return acc
  }, {})
}

export async function upsertEquipmentItem(clientId, category, item) {
  const { _id, ...data } = item
  if (_id) {
    const { error } = await supabase
      .from('equipment')
      .update({ data })
      .eq('id', _id)
    if (error) throw error
    return _id
  } else {
    const { data: row, error } = await supabase
      .from('equipment')
      .insert({ client_id: clientId, category, data })
      .select('id')
      .single()
    if (error) throw error
    return row.id
  }
}

export async function deleteEquipmentItem(id) {
  const { error } = await supabase.from('equipment').delete().eq('id', id)
  if (error) throw error
}

// ── Visits ────────────────────────────────────────────────────────────────────

export async function fetchVisits(clientId) {
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('client_id', clientId)
    .order('visit_date', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchAllVisits() {
  const { data, error } = await supabase
    .from('visits')
    .select('*, clients(name)')
    .order('visit_date', { ascending: false })
    .limit(100)
  if (error) throw error
  return data || []
}

export async function insertVisit(visit) {
  const { data, error } = await supabase
    .from('visits')
    .insert(visit)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteVisit(id) {
  const { error } = await supabase.from('visits').delete().eq('id', id)
  if (error) throw error
}

// ── Profiles (admin) ──────────────────────────────────────────────────────────

export async function fetchProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('name')
  if (error) throw error
  return data || []
}
