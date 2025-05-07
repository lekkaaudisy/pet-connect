// src/lib/server/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// This client is intended for server-side use (e.g., in +page.server.js, +server.js)
// It uses the anon key, but for sensitive operations, you'd typically use a service_role key
// securely stored and only accessible on the server. For now, anon key is fine for setup.
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);