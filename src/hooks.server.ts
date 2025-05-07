// src/hooks.server.ts
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    // Create a Supabase client specific to this server-side request
    event.locals.supabase = createSupabaseServerClient({
        supabaseUrl: PUBLIC_SUPABASE_URL,
        supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
        event: event, // Pass the SvelteKit event
    });

    /**
     * Gets the session from the request cookies.
     * IMPORTANT:
     *   This `getSession` method **must be called** for the server-side client to be able
     *   to establish a session from the cookies. It reads the Supabase auth cookies.
     *   Not calling this will result in `event.locals.supabase.auth.getUser()` returning null
     *   or an error, and RLS policies based on `auth.uid()` will not work correctly.
     */
    const { data: { session } } = await event.locals.supabase.auth.getSession();
    event.locals.session = session; // Make the session available on `event.locals`

    /**
     * getUser() will use the session from getSession() to return the authenticated user.
     * This is optional if you only need the session object, but often useful to have the user object directly.
     */
    const { data: { user } } = await event.locals.supabase.auth.getUser();
    event.locals.user = user; // Make the user object available on `event.locals`


    // Resolve the request, passing down the modified event with .locals populated.
    // The `filterSerializedResponseHeaders` is important for Supabase Auth Helpers
    // to correctly handle cookies during form actions and server-side data loads.
    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range' || name === 'x-supabase-api-version';
        },
    });
};