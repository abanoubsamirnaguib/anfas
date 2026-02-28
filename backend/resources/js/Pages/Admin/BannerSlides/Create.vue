<template>
    <AdminLayout>
        <template #header>
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h2 class="font-semibold text-2xl text-slate-100 leading-tight">Add Banner Slide</h2>
                <Link :href="route('admin.banner-slides.index')" class="text-slate-300 hover:text-slate-100">Back to Slides</Link>
            </div>
        </template>

        <div class="py-6 sm:py-8">
            <div class="max-w-3xl mx-auto">
                <div class="bg-slate-900 border border-slate-800 overflow-hidden rounded-xl">
                    <form @submit.prevent="submit" class="p-6 space-y-6">

                        <!-- Image Upload -->
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">Slide Image *</label>
                            <ImageUpload v-model="form.image_url" folder="images" />
                            <div v-if="form.errors.image_url" class="text-red-500 text-sm mt-1">{{ form.errors.image_url }}</div>
                        </div>

                        <!-- Video Upload -->
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">Slide Video <span class="text-slate-500 font-normal">(optional — replaces image when set)</span></label>
                            <VideoUpload v-model="form.video_url" folder="banner-videos" />
                            <div v-if="form.errors.video_url" class="text-red-500 text-sm mt-1">{{ form.errors.video_url }}</div>
                        </div>

                        <!-- Link URL -->
                        <div>
                            <label for="link_url" class="block text-sm font-medium text-slate-300">Link URL</label>
                            <input
                                v-model="form.link_url"
                                type="text"
                                id="link_url"
                                placeholder="/categories/oud  or  https://example.com"
                                class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <p class="text-xs text-slate-400 mt-1">Where to navigate when this slide is tapped. Use internal paths like <code class="text-slate-300">/categories/oud</code> or full external URLs.</p>
                            <div v-if="form.errors.link_url" class="text-red-500 text-sm mt-1">{{ form.errors.link_url }}</div>
                        </div>

                        <!-- Title -->
                        <div>
                            <label for="title" class="block text-sm font-medium text-slate-300">Title (optional)</label>
                            <input v-model="form.title" type="text" id="title" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            <div v-if="form.errors.title" class="text-red-500 text-sm mt-1">{{ form.errors.title }}</div>
                        </div>

                        <!-- Subtitle -->
                        <div>
                            <label for="subtitle" class="block text-sm font-medium text-slate-300">Subtitle (optional)</label>
                            <input v-model="form.subtitle" type="text" id="subtitle" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>

                        <!-- Sort Order -->
                        <div>
                            <label for="sort_order" class="block text-sm font-medium text-slate-300">Sort Order</label>
                            <input v-model.number="form.sort_order" type="number" id="sort_order" min="0" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            <p class="text-xs text-slate-400 mt-1">Lower numbers appear first.</p>
                        </div>

                        <!-- Active -->
                        <div class="flex items-center">
                            <input v-model="form.is_active" type="checkbox" id="is_active" class="rounded border-slate-600 bg-slate-900 text-indigo-500 shadow-sm" />
                            <label for="is_active" class="ml-2 block text-sm text-slate-200">Active (visible in the storefront slider)</label>
                        </div>

                        <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
                            <Link :href="route('admin.banner-slides.index')" class="bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-md text-sm font-medium text-center">Cancel</Link>
                            <button type="submit" :disabled="form.processing" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50">
                                Create Slide
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/Layouts/AdminLayout.vue';
import ImageUpload from '@/Components/Admin/ImageUpload.vue';
import VideoUpload from '@/Components/Admin/VideoUpload.vue';
import { Link, useForm } from '@inertiajs/vue3';

const form = useForm({
    image_url:  '',
    video_url:  '',
    link_url:   '',
    title:      '',
    subtitle:   '',
    sort_order: 0,
    is_active:  true,
});

const submit = () => {
    form.post(route('admin.banner-slides.store'));
};
</script>
