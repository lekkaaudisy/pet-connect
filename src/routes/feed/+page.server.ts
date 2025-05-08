// src/routes/feed/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    // Check if the user is logged in
    if (!locals.session) {
        // If not logged in, redirect them to the login page
        throw redirect(303, '/auth/login');
    }

    // If logged in, return the user object (or necessary parts)
    // so the +page.svelte can display personalized info like username.
    // `locals.user` is populated by hooks.server.ts
    return {
        user: locals.user
    };
};