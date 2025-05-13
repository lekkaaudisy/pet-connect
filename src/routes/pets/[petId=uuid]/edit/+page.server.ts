/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from 'zod';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const editPetSchema = z.object({
    name: z.string().min(1, 'Pet name is required.').max(100),
    species: z.string().min(1, 'Species is required.').max(50),
    breed: z.string().max(100).optional().nullable().transform(val => val === '' ? null : val),
    birth_date: z.string().refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid date format.",
    }).optional().nullable().transform(val => val === '' ? null : val),
    color: z.string().max(100).optional().nullable().transform(val => val === '' ? null : val),
    distinguishing_features: z.string().optional().nullable().transform(val => val === '' ? null : val),
    bio: z.string().optional().nullable().transform(val => val === '' ? null : val),
    profile_picture: z.instanceof(File)
        .refine(f => f.size === 0 || f.type.startsWith("image/"), 'File must be an image.')
        .refine(f => f.size < 5 * 1024 * 1024, 'Max 5MB upload size.')
        .optional()
});

type EditPetFieldErrors = Partial<Record<keyof z.infer<typeof editPetSchema> | '_form', string[]>>;

type EditPetFormData = {
    name?: string;
    species?: string;
    breed?: string | null;
    birth_date?: string | null;
    color?: string | null;
    distinguishing_features?: string | null;
    bio?: string | null;
};

export const load: PageServerLoad = async ({ params, locals }) => {
    const { petId } = params;
    const { supabase, session } = locals;

    if (!session?.user) {
        throw redirect(303, '/auth/login');
    }

    const { data: pet, error: dbError } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .eq('user_id', session.user.id)
        .single();

    if (dbError || !pet) {
        if (dbError?.code === 'PGRST116' || !pet) {
            throw error(404, 'Pet not found or you do not have permission to edit it.');
        }
        throw error(500, 'Server error: Unable to load pet for editing.');
    }

    if (pet.birth_date) {
        try {
            const dateObj = new Date(pet.birth_date);
            pet.birth_date = dateObj.toISOString().split('T')[0];
        } catch (e) {
            // Keep original if parsing fails
        }
    }
    return { pet };
};

