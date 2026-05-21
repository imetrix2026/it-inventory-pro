# IT Inventory Pro

Εφαρμογή καταγραφής δικτύου & εξοπλισμού IT με cloud αποθήκευση.

**Stack:** React + Vite · Supabase (PostgreSQL + Auth) · Vercel

---

## Γρήγορη Εγκατάσταση (15 λεπτά)

### Βήμα 1 — Supabase

1. Πηγαίνετε στο [supabase.com](https://supabase.com) → **New Project**
2. Δώστε όνομα και κωδικό βάσης → Create
3. Περιμένετε ~2 λεπτά να ετοιμαστεί
4. **SQL Editor** → επικολλήστε και εκτελέστε ολόκληρο το `supabase_schema.sql`
5. **Authentication → Users** → Add User για κάθε τεχνικό
   - Για admin: στο metadata προσθέστε `{"role": "admin", "name": "Ανδρέας Κοντός"}`
   - Για τεχνικό: `{"role": "tech", "name": "Νίκος Μαμαλικόπουλος"}`
6. **Project Settings → API** → αντιγράψτε:
   - `Project URL`
   - `anon public` key

### Βήμα 2 — Τοπική εκτέλεση

```bash
# Αντιγράψτε το .env.example
cp .env.example .env

# Συμπληρώστε το .env με τα στοιχεία Supabase:
VITE_SUPABASE_URL=https://YOURPROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Εγκατάσταση dependencies
npm install

# Εκκίνηση
npm run dev
# → http://localhost:5173
```

### Βήμα 3 — Deploy στο Vercel (δωρεάν)

```bash
npm install -g vercel
vercel
```

Στο Vercel Dashboard → Settings → Environment Variables προσθέστε:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Μετά: `vercel --prod`

---

## Δομή Αρχείων

```
src/
├── lib/
│   ├── supabase.js        # Supabase client + όλα τα queries
│   └── AuthContext.jsx    # Session management
├── components/
│   ├── Layout.jsx         # Topbar + Sidebar
│   ├── UI.jsx             # Icons, Toast, Tags, Avatar
│   └── EquipmentTab.jsx   # Γενικό component για εξοπλισμό
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── ClientsPage.jsx
│   ├── ClientDetailPage.jsx  # Φόρμα με 8 tabs
│   └── OtherPages.jsx        # History + Admin
└── App.jsx                # Router + auth guards
```

---

## Ασφάλεια

- **JWT tokens** — Supabase Auth χειρίζεται το login
- **Row Level Security** — κάθε τεχνικός βλέπει μόνο τους δικούς του πελάτες
- **Admin role** — admin βλέπει τα πάντα, μπορεί να αναθέσει πελάτες σε τεχνικούς
- Οι κωδικοί **δεν αποθηκεύονται** πουθενά στον κώδικα

---

## Κόστος

| Υπηρεσία | Δωρεάν tier |
|----------|------------|
| Supabase | 500MB DB · 50K αιτήσεις/μήνα |
| Vercel   | Unlimited deploys · custom domain |
| **Σύνολο** | **€0/μήνα** |

Για περισσότερους τεχνικούς ή μεγαλύτερη βάση: Supabase Pro = $25/μήνα.

---

## Προσθήκη Νέου Τεχνικού

1. Supabase Dashboard → Authentication → Users → Invite User
2. Ή: Add User με email + password
3. Στο `raw_user_meta_data`: `{"role": "tech", "name": "Ονοματεπώνυμο"}`

---

## Συχνές Ερωτήσεις

**Μπορώ να προσθέσω custom πεδία;**
Ναι — το equipment αποθηκεύεται ως JSONB, οποιαδήποτε αλλαγή στο `EquipmentTab.jsx` → `CONFIGS` αντικατοπτρίζεται αμέσως.

**Υπάρχει mobile έκδοση;**
Η εφαρμογή είναι responsive — λειτουργεί από tablet/κινητό μέσω browser.

**Πώς κάνω backup;**
Supabase Dashboard → Database → Backups (αυτόματα daily backups στο Pro tier).
