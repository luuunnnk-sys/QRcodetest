import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://0ec90b57d6e95fcbda19832f.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw';

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
