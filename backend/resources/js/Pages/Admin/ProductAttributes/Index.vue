<template>
    <AdminLayout>
        <template #header>
            <div class="flex flex-col lg:flex-row justify-between lg:items-center gap-3">
                <h2 class="font-semibold text-2xl text-slate-100 leading-tight">
                    Attributes — {{ product.name }}
                </h2>
                <div class="flex flex-wrap gap-2">
                    <Link :href="route('admin.products.attributes.create', product.id)" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Add Attribute</Link>
                    <Link :href="route('admin.products.edit', product.id)" class="bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-lg text-sm font-medium">Edit Product</Link>
                    <Link :href="route('admin.products.index')" class="text-slate-300 hover:text-slate-100 px-4 py-2">Back</Link>
                </div>
            </div>
        </template>

        <div class="py-6 sm:py-8">
            <div class="max-w-7xl mx-auto">
                <div class="bg-slate-900 border border-slate-800 overflow-hidden rounded-xl">
                    <div class="p-4 sm:p-6 overflow-x-auto">
                        <p v-if="attributes.length === 0" class="text-slate-400">No attributes yet. Add size/volume variants above.</p>
                        <table v-else class="min-w-[1020px] w-full divide-y divide-slate-800">
                            <thead>
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Name</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Value</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Price (€)</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Stock</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">SKU</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-slate-900 divide-y divide-slate-800">
                                <tr v-for="attr in attributes" :key="attr.id">
                                    <td class="px-6 py-4 text-sm text-slate-100">{{ attr.name }}</td>
                                    <td class="px-6 py-4 text-sm text-slate-100">{{ attr.value }}</td>
                                    <td class="px-6 py-4 text-sm text-slate-100">€{{ attr.price }}</td>
                                    <td class="px-6 py-4 text-sm text-slate-300">{{ attr.stock ?? '—' }}</td>
                                    <td class="px-6 py-4 text-sm text-slate-300 font-mono">{{ attr.sku ?? '—' }}</td>
                                    <td class="px-6 py-4">
                                        <span v-if="attr.is_active" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                        <span v-else class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-700 text-slate-200">Inactive</span>
                                    </td>
                                    <td class="px-6 py-4 text-right text-sm font-medium min-w-[180px]">
                                        <div class="flex justify-end flex-wrap gap-2">
                                            <Link :href="route('admin.products.attributes.edit', [product.id, attr.id])" class="text-indigo-300 hover:text-indigo-200">Edit</Link>
                                            <button @click="deleteAttribute(attr)" class="text-red-400 hover:text-red-300">Delete</button>
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

const props = defineProps({
    product: Object,
    attributes: Array,
});

const deleteAttribute = (attr) => {
    if (confirm(`Delete attribute "${attr.name}: ${attr.value}"?`)) {
        router.delete(route('admin.products.attributes.destroy', [props.product.id, attr.id]));
    }
};
</script>
