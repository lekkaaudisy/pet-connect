/* eslint-disable @typescript-eslint/no-unused-vars */
// src/routes/auth/register/+page.server.ts
import { z } from 'zod';
import { AuthApiError } from '@supabase/supabase-js';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
// No longer importing `supabase` directly from `$lib/server/supabaseClient`

// Define a type for Zod flattened field errors for clarity and consistency
type RegisterFieldErrors = {
    username?: { _errors: string[] };
    email?: { _errors: string[] };
    password?: { _errors: string[] };
    passwordConfirm?: { _errors: string[] };
    // Add other fields if they can have Zod errors (e.g., full_name)
};

// Zod schema for validating the registration form data
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
    // Add full_name here if you collect it:
    // full_name: z.string().min(1, { message: 'Full name is required.' }).max(100).optional(),
}).refine(data => data.password === data.passwordConfirm, {
    message: "Passwords don't match.",
    path: ["passwordConfirm"], // Associates this error with the passwordConfirm field
});


// If the user is already logged in (session exists on locals), redirect them.
export const load: PageServerLoad = async ({ locals }) => {
    if (locals.session) { // `locals.session` is now properly typed and populated by hooks.server.ts
        throw redirect(303, '/'); // Redirect to homepage or a user dashboard
    }
    return {}; // Return empty if no session
};

export const actions: Actions = {
    // Default action for the registration form
    default: async ({ request, locals }) => { // Use `locals` to access supabase and session
        const formData = Object.fromEntries(await request.formData());

        // Validate the form data using our Zod schema
        const validationResult = registerUserSchema.safeParse(formData);

        // If validation fails, return errors to the client
        if (!validationResult.success) {
            const fieldErrors = validationResult.error.flatten().fieldErrors as RegisterFieldErrors;
            const { password: _password, passwordConfirm: _passwordConfirm, ...restOfData } = formData;
            return fail(400, {
                data: restOfData as { username?: string; email?: string; /* full_name?: string */ },
                errors: fieldErrors,
                error: "Please correct the errors highlighted below."
            });
        }

        // If validation is successful, extract the data
        const { email, password, username /*, full_name */ } = validationResult.data; // Destructure full_name if added

        // Attempt to sign up the user using locals.supabase
        const { error: signUpError } = await locals.supabase.auth.signUp({
            email,
            password,
            options: {
                data: { // This 'data' populates 'raw_user_meta_data' in Supabase's auth.users table
                    username: username,
                    // full_name: full_name, // Pass full_name if you collect and validate it
                }
            }
        });

        // Handle any errors from the signUp process
        if (signUpError) {
            const { password: _passwordFail, passwordConfirm: _passwordConfirmFail, ...restOfDataOnFail } = formData;
            const emptyFieldErrors: RegisterFieldErrors = {};

            if (signUpError instanceof AuthApiError && signUpError.status === 400) {
                 return fail(400, {
                    data: restOfDataOnFail as { username?: string; email?: string; /* full_name?: string */ },
                    errors: emptyFieldErrors,
                    error: signUpError.message
                });
            }
            if (signUpError.message.toLowerCase().includes('user already registered') ||
                signUpError.message.toLowerCase().includes('should be unique') ||
                signUpError.message.toLowerCase().includes('already exists')) {
                return fail(409, { // 409 Conflict
                    data: restOfDataOnFail as { username?: string; email?: string; /* full_name?: string */ },
                    errors: emptyFieldErrors,
                    error: 'A user with this email or username already exists. Please try logging in.'
                });
            }

            console.error('Supabase Auth SignUp Error (Unexpected):', signUpError.message, signUpError);
            return fail(500, {
                data: restOfDataOnFail as { username?: string; email?: string; /* full_name?: string */ },
                errors: emptyFieldErrors,
                error: 'An unexpected server error occurred during sign up. Please try again later.'
            });
        }

        return {
            message: "Registration successful! Please check your email to confirm your account and complete the process.",
            data: undefined,
            errors: {} as RegisterFieldErrors, // Ensure consistent shape for errors
            error: null
        };
    }
};