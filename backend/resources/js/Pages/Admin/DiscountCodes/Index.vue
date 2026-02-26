<template>
    <AdminLayout>
        <template #header>
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h2 class="font-semibold text-2xl text-slate-100 leading-tight">Discount Codes</h2>
                <Link :href="route('admin.discount-codes.create')" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium text-center">Add Discount Code</Link>
            </div>
        </template>

        <div class="py-6 sm:py-8">
            <div class="max-w-7xl mx-auto">
                <div class="bg-slate-900 border border-slate-800 overflow-hidden rounded-xl">
                    <div class="p-4 sm:p-6 overflow-x-auto">
                        <table class="min-w-[980px] w-full divide-y divide-slate-800">
                            <thead>
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Code</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Type</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Value</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Usage</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Expires</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-slate-900 divide-y divide-slate-800">
                                <tr v-for="code in discountCodes.data" :key="code.id">
                                    <td class="px-6 py-4 text-sm font-mono font-medium text-slate-100">{{ code.code }}</td>
                                    <td class="px-6 py-4 text-sm text-slate-300 capitalize">{{ code.type }}</td>
                                    <td class="px-6 py-4 text-sm text-slate-100">
                                        {{ code.type === 'percentage' ? code.value + '%' : '€' + code.value }}
                                    </td>
                                    <td class="px-6 py-4 text-sm text-slate-300">
                                        {{ code.usage_count }} / {{ code.usage_limit ?? '∞' }}
                                    </td>
                                    <td class="px-6 py-4 text-sm text-slate-300">
                                        {{ code.expires_at ? new Date(code.expires_at).toLocaleDateString() : '—' }}
                                    </td>
                                    <td class="px-6 py-4">
                                        <span v-if="code.is_active" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                        <span v-else class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-700 text-slate-200">Inactive</span>
                                    </td>
                                    <td class="px-6 py-4 text-right text-sm font-medium min-w-[180px]">
                                        <div class="flex justify-end flex-wrap gap-2">
                                            <Link :href="route('admin.discount-codes.edit', code.id)" class="text-indigo-300 hover:text-indigo-200">Edit</Link>
                                            <button @click="deleteCode(code)" class="text-red-400 hover:text-red-300">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <!-- Pagination -->
                        <div v-if="discountCodes.links" class="mt-4 flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
                            <div class="text-sm text-slate-400">
                                Showing {{ discountCodes.from }} to {{ discountCodes.to }} of {{ discountCodes.total }} codes
                            </div>
                            <div class="flex gap-2 flex-wrap">
                                <template v-for="link in discountCodes.links" :key="link.label">
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

defineProps({
    discountCodes: Object,
});

const deleteCode = (code) => {
    if (confirm(`Delete code "${code.code}"?`)) {
        router.delete(route('admin.discount-codes.destroy', code.id));
    }
};
</script>
