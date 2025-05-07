<!-- src/routes/auth/login/+page.svelte -->
<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData } from './$types';

    export let form: ActionData;
</script>

<svelte:head>
    <title>Login - PetConnect</title>
</svelte:head>

<div class="min-h-[calc(100vh-10rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
    <div class="card w-full max-w-md bg-base-200 shadow-xl">
        <div class="card-body">
            <h2 class="card-title text-3xl justify-center mb-6">Login to PetConnect</h2>

            {#if form?.error}
                <div class="alert alert-error shadow-lg mb-4">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{form.error}</span>
                    </div>
                </div>
            {/if}

            <form class="space-y-4" method="POST" use:enhance>
                <!-- Email Field -->
                <div class="form-control">
                    <label for="email" class="label">
                        <span class="label-text">Email address</span>
                    </label>
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
                    />
                    {#if form?.errors?.email}
                        <label class="label" for="email">
                            <span class="label-text-alt text-error">{form.errors.email._errors.join(', ')}</span>
                        </label>
                    {/if}
                </div>

                <!-- Password Field -->
                <div class="form-control">
                    <label for="password" class="label">
                        <span class="label-text">Password</span>
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autocomplete="current-password"
                        required
                        class="input input-bordered w-full {form?.errors?.password ? 'input-error' : ''}"
                        placeholder="Your password"
                        aria-invalid={form?.errors?.password ? 'true' : undefined}
                    />
                    {#if form?.errors?.password}
                        <label class="label" for="password">
                            <span class="label-text-alt text-error">{form.errors.password._errors.join(', ')}</span>
                        </label>
                    {/if}
                </div>

                <!-- Optional: Remember me, Forgot password -->
                <div class="flex items-center justify-between">
                    <!-- <div class="flex items-center">
                        <input id="remember-me" name="remember-me" type="checkbox" class="checkbox checkbox-primary" />
                        <label for="remember-me" class="ml-2 block text-sm"> Remember me </label>
                    </div> -->
                    <div class="text-sm">
                        <a href="/auth/forgot-password" class="link link-hover link-secondary"> Forgot your password? </a>
                        <!-- We'll implement forgot-password later -->
                    </div>
                </div>

                <!-- Submit Button -->
                <div class="form-control mt-6">
                    <button type="submit" class="btn btn-primary w-full">
                        Login
                    </button>
                </div>

                 <div class="text-sm text-center mt-4">
                    <p>
                        Don't have an account?
                        <a href="/auth/register" class="link link-secondary">Register here</a>
                    </p>
                </div>
            </form>
        </div>
    </div>
</div>