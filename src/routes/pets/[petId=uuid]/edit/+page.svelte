<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import { goto } from '$app/navigation';
	import { Trash2 } from 'lucide-svelte';

	export let data: PageData;
	export let form: ActionData | null = null;

	// Better typed interface for the form data
	interface PetFormData {
		name: string;
		species: string;
		breed: string | null;
		birth_date: string | null;
		color: string | null;
		distinguishing_features: string | null;
		bio: string | null;
		profile_picture?: File;
	}

	// Better typed interface for form errors
	interface FormErrors {
		name?: string[];
		species?: string[];
		breed?: string[];
		birth_date?: string[];
		color?: string[];
		distinguishing_features?: string[];
		bio?: string[];
		profile_picture?: string[];
	}

	// Properly typed interface for form structure
	interface FormData {
		success?: boolean;
		data?: PetFormData;
		error?: string;
		message?: string;
		errors?: FormErrors;
		updatedPetId?: string;
	}

	// Assert that form has the right structure
	function getFormData(): Partial<PetFormData> {
		return (form?.data as PetFormData) || {};
	}

	// Safely extract form values with proper fallbacks
	$: formData = getFormData();
	$: name = formData.name ?? data.pet.name ?? '';
	$: species = formData.species ?? data.pet.species ?? '';
	$: breed = formData.breed ?? data.pet.breed ?? '';
	$: birth_date = formData.birth_date ?? data.pet.birth_date ?? '';
	$: color = formData.color ?? data.pet.color ?? '';
	$: distinguishing_features = formData.distinguishing_features ?? data.pet.distinguishing_features ?? '';
	$: bio = formData.bio ?? data.pet.bio ?? '';

	let imagePreviewUrl: string | null = data.pet.profile_picture_url ?? null;
	let fileInput: HTMLInputElement;
    let formElement: HTMLFormElement;
    let deleteModal: HTMLDialogElement;

	function handleFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        imagePreviewUrl = null;
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Invalid file type. Please select an image.');
                if (fileInput) fileInput.value = '';
                return;
            }
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('File too large. Maximum size is 5MB.');
                if (fileInput) fileInput.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreviewUrl = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        } else {
            imagePreviewUrl = data.pet.profile_picture_url ?? null;
        }
	}

    function triggerFileInput() {
        fileInput?.click();
    }

    interface DeleteActionResult {
        type: 'success' | 'failure' | 'error' | 'redirect';
        data?: {
            deleted?: boolean;
            error?: string;
        };
        error?: {
            message?: string;
        };
        status?: number;
        location?: string;
    }

    async function handleDeleteResult(actionResult: DeleteActionResult) {
        if (actionResult.type === 'success' && actionResult.data?.deleted) {
            alert('Pet profile deleted successfully.');
            if (data && data.pet && data.pet.user_id) {
                goto(`/profile/${data.pet.user_id}`, { invalidateAll: true });
            } else {
                goto('/', { invalidateAll: true });
            }
        } else if (actionResult.type === 'failure' && actionResult.data?.error) {
            alert(`Error deleting pet: ${actionResult.data.error}`);
        } else if (actionResult.type === 'error') {
            alert(`Error processing delete request: ${actionResult.error?.message || 'Unknown error'}`);
        } else if (actionResult.type === 'redirect') {
            // Handle redirect case
            goto(actionResult.location || '/', { invalidateAll: true });
        }
    }

	$: {
		if (form?.success && form?.updatedPetId) {
            const targetUrl = `/pets/${form.updatedPetId}`;
			goto(targetUrl, { invalidateAll: true });
            form = null;
		}
	}
</script>

