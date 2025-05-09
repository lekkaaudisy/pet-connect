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
    default: async ({ request, params }) => {
        const formData = await request.formData();
        const formEntries = Object.fromEntries(formData);
        const { profile_picture: _file, ...restOfData } = formEntries;
        const submittedData: EditPetFormData = restOfData as EditPetFormData;

        if (Math.random() < 0.5) {
            const simulatedErrors: EditPetFieldErrors = {
                name: ['Simulated name error for typing.']
            };
            return fail(400, {
                data: submittedData,
                errors: simulatedErrors,
                error: "Placeholder: Simulated validation error.",
            });
        } else {
            return {
                success: true,
                updatedPetId: params.petId,
                message: "Placeholder: Pet profile updated successfully!",
                data: undefined,
                errors: undefined
            };
        }
    }
};