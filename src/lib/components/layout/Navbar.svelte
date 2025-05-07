<!-- src/lib/components/layout/Navbar.svelte -->
<script lang="ts">
    import { themeChange } from 'theme-change';
    import { onMount } from 'svelte';
    import type { Session } from '@supabase/supabase-js'; // Import Session type

    export let currentSession: Session | null; // Prop to receive the session

    onMount(() => {
        themeChange(false); // Initialize theme changer specific to this component instance
    });

    function getProfileUrl() {
        if (currentSession?.user) {
            const username = currentSession.user.user_metadata?.username;
            const userId = currentSession.user.id;
            return `/profile/${username || userId}`;
        }
        return '/';
    }
</script>

<header class="bg-neutral text-neutral-content shadow-md sticky top-0 z-50">
    <div class="container mx-auto navbar px-4">
        <div class="flex-1">
            <a href="/" class="btn btn-ghost normal-case text-xl">PetConnect</a>
        </div>

        <div class="flex-none flex items-center space-x-2">
            <div title="Change Theme" class="dropdown dropdown-end">
                <!-- svelte-ignore a11y_no_redundant_roles -->
                <!-- svelte-ignore a11y_consider_explicit_label -->
                <button type="button" tabindex="0" role="button" class="btn btn-ghost btn-square">
                    <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-5 w-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
                </button>
                <ul tabindex="0" role="menu" class="menu menu-sm dropdown-content bg-base-200 text-base-content rounded-box shadow-2xl w-52 mt-4 z-[1] p-2">
                    <li><div class="menu-title px-4 py-2"><span>Change Theme</span></div></li>
                    <li><button role="menuitem" data-set-theme="light" data-act-class="active" class="btn btn-ghost btn-sm justify-start w-full">Light</button></li>
                    <li><button role="menuitem" data-set-theme="dark" data-act-class="active" class="btn btn-ghost btn-sm justify-start w-full">Dark</button></li>
                    <li><button role="menuitem" data-set-theme="cupcake" data-act-class="active" class="btn btn-ghost btn-sm justify-start w-full">Cupcake</button></li>
                </ul>
            </div>

            {#if currentSession}
                <div class="dropdown dropdown-end">
                    <!-- svelte-ignore a11y_no_redundant_roles -->
                    <button type="button" tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                        <div class="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                            {#if currentSession.user?.user_metadata?.profile_picture_url}
                                <img src={currentSession.user.user_metadata.profile_picture_url} alt="User avatar" />
                            {:else if currentSession.user?.email}
                                <span class="text-xl uppercase flex items-center justify-center h-full">
                                    {currentSession.user.email.substring(0, 1)}
                                </span>
                            {:else}
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 m-auto">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                            {/if}
                        </div>
                    </button>
                    <ul tabindex="0" role="menu" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 text-base-content rounded-box w-52">
                        <li class="px-4 py-2 font-semibold text-sm pointer-events-none">
                        Hi, {currentSession.user?.user_metadata?.username || currentSession.user?.email?.split('@')[0] || 'User'}
                        </li>
                        <li><a role="menuitem" href={getProfileUrl()} class="block">View Profile</a></li>
                        <li><a role="menuitem" href="/settings/profile" class="block">Account Settings</a></li>
                        
                              
                        <li class="hover:bg-base-300 focus-within:bg-base-300 rounded-lg">
                            <form method="POST" action="/auth/logout" class="w-full">
                                <button
                                    type="submit"
                                    class="w-full text-left appearance-none bg-transparent border-none cursor-pointer text-current focus:outline-none"
                                    aria-label="Logout"
                                    >
                                    Logout
                                </button>
                            </form>
                        </li>
                    </ul>
                </div>
            {:else}
                <a href="/auth/login" class="btn btn-ghost btn-md">Login</a>
                <a href="/auth/register" class="btn btn-primary btn-md">Register</a>
            {/if}
        </div>
    </div>
</header>