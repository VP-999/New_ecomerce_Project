-- Create Users Table (Demo)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  password_salt TEXT,
  address TEXT,
  role VARCHAR(50) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Backward compat: drop plaintext password column if it exists (safe no-op on failure)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='password'
  ) THEN
    ALTER TABLE users DROP COLUMN password;
  END IF;
END $$;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read users" ON users FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Allow public insert users" ON users FOR INSERT TO PUBLIC WITH CHECK (true);
CREATE POLICY "Allow public update users" ON users FOR UPDATE TO PUBLIC USING (true);
