<template>
    <div class="min-h-screen bg-slate-950 text-slate-100">
        <!-- Navigation -->
        <nav class="bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex">
                        <div class="flex-shrink-0 flex items-center">
                            <Link :href="route('admin.dashboard')" class="text-xl font-bold text-slate-100">
                               Admin Panel
                            </Link>
                        </div>
                        <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link :href="route('admin.dashboard')" :class="isActive('admin.dashboard') ? 'border-indigo-400 text-white' : 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200'" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Dashboard
                            </Link>
                            <Link :href="route('admin.categories.index')" :class="isActive('admin.categories.*') ? 'border-indigo-400 text-white' : 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200'" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Categories
                            </Link>
                            <Link :href="route('admin.products.index')" :class="isActive('admin.products.*') ? 'border-indigo-400 text-white' : 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200'" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Products
                            </Link>
                            <Link :href="route('admin.banner-slides.index')" :class="isActive('admin.banner-slides.*') ? 'border-indigo-400 text-white' : 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200'" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Banners
                            </Link>
                            <Link :href="route('admin.discount-codes.index')" :class="isActive('admin.discount-codes.*') ? 'border-indigo-400 text-white' : 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200'" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Discounts
                            </Link>
                            <Link :href="route('admin.whatsapp-messages.index')" :class="isActive('admin.whatsapp-messages.*') ? 'border-indigo-400 text-white' : 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200'" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Messages
                            </Link>
                            <Link :href="route('admin.settings.edit')" :class="isActive('admin.settings.*') ? 'border-indigo-400 text-white' : 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200'" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Settings
                            </Link>
                        </div>
                    </div>

                    <div class="flex items-center sm:hidden">
                        <button
                            @click="menuOpen = !menuOpen"
                            type="button"
                            class="inline-flex items-center justify-center rounded-md p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path v-if="!menuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div v-show="menuOpen" class="sm:hidden pb-4 pt-2 space-y-1 border-t border-slate-800">
                    <Link :href="route('admin.dashboard')" class="block rounded-md px-3 py-2 text-sm" :class="isActive('admin.dashboard') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'">Dashboard</Link>
                    <Link :href="route('admin.categories.index')" class="block rounded-md px-3 py-2 text-sm" :class="isActive('admin.categories.*') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'">Categories</Link>
                    <Link :href="route('admin.products.index')" class="block rounded-md px-3 py-2 text-sm" :class="isActive('admin.products.*') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'">Products</Link>
                    <Link :href="route('admin.banner-slides.index')" class="block rounded-md px-3 py-2 text-sm" :class="isActive('admin.banner-slides.*') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'">Banners</Link>
                    <Link :href="route('admin.discount-codes.index')" class="block rounded-md px-3 py-2 text-sm" :class="isActive('admin.discount-codes.*') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'">Discounts</Link>
                    <Link :href="route('admin.whatsapp-messages.index')" class="block rounded-md px-3 py-2 text-sm" :class="isActive('admin.whatsapp-messages.*') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'">Messages</Link>
                    <Link :href="route('admin.settings.edit')" class="block rounded-md px-3 py-2 text-sm" :class="isActive('admin.settings.*') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'">Settings</Link>
                </div>
            </div>
        </nav>

        <!-- Page Header -->
        <header class="bg-slate-900/70 border-b border-slate-800 backdrop-blur" v-if="$slots.header">
            <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <slot name="header" />
            </div>
        </header>

        <!-- Page Content -->
        <main>
            <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <slot />
            </div>
        </main>
    </div>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
import { usePage } from '@inertiajs/vue3';
import { ref } from 'vue';

const page = usePage();
const menuOpen = ref(false);

const isActive = (routeName) => {
    const currentRoute = page.props.ziggy?.route;
    if (!currentRoute) return false;
    
    if (routeName.endsWith('.*')) {
        return currentRoute.startsWith(routeName.slice(0, -2));
    }
    return currentRoute === routeName;
};
</script>
