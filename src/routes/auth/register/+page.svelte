<!-- src/routes/auth/register/+page.svelte -->
<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData } from './$types'; // Let's see how this gets typed now

    export let form: ActionData;
</script>

<svelte:head>
    <title>Register - PetConnect</title>
    <meta name="description" content="Create your PetConnect account to join our community of pet lovers." />
</svelte:head>

<div class="min-h-[calc(100vh-10rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
    <div class="card w-full max-w-md bg-base-200 shadow-xl">
        <div class="card-body">
            <h2 class="card-title text-3xl justify-center mb-6">Create Account</h2>

            {#if form?.message}
                <div class="alert alert-success shadow-lg mb-4">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{form.message}</span>
                    </div>
                </div>
            {/if}

            {#if form?.error && !form.message}
                <div class="alert alert-error shadow-lg mb-4">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{form.error}</span>
                    </div>
                </div>
            {/if}

            {#if !form?.message}
            <form class="space-y-4" method="POST" use:enhance>
                <!-- Username Field -->
                <div class="form-control">
                    <label for="username" class="label"><span class="label-text">Username</span></label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        autocomplete="username"
                        required
                        minlength="3" maxlength="50" pattern="^[a-zA-Z0-9_]+$" title="Username: 3-50 chars, letters, numbers, underscores."
                        class="input input-bordered w-full {form?.errors?.username ? 'input-error' : ''}"
                        placeholder="Choose a unique username"
                        value={form?.data?.username ?? ''}
                        aria-invalid={form?.errors?.username ? 'true' : undefined}
                        aria-describedby={form?.errors?.username ? 'username-error-message' : undefined}
                    />
                    {#if form?.errors?.username}
                        <label class="label" for="username" id="username-error-message">
                            <!-- Ensure form.errors.username exists before accessing _errors -->
                            <span class="label-text-alt text-error">{form.errors.username?._errors.join(', ')}</span>
                        </label>
                    {/if}
                </div>

                <!-- Email Field -->
                <div class="form-control">
                    <label for="email" class="label"><span class="label-text">Email address</span></label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autocomplete="email"
                        required
                        class="input input-bordered w-full {form?.errors?.email ? 'input-error' : ''}"
                        placeholder="your.email@example.com"
                        value={form?.data?.email ?? ''}
                        aria-invalid={form?.errors?.email ? 'true' : undefined}
                        aria-describedby={form?.errors?.email ? 'email-error-message' : undefined}
                    />
                    {#if form?.errors?.email}
                        <label class="label" for="email" id="email-error-message">
                            <span class="label-text-alt text-error">{form.errors.email?._errors.join(', ')}</span>
                        </label>
                    {/if}
                </div>

                <!-- Password Field -->
                <div class="form-control">
                    <label for="password" class="label"><span class="label-text">Password</span></label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autocomplete="new-password"
                        required minlength="8"
                        class="input input-bordered w-full {form?.errors?.password ? 'input-error' : ''}"
                        placeholder="Create a strong password (min. 8 characters)"
                        aria-invalid={form?.errors?.password ? 'true' : undefined}
                        aria-describedby={form?.errors?.password ? 'password-error-message' : undefined}
                    />
                     {#if form?.errors?.password}
                        <label class="label" for="password" id="password-error-message">
                            <span class="label-text-alt text-error">{form.errors.password?._errors.join(', ')}</span>
                        </label>
                    {/if}
                </div>

                <!-- Confirm Password Field -->
                 <div class="form-control">
                    <label for="passwordConfirm" class="label"><span class="label-text">Confirm Password</span></label>
                    <input
                        id="passwordConfirm"
                        name="passwordConfirm"
                        type="password"
                        autocomplete="new-password"
                        required minlength="8"
                        class="input input-bordered w-full {form?.errors?.passwordConfirm ? 'input-error' : ''}"
                        placeholder="Re-type your password"
                        aria-invalid={form?.errors?.passwordConfirm ? 'true' : undefined}
                        aria-describedby={form?.errors?.passwordConfirm ? 'passwordConfirm-error-message' : undefined}
                    />
                     {#if form?.errors?.passwordConfirm}
                        <label class="label" for="passwordConfirm" id="passwordConfirm-error-message">
                            <span class="label-text-alt text-error">{form.errors.passwordConfirm?._errors.join(', ')}</span>
                        </label>
                    {/if}
                </div>

                <div class="form-control mt-6">
                    <button type="submit" class="btn btn-primary w-full">Register</button>
                </div>
                 <div class="text-sm text-center mt-4">
                    <p>Already have an account? <a href="/auth/login" class="link link-secondary">Login here</a></p>
                </div>
            </form>
            {/if}
        </div>
    </div>
</div>