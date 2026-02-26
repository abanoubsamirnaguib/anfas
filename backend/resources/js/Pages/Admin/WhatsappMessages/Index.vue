<template>
    <AdminLayout>
        <template #header>
            <div class="flex flex-col lg:flex-row justify-between lg:items-center gap-3">
                <h2 class="font-semibold text-2xl text-slate-100 leading-tight">WhatsApp Messages</h2>
                <div class="flex flex-col sm:flex-row sm:items-center gap-2 w-full lg:w-auto">
                    <select v-model="filterForm.status" class="rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm text-sm">
                        <option value="">All</option>
                        <option value="pending">Pending</option>
                        <option value="sent">Sent</option>
                        <option value="failed">Failed</option>
                    </select>
                    <input v-model="filterForm.search" type="text" placeholder="Search..." class="rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm text-sm px-2" />
                    <button @click="applyFilters" class="bg-slate-800 hover:bg-slate-700 text-slate-100 px-3 py-1 rounded text-sm">Filter</button>
                </div>
            </div>
        </template>

        <div class="py-6">
            <div class="max-w-7xl mx-auto">
                <div class="bg-slate-900 border border-slate-800 overflow-hidden rounded-xl">
                    <div class="p-4 sm:p-6 overflow-x-auto">
                        <table class="min-w-[1180px] w-full divide-y divide-slate-800">
                            <thead>
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Customer</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Phone</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Message</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Created</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800 bg-slate-900">
                                <tr v-for="msg in messages.data" :key="msg.id">
                                    <td class="px-6 py-4 text-sm text-slate-100">{{ msg.customer_name || '—' }}</td>
                                    <td class="px-6 py-4 text-sm text-slate-300">{{ msg.customer_phone || '—' }}</td>
                                    <td class="px-6 py-4 text-sm text-slate-200"><div class="truncate" style="max-width:360px">{{ msg.message }}</div></td>
                                    <td class="px-6 py-4 text-sm">
                                        <span v-if="msg.status === 'sent'" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Sent</span>
                                        <span v-else-if="msg.status === 'failed'" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Failed</span>
                                        <span v-else class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-slate-400">{{ formatDate(msg.created_at) }}</td>
                                    <td class="px-6 py-4 text-right text-sm font-medium min-w-[330px]">
                                        <div class="flex justify-end flex-wrap gap-2">
                                            <Link :href="route('admin.whatsapp-messages.show', msg.id)" class="text-blue-300 hover:text-blue-200">View</Link>
                                            <button @click="updateStatus(msg, 'sent')" class="text-green-400 hover:text-green-300">Mark Sent</button>
                                            <button @click="updateStatus(msg, 'failed')" class="text-red-400 hover:text-red-300">Mark Failed</button>
                                            <button @click="deleteMessage(msg)" class="text-slate-300 hover:text-slate-100">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <!-- Pagination -->
                        <div v-if="messages.links" class="mt-4 flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
                            <div class="text-sm text-slate-400">
                                Showing {{ messages.from }} to {{ messages.to }} of {{ messages.total }} messages
                            </div>
                            <div class="flex gap-2 flex-wrap">
                                <template v-for="link in messages.links" :key="link.label">
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
    messages: Object,
    filters: Object,
});

const filterForm = ref({
    status: props.filters?.status || '',
    search: props.filters?.search || '',
});

const applyFilters = () => {
    router.get(route('admin.whatsapp-messages.index'), filterForm.value, { preserveState: true });
};

const updateStatus = (message, status) => {
    if (!confirm(`Mark message #${message.id} as ${status}?`)) return;
    router.patch(route('admin.whatsapp-messages.update-status', message.id), { status }, { preserveState: true });
};

const deleteMessage = (message) => {
    if (!confirm(`Delete message #${message.id}?`)) return;
    router.delete(route('admin.whatsapp-messages.destroy', message.id));
};

const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
};
</script>
