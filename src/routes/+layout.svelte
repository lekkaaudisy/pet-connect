<!-- src/routes/+layout.svelte -->
<script lang="ts">
    import '../app.css'; // Import global styles (Tailwind/DaisyUI)
    import { onMount } from 'svelte';
    import { themeChange } from 'theme-change'; // For DaisyUI theme switching

    onMount(() => {
        // Enables DaisyUI theme switching based on data-theme attribute on <html>
        themeChange(false);
    });
</script>

<div class="min-h-screen flex flex-col bg-base-100 text-base-content">
    <header class="bg-neutral text-neutral-content shadow-md">
        <div class="container mx-auto navbar px-4">
            <div class="flex-1">
                <a href="/" class="btn btn-ghost normal-case text-xl">PetConnect</a>
            </div>
            <div class="flex-none">
                <!-- Theme Changer Dropdown -->
                <div title="Change Theme" class="dropdown dropdown-end">
                    <div tabindex="0" role="button" class="btn btn-ghost normal-case">
                        <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-5 w-5 stroke-current md:h-6 md:w-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
                        <span class="hidden md:inline">Theme</span>
                        <svg width="12px" height="12px" class="ml-1 hidden h-3 w-3 fill-current opacity-60 sm:inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048"><path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path></svg>
                    </div>
                    <div class="dropdown-content bg-base-200 text-base-content rounded-t-box rounded-b-box top-px max-h-96 h-[70vh] w-52 overflow-y-auto shadow-2xl mt-16">
                        <div class="grid grid-cols-1 gap-3 p-3">
                            <button class="outline-base-content overflow-hidden rounded-lg text-left" data-set-theme="light" data-act-class="[&_svg]:visible">
                                <div data-theme="light" class="bg-base-100 text-base-content w-full cursor-pointer font-sans">
                                    <div class="grid grid-cols-5 grid-rows-3">
                                        <div class="col-span-5 row-span-3 row-start-1 flex gap-1 py-3 px-4 items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3 invisible"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"></path></svg>
                                            <div class="flex-grow text-sm">light</div>
                                            <div class="flex flex-shrink-0 flex-wrap gap-1 h-full">
                                                <div class="bg-primary w-2 rounded"></div>
                                                <div class="bg-secondary w-2 rounded"></div>
                                                <div class="bg-accent w-2 rounded"></div>
                                                <div class="bg-neutral w-2 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </button>
                            <button class="outline-base-content overflow-hidden rounded-lg text-left" data-set-theme="dark" data-act-class="[&_svg]:visible">
                                <div data-theme="dark" class="bg-base-100 text-base-content w-full cursor-pointer font-sans">
                                    <div class="grid grid-cols-5 grid-rows-3">
                                        <div class="col-span-5 row-span-3 row-start-1 flex gap-1 py-3 px-4 items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3 invisible"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"></path></svg>
                                            <div class="flex-grow text-sm">dark</div>
                                            <div class="flex flex-shrink-0 flex-wrap gap-1 h-full">
                                                <div class="bg-primary w-2 rounded"></div>
                                                <div class="bg-secondary w-2 rounded"></div>
                                                <div class="bg-accent w-2 rounded"></div>
                                                <div class="bg-neutral w-2 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </button>
                            <button class="outline-base-content overflow-hidden rounded-lg text-left" data-set-theme="cupcake" data-act-class="[&_svg]:visible">
                                <div data-theme="cupcake" class="bg-base-100 text-base-content w-full cursor-pointer font-sans">
                                    <div class="grid grid-cols-5 grid-rows-3">
                                        <div class="col-span-5 row-span-3 row-start-1 flex gap-1 py-3 px-4 items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3 invisible"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"></path></svg>
                                            <div class="flex-grow text-sm">cupcake</div>
                                            <div class="flex flex-shrink-0 flex-wrap gap-1 h-full">
                                                <div class="bg-primary w-2 rounded"></div>
                                                <div class="bg-secondary w-2 rounded"></div>
                                                <div class="bg-accent w-2 rounded"></div>
                                                <div class="bg-neutral w-2 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </button>
                            <!-- Add more theme buttons here for themes specified in tailwind.config.js -->
                        </div>
                    </div>
                </div>
                <!-- Placeholder for Auth Links -->
                <ul class="menu menu-horizontal px-1">
                    <li><a href="/auth/login">Login</a></li>
                    <li><a href="/auth/register">Register</a></li>
                </ul>
            </div>
        </div>
    </header>

    <main class="flex-grow container mx-auto p-4">
        <slot /> <!-- This is where page content will be injected -->
    </main>

    <footer class="footer footer-center p-4 bg-base-300 text-base-content">
        <div>
            <p>© {new Date().getFullYear()} PetConnect. All rights reserved.</p>
        </div>
    </footer>
</div>