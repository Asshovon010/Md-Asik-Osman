import { createClient } from '@supabase/supabase-js';

// REPLACE THESE WITH YOUR ACTUAL SUPABASE CREDENTIALS
const SUPABASE_URL = "https://ueccwrjcqwtvgzmistyo.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_nYj7n4TdZzN4Ef8EdpcrwA_eAD6LqZ_";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
  auth: {
    storage: sessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});