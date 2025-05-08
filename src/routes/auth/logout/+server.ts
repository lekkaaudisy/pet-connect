// src/routes/auth/logout/+server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
    console.log('Logout endpoint called. Signing out...'); // Add console log

    const { error } = await locals.supabase.auth.signOut();

    if (error) {
        console.error('Supabase sign out error:', error);
    } else {
        console.log('Supabase signOut successful (cookies should be cleared by helper).'); // Add log
    }

    // Force redirect to '/' after signout attempt
    throw redirect(303, '/');
};