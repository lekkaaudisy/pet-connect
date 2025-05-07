// src/lib/server/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// This client is intended for server-side use (e.g., in +page.server.js, +server.js)
// It uses the anon key. For most server-side auth operations (like signUp, signIn),
// this is appropriate as Supabase's RLS and built-in auth logic handle security.
// For operations requiring elevated privileges bypassing RLS (rarely needed directly in app code,
// usually handled by database functions/triggers with SECURITY DEFINER), a service_role key client would be used,
// BUT that key must NEVER be exposed to the browser.
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);