<template>
    <AdminLayout>
        <template #header>
            <h2 class="font-semibold text-2xl text-slate-100 leading-tight">Admin Dashboard</h2>
        </template>

        <div class="py-6 sm:py-8">
            <div class="max-w-7xl mx-auto">
                <!-- Stats Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div class="bg-slate-900 border border-slate-800 overflow-hidden rounded-xl p-6">
                        <div class="text-slate-400 text-sm">Total Categories</div>
                        <div class="text-3xl font-bold text-slate-100 mt-2">{{ stats.total_categories }}</div>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 overflow-hidden rounded-xl p-6">
                        <div class="text-slate-400 text-sm">Total Products</div>
                        <div class="text-3xl font-bold text-slate-100 mt-2">{{ stats.total_products }}</div>
                        <div class="text-xs text-slate-400 mt-1">{{ stats.active_products }} active</div>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 overflow-hidden rounded-xl p-6">
                        <div class="text-slate-400 text-sm">Discount Codes</div>
                        <div class="text-3xl font-bold text-slate-100 mt-2">{{ stats.total_discount_codes }}</div>
                        <div class="text-xs text-slate-400 mt-1">{{ stats.active_discount_codes }} active</div>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 overflow-hidden rounded-xl p-6">
                        <div class="text-slate-400 text-sm">WhatsApp Messages</div>
                        <div class="text-3xl font-bold text-slate-100 mt-2">{{ stats.total_messages }}</div>
                        <div class="text-xs text-slate-400 mt-1">{{ stats.pending_messages }} pending</div>
                    </div>
                </div>

                <!-- Recent Products -->
                <div class="bg-slate-900 border border-slate-800 overflow-hidden rounded-xl mb-8">
                    <div class="p-6 border-b border-slate-800">
                        <h3 class="text-lg font-semibold text-slate-100">Recent Products</h3>
                    </div>
                    <div class="p-4 sm:p-6 overflow-x-auto">
                        <table class="min-w-[720px] w-full divide-y divide-slate-800">
                            <thead>
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Name</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Category</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Price</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800">
                                <tr v-for="product in recentProducts" :key="product.id">
                                    <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-100">{{ product.name }}</td>
                                    <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-300">
                                        <span v-if="product.categories && product.categories.length > 0">{{ product.categories[0].name }}</span>
                                        <span v-else class="text-slate-500 italic">None</span>
                                    </td>
                                    <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-100">€{{ product.base_price }}</td>
                                    <td class="px-4 py-3 whitespace-nowrap">
                                        <span v-if="product.is_active" class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                                        <span v-else class="px-2 py-1 text-xs rounded-full bg-slate-700 text-slate-200">Inactive</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Recent Messages -->
                <div class="bg-slate-900 border border-slate-800 overflow-hidden rounded-xl">
                    <div class="p-6 border-b border-slate-800">
                        <h3 class="text-lg font-semibold text-slate-100">Recent WhatsApp Messages</h3>
                    </div>
                    <div class="p-4 sm:p-6 overflow-x-auto">
                        <table class="min-w-[780px] w-full divide-y divide-slate-800">
                            <thead>
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Customer</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Phone</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Channel</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Message</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800">
                                <tr v-for="message in recentMessages" :key="message.id">
                                    <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-100">{{ message.customer_name || 'N/A' }}</td>
                                    <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-300">{{ message.customer_phone }}</td>
                                    <td class="px-4 py-3 whitespace-nowrap text-sm">
                                        <span v-if="message.channel === 'instagram'" class="px-2 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-pink-100 text-pink-800">
                                            <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                            IG
                                        </span>
                                        <span v-else class="px-2 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                            WA
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-sm text-slate-100">{{ message.message.substring(0, 50) }}...</td>
                                    <td class="px-4 py-3 whitespace-nowrap">
                                        <span :class="{
                                            'bg-yellow-100 text-yellow-800': message.status === 'pending',
                                            'bg-green-100 text-green-800': message.status === 'sent',
                                            'bg-red-100 text-red-800': message.status === 'failed'
                                        }" class="px-2 py-1 text-xs rounded-full">
                                            {{ message.status }}
                                        </span>
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

defineProps({
    stats: Object,
    recentProducts: Array,
    recentMessages: Array,
});
</script>
