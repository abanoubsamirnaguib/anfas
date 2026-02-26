<template>
    <AdminLayout>
        <template #header>
            <h2 class="font-semibold text-2xl text-slate-100 leading-tight">Settings</h2>
        </template>

        <div class="py-6 sm:py-8">
            <div class="max-w-3xl mx-auto">

                <!-- Flash success -->
                <div v-if="$page.props.flash?.success" class="mb-6 p-4 rounded-lg bg-emerald-900/40 border border-emerald-700 text-emerald-300 text-sm">
                    {{ $page.props.flash.success }}
                </div>

                <form @submit.prevent="submit">
                    <!-- WhatsApp group -->
                    <div class="bg-slate-900 border border-slate-800 rounded-xl mb-6 overflow-hidden">
                        <div class="px-6 py-4 border-b border-slate-800">
                            <h3 class="text-slate-200 font-semibold text-sm uppercase tracking-widest">WhatsApp</h3>
                        </div>
                        <div class="p-6 space-y-5">
                            <div>
                                <label class="block text-sm font-medium text-slate-300 mb-1">
                                    WhatsApp Phone Number
                                    <span class="text-slate-500 font-normal ml-1">(digits only, with country code)</span>
                                </label>
                                <input
                                    v-model="form.settings.whatsapp_phone"
                                    type="text"
                                    placeholder="e.g. 201068644570"
                                    class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <div v-if="form.errors['settings.whatsapp_phone']" class="text-red-400 text-xs mt-1">
                                    {{ form.errors['settings.whatsapp_phone'] }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- General group -->
                    <div class="bg-slate-900 border border-slate-800 rounded-xl mb-6 overflow-hidden">
                        <div class="px-6 py-4 border-b border-slate-800">
                            <h3 class="text-slate-200 font-semibold text-sm uppercase tracking-widest">General</h3>
                        </div>
                        <div class="p-6 space-y-5">
                            <div>
                                <label class="block text-sm font-medium text-slate-300 mb-1">Shop Name</label>
                                <input
                                    v-model="form.settings.shop_name"
                                    type="text"
                                    placeholder="Shop name"
                                    class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end">
                        <button
                            type="submit"
                            :disabled="form.processing"
                            class="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2 rounded-md text-sm font-medium"
                        >
                            Save Settings
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/Layouts/AdminLayout.vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({
    settings: Object,
});

const form = useForm({
    settings: {
        whatsapp_phone: props.settings?.whatsapp_phone?.value ?? '',
        shop_name:      props.settings?.shop_name?.value ?? '',
    },
});

const submit = () => {
    form.put(route('admin.settings.update'), {
        preserveScroll: true,
    });
};
</script>
