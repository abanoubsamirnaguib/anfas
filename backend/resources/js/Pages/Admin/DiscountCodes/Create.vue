<template>
    <AdminLayout>
        <template #header>
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h2 class="font-semibold text-2xl text-slate-100 leading-tight">Create Discount Code</h2>
                <Link :href="route('admin.discount-codes.index')" class="text-slate-300 hover:text-slate-100">Back to Discount Codes</Link>
            </div>
        </template>

        <div class="py-6 sm:py-8">
            <div class="max-w-3xl mx-auto">
                <div class="bg-slate-900 border border-slate-800 overflow-hidden rounded-xl">
                    <form @submit.prevent="submit" class="p-6 space-y-6">
                        <div>
                            <label for="code" class="block text-sm font-medium text-slate-300">Code *</label>
                            <input v-model="form.code" type="text" id="code" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 uppercase" required>
                            <div v-if="form.errors.code" class="text-red-600 text-sm mt-1">{{ form.errors.code }}</div>
                        </div>

                        <div>
                            <label for="description" class="block text-sm font-medium text-slate-300">Description</label>
                            <textarea v-model="form.description" id="description" rows="3" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="type" class="block text-sm font-medium text-slate-300">Type *</label>
                                <select v-model="form.type" id="type" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (€)</option>
                                </select>
                                <div v-if="form.errors.type" class="text-red-600 text-sm mt-1">{{ form.errors.type }}</div>
                            </div>
                            <div>
                                <label for="value" class="block text-sm font-medium text-slate-300">Value *</label>
                                <input v-model.number="form.value" type="number" id="value" step="0.01" min="0" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                                <div v-if="form.errors.value" class="text-red-600 text-sm mt-1">{{ form.errors.value }}</div>
                            </div>
                        </div>

                        <div v-if="form.type === 'percentage'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="min_purchase" class="block text-sm font-medium text-slate-300">Min Purchase (€)</label>
                                <input v-model.number="form.min_purchase" type="number" id="min_purchase" step="0.01" min="0" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            </div>
                            <div>
                                <label for="max_discount" class="block text-sm font-medium text-slate-300">Max Discount (€)</label>
                                <input v-model.number="form.max_discount" type="number" id="max_discount" step="0.01" min="0" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            </div>
                        </div>

                        <div>
                            <label for="usage_limit" class="block text-sm font-medium text-slate-300">Usage Limit</label>
                            <input v-model.number="form.usage_limit" type="number" id="usage_limit" min="1" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            <p class="text-xs text-slate-400 mt-1">Leave empty for unlimited</p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="starts_at" class="block text-sm font-medium text-slate-300">Starts At</label>
                                <input v-model="form.starts_at" type="datetime-local" id="starts_at" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            </div>
                            <div>
                                <label for="expires_at" class="block text-sm font-medium text-slate-300">Expires At</label>
                                <input v-model="form.expires_at" type="datetime-local" id="expires_at" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            </div>
                        </div>

                        <div class="flex items-center">
                            <input v-model="form.is_active" type="checkbox" id="is_active" class="rounded border-slate-600 bg-slate-900 text-indigo-500 shadow-sm">
                            <label for="is_active" class="ml-2 block text-sm text-slate-200">Active</label>
                        </div>

                        <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
                            <Link :href="route('admin.discount-codes.index')" class="bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-md text-sm font-medium text-center">Cancel</Link>
                            <button type="submit" :disabled="form.processing" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50">
                                Create Code
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

const form = useForm({
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    min_purchase: '',
    max_discount: '',
    usage_limit: '',
    starts_at: '',
    expires_at: '',
    is_active: true,
});

const submit = () => {
    form.post(route('admin.discount-codes.store'));
};
</script>
