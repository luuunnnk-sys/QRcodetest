import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase env vars:', { supabaseUrl, supabaseAnonKey });
  throw new Error('Missing Supabase environment variables. Please restart the dev server.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Event {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  secret_key: string;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  event_id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  qr_code_data: string;
  created_at: string;
}

export interface CheckIn {
  id: string;
  participant_id: string;
  scanner_name: string;
  scanner_email?: string;
  checked_in_at: string;
  is_duplicate: boolean;
}
