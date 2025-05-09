<!-- src/routes/pets/[petId=uuid]/+page.svelte -->
<script lang="ts">
    import type { PageData } from './$types';
    import { Mail, CalendarDays, UserCircle } from 'lucide-svelte'; // Example icons

    export let data: PageData;

    $: pet = data.pet;
    $: isOwner = data.isOwner;
    $: owner = data.pet.user; // The joined owner object

    function formatDate(dateString: string | null | undefined): string {
        if (!dateString) return 'Not specified';
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
    <title>{pet.name ? `${pet.name}'s Profile` : 'Pet Profile'} - PetConnect</title>
    <meta name="description" content={pet.bio ? pet.bio.substring(0, 150) : `Profile page for ${pet.name ?? 'a pet'}.`} />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
    {#if pet}
        <div class="card lg:card-side bg-base-200 shadow-xl">
            <figure class="p-4 md:p-8 lg:w-1/3 flex flex-col items-center justify-start">
                {#if pet.profile_picture_url}
                    <div class="avatar">
                        <div class="w-40 h-40 md:w-56 md:h-56 rounded-full ring-4 ring-primary ring-offset-base-100 ring-offset-4 overflow-hidden">
                            <img
                                src={pet.profile_picture_url}
                                alt="{pet.name}'s profile"
                                class="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                {:else}
                    <div class="avatar placeholder mb-4">
                         <div class="bg-neutral text-neutral-content rounded-full w-40 h-40 md:w-56 md:h-56 ring-4 ring-primary ring-offset-base-100 ring-offset-4 flex items-center justify-center overflow-hidden">
                            <span class="text-6xl md:text-8xl uppercase">{pet.name ? pet.name.substring(0, 1) : '?'}</span>
                         </div>
                     </div>
                {/if}
                {#if owner}
                    <div class="text-center mt-4">
                        <p class="text-sm text-base-content/70">Owned by:</p>
                        <a href={`/profile/${owner.username || owner.id}`} class="link link-hover link-secondary font-medium">
                            {owner.username || 'Owner'}
                        </a>
                    </div>
                {/if}
            </figure>

            <div class="card-body lg:w-2/3">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h1 class="card-title text-3xl md:text-4xl font-bold mb-2 sm:mb-0">{pet.name}</h1>
                    {#if isOwner}
                         <a href={`/pets/${pet.id}/edit`} class="btn btn-sm btn-outline btn-secondary">Edit Pet Profile</a>
                    {/if}
                </div>

                {#if pet.bio}
                    <p class="text-base-content/90 mb-6 whitespace-pre-line">{pet.bio}</p>
                {:else}
                    <p class="text-base-content/70 italic mb-6">No bio provided for {pet.name}.</p>
                {/if}

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div>
                        <strong class="font-medium">Species:</strong>
                        <span class="ml-1 badge badge-lg badge-accent">{pet.species}</span>
                    </div>
                    {#if pet.breed}
                        <div><strong class="font-medium">Breed:</strong> {pet.breed}</div>
                    {/if}
                    {#if pet.birth_date}
                        <div class="flex items-center">
                            <CalendarDays class="w-4 h-4 mr-2 text-base-content/70" />
                            <strong class="font-medium">Born/Adopted:</strong>
                            <span class="ml-1">{formatDate(pet.birth_date)}</span>
                        </div>
                    {/if}
                     {#if pet.color}
                        <div><strong class="font-medium">Color(s):</strong> {pet.color}</div>
                    {/if}
                    {#if pet.distinguishing_features}
                        <div class="sm:col-span-2"><strong class="font-medium">Features:</strong> {pet.distinguishing_features}</div>
                    {/if}
                </div>

                <div class="divider my-6">Activity</div>
                {#if isOwner}
                    <div class="text-center">
                        <p class="text-base-content/70 mb-2">Share an update about {pet.name}!</p>
                        <!-- Placeholder for "Add Update" form - Step 2.8 -->
                        <button class="btn btn-primary btn-sm">Post an Update (Coming Soon)</button>
                    </div>
                {:else}
                     <p class="text-center text-base-content/70">{pet.name}'s recent activity will appear here.</p>
                {/if}
                 <!-- Placeholder for Pet's Posts list - Step 2.9 -->

            </div>
        </div>
    {:else}
        <!-- This should ideally not be reached if load function throws 404 correctly -->
        <div class="alert alert-warning">
            <p>Pet profile data is not available.</p>
        </div>
    {/if}
</div>