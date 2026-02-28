<template>
    <AdminLayout>
        <template #header>
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h2 class="font-semibold text-2xl text-slate-100 leading-tight">WhatsApp Message</h2>
                <Link :href="route('admin.whatsapp-messages.index')" class="bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-md text-sm font-medium text-center">Back</Link>
            </div>
        </template>

        <div class="py-6">
            <div class="max-w-4xl mx-auto">
                <div class="bg-slate-900 border border-slate-800 overflow-hidden rounded-xl p-6">
                    <div class="space-y-4">
                        <div>
                            <div class="text-sm text-slate-400">Customer</div>
                            <div class="text-lg font-medium text-slate-100">{{ message.customer_name || '—' }}</div>
                        </div>
                        <div>
                            <div class="text-sm text-slate-400">Phone</div>
                            <div class="text-lg text-slate-100">{{ message.customer_phone || '—' }}</div>
                        </div>
                        <div>
                            <div class="text-sm text-slate-400">Message</div>
                            <div class="whitespace-pre-wrap text-slate-200">{{ message.message }}</div>
                        </div>
                        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div>
                                <div class="text-sm text-slate-400">Status</div>
                                <div class="text-sm text-slate-200">{{ message.status }}</div>
                            </div>
                            <div>
                                <div class="text-sm text-slate-400">Created</div>
                                <div class="text-sm text-slate-200">{{ formatDate(message.created_at) }}</div>
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
import { Link } from '@inertiajs/vue3';

const props = defineProps({
    message: Object,
});

const message = props.message;

const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
};
</script>
