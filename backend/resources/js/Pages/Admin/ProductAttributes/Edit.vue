<template>
    <AdminLayout>
        <template #header>
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h2 class="font-semibold text-2xl text-slate-100 leading-tight">Edit Attribute — {{ product.name }}</h2>
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
                            <div v-if="form.errors.sku" class="text-red-600 text-sm mt-1">{{ form.errors.sku }}</div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="image_url" class="block text-sm font-medium text-slate-300">Attribute Image</label>
                                <select
                                    v-model="form.image_url"
                                    id="image_url"
                                    class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    :disabled="imageOptions.length === 0"
                                >
                                    <option value="">Use product default image</option>
                                    <option v-for="option in imageOptions" :key="option.url" :value="option.url">
                                        {{ option.label }}
                                    </option>
                                </select>
                                <p class="text-slate-500 text-xs mt-1">Shown on product cards and selected automatically when this attribute is chosen.</p>
                                <div v-if="form.errors.image_url" class="text-red-600 text-sm mt-1">{{ form.errors.image_url }}</div>
                                <img v-if="selectedAttributePreview" :src="selectedAttributePreview" alt="Attribute preview" class="mt-3 h-24 w-24 rounded-md object-cover border border-slate-700">
                            </div>
                            <div>
                                <label for="suggested_image_url" class="block text-sm font-medium text-slate-300">Suggested Reference Image</label>
                                <select
                                    v-model="form.suggested_image_url"
                                    id="suggested_image_url"
                                    class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    :disabled="imageOptions.length === 0"
                                >
                                    <option value="">Use this attribute image</option>
                                    <option v-for="option in imageOptions" :key="`suggested-${option.url}`" :value="option.url">
                                        {{ option.label }}
                                    </option>
                                </select>
                                <p class="text-slate-500 text-xs mt-1">Used only in the cart suggested-products section for this attribute.</p>
                                <div v-if="form.errors.suggested_image_url" class="text-red-600 text-sm mt-1">{{ form.errors.suggested_image_url }}</div>
                                <img v-if="selectedSuggestedPreview" :src="selectedSuggestedPreview" alt="Suggested preview" class="mt-3 h-24 w-24 rounded-md object-cover border border-slate-700">
                            </div>
                        </div>

                        <p v-if="imageOptions.length === 0" class="text-amber-300 text-sm bg-amber-500/10 border border-amber-500/30 rounded-md px-3 py-2">
                            Add a cover image or gallery image to the product first if you want to map images to this attribute.
                        </p>

                        <div class="flex flex-wrap items-center gap-6">
                            <div class="flex items-center">
                                <input v-model="form.is_active" type="checkbox" id="is_active" class="rounded border-slate-600 bg-slate-900 text-indigo-500 shadow-sm">
                                <label for="is_active" class="ml-2 block text-sm text-slate-200">Active</label>
                            </div>
                            <div class="flex items-center">
                                <input v-model="form.is_default" type="checkbox" id="is_default" class="rounded border-slate-600 bg-slate-900 text-indigo-500 shadow-sm">
                                <label for="is_default" class="ml-2 block text-sm text-slate-200">Default</label>
                            </div>
                            <div class="flex items-center">
                                <input v-model="form.is_suggested" type="checkbox" id="is_suggested" class="rounded border-slate-600 bg-slate-900 text-indigo-500 shadow-sm">
                                <label for="is_suggested" class="ml-2 block text-sm text-slate-200">Suggested</label>
                            </div>
                        </div>

                        <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
                            <Link :href="route('admin.products.attributes.index', product.id)" class="bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-md text-sm font-medium text-center">Cancel</Link>
                            <button type="submit" :disabled="form.processing" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50">
                                Update Attribute
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
import { computed } from 'vue';

const props = defineProps({
    product: Object,
    attribute: Object,
    imageOptions: {
        type: Array,
        default: () => [],
    },
});

const form = useForm({
    name: props.attribute.name,
    value: props.attribute.value,
    price: props.attribute.price,
    discount_percentage: props.attribute.discount_percentage ?? 0,
    stock: props.attribute.stock ?? '',
    sku: props.attribute.sku ?? '',
    is_active: props.attribute.is_active,
    is_default: props.attribute.is_default ?? false,
    is_suggested: props.attribute.is_suggested ?? false,
    image_url: props.attribute.image_url ?? '',
    suggested_image_url: props.attribute.suggested_image_url ?? '',
});

const findPreview = (url) => props.imageOptions.find((option) => option.url === url)?.preview_url ?? '';
const selectedAttributePreview = computed(() => findPreview(form.image_url));
const selectedSuggestedPreview = computed(() => findPreview(form.suggested_image_url || form.image_url));

const submit = () => {
    form.put(route('admin.products.attributes.update', [props.product.id, props.attribute.id]));
};
</script>
