# Naturals E-Card System

Two-sided event lead-capture and digital business card platform for Naturals salon chain entrepreneur networking events.

---

## Quick Start

```bash
cp .env.local.example .env.local
# Fill in your Supabase URL and anon key

npm install
npm run dev
```

Open http://localhost:3000 — redirects to `/register`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Only for Netlify Functions | Never expose client-side |

---

## Database Setup

1. Open your Supabase project → SQL Editor
2. Paste and run the full contents of `supabase/migration_001_initial.sql`
3. This creates: `registrations` table, all enums, RLS policies, and the `profile-photos` storage bucket

### Storage bucket (if SQL INSERT into storage.buckets fails)

Go to Supabase Dashboard → Storage → Create bucket:
- Name: `profile-photos`
- Public: ✅
- Max file size: 5 MB
- Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`

---

## Supabase Auth Setup

Admin users log in via Supabase Auth (email/password). To create an admin:

1. Supabase Dashboard → Authentication → Users → Invite user
2. Or use the Supabase admin API / dashboard to add a user manually

The `/admin/*` routes are protected server-side via middleware using `supabase.auth.getUser()`.

---

## Deployment (Netlify)

1. Push repo to GitHub
2. Import into Netlify
3. Set build command: `npm run build`, publish directory: `.next`
4. Add environment variables in Netlify site settings
5. The `@netlify/plugin-nextjs` plugin is already configured in `netlify.toml`

---

## App Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Redirects to `/register` |
| `/register` | Public | Registration form (photo upload, preview step) |
| `/card/[id]` | Public | Digital e-card with QR, vCard download, WhatsApp share |
| `/admin/login` | Public | Admin sign-in (Supabase Auth) |
| `/admin/dashboard` | Auth-only | Registration table, search/filter, Excel export |

---

## n8n Webhook Integration

When a new row is inserted into the `registrations` table, configure a **Supabase webhook** in your Supabase project (Database → Webhooks) to POST to your n8n workflow URL.

### Trigger

- Table: `registrations`
- Event: `INSERT`
- HTTP method: `POST`

### Payload shape

Supabase sends the following JSON body to your n8n webhook URL:

```json
{
  "type": "INSERT",
  "table": "registrations",
  "schema": "public",
  "record": {
    "id": "uuid-v4-string",
    "full_name": "Priya Sharma",
    "designation": "Founder & CEO",
    "business_name": "Glow Studio",
    "business_category": "beauty_wellness",
    "one_line_description": "We help busy women rediscover confidence through expert styling.",
    "mobile_number": "+919876543210",
    "whatsapp_number": "+919876543210",
    "email": "priya@glowstudio.in",
    "website": "https://glowstudio.in",
    "linkedin": "https://linkedin.com/in/priyasharma",
    "instagram": "@glowstudio",
    "city": "Chennai",
    "photo_url": "https://<project>.supabase.co/storage/v1/object/public/profile-photos/<filename>.jpg",
    "connection_looking_for": "customers",
    "consent_required": true,
    "consent_marketing": true,
    "card_delivery_status": "pending",
    "created_at": "2025-01-15T10:30:00.000Z"
  },
  "old_record": null
}
```

### business_category enum values
`beauty_wellness` · `fashion_apparel` · `food_beverage` · `health_fitness` · `education_training` · `technology` · `retail` · `professional_services` · `manufacturing` · `real_estate` · `finance` · `media_entertainment` · `other`

### connection_looking_for enum values
`customers` · `distributors` · `investors` · `franchise` · `vendors` · `mentors` · `tech_partners`

### card_delivery_status enum values
`pending` (default on insert) · `sent` · `failed`

### Suggested n8n workflow

1. **Webhook node** — receives the POST above
2. **Set node** — extract `record.*` fields
3. **vCard generation** — build a `.vcf` string from the record fields:
   ```
   BEGIN:VCARD
   VERSION:3.0
   FN:{{ record.full_name }}
   ORG:{{ record.business_name }}
   TITLE:{{ record.designation }}
   TEL;TYPE=CELL:{{ record.mobile_number }}
   EMAIL:{{ record.email }}
   URL:{{ record.website }}
   NOTE:{{ record.one_line_description }}
   END:VCARD
   ```
4. **Email node** — send the vCard as attachment to `{{ record.email }}`
5. **Supabase node** — PATCH `registrations` set `card_delivery_status = 'sent'` where `id = {{ record.id }}`
6. **Error branch** — on failure, PATCH `card_delivery_status = 'failed'`

### E-card URL for email body

Construct the profile URL as:
```
https://your-netlify-domain.netlify.app/card/{{ record.id }}
```

### WhatsApp (manual share)

The `/card/[id]` page has a "Share" button that opens `https://wa.me/?text=<encoded message+url>`. No automated WhatsApp send is wired — this is intentional per current scope.

---

## Security Notes

- **Supabase anon key** is safe to expose client-side — RLS policies enforce all access control
- **Service role key** is never in client code; only use it in Netlify Functions if you add server-side admin operations
- Public users can INSERT but cannot SELECT all rows (they can only fetch by exact UUID)
- Admin routes checked server-side via middleware; client-side redirect is not the only guard
- File uploads restricted to `image/*` MIME types and 5 MB at the Storage bucket policy level

### TODO: Rate limiting

Currently no hard rate limit on the public `/register` form. Options:
1. Add Cloudflare Turnstile CAPTCHA to the form
2. Wrap the Supabase INSERT in a Netlify Function that checks an IP-based counter
3. Enable Supabase's built-in rate limits (available on Pro plan)

---

## Project Structure

```
app/
  page.tsx                  → redirects to /register
  register/page.tsx         → public registration form
  card/[id]/
    page.tsx                → server component (fetches from Supabase)
    CardClient.tsx          → client component (QR, vCard, share)
  admin/
    login/page.tsx          → Supabase Auth sign-in
    dashboard/
      page.tsx              → server component (auth check + data fetch)
      DashboardClient.tsx   → client component (filter, table, export)
  not-found.tsx
  layout.tsx
  globals.css

components/
  HeartbeatLoader.tsx       → brand-consistent loading screen

lib/
  types.ts                  → shared TypeScript types + enum maps
  supabase/
    client.ts               → browser Supabase client
    server.ts               → server Supabase client
    middleware.ts           → session refresh + route protection

middleware.ts               → Next.js middleware (protects /admin/*)
supabase/
  migration_001_initial.sql → full DB migration
netlify.toml                → build + security headers config
```
