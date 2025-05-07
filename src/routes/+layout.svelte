<!-- src/routes/+layout.svelte -->
<script lang="ts">
    import '../app.css';
    import { onMount } from 'svelte';
    import { invalidateAll } from '$app/navigation';
    // Removed themeChange import from here
    import type { LayoutData } from './$types';
    import { supabase } from '$lib/supabaseClient';
    import Navbar from '$lib/components/layout/Navbar.svelte'; // Import the new Navbar component

    export let data: LayoutData;

    let currentSession = data.session;

    onMount(() => {
        // ThemeChange is now handled within Navbar.svelte

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.access_token !== currentSession?.access_token) {
                invalidateAll();
            }
            currentSession = session;
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    });

    $: currentSession = data.session;

    // getProfileUrl is now inside Navbar.svelte
</script>

<div class="min-h-screen flex flex-col bg-base-100 text-base-content">
    <Navbar {currentSession} />

    <main class="flex-grow container mx-auto p-4">
        <slot />
    </main>

    <footer class="footer footer-center p-4 bg-base-300 text-base-content">
        <div>
            <p>© {new Date().getFullYear()} PetConnect. All rights reserved.</p>
        </div>
    </footer>
</div>