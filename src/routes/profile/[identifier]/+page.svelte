<!-- src/routes/profile/[identifier]/+page.svelte -->
<script lang="ts">
    import type { PageData } from './$types';

    export let data: PageData;

    // Reactive variables for easier access in template
    $: profile = data.profile;
    $: isOwnProfile = data.isOwnProfile;

    // Format date helper (could be moved to a utility file later)
    function formatDate(dateString: string | null | undefined): string {
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

<div class="container mx-auto px-4 py-8">
    {#if profile}
        <div class="card lg:card-side bg-base-200 shadow-xl">
            <figure class="p-4 lg:p-8 lg:w-1/4 flex justify-center">
                {#if profile.profile_picture_url}
                     <img src={profile.profile_picture_url} alt="{profile.username}'s avatar" class="rounded-full w-32 h-32 lg:w-48 lg:h-48 object-cover ring ring-primary ring-offset-base-100 ring-offset-4"/>
                {:else}
                    <div class="avatar placeholder">
                         <div class="bg-neutral-focus text-neutral-content rounded-full w-32 h-32 lg:w-48 lg:h-48 ring ring-primary ring-offset-base-100 ring-offset-4">
                            <span class="text-5xl lg:text-7xl uppercase">{profile.username ? profile.username.substring(0, 1) : '?'}</span>
                         </div>
                     </div>
                {/if}
            </figure>
            <div class="card-body lg:w-3/4">
                <div class="flex justify-between items-start">
                    <h1 class="card-title text-3xl lg:text-4xl mb-2">{profile.username}</h1>
                    {#if isOwnProfile}
                         <a href="/settings/profile" class="btn btn-sm btn-outline btn-primary">Edit Profile</a>
                    {/if}
                </div>

                {#if profile.full_name}
                    <p class="text-lg text-base-content/80 mb-4">{profile.full_name}</p>
                {/if}

                <p class="mb-2"><strong>Email:</strong> {profile.email ?? 'Not available'}</p>
                <p class="mb-4"><strong>Member Since:</strong> {formatDate(profile.created_at)}</p>

                 <div class="divider">Pets</div>
                 {#if isOwnProfile}
                     <p class="text-center text-base-content/70 mb-4">Your beloved pets will appear here.</p>
                     <div class="text-center">
                         <a href="/pets/new" class="btn btn-secondary">Add New Pet</a>
                     </div>
                 {:else}
                     <p class="text-center text-base-content/70 mb-4">{profile.username}'s pets will appear here.</p>
                 {/if}
                 <!-- Placeholder for Pet list - Fetch and display in Phase 2 -->

                <!-- Placeholder for user's posts -->
                <!-- <div class="divider">Posts</div> -->
                <!-- Fetch and display posts in a later phase -->

            </div>
        </div>
    {:else}
        <!-- This part shouldn't usually be reached because the load function throws 404 -->
        <div class="alert alert-error">
            <p>Could not load user profile.</p>
        </div>
    {/if}
</div>