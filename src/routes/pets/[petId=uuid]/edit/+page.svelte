<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import { goto } from '$app/navigation';

	export let data: PageData;
	export let form: ActionData | null = null;

	$: name = form?.data?.name ?? data.pet.name ?? '';
	$: species = form?.data?.species ?? data.pet.species ?? '';
	$: breed = form?.data?.breed ?? data.pet.breed ?? '';
	$: birth_date = form?.data?.birth_date ?? data.pet.birth_date ?? '';
	$: color = form?.data?.color ?? data.pet.color ?? '';
	$: distinguishing_features = form?.data?.distinguishing_features ?? data.pet.distinguishing_features ?? '';
	$: bio = form?.data?.bio ?? data.pet.bio ?? '';

	let imagePreviewUrl: string | null = data.pet.profile_picture_url ?? null;
	let fileInput: HTMLInputElement;
    let formElement: HTMLFormElement;

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
	<h1 class="text-3xl font-bold mb-8 text-center">Edit {data.pet.name}'s Profile</h1>

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

	<form bind:this={formElement} method="POST" use:enhance enctype="multipart/form-data" class="space-y-8">

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
</div>