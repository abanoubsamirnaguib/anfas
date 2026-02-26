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
                                    <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-300">{{ product.category.name }}</td>
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
                                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Message</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800">
                                <tr v-for="message in recentMessages" :key="message.id">
                                    <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-100">{{ message.customer_name || 'N/A' }}</td>
                                    <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-300">{{ message.customer_phone }}</td>
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
