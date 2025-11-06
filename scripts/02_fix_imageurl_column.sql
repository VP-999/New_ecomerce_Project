-- Migration: Fix imageurl column size issue
-- This script updates the imageurl column from VARCHAR(500) to TEXT
-- Run this in your Supabase SQL Editor if you're getting "value too long" errors

-- Step 1: Alter the column type to TEXT
ALTER TABLE products 
ALTER COLUMN imageurl TYPE TEXT;

-- Verify the change
-- SELECT column_name, data_type, character_maximum_length 
-- FROM information_schema.columns 
-- WHERE table_name = 'products' AND column_name = 'imageurl';

