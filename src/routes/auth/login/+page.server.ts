/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from 'zod';
import { AuthApiError } from '@supabase/supabase-js';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const loginUserSchema = z.object({
    email: z.string().email({ message: 'Invalid email address format.' }),
    password: z.string().min(1, { message: 'Password is required.' })
});

type LoginFieldErrors = {
    email?: { _errors: string[] };
    password?: { _errors: string[] };
};

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.session) { // `locals.session` is now properly typed and populated by hooks.server.ts
        throw redirect(303, '/'); 
    }
    return {}; 
};

export const actions: Actions = {
    default: async ({ request, locals }) => { 
        const formData = Object.fromEntries(await request.formData());

        const validationResult = loginUserSchema.safeParse(formData);

        if (!validationResult.success) {
            const fieldErrors = validationResult.error.flatten().fieldErrors as LoginFieldErrors;
            const { password: _password, ...restOfData } = formData;
            return fail(400, {
                data: restOfData as { email?: string },
                errors: fieldErrors,
                error: "Please check your email and password."
            });
        }

        const { email, password } = validationResult.data;

        const { error: signInError } = await locals.supabase.auth.signInWithPassword({
            email,
            password
        });

        if (signInError) {
            const { password: _passwordFail, ...restOfDataOnFail } = formData;
            const emptyFieldErrors: LoginFieldErrors = {};

            if (signInError instanceof AuthApiError) {
                if (signInError.message.toLowerCase().includes('invalid login credentials')) {
                    return fail(401, { 
                        data: restOfDataOnFail as { email?: string },
                        errors: emptyFieldErrors,
                        error: 'Invalid email or password. Please try again.'
                    });
                }
                if (signInError.message.toLowerCase().includes('email not confirmed')) {
                     return fail(403, { 
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

        throw redirect(303, '/'); 
    }
};