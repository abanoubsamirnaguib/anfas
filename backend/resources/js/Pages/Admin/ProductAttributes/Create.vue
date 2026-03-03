<template>
    <AdminLayout>
        <template #header>
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h2 class="font-semibold text-2xl text-slate-100 leading-tight">Add Attribute — {{ product.name }}</h2>
                <Link :href="route('admin.products.attributes.index', product.id)" class="text-slate-300 hover:text-slate-100">Back to Attributes</Link>
            </div>
        </template>

        <div class="py-6 sm:py-8">
            <div class="max-w-2xl mx-auto">
                <div class="bg-slate-900 border border-slate-800 overflow-hidden rounded-xl">
                    <form @submit.prevent="submit" class="p-6 space-y-6">
                        <div>
                            <label for="name" class="block text-sm font-medium text-slate-300">Attribute Name *</label>
                            <input v-model="form.name" type="text" id="name" placeholder="e.g. Size, Volume" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                            <div v-if="form.errors.name" class="text-red-600 text-sm mt-1">{{ form.errors.name }}</div>
                        </div>

                        <div>
                            <label for="value" class="block text-sm font-medium text-slate-300">Value *</label>
                            <input v-model="form.value" type="text" id="value" placeholder="e.g. 50ml, Large" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                            <div v-if="form.errors.value" class="text-red-600 text-sm mt-1">{{ form.errors.value }}</div>
                        </div>

                        <div>
                            <label for="price" class="block text-sm font-medium text-slate-300">Price (€) *</label>
                            <input v-model.number="form.price" type="number" id="price" step="0.01" min="0" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                            <div v-if="form.errors.price" class="text-red-600 text-sm mt-1">{{ form.errors.price }}</div>
                        </div>

                        <div>
                            <label for="discount_percentage" class="block text-sm font-medium text-slate-300">Discount (%)</label>
                            <input v-model.number="form.discount_percentage" type="number" id="discount_percentage" step="0.0001" min="0" max="100" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            <p class="text-slate-500 text-xs mt-1">Individual discount for this attribute (overrides product discount)</p>
                            <div v-if="form.errors.discount_percentage" class="text-red-600 text-sm mt-1">{{ form.errors.discount_percentage }}</div>
                        </div>

                        <div>
                            <label for="stock" class="block text-sm font-medium text-slate-300">Stock</label>
                            <input v-model.number="form.stock" type="number" id="stock" min="0" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        </div>

                        <div>
                            <label for="sku" class="block text-sm font-medium text-slate-300">SKU</label>
                            <input v-model="form.sku" type="text" id="sku" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        </div>

                        <div class="flex items-center">
                            <input v-model="form.is_active" type="checkbox" id="is_active" class="rounded border-slate-600 bg-slate-900 text-indigo-500 shadow-sm">
                            <label for="is_active" class="ml-2 block text-sm text-slate-200">Active</label>
                        </div>

                        <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
                            <Link :href="route('admin.products.attributes.index', product.id)" class="bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-md text-sm font-medium text-center">Cancel</Link>
                            <button type="submit" :disabled="form.processing" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50">
                                Add Attribute
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
import { Link, useForm } from '@inertiajs/vue3';

const props = defineProps({
    product: Object,
});

const form = useForm({
    name: '',
    value: '',
    price: '',
    discount_percentage: 0,
    stock: '',
    sku: '',
    is_active: true,
});

const submit = () => {
    form.post(route('admin.products.attributes.store', props.product.id));
};
</script>
