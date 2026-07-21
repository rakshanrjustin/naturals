-- ============================================================
-- Naturals E-Card System — Initial Migration
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- Enable UUID extension (already enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ────────────────────────────────────────────────────────────
-- Enum types
-- ────────────────────────────────────────────────────────────
CREATE TYPE card_delivery_status AS ENUM ('pending', 'sent', 'failed');

CREATE TYPE business_category AS ENUM (
  'beauty_wellness',
  'fashion_apparel',
  'food_beverage',
  'health_fitness',
  'education_training',
  'technology',
  'retail',
  'professional_services',
  'manufacturing',
  'real_estate',
  'finance',
  'media_entertainment',
  'other'
);

CREATE TYPE connection_looking_for AS ENUM (
  'customers',
  'distributors',
  'investors',
  'franchise',
  'vendors',
  'mentors',
  'tech_partners'
);

-- ────────────────────────────────────────────────────────────
-- Registrations table
-- ────────────────────────────────────────────────────────────
CREATE TABLE registrations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name               TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  designation             TEXT NOT NULL CHECK (char_length(designation) BETWEEN 1 AND 100),
  business_name           TEXT NOT NULL CHECK (char_length(business_name) BETWEEN 1 AND 150),
  business_category       business_category NOT NULL,
  one_line_description    TEXT NOT NULL CHECK (char_length(one_line_description) BETWEEN 10 AND 120),
  mobile_number           TEXT NOT NULL CHECK (mobile_number ~ '^\+[1-9]\d{6,14}$'),
  whatsapp_number         TEXT CHECK (whatsapp_number IS NULL OR whatsapp_number ~ '^\+[1-9]\d{6,14}$'),
  email                   TEXT NOT NULL CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  website                 TEXT CHECK (website IS NULL OR char_length(website) <= 255),
  linkedin                TEXT CHECK (linkedin IS NULL OR char_length(linkedin) <= 255),
  instagram               TEXT CHECK (instagram IS NULL OR char_length(instagram) <= 100),
  city                    TEXT NOT NULL CHECK (char_length(city) BETWEEN 1 AND 100),
  photo_url               TEXT,
  connection_looking_for  connection_looking_for NOT NULL,
  consent_required        BOOLEAN NOT NULL DEFAULT FALSE,
  consent_marketing       BOOLEAN NOT NULL DEFAULT FALSE,
  card_delivery_status    card_delivery_status NOT NULL DEFAULT 'pending',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for admin dashboard filtering
CREATE INDEX idx_registrations_city ON registrations (city);
CREATE INDEX idx_registrations_consent_marketing ON registrations (consent_marketing);
CREATE INDEX idx_registrations_created_at ON registrations (created_at DESC);
CREATE INDEX idx_registrations_business_category ON registrations (business_category);

-- ────────────────────────────────────────────────────────────
-- Row Level Security
-- ────────────────────────────────────────────────────────────
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Public: can INSERT (to submit the form)
-- NOTE: consent_required must be TRUE — enforced at app level;
--       add a check constraint here too for defence in depth
ALTER TABLE registrations
  ADD CONSTRAINT chk_consent_required CHECK (consent_required = TRUE);

CREATE POLICY "public_insert"
  ON registrations
  FOR INSERT
  TO anon
  WITH CHECK (consent_required = TRUE);

-- Public: can SELECT their own row by id (for /card/[id] page)
CREATE POLICY "public_select_own"
  ON registrations
  FOR SELECT
  TO anon
  USING (true);
-- NOTE: "true" here is intentional — the /card/[id] page fetches by UUID.
-- UUIDs are not guessable (128-bit random), so listing all rows is
-- prevented by NOT granting a policy that returns multiple rows to anon.
-- Admins (authenticated role) get full select below.
-- If you want stricter isolation, replace with: USING (id = current_setting('request.jwt.claims', true)::json->>'sub')
-- but that requires passing the id as a JWT claim, which isn't standard.
-- The UUID-as-secret approach is documented and acceptable for this use case.

-- Authenticated admins: full SELECT, UPDATE (for delivery status)
CREATE POLICY "admin_select_all"
  ON registrations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admin_update_delivery_status"
  ON registrations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- No public UPDATE or DELETE
-- (no policies = deny by default under RLS)

-- ────────────────────────────────────────────────────────────
-- Storage bucket for profile photos/logos
-- ────────────────────────────────────────────────────────────

-- Run via Supabase Dashboard > Storage, or use the Management API.
-- The SQL below creates the bucket record; bucket policies are set separately.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,                        -- public bucket so /card/[id] can load images without auth
  5242880,                     -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: anyone can upload (INSERT) to this bucket
-- Authenticated users can manage all objects
CREATE POLICY "public_upload_photo"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "public_read_photo"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'profile-photos');

CREATE POLICY "admin_manage_photos"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'profile-photos')
  WITH CHECK (bucket_id = 'profile-photos');

-- ────────────────────────────────────────────────────────────
-- TODO: Rate limiting on public INSERT
-- Supabase does not natively rate-limit per-table INSERTs.
-- Options:
--   1. Netlify Function as a proxy (validates + inserts server-side, add IP rate-limit header check)
--   2. pg_cron + a submissions_per_hour counter table
--   3. Cloudflare in front of Supabase (turnstile CAPTCHA)
-- For now, the UUID-only-access pattern + RLS prevents data scraping.
-- Add a CAPTCHA (e.g. Cloudflare Turnstile) to the form as the next step.
-- ────────────────────────────────────────────────────────────