<svelte:head>
	<title>Edit {data.pet.name ?? 'Pet'} - PetConnect</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-2xl">
    <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">Edit {data.pet.name ?? 'Pet'}'s Profile</h1>
        <a href={`/pets/${data.pet.id}`} class="btn btn-sm btn-outline">View Profile</a>
    </div>

    {#if form && form.error && !form.success}
        <div class="alert alert-error shadow-lg mb-6">
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{form.error}</span>
            </div>
        </div>
    {/if}
    {#if form?.message}
        <div class="alert alert-info shadow-lg mb-6">
            <span>{form.message}</span>
        </div>
    {/if}

	<form bind:this={formElement} method="POST" action="?/update" use:enhance class="space-y-8">

        <div class="flex items-center space-x-6 p-4 border border-base-300 rounded-lg bg-base-200">
             <div class="avatar flex-shrink-0">
                 <div class="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 bg-base-300 flex items-center justify-center overflow-hidden">
                    {#if imagePreviewUrl}
                        <img src={imagePreviewUrl} alt="Pet profile preview" class="w-full h-full object-cover"/>
                    {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-base-content/50">
                           <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                           <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                        </svg>
                    {/if}
                 </div>
             </div>
             <div class="flex flex-col">
                 <button type="button" on:click={triggerFileInput} class="btn btn-sm btn-outline btn-primary mb-1">
                     Change Photo
                 </button>
                 <p class="text-xs text-base-content/70">Max 5MB. JPG, PNG, GIF, WEBP.</p>
                 {#if form?.errors?.profile_picture}
                    <span class="label-text-alt text-error mt-1">{form.errors.profile_picture.join(', ')}</span>
                 {/if}
             </div>
             <input
                type="file"
                id="profile_picture"
                name="profile_picture"
                accept="image/png, image/jpeg, image/gif, image/webp"
                class="hidden"
                on:change={handleFileChange}
                bind:this={fileInput}
             />
        </div>

        <hr class="border-base-300"/>

        <div class="space-y-4">
            <div class="form-control w-full">
                <label for="name" class="label pb-1"><span class="label-text font-medium">Pet's Name *</span></label>
                <input type="text" id="name" name="name" required bind:value={name}
                    class="input input-bordered w-full {form?.errors?.name ? 'input-error' : ''}" />
                {#if form?.errors?.name} <label class="label pt-1" for="name"><span class="label-text-alt text-error">{form.errors.name.join(', ')}</span></label> {/if}
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div class="form-control w-full">
                    <label for="species" class="label pb-1"><span class="label-text font-medium">Species *</span></label>
                    <select id="species" name="species" required bind:value={species}
                            class="select select-bordered w-full {form?.errors?.species ? 'select-error' : ''}">
                        <option disabled value="">Select Species</option>
                        <option value="Dog">Dog</option><option value="Cat">Cat</option><option value="Bird">Bird</option><option value="Fish">Fish</option><option value="Reptile">Reptile</option><option value="Small Mammal">Small Mammal</option><option value="Other">Other</option>
                    </select>
                     {#if form?.errors?.species} <label class="label pt-1" for="species"><span class="label-text-alt text-error">{form.errors.species.join(', ')}</span></label> {/if}
                </div>

                <div class="form-control w-full">
                    <label for="breed" class="label pb-1"><span class="label-text font-medium">Breed</span></label>
                    <input type="text" id="breed" name="breed" bind:value={breed} placeholder="Optional"
                        class="input input-bordered w-full {form?.errors?.breed ? 'input-error' : ''}" />
                    {#if form?.errors?.breed} <label class="label pt-1" for="breed"><span class="label-text-alt text-error">{form.errors.breed.join(', ')}</span></label> {/if}
                </div>
            </div>

             <div class="form-control w-full">
                 <label for="birth_date" class="label pb-1"><span class="label-text font-medium">Date of Birth / Adoption Date</span></label>
                 <input type="date" id="birth_date" name="birth_date" bind:value={birth_date}
                    class="input input-bordered w-full {form?.errors?.birth_date ? 'input-error' : ''}" />
                 {#if form?.errors?.birth_date} <label class="label pt-1" for="birth_date"><span class="label-text-alt text-error">{form.errors.birth_date.join(', ')}</span></label> {/if}
            </div>
        </div>

         <hr class="border-base-300"/>

        <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                 <div class="form-control w-full">
                    <label for="color" class="label pb-1"><span class="label-text font-medium">Color(s)</span></label>
                    <input type="text" id="color" name="color" bind:value={color} placeholder="Optional"
                        class="input input-bordered w-full {form?.errors?.color ? 'input-error' : ''}" />
                    {#if form?.errors?.color} <label class="label pt-1" for="color"><span class="label-text-alt text-error">{form.errors.color.join(', ')}</span></label> {/if}
                </div>

                 <div class="form-control w-full">
                     <label for="distinguishing_features" class="label pb-1"><span class="label-text font-medium">Distinguishing Features</span></label>
                    <input type="text" id="distinguishing_features" name="distinguishing_features" bind:value={distinguishing_features} placeholder="Optional"
                              class="input input-bordered w-full {form?.errors?.distinguishing_features ? 'input-error' : ''}" />
                     {#if form?.errors?.distinguishing_features} <label class="label pt-1" for="distinguishing_features"><span class="label-text-alt text-error">{form.errors.distinguishing_features.join(', ')}</span></label> {/if}
                 </div>
            </div>

             <div class="form-control w-full">
                 <label for="bio" class="label pb-1"><span class="label-text font-medium">Bio / About Your Pet</span></label>
                <textarea id="bio" name="bio" rows="5" bind:value={bio} placeholder="Optional"
                          class="textarea bg-base-100 focus:ring-primary focus:ring-1 w-full rounded-md p-2 {form?.errors?.bio ? 'textarea-error border-error' : 'border border-base-300'}"
                          ></textarea>
                 {#if form?.errors?.bio} <label class="label pt-1" for="bio"><span class="label-text-alt text-error">{form.errors.bio.join(', ')}</span></label> {/if}
             </div>
        </div>

        <div class="form-control mt-10 pt-6 border-t border-base-300">
            <button type="submit" class="btn btn-primary w-full md:w-auto md:ml-auto">Save Changes</button>
        </div>
	</form>

    <div class="mt-12 pt-6 border-t border-error/30">
        <h3 class="text-xl font-semibold text-error mb-3">Danger Zone</h3>
        <p class="text-sm text-base-content/70 mb-4">
            Deleting your pet's profile is permanent and cannot be undone.
            All associated data will be removed.
        </p>
        <button type="button" class="btn btn-error btn-outline" on:click={() => deleteModal.showModal()}>
            <Trash2 class="w-4 h-4 mr-2" />
            Delete Pet Profile
        </button>
    </div>

    <dialog bind:this={deleteModal} id="delete_pet_modal" class="modal">
        <div class="modal-box">
            <form method="dialog"> <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button> </form>
            <h3 class="font-bold text-lg text-error">Confirm Deletion</h3>
            <p class="py-4">Are you absolutely sure you want to delete {data.pet.name}'s profile? This action cannot be undone.</p>
            <div class="modal-action">
                <form method="dialog"> <button class="btn">Cancel</button> </form>
                <form
                    method="POST"
                    action={`/pets/${data.pet.id}/edit?/delete`}
                    use:enhance={({ form, data, action, cancel, submitter }) => {
                        return async ({ result }) => {
                            deleteModal.close();
                            await handleDeleteResult(result as DeleteActionResult);
                        };
                    }}
                >
                    <button type="submit" class="btn btn-error">Yes, Delete Profile</button>
                </form>
            </div>
        </div>
         <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>

</div>