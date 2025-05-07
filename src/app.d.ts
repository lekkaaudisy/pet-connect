// src/app.d.ts
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';

declare global {
    namespace App {
        interface Locals {
            supabase: SupabaseClient;
            session: Session | null;
            user: User | null; // Add user if you are setting it
        }
        interface PageData {
            session?: Session | null; // Optional: if you pass session to page data from a root +layout.server.js
        }
        // interface Error {}
        // interface Platform {}
    }
}

export {}; // Important: This makes the file a module