<script lang="ts">
    import '../app.css';
    import { onMount } from 'svelte';
    import { invalidateAll } from '$app/navigation';
    import type { LayoutData } from './$types';
    import { supabase } from '$lib/supabaseClient';
    import Navbar from '$lib/components/layout/Navbar.svelte';

    export let data: LayoutData;

    let currentSession = data.session;

    onMount(() => {
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