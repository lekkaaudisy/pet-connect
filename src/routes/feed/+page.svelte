<!-- src/routes/feed/+page.svelte -->
<script lang="ts">
    import type { PageData } from './$types';

    export let data: PageData; // To potentially access user data later if needed

    // Reactive variable to get username or fallback
    $: username = data.user?.user_metadata?.username || data.user?.email?.split('@')[0] || 'User';

</script>

<svelte:head>
    <title>Your Feed - PetConnect</title>
    <meta name="description" content="Your PetConnect feed." />
</svelte:head>

<div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-4">Welcome back, {username}!</h1>
    <p class="text-lg mb-6">This is your PetConnect feed.</p>

    <div class="bg-base-200 p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-3">Coming Soon!</h2>
        <p>Your personalized feed content, including updates from pets and owners you follow, group discussions, Q&A, and important alerts, will appear here.</p>
        <!-- We will build the actual feed content in later phases -->
    </div>

     <!-- Temporary link back to root for testing (logged out users land here) -->
    <!-- <div class="mt-6">
        <a href="/" class="link link-primary">Go to Public Homepage (for testing)</a>
    </div> -->
     <!-- Temporary link to trigger logout for testing -->
     <div class="mt-6">
         <form method="POST" action="/auth/logout">
             <button type="submit" class="btn btn-outline btn-sm">Logout (Test)</button>
         </form>
     </div>
</div>