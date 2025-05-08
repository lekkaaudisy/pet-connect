// src/routes/+page.server.ts - Potential Problem Area
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    // Check if the user is logged in by inspecting locals.session
    if (locals.session) {
        // If logged in, redirect them away from the public landing page
        throw redirect(303, '/feed');
    }
    // If the user is not logged in, render the landing page.
    return {};
};