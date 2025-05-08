/* eslint-disable @typescript-eslint/no-unused-vars */
// src/routes/profile/[identifier]/+page.server.ts
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import isUUID from 'validator/lib/isUUID'; // Helper to check if identifier is a UUID

export const load: PageServerLoad = async ({ params, locals }) => {
    const { identifier } = params;
    const { supabase } = locals; // Use Supabase client from locals

    console.log(`[Profile Load] Loading profile for identifier: ${identifier}`);

    let profileData = null;
    let queryError = null;

    // Determine if the identifier is likely a UUID (user ID) or a username (string)
    // We'll query based on that assumption.
    if (isUUID(identifier)) {
        // Assume it's a user ID (UUID)
        const { data, error: dbError } = await supabase
            .from('users')
            .select('id, username, email, full_name, profile_picture_url, created_at') // Select desired public fields
            .eq('id', identifier)
            .maybeSingle(); // Use maybeSingle() in case the ID doesn't exist

        profileData = data;
        queryError = dbError;

    } else {
        // Assume it's a username (string)
         const { data, error: dbError } = await supabase
            .from('users')
            .select('id, username, email, full_name, profile_picture_url, created_at') // Select desired public fields
            .eq('username', identifier)
            .maybeSingle(); // Use maybeSingle() in case the username doesn't exist

        profileData = data;
        queryError = dbError;
    }


    if (queryError) {
        // Don't throw critical error, just log it and let page handle potentially null profile
        console.error(`[Profile Load] Error fetching profile for ${identifier}:`, queryError.message);
        // You could potentially throw a 500 error here if database errors are critical
        // throw error(500, `Database error: ${queryError.message}`);
    }

    if (!profileData) {
        // If no profile was found by either ID or username
        console.log(`[Profile Load] Profile not found for identifier: ${identifier}`);
        throw error(404, 'User profile not found'); // Throw a 404 Not Found error
    }

    // Determine if the logged-in user is viewing their own profile
    const isOwnProfile = locals.session?.user?.id === profileData.id;

    console.log(`[Profile Load] Profile data found for ${identifier}. Is own profile: ${isOwnProfile}`);

    // Return the fetched profile data and ownership status
    return {
        profile: profileData,
        isOwnProfile: isOwnProfile
    };
};