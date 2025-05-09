<!-- src/routes/profile/[identifier]/+page.svelte -->
<script lang="ts">
    import type { PageData } from './$types';
    // import { Mail, CalendarDays, UserCircle } from 'lucide-svelte'; // Keep if used

    export let data: PageData;

    $: profile = data.profile;
    $: pets = data.pets; // Get the pets array
    $: isOwnProfile = data.isOwnProfile;

    function formatDate(dateString: string | null | undefined): string {
        // ... (formatDate function remains the same) ...
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        } catch (e) {
            return 'Invalid Date';
        }
    }
</script>

<svelte:head>
    <title>{profile?.username ?? 'User Profile'} - PetConnect</title>
    <meta name="description" content={`Profile page for ${profile?.username ?? 'a PetConnect user'}.`} />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
    {#if profile}
        <div class="card lg:card-side bg-base-200 shadow-xl mb-8">
            <figure class="p-4 md:p-8 lg:w-1/3 flex flex-col items-center justify-start">
                {#if profile.profile_picture_url}
                    <div class="avatar">
                        <div class="w-32 h-32 lg:w-48 lg:h-48 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4 overflow-hidden">
                            <img
                                src={profile.profile_picture_url}
                                alt="{profile.username}'s avatar"
                                class="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    {:else}
                    <div class="avatar placeholder">
                         <div class="bg-neutral-focus text-neutral-content rounded-full w-32 h-32 lg:w-48 lg:h-48 ring ring-primary ring-offset-base-100 ring-offset-4 flex items-center justify-center overflow-hidden">
                            <span class="text-5xl lg:text-7xl uppercase flex items-center justify-center w-full h-full">
                                {profile.username ? profile.username.substring(0, 1) : '?'}
                            </span>
                         </div>
                     </div>
                {/if}
            </figure>
            <div class="card-body lg:w-3/4">
                <div class="flex justify-between items-start">
                    <h1 class="card-title text-3xl lg:text-4xl mb-2">{profile.username}</h1>
                    {#if isOwnProfile}
                         <a href="/settings/profile" class="btn btn-sm btn-outline btn-secondary">Edit Profile</a>
                    {/if}
                </div>

                {#if profile.full_name}
                    <p class="text-lg text-base-content/80 mb-4">{profile.full_name}</p>
                {/if}

                <p class="mb-2"><strong class="font-medium">Email:</strong> {profile.email ?? 'Not available'}</p>
                <p class="mb-4"><strong class="font-medium">Member Since:</strong> {formatDate(profile.created_at)}</p>
            </div>
        </div>

        <!-- Pets Section -->
        <div class="mb-8">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-semibold">
                    {isOwnProfile ? "My Pets" : `${profile.username}'s Pets`}
                </h2>
                {#if isOwnProfile}
                    <a href="/pets/new" class="btn btn-primary btn-sm">Add New Pet</a>
                {/if}
            </div>

            {#if pets && pets.length > 0}
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {#each pets as petItem (petItem.id)}
                        <a href={`/pets/${petItem.id}`} class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out overflow-hidden">
                            <figure class="h-40 bg-base-300">
                                {#if petItem.profile_picture_url}
                                    <img src={petItem.profile_picture_url} alt="{petItem.name}'s photo" class="w-full h-full object-cover" />
                                {:else}
                                    <div class="w-full h-full flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 text-base-content/30">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316zM9 10.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm.75 2.25h4.5v1.5h-4.5v-1.5zM18.75 10.5h.008v.008h-.008V10.5z" />
                                        </svg>
                                    </div>
                                {/if}
                            </figure>
                            <div class="card-body p-4">
                                <h3 class="card-title text-lg truncate">{petItem.name}</h3>
                                <p class="text-sm text-base-content/70 truncate">{petItem.species}</p>
                            </div>
                        </a>
                    {/each}
                </div>
            {:else}
                <div class="text-center py-6 bg-base-200 rounded-lg">
                    {#if isOwnProfile}
                        <p class="text-lg text-base-content/80">You haven't added any pets yet.</p>
                        <p class="text-sm mt-1">Click "Add New Pet" to get started!</p>
                    {:else}
                        <p class="text-lg text-base-content/80">{profile.username} hasn't added any pets yet.</p>
                    {/if}
                </div>
            {/if}
        </div>

         <!-- Placeholder for User's Posts -->
        <!-- <div class="divider">Posts</div> -->
        <!-- ... -->

    {:else}
        <div class="alert alert-error">
            <p>Could not load user profile.</p>
        </div>
    {/if}
</div>