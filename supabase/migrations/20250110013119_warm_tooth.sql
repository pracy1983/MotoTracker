/*
  # Add cilindradas column to motocicletas table

  1. Changes
    - Add `cilindradas` column to `motocicletas` table
    - Set default value to 0
    - Make column NOT NULL to ensure data consistency

  2. Notes
    - Uses safe migration pattern with IF NOT EXISTS check
    - Preserves existing data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'motocicletas' AND column_name = 'cilindradas'
  ) THEN
    ALTER TABLE motocicletas 
    ADD COLUMN cilindradas integer NOT NULL DEFAULT 0;
  END IF;
END $$;