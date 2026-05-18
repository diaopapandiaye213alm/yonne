-- platform_settings: key-value store for admin-configurable parameters
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS platform_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: only service role can read/write (API uses supabaseAdmin)
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated access — all access via service role key (API routes)
-- Service role bypasses RLS automatically.

-- Seed default values
INSERT INTO platform_settings (key, value) VALUES
  ('platform_fee_percent', '15'),
  ('fixed_fee',            '100'),
  ('driver_share_percent', '80'),
  ('insurance_percent',    '0.5'),
  ('insurance_min',        '200'),
  ('surge_base',           '1.0'),
  ('surge_peak',           '1.4'),
  ('surge_tabaski',        '2.0'),
  ('paytech_fee_percent',  '2.5'),
  ('referral_bonus',       '5000'),
  ('advance_fee_percent',  '2')
ON CONFLICT (key) DO NOTHING;
