<template>
    <AdminLayout>
        <template #header>
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h2 class="font-semibold text-2xl text-slate-100 leading-tight">Categories</h2>
                <Link :href="route('admin.categories.create')" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium text-center">
                    Add Category
                </Link>
            </div>
        </template>

        <div class="py-6 sm:py-8">
            <div class="max-w-7xl mx-auto">
                <div class="bg-slate-900 border border-slate-800 overflow-hidden rounded-xl">
                    <div class="p-4 sm:p-6 overflow-x-auto">
                        <table class="min-w-[920px] w-full divide-y divide-slate-800">
                            <thead>
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Slug</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Products</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-slate-900 divide-y divide-slate-800">
                                <tr v-for="category in categories" :key="category.id">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">{{ category.name }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{{ category.slug }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{{ category.products_count }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span v-if="category.is_active" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                        <span v-else class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-700 text-slate-200">Inactive</span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium min-w-[180px]">
                                        <div class="flex justify-end flex-wrap gap-2">
                                            <Link :href="route('admin.categories.edit', category.id)" class="text-indigo-300 hover:text-indigo-200">Edit</Link>
                                            <button @click="deleteCategory(category)" class="text-red-400 hover:text-red-300">Delete</button>
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
    categories: Array,
});

const deleteCategory = (category) => {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
        router.delete(route('admin.categories.destroy', category.id));
    }
};
</script>
