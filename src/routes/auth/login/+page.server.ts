/* eslint-disable @typescript-eslint/no-unused-vars */
// src/routes/auth/login/+page.server.ts
import { z } from 'zod';
import { AuthApiError } from '@supabase/supabase-js';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
// No longer importing `supabase` directly from `$lib/server/supabaseClient`

// Zod schema for validating login form data
const loginUserSchema = z.object({
    email: z.string().email({ message: 'Invalid email address format.' }),
    password: z.string().min(1, { message: 'Password is required.' })
});

// Define a type for the potential structure of field errors for consistency
type LoginFieldErrors = {
    email?: { _errors: string[] };
    password?: { _errors: string[] };
};

// If the user is already logged in (session exists on locals), redirect them.
export const load: PageServerLoad = async ({ locals }) => {
    if (locals.session) { // `locals.session` is now properly typed and populated by hooks.server.ts
        throw redirect(303, '/'); // Redirect to homepage or user dashboard
    }
    return {}; // Return empty if no session
};

export const actions: Actions = {
    // Default action for the login form
    default: async ({ request, locals }) => { // Use `locals` to access supabase and session
        const formData = Object.fromEntries(await request.formData());

        // Validate the form data using our Zod schema
        const validationResult = loginUserSchema.safeParse(formData);

        // If validation fails, return errors to the client
        if (!validationResult.success) {
            const fieldErrors = validationResult.error.flatten().fieldErrors as LoginFieldErrors;
            const { password: _password, ...restOfData } = formData; // Exclude password
            return fail(400, {
                data: restOfData as { email?: string },
                errors: fieldErrors,
                error: "Please check your email and password."
            });
        }

        // If validation is successful, extract the data
        const { email, password } = validationResult.data;

        // Attempt to sign in the user using locals.supabase
        const { error: signInError } = await locals.supabase.auth.signInWithPassword({
            email,
            password
        });

        // Handle any errors from the signIn process
        if (signInError) {
            const { password: _passwordFail, ...restOfDataOnFail } = formData; // Exclude password
            const emptyFieldErrors: LoginFieldErrors = {};

            if (signInError instanceof AuthApiError) {
                if (signInError.message.toLowerCase().includes('invalid login credentials')) {
                    return fail(401, { // 401 Unauthorized
                        data: restOfDataOnFail as { email?: string },
                        errors: emptyFieldErrors,
                        error: 'Invalid email or password. Please try again.'
                    });
                }
                if (signInError.message.toLowerCase().includes('email not confirmed')) {
                     return fail(403, { // 403 Forbidden
                        data: restOfDataOnFail as { email?: string },
                        errors: emptyFieldErrors,
                        error: 'Email not confirmed. Please check your inbox for the confirmation link.'
                    });
                }
            }

            console.error('Supabase Auth SignIn Error (Unexpected):', signInError.message, signInError);
            return fail(500, {
                data: restOfDataOnFail as { email?: string },
                errors: emptyFieldErrors,
                error: 'An unexpected server error occurred during login. Please try again later.'
            });
        }

        // If signIn is successful, Supabase client (via Auth Helpers) handles cookie setting.
        // Redirect to the homepage or a user-specific dashboard.
        throw redirect(303, '/'); // The user is now logged in.
    }
};