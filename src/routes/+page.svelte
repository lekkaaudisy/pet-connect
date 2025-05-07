<!-- src/routes/+page.svelte -->
<svelte:head>
    <title>Welcome - PetConnect</title>
    <meta name="description" content="Welcome to PetConnect, a social network for pets and their owners." />
</svelte:head>

<div class="hero min-h-[calc(100vh-10rem)] bg-base-200">
    <div class="hero-content text-center">
        <div class="max-w-md">
            <h1 class="text-5xl font-bold">Hello Pet Lovers!</h1>
            <p class="py-6">
                PetConnect is a unique social media platform designed for pet owners to connect, share, and find support.
                Join our community today!
            </p>
            <a href="/auth/register" class="btn btn-primary">Get Started</a>
        </div>
    </div>
</div>

<div class="py-12 bg-base-100">
    <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-8">Why PetConnect?</h2>
        <div class="grid md:grid-cols-3 gap-8">
            <div class="card bg-base-300 shadow-xl">
                <div class="card-body items-center text-center">
                    <h3 class="card-title">Connect & Share</h3>
                    <p>Create profiles for your pets and share their adorable moments.</p>
                </div>
            </div>
            <div class="card bg-base-300 shadow-xl">
                <div class="card-body items-center text-center">
                    <h3 class="card-title">Missing Pet Alerts</h3>
                    <p>Our key feature: quickly alert the community if your pet goes missing.</p>
                </div>
            </div>
            <div class="card bg-base-300 shadow-xl">
                <div class="card-body items-center text-center">
                    <h3 class="card-title">Supportive Community</h3>
                    <p>Find support and advice from fellow pet enthusiasts.</p>
                </div>
            </div>
        </div>
    </div>
</div>