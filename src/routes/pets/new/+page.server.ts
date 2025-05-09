/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/routes/pets/new/+page.server.ts
import { z } from 'zod';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabase } from '$lib/server/supabaseClient'; // Use direct import OR locals.supabase
// Note: For file uploads, sometimes direct import is simpler than passing through locals setup,
// but using locals.supabase is generally preferred for consistency if your hooks setup handles it well.
// Let's use locals.supabase for consistency.

// Zod schema for validation - adjust based on your exact requirements
const petSchema = z.object({
    name: z.string().min(1, 'Pet name is required.').max(100),
    species: z.string().min(1, 'Species is required.').max(50),
    breed: z.string().max(100).optional().nullable(),
    birth_date: z.string().refine((val) => !val || !isNaN(Date.parse(val)), { // Optional, check if valid date if provided
        message: "Invalid date format.",
    }).optional().nullable(),
    color: z.string().max(100).optional().nullable(),
    distinguishing_features: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
    profile_picture: z.instanceof(File, { message: 'Profile picture is required.' }) // Check if it's a file object initially
        .refine(f => f.size === 0 || f.type.startsWith("image/"), 'File must be an image.') // Allow empty file initially, or check type
        .refine(f => f.size < 5 * 1024 * 1024, 'Max 5MB upload size.') // 5MB limit
        .optional() // Make the File object itself optional
});

// Define types for consistent return structure
type PetFieldErrors = z.inferFlattenedErrors<typeof petSchema>['fieldErrors'];
type PetFormData = {
    name?: string;
    species?: string;
    breed?: string;
    birth_date?: string;
    color?: string;
    distinguishing_features?: string;
    bio?: string;
    // No file data sent back
};

// Ensure user is logged in to access this page
export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.session) {
        throw redirect(303, '/auth/login');
    }
    return {}; // No specific data needed to load the form page itself
};


export const actions: Actions = {
    default: async ({ request, locals }) => {
        // Ensure user is logged in to perform this action
        const session = locals.session;
        if (!session?.user) {
            return fail(401, { error: 'Unauthorized. Please log in.', data: undefined, errors: undefined });
        }

        const formData = await request.formData();
        const formEntries = Object.fromEntries(formData);

        // Add the file object directly for Zod validation
        const profilePictureFile = formData.get('profile_picture') as File | null;
        const validationData = {
            ...formEntries,
            profile_picture: profilePictureFile && profilePictureFile.size > 0 ? profilePictureFile : undefined // Pass file only if it exists and isn't empty
        };

        const validationResult = petSchema.safeParse(validationData);

        // Prepare data to send back in case of error (excluding file)
        const { profile_picture: _file, ...restOfData } = formEntries;
        const returnData: PetFormData = restOfData;

        if (!validationResult.success) {
            console.log('Zod Validation Errors:', validationResult.error.flatten());
            return fail(400, {
                data: returnData,
                errors: validationResult.error.flatten().fieldErrors as PetFieldErrors,
                error: 'Please correct the errors in the form.'
            });
        }

        // --- File Upload Logic ---
        let profilePictureUrl: string | null = null;
        if (profilePictureFile && profilePictureFile.size > 0) {
            try {
                // Generate a unique file path: user_id/pet_images/random_uuid.extension
                const fileExt = profilePictureFile.name.split('.').pop();
                const randomUUID = crypto.randomUUID(); // Use built-in crypto for randomness
                const filePath = `${session.user.id}/pet_images/${randomUUID}.${fileExt}`;

                // Use locals.supabase (or direct import if preferred/simpler for storage)
                const { data: uploadData, error: uploadError } = await locals.supabase.storage
                    .from('pet-profiles') // YOUR BUCKET NAME - Create this in Supabase Storage UI
                    .upload(filePath, profilePictureFile, {
                        cacheControl: '3600', // Cache for 1 hour
                        upsert: false // Don't upsert if file name conflicts (unlikely with UUID)
                    });

                if (uploadError) {
                    throw new Error(`Storage error: ${uploadError.message}`);
                }

                // Get the public URL for the uploaded file
                const { data: urlData } = locals.supabase.storage
                    .from('pet-profiles') // YOUR BUCKET NAME
                    .getPublicUrl(uploadData.path);

                profilePictureUrl = urlData.publicUrl;
                console.log('File uploaded successfully:', profilePictureUrl);

            } catch (err: any) {
                console.error('Error uploading file:', err);
                return fail(500, {
                    data: returnData,
                    errors: {} as PetFieldErrors,
                    error: `Failed to upload profile picture: ${err.message}`
                });
            }
        }

        // --- Database Insert Logic ---
        const { name, species, breed, birth_date, color, distinguishing_features, bio } = validationResult.data;

        try {
            const { data: newPetData, error: insertError } = await locals.supabase
                .from('pets')
                .insert({
                    user_id: session.user.id, // Link to the logged-in user
                    name: name,
                    species: species,
                    breed: breed || null, // Ensure empty strings become null if needed
                    birth_date: birth_date || null,
                    color: color || null,
                    distinguishing_features: distinguishing_features || null,
                    bio: bio || null,
                    profile_picture_url: profilePictureUrl // The URL from storage upload (or null)
                })
                .select('id') // Select the ID of the newly created pet
                .single(); // Expect only one row back

            if (insertError) {
                throw new Error(`Database error: ${insertError.message}`);
            }

            console.log('Pet inserted successfully, ID:', newPetData.id);

            // Return success state and the new pet's ID for redirection
            return {
                success: true,
                petId: newPetData.id,
                error: null,
                errors: {} as PetFieldErrors,
                data: undefined
             };

             // Alternative: Redirect directly from server action (can sometimes cause issues with enhance)
             // throw redirect(303, `/pets/${newPetData.id}`);

        } catch (err: any) {
             console.error('Error inserting pet:', err);
             // TODO: Optionally delete the uploaded image if DB insert fails
             if (profilePictureUrl) {
                 // Add logic here to delete the file from storage if the DB operation fails
                 // e.g., locals.supabase.storage.from('pet-profiles').remove([filePath]);
             }
             return fail(500, {
                data: returnData,
                errors: {} as PetFieldErrors,
                error: `Failed to save pet profile: ${err.message}`
             });
        }
    }
};