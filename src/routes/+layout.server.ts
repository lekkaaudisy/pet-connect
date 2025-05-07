// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    // locals.session is populated by the `handle` hook in `hooks.server.ts`
    // It contains the user's session information if they are logged in, or null otherwise.

    // We return the session here so it's available as `data.session` in the
    // corresponding `+layout.svelte` file and consequently to all child pages.
    return {
        session: locals.session,
        // You could also return locals.user directly if you prefer:
        // user: locals.user
    };
};