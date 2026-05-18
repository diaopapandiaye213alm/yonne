-- Add region + city columns to orders, merchants, drivers
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS city   TEXT;

ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS city   TEXT;

ALTER TABLE drivers
  ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'Dakar',
  ADD COLUMN IF NOT EXISTS city   TEXT DEFAULT '';

-- Region coverage configuration table
CREATE TABLE IF NOT EXISTS region_coverage (
  region            TEXT PRIMARY KEY,
  active            BOOLEAN     NOT NULL DEFAULT true,
  surge_multiplier  NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  base_fee          NUMERIC(10,0) NOT NULL DEFAULT 1000,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Sénégal regions
INSERT INTO region_coverage (region, active, surge_multiplier, base_fee)
VALUES
  ('Dakar',         true,  1.0,  900),
  ('Thiès',         true,  1.0, 1200),
  ('Saint-Louis',   true,  1.0, 1500),
  ('Diourbel',      true,  1.0, 1400),
  ('Fatick',        false, 1.0, 1600),
  ('Kaolack',       true,  1.0, 1400),
  ('Kaffrine',      false, 1.0, 1700),
  ('Tambacounda',   false, 1.0, 2000),
  ('Kédougou',      false, 1.0, 2500),
  ('Kolda',         false, 1.0, 2200),
  ('Ziguinchor',    false, 1.0, 2000),
  ('Sédhiou',       false, 1.0, 2200),
  ('Louga',         true,  1.0, 1600),
  ('Matam',         false, 1.0, 2000)
ON CONFLICT (region) DO NOTHING;

-- Enable RLS
ALTER TABLE region_coverage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_coverage" ON region_coverage
  FOR ALL USING (true);  -- restricted by API layer (admin role check)
