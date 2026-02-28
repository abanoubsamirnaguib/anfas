<template>
    <AdminLayout>
        <template #header>
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h2 class="font-semibold text-2xl text-slate-100 leading-tight">Banner Slides</h2>
                <Link :href="route('admin.banner-slides.create')" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium text-center">
                    Add Slide
                </Link>
            </div>
        </template>

        <div class="py-6 sm:py-8">
            <div class="max-w-7xl mx-auto">
                <div v-if="$page.props.flash?.success" class="mb-4 bg-green-900/40 border border-green-700 text-green-300 px-4 py-3 rounded-lg text-sm">
                    {{ $page.props.flash.success }}
                </div>

                <div class="bg-slate-900 border border-slate-800 overflow-hidden rounded-xl">
                    <div class="p-4 sm:p-6 overflow-x-auto">
                        <table class="min-w-[700px] w-full divide-y divide-slate-800">
                            <thead>
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Preview</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Title</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Link URL</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Order</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                                    <th class="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-slate-900 divide-y divide-slate-800">
                                <tr v-if="slides.length === 0">
                                    <td colspan="6" class="px-4 py-8 text-center text-slate-400 text-sm">No banner slides yet. Add one to populate the homepage slider.</td>
                                </tr>
                                <tr v-for="slide in slides" :key="slide.id">
                                    <td class="px-4 py-3">
                                        <video v-if="slide.video_url" :src="slide.video_url" class="w-20 h-12 object-cover rounded border border-slate-700" muted preload="metadata" />
                                        <img v-else :src="slide.image_url" alt="slide" class="w-20 h-12 object-cover rounded border border-slate-700" />
                                    </td>
                                    <td class="px-4 py-3 text-sm text-slate-200">{{ slide.title || '—' }}</td>
                                    <td class="px-4 py-3 text-sm text-slate-400 max-w-[200px] truncate">{{ slide.link_url || '—' }}</td>
                                    <td class="px-4 py-3 text-sm text-slate-300">{{ slide.sort_order }}</td>
                                    <td class="px-4 py-3">
                                        <span v-if="slide.is_active" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                        <span v-else class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-700 text-slate-200">Inactive</span>
                                    </td>
                                    <td class="px-4 py-3 text-right text-sm font-medium">
                                        <div class="flex justify-end flex-wrap gap-2">
                                            <Link :href="route('admin.banner-slides.edit', slide.id)" class="text-indigo-300 hover:text-indigo-200">Edit</Link>
                                            <button @click="deleteSlide(slide)" class="text-red-400 hover:text-red-300">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/Layouts/AdminLayout.vue';
import { Link, router } from '@inertiajs/vue3';

defineProps({
    slides: Array,
});

const deleteSlide = (slide) => {
    if (confirm('Are you sure you want to delete this slide?')) {
        router.delete(route('admin.banner-slides.destroy', slide.id));
    }
};
</script>
