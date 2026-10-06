import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Customer Auth
export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      storageKey: 'bakery-customer-auth',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

// Admin Auth
export const adminSupabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      storageKey: 'bakery-admin-auth',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)