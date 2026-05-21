-- ============================================================
-- IT Inventory Pro — Supabase SQL Schema
-- Εκτελέστε στο: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Profiles (συνδεδεμένο με auth.users)
create table if not exists profiles (
  id        uuid primary key references auth.users(id) on delete cascade,
  name      text not null,
  email     text,
  role      text not null default 'tech' check (role in ('admin','tech'))
);

-- Αυτόματη δημιουργία profile όταν εγγράφεται χρήστης
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'tech')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Clients
create table if not exists clients (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  afm              text,
  address          text,
  phone            text,
  email            text,
  contact          text,
  contact_mobile   text,
  server_room      text,
  wifi             text,
  isp              text,
  isp_type         text,
  public_ip        text,
  sla              text,
  contract         text,
  contract_start   date,
  contract_end     date,
  support_hours    text,
  billing          text,
  tech_id          uuid references auth.users(id),
  status           text not null default 'ok' check (status in ('ok','warn','err')),
  last_visit       date,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger clients_updated_at before update on clients
  for each row execute procedure update_updated_at();

-- 3. Equipment (JSONB — ευέλικτο schema ανά κατηγορία)
create table if not exists equipment (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references clients(id) on delete cascade,
  category    text not null,  -- network | servers | workstations | ups | phones
  data        jsonb not null default '{}',
  created_at  timestamptz not null default now()
);
create index if not exists equipment_client_id_idx on equipment(client_id);

-- 4. Visits (Ιστορικό επισκέψεων)
create table if not exists visits (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references clients(id) on delete cascade,
  tech_id     uuid references auth.users(id),
  tech_name   text,
  visit_date  date not null default current_date,
  visit_type  text,
  work_done   text,
  status      text default 'Ολοκληρώθηκε',
  pending     text,
  created_at  timestamptz not null default now()
);
create index if not exists visits_client_id_idx on visits(client_id);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles  enable row level security;
alter table clients   enable row level security;
alter table equipment enable row level security;
alter table visits    enable row level security;

-- Profiles: readable by all authenticated
create policy "profiles_select" on profiles for select
  to authenticated using (true);

create policy "profiles_update_own" on profiles for update
  to authenticated using (id = auth.uid());

-- Helper: is current user admin?
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;

-- Clients: admin sees all, tech sees own
create policy "clients_select" on clients for select to authenticated
  using (tech_id = auth.uid() or is_admin());

create policy "clients_insert" on clients for insert to authenticated
  with check (tech_id = auth.uid() or is_admin());

create policy "clients_update" on clients for update to authenticated
  using (tech_id = auth.uid() or is_admin());

create policy "clients_delete" on clients for delete to authenticated
  using (is_admin());

-- Equipment: follows client access
create policy "equipment_select" on equipment for select to authenticated
  using (exists (
    select 1 from clients where id = client_id
    and (tech_id = auth.uid() or is_admin())
  ));

create policy "equipment_insert" on equipment for insert to authenticated
  with check (exists (
    select 1 from clients where id = client_id
    and (tech_id = auth.uid() or is_admin())
  ));

create policy "equipment_update" on equipment for update to authenticated
  using (exists (
    select 1 from clients where id = client_id
    and (tech_id = auth.uid() or is_admin())
  ));

create policy "equipment_delete" on equipment for delete to authenticated
  using (exists (
    select 1 from clients where id = client_id
    and (tech_id = auth.uid() or is_admin())
  ));

-- Visits: follows client access
create policy "visits_select" on visits for select to authenticated
  using (exists (
    select 1 from clients where id = client_id
    and (tech_id = auth.uid() or is_admin())
  ));

create policy "visits_insert" on visits for insert to authenticated
  with check (exists (
    select 1 from clients where id = client_id
    and (tech_id = auth.uid() or is_admin())
  ));

create policy "visits_delete" on visits for delete to authenticated
  using (tech_id = auth.uid() or is_admin());

-- ============================================================
-- Demo data (προαιρετικό — διαγράψτε αν δεν θέλετε)
-- Σημ: Αντικαταστήστε τα UUIDs με πραγματικούς χρήστες σας
-- ============================================================
-- insert into clients (name, afm, address, phone, contact, sla, status, notes, tech_id)
-- values ('Kantor Α.Ε.', '123456789', 'Αθήνα, Συγγρού 15', '2101234567', 'Γιώργος Ηλίας', '4h on-site', 'warn', 'Αντικατάσταση switches εκκρεμεί', '<YOUR_TECH_USER_ID>');
