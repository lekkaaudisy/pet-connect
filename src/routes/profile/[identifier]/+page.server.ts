/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/routes/profile/[identifier]/+page.server.ts
import { error } from '@sveltejs/kit'; // Removed `fail` as it's not used here
import type { PageServerLoad } from './$types';
import isUUID from 'validator/lib/isUUID';

export const load: PageServerLoad = async ({ params, locals }) => {
    const { identifier } = params;
    const { supabase, session } = locals; // Destructure session for easier access

    console.log(`[User Profile Load] Loading profile and pets for identifier: ${identifier}`);

    let userProfileData: any = null; // Using 'any' for now, can be typed more strictly later
    let userPetsData: any[] = [];   // Initialize as empty array
     
    let queryError: any = null;

    // Determine if the identifier is a UUID (user ID) or a username
     
    let queryField = isUUID(identifier) ? 'id' : 'username';
    let queryValue = identifier;

    // Fetch user profile data
    const { data: profile, error: profileDbError } = await supabase
        .from('users')
        .select('id, username, email, full_name, profile_picture_url, created_at')
        .eq(queryField, queryValue)
        .single(); // Use single() as we expect one user or an error

    if (profileDbError) {
        console.error(`[User Profile Load] Error fetching user profile for ${identifier}:`, profileDbError.message);
        if (profileDbError.code === 'PGRST116') {
            throw error(404, 'User profile not found');
        }
        throw error(500, `Server error: Unable to retrieve user profile. ${profileDbError.message}`);
    }

    if (!profile) { // Should be caught by PGRST116, but as a fallback
        throw error(404, 'User profile not found');
    }
    userProfileData = profile;

    // If user profile is found, fetch their pets
    const { data: pets, error: petsDbError } = await supabase
        .from('pets')
        .select('id, name, species, profile_picture_url') // Select only needed fields for the list
        .eq('user_id', userProfileData.id) // Match pets by the found user's ID
        .order('created_at', { ascending: false }); // Order by most recently added

    if (petsDbError) {
        // Log error but don't necessarily fail the whole page load if pets can't be fetched
        console.error(`[User Profile Load] Error fetching pets for user ${userProfileData.id}:`, petsDbError.message);
    } else {
        userPetsData = pets || []; // Ensure userPetsData is an array
    }

    const isOwnProfile = session?.user?.id === userProfileData.id;

    console.log(`[User Profile Load] User Profile: ${userProfileData.username}, Pets found: ${userPetsData.length}, Is own profile: ${isOwnProfile}`);

    return {
        profile: userProfileData,
        pets: userPetsData, // Pass the pets array to the page
        isOwnProfile: isOwnProfile
    };
};