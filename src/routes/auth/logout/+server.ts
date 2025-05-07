// src/routes/auth/logout/+server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
    // Sign out the user using the Supabase client instance from locals
    // The Auth Helpers will handle clearing the session cookies.
    const { error } = await locals.supabase.auth.signOut();

    if (error) {
        // Log the error for server-side debugging
        console.error('Supabase sign out error:', error);
        // Optionally, you could return a specific error response here,
        // but for logout, redirecting is usually sufficient even on error.
        // For a more robust solution, you might want to inform the user.
    }

    // Regardless of signOut error, always attempt to redirect to a public page.
    // This ensures the user is taken out of any authenticated context.
    throw redirect(303, '/'); // Redirect to the homepage after logout
};

// Optional: If you want to allow GET requests to logout (less secure but simpler for direct links initially)
// export const GET: RequestHandler = async ({ locals }) => {
//     await locals.supabase.auth.signOut();
//     throw redirect(303, '/');
// };
// However, POST is recommended for state-changing actions.