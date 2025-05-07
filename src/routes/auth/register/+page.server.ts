/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// src/routes/auth/register/+page.server.ts
import { z } from 'zod';
import { AuthApiError } from '@supabase/supabase-js';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabase } from '$lib/server/supabaseClient';

// Define a type for Zod flattened field errors for clarity
type ZodFieldErrors = {
    username?: { _errors: string[] };
    email?: { _errors: string[] };
    password?: { _errors: string[] };
    passwordConfirm?: { _errors: string[] };
    // Add other fields if they can have Zod errors
};

const registerUserSchema = z.object({
    username: z.string()
        .min(3, { message: 'Username must be at least 3 characters long.' })
        .max(50, { message: 'Username must be 50 characters or less.' })
        .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores.' }),
    email: z.string()
        .email({ message: 'Invalid email address.' }),
    password: z.string()
        .min(8, { message: 'Password must be at least 8 characters long.' }),
    passwordConfirm: z.string()
}).refine(data => data.password === data.passwordConfirm, {
    message: "Passwords don't match.",
    path: ["passwordConfirm"],
});

export const load: PageServerLoad = async ({ locals }) => {
    // @ts-expect-error
    if (locals.session) {
        throw redirect(303, '/');
    }
    return {};
};

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = Object.fromEntries(await request.formData());
        const validationResult = registerUserSchema.safeParse(formData);

        if (!validationResult.success) {
            const fieldErrors = validationResult.error.flatten().fieldErrors as ZodFieldErrors; // Cast to our defined type
            const { password: _password, passwordConfirm: _passwordConfirm, ...restOfData } = formData;
            return fail(400, {
                data: restOfData as { username?: string; email?: string },
                errors: fieldErrors, // This is the detailed Zod error object
                error: "Please correct the errors highlighted below."
            });
        }

        const { email, password, username } = validationResult.data;
        const { password: _passwordFail, passwordConfirm: _passwordConfirmFail, ...restOfDataOnFail } = formData;


        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { username: username } }
        });

        if (signUpError) {
            // For these general errors, ensure 'errors' is an empty ZodFieldErrors-compatible object
            const emptyFieldErrors: ZodFieldErrors = {};

            if (signUpError instanceof AuthApiError && signUpError.status === 400) {
                 return fail(400, {
                    data: restOfDataOnFail as { username?: string; email?: string },
                    errors: emptyFieldErrors, // Consistent shape
                    error: signUpError.message
                });
            }
            if (signUpError.message.toLowerCase().includes('user already registered') ||
                signUpError.message.toLowerCase().includes('should be unique') ||
                signUpError.message.toLowerCase().includes('already exists')) {
                return fail(409, {
                    data: restOfDataOnFail as { username?: string; email?: string },
                    errors: emptyFieldErrors, // Consistent shape
                    error: 'A user with this email or username already exists. Please try logging in.'
                });
            }
            console.error('Supabase Auth SignUp Error (Unexpected):', signUpError.message, signUpError);
            return fail(500, {
                data: restOfDataOnFail as { username?: string; email?: string },
                errors: emptyFieldErrors, // Consistent shape
                error: 'An unexpected server error occurred during sign up. Please try again later.'
            });
        }

        return {
            message: "Registration successful! Please check your email to confirm your account and complete the process.",
            data: undefined,
            errors: {} as ZodFieldErrors, // Consistent shape, even if empty
            error: null
        };
    }
};