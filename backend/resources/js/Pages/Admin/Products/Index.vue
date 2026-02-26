<template>
    <AdminLayout>
        <template #header>
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h2 class="font-semibold text-2xl text-slate-100 leading-tight">Products</h2>
                <Link :href="route('admin.products.create')" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium text-center">
                    Add Product
                </Link>
            </div>
        </template>

        <div class="py-6 sm:py-8">
            <div class="max-w-7xl mx-auto">
                <!-- Filters -->
                <div class="bg-slate-900 border border-slate-800 overflow-hidden rounded-xl mb-4 p-4">
                    <form @submit.prevent="applyFilters" class="flex flex-col lg:flex-row gap-3 lg:gap-4">
                        <div class="flex-1">
                            <input v-model="filterForm.search" type="text" placeholder="Search products..." class="w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        </div>
                        <select v-model="filterForm.category_id" class="rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            <option value="">All Categories</option>
                            <option v-for="category in categories" :key="category.id" :value="category.id">
                                {{ category.name }}
                            </option>
                        </select>
                        <button type="submit" class="bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-md text-sm font-medium">
                            Filter
                        </button>
                    </form>
                </div>

                <div class="bg-slate-900 border border-slate-800 overflow-hidden rounded-xl">
                    <div class="p-4 sm:p-6 overflow-x-auto">
                        <table class="min-w-[1100px] w-full divide-y divide-slate-800">
                            <thead>
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Image</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Name</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Category</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Price</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Attributes</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800">
                                <tr v-for="product in products.data" :key="product.id">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <img v-if="product.image" :src="product.image" :alt="product.name" class="h-10 w-10 rounded object-cover" />
                                    </td>
                                    <td class="px-6 py-4 text-sm font-medium text-slate-100">{{ product.name }}</td>
                                    <td class="px-6 py-4 text-sm text-slate-300">{{ product.category.name }}</td>
                                    <td class="px-6 py-4 text-sm text-slate-100">€{{ product.base_price }}</td>
                                    <td class="px-6 py-4 text-sm text-slate-300">{{ product.attributes_count }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span v-if="product.is_active" class="px-2 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                                        <span v-else class="px-2 text-xs rounded-full bg-slate-700 text-slate-200">Inactive</span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium min-w-[260px]">
                                        <div class="flex justify-end flex-wrap gap-2">
                                            <Link :href="route('admin.products.attributes.index', product.id)" class="text-blue-300 hover:text-blue-200">Attributes</Link>
                                            <Link :href="route('admin.products.edit', product.id)" class="text-indigo-300 hover:text-indigo-200">Edit</Link>
                                            <button @click="deleteProduct(product)" class="text-red-400 hover:text-red-300">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <!-- Pagination -->
                        <div v-if="products.links" class="mt-4 flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
                            <div class="text-sm text-slate-400">
                                Showing {{ products.from }} to {{ products.to }} of {{ products.total }} results
                            </div>
                            <div class="flex gap-2 flex-wrap">
                                <template v-for="link in products.links" :key="link.label">
                                    <Link
                                        v-if="link.url"
                                        :href="link.url"
                                        v-html="link.label"
                                        :class="(link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800') + ' px-3 py-1 rounded border'"
                                    />
                                    <span v-else v-html="link.label" class="px-3 py-1 rounded border border-slate-700 text-slate-500" />
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/Layouts/AdminLayout.vue';
import { Link, router } from '@inertiajs/vue3';
import { ref } from 'vue';

const props = defineProps({
    products: Object,
    categories: Array,
    filters: Object,
});

const filterForm = ref({
    search: props.filters.search || '',
    category_id: props.filters.category_id || '',
});

const applyFilters = () => {
    router.get(route('admin.products.index'), filterForm.value, { preserveState: true });
};

const deleteProduct = (product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
        router.delete(route('admin.products.destroy', product.id));
    }
};
</script>
