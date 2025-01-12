import { createClient } from '@supabase/supabase-js';

// Temporary placeholder values until Supabase is connected
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://placeholder-url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase credentials not found. Please click "Connect to Supabase" button in the top right corner to set up your database.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);