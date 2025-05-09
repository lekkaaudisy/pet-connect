// src/routes/pets/[petId=uuid]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
    const { petId } = params;
    const { supabase, session } = locals;

    console.log(`[Pet Profile Load] Loading pet profile for ID: ${petId}`);

    // Fetch the pet's details
    // We also fetch the owner's username for display purposes
    const { data: pet, error: dbError } = await supabase
        .from('pets')
        .select(`
            *,
            user:users ( id, username, profile_picture_url )
        `)
        .eq('id', petId)
        .single(); // Use single() as we expect one pet or an error

    if (dbError) {
        console.error(`[Pet Profile Load] Database error fetching pet ${petId}:`, dbError.message);
        if (dbError.code === 'PGRST116') { // PGRST116: "Searched for a single row, but found no rows" or "found multiple rows"
            throw error(404, 'Pet not found');
        }
        throw error(500, `Server error: Unable to retrieve pet profile. ${dbError.message}`);
    }

    if (!pet) { // Should be caught by dbError.code === 'PGRST116' with .single(), but as a fallback
        console.log(`[Pet Profile Load] Pet not found for ID: ${petId}`);
        throw error(404, 'Pet not found');
    }

    // Determine if the logged-in user is the owner of this pet
    // The 'user' field in the pet object is the owner's profile from the 'users' table due to the join.
    const isOwner = session?.user?.id === pet.user_id;
    // Or more directly using the joined user object:
    // const isOwner = session?.user?.id === pet.user?.id;


    console.log(`[Pet Profile Load] Pet data found for ${pet.name}. Owner: ${pet.user?.username}, Is current user owner: ${isOwner}`);

    return {
        pet,         // The pet object, including the joined owner's username
        isOwner      // Boolean indicating if the current session user is the pet's owner
    };
};