export const actions: Actions = {
    update: async ({ request, params, locals }) => {
        const { petId } = params;
        const { supabase, session } = locals;

        if (!session?.user) {
            return fail(401, { error: 'Unauthorized. Please log in.' });
        }

        const formData = await request.formData();
        const formEntries = Object.fromEntries(formData);

        const profilePictureFile = formData.get('profile_picture') as File | null;
        const validationData = {
            ...formEntries,
            profile_picture: profilePictureFile && profilePictureFile.size > 0 ? profilePictureFile : undefined
        };

        const validationResult = editPetSchema.safeParse(validationData);

        const { profile_picture: _file, ...restOfData } = formEntries;
        const submittedData: EditPetFormData = restOfData as EditPetFormData;


        if (!validationResult.success) {
            return fail(400, {
                data: submittedData,
                errors: validationResult.error.flatten().fieldErrors as EditPetFieldErrors,
                error: "Please correct the errors in the form."
            });
        }

        const { name, species, breed, birth_date, color, distinguishing_features, bio } = validationResult.data;
        let newProfilePictureUrl: string | undefined = undefined;
        let oldProfilePicturePath: string | null = null;

        try {
            const { data: currentPetData, error: fetchError } = await supabase
                .from('pets')
                .select('profile_picture_url')
                .eq('id', petId)
                .eq('user_id', session.user.id)
                .single();

            if (fetchError || !currentPetData) {
                throw error(404, 'Pet not found or you do not have permission to make this edit.');
            }

            if (currentPetData.profile_picture_url) {
                try {
                    const urlObject = new URL(currentPetData.profile_picture_url);
                    const pathSegments = urlObject.pathname.split('/');
                    oldProfilePicturePath = pathSegments.slice(pathSegments.indexOf('pet-profiles') + 1).join('/');
                } catch (e) {
                    console.warn("Could not parse old profile picture URL path:", currentPetData.profile_picture_url, e);
                }
            }


            if (profilePictureFile && profilePictureFile.size > 0) {
                const fileExt = profilePictureFile.name.split('.').pop();
                const randomUUID = crypto.randomUUID();
                const newFilePathInBucket = `${session.user.id}/pet_images/${randomUUID}.${fileExt}`;

                const { data: uploadData, error: uploadError } = await locals.supabase.storage
                    .from('pet-profiles')
                    .upload(newFilePathInBucket, profilePictureFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    throw new Error(`Storage error during upload: ${uploadError.message}`);
                }

                const { data: urlData } = locals.supabase.storage
                    .from('pet-profiles')
                    .getPublicUrl(uploadData.path);
                newProfilePictureUrl = urlData.publicUrl;

                if (oldProfilePicturePath && oldProfilePicturePath !== newFilePathInBucket) {
                    const { error: deleteOldError } = await locals.supabase.storage
                        .from('pet-profiles')
                        .remove([oldProfilePicturePath]);
                    if (deleteOldError) {
                        console.warn(`Failed to delete old profile picture: ${oldProfilePicturePath}`, deleteOldError.message);
                    }
                }
            }

            const updatePayload: {
                name: string;
                species: string;
                breed: string | null;
                birth_date: string | null;
                color: string | null;
                distinguishing_features: string | null;
                bio: string | null;
                profile_picture_url?: string | null;
            } = {
                name,
                species,
                breed: breed || null,
                birth_date: birth_date || null,
                color: color || null,
                distinguishing_features: distinguishing_features || null,
                bio: bio || null,
            };

            if (newProfilePictureUrl !== undefined) {
                updatePayload.profile_picture_url = newProfilePictureUrl;
            }


            const { error: updateError } = await locals.supabase
                .from('pets')
                .update(updatePayload)
                .eq('id', petId)
                .eq('user_id', session.user.id);

            if (updateError) {
                throw new Error(`Database error during update: ${updateError.message}`);
            }

            return {
                success: true,
                updatedPetId: petId,
                message: "Pet profile updated successfully!",
                errors: undefined,
                data: undefined
            };

        } catch (err: any) {
            console.error('Error updating pet:', err.message, err);
            if (newProfilePictureUrl && err.message.toLowerCase().includes('database error')) {
                try {
                    const urlObject = new URL(newProfilePictureUrl);
                    const pathSegments = urlObject.pathname.split('/');
                    const pathToDelete = pathSegments.slice(pathSegments.indexOf('pet-profiles') + 1).join('/');
                    if (pathToDelete) {
                        await locals.supabase.storage.from('pet-profiles').remove([pathToDelete]);
                    }
                } catch (cleanupError: any) {
                    console.error("Error cleaning up newly uploaded image:", cleanupError.message);
                }
            }
            return fail(500, {
                data: submittedData,
                errors: {} as EditPetFieldErrors,
                error: `Failed to update pet profile: ${err.message || 'Unknown error'}`
            });
        }
    },

    delete: async ({ params, locals }) => {
        const { petId } = params;
        const { supabase, session } = locals;

        if (!session?.user) {
            return fail(401, { error: 'Unauthorized.' });
        }

        try {
            const { data: petToDelete, error: fetchError } = await supabase
                .from('pets')
                .select('profile_picture_url, user_id')
                .eq('id', petId)
                .single();

            if (fetchError || !petToDelete) {
                return fail(404, { error: 'Pet not found or cannot be fetched for deletion.' });
            }

            if (petToDelete.user_id !== session.user.id) {
                return fail(403, { error: 'You do not have permission to delete this pet.' });
            }

            const { error: deleteDbError } = await supabase
                .from('pets')
                .delete()
                .eq('id', petId)
                .eq('user_id', session.user.id);

            if (deleteDbError) {
                throw new Error(`Database error deleting pet: ${deleteDbError.message}`);
            }

            if (petToDelete.profile_picture_url) {
                try {
                    const urlObject = new URL(petToDelete.profile_picture_url);
                    const pathSegments = urlObject.pathname.split('/');
                    const filePathInBucket = pathSegments.slice(pathSegments.indexOf('pet-profiles') + 1).join('/');
                    if (filePathInBucket && filePathInBucket.trim() !== '') {
                        const { error: storageError } = await supabase.storage
                            .from('pet-profiles')
                            .remove([filePathInBucket]);
                        if (storageError) {
                            console.warn(`Failed to delete pet image from storage: ${filePathInBucket}`, storageError.message);
                        }
                    }
                } catch (e: any) {
                     console.warn(`Error parsing or deleting pet image from storage: ${petToDelete.profile_picture_url}`, e.message);
                }
            }
            return { deleted: true, error: null };

        } catch (err: any) {
            console.error(`[Delete Pet Action] Error deleting pet ID: ${petId}`, err);
            return fail(500, { error: `Failed to delete pet: ${err.message || 'Unknown server error'}` });
        }
    }
} satisfies Actions;