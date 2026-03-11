<template>
    <AdminLayout>
        <template #header>
            <div class="flex flex-col lg:flex-row justify-between lg:items-center gap-3">
                <h2 class="font-semibold text-2xl text-slate-100 leading-tight">Edit Product</h2>
                <div class="flex flex-wrap gap-2">
                    <Link :href="route('admin.products.attributes.index', product.id)" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium">Manage Attributes</Link>
                    <Link :href="route('admin.products.index')" class="text-slate-300 hover:text-slate-100 px-4 py-2">Back to Products</Link>
                </div>
            </div>
        </template>

        <div class="py-6 sm:py-8">
            <div class="max-w-3xl mx-auto">
                <div class="bg-slate-900 border border-slate-800 overflow-hidden rounded-xl">
                    <form @submit.prevent="submit" class="p-6 space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-2">Categories * (Select one or more)</label>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 border border-slate-700 rounded-md bg-slate-950">
                                <div v-for="cat in categories" :key="cat.id" class="flex items-center">
                                    <input
                                        :id="'cat-' + cat.id"
                                        type="checkbox"
                                        :value="cat.id"
                                        v-model="form.category_ids"
                                        class="rounded border-slate-600 bg-slate-900 text-indigo-500 shadow-sm"
                                    />
                                    <label :for="'cat-' + cat.id" class="ml-2 block text-sm text-slate-200">{{ cat.name }}</label>
                                </div>
                            </div>
                            <div v-if="form.errors.category_ids" class="text-red-600 text-sm mt-1">{{ form.errors.category_ids }}</div>
                        </div>

                        <div>
                            <label for="name" class="block text-sm font-medium text-slate-300">Name *</label>
                            <input v-model="form.name" type="text" id="name" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                            <div v-if="form.errors.name" class="text-red-600 text-sm mt-1">{{ form.errors.name }}</div>
                        </div>

                        <div>
                            <label for="slug" class="block text-sm font-medium text-slate-300">Slug</label>
                            <input v-model="form.slug" type="text" id="slug" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="description" class="block text-sm font-medium text-slate-300">Description (English)</label>
                                <textarea v-model="form.description" id="description" rows="5" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
                            </div>
                            <div>
                                <label for="description_ar" class="block text-sm font-medium text-slate-300">Description (Arabic)</label>
                                <textarea v-model="form.description_ar" id="description_ar" dir="rtl" rows="5" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">Cover Image</label>
                            <ImageUpload v-model="form.image" />
                            <div v-if="form.errors.image" class="text-red-600 text-sm mt-1">{{ form.errors.image }}</div>
                        </div>

                        <!-- Product Video (optional) -->
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">
                                Product Video
                                <span class="text-slate-500 font-normal">(optional — shown first in the gallery when set)</span>
                            </label>
                            <VideoUpload v-model="form.video_url" folder="product-videos" />
                            <div v-if="form.errors.video_url" class="text-red-600 text-sm mt-1">{{ form.errors.video_url }}</div>
                        </div>

                        <!-- Gallery Images -->
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">Gallery Images</label>
                            <p class="text-xs text-slate-500 mb-3">Upload multiple images shown as a swipeable slider in the app. Hover an image to reorder or remove it.</p>
                            <GalleryUpload v-model="form.gallery_images" />
                            <div v-if="form.errors.gallery_images" class="text-red-600 text-sm mt-1">{{ form.errors.gallery_images }}</div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="base_price" class="block text-sm font-medium text-slate-300">Base Price (€) *</label>
                                <input v-model.number="form.base_price" type="number" id="base_price" step="1.00" min="0" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                                <div v-if="form.errors.base_price" class="text-red-600 text-sm mt-1">{{ form.errors.base_price }}</div>
                            </div>
                            <div>
                                <label for="discount_percentage" class="block text-sm font-medium text-slate-300">Discount (%)</label>
                                <input v-model.number="form.discount_percentage" type="number" id="discount_percentage" step="0.0001" min="0" max="100" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="rating" class="block text-sm font-medium text-slate-300">Rating (0–5)</label>
                                <input v-model.number="form.rating" type="number" id="rating" step="0.1" min="0" max="5" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            </div>
                            <div>
                                <label for="reviews_count" class="block text-sm font-medium text-slate-300">Reviews Count</label>
                                <input v-model.number="form.reviews_count" type="number" id="reviews_count" min="0" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            </div>
                        </div>

                        <!-- Fragrance Notes -->
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <label class="block text-sm font-medium text-slate-300">Fragrance Notes</label>
                                <button type="button" @click="addFragranceRow" class="text-xs text-indigo-400 hover:text-indigo-300">+ Add Note</button>
                            </div>
                            <div v-if="fragranceRows.length === 0" class="text-sm text-slate-500 italic">No fragrance notes added.</div>
                            <div v-for="(row, i) in fragranceRows" :key="i" class="grid grid-cols-1 md:grid-cols-[1.2fr,1.2fr,1.5fr,1.5fr,auto] gap-2 mb-2">
                                <input v-model="row.key" type="text" placeholder="Label EN (e.g. Top Notes)" class="w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                <input v-model="row.key_ar" type="text" placeholder="Label AR" dir="rtl" class="w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                <input v-model="row.value_en" type="text" placeholder="Notes EN (e.g. Rose, Oud)" class="w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                <input v-model="row.value_ar" type="text" placeholder="Notes AR" dir="rtl" class="w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                <button type="button" @click="removeFragranceRow(i)" class="text-red-400 hover:text-red-300 px-1 text-lg leading-none">&times;</button>
                            </div>
                            <div v-if="form.errors.fragrance_notes" class="text-red-600 text-sm mt-1">{{ form.errors.fragrance_notes }}</div>
                        </div>

                        <!-- Shipping Info -->
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <label class="block text-sm font-medium text-slate-300">Shipping Info</label>
                                <button type="button" @click="addShippingRow" class="text-xs text-indigo-400 hover:text-indigo-300">+ Add Method</button>
                            </div>
                            <div v-if="shippingRows.length === 0" class="text-sm text-slate-500 italic">No shipping methods added.</div>
                            <div v-for="(row, i) in shippingRows" :key="i" class="grid grid-cols-1 md:grid-cols-[1.2fr,1.2fr,1.5fr,1.5fr,auto] gap-2 mb-2">
                                <input v-model="row.key" type="text" placeholder="Method EN (e.g. Standard)" class="w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                <input v-model="row.key_ar" type="text" placeholder="Method AR" dir="rtl" class="w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                <input v-model="row.value_en" type="text" placeholder="Duration EN (e.g. 3-5 business days)" class="w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                <input v-model="row.value_ar" type="text" placeholder="Duration AR" dir="rtl" class="w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                <button type="button" @click="removeShippingRow(i)" class="text-red-400 hover:text-red-300 px-1 text-lg leading-none">&times;</button>
                            </div>
                            <div v-if="form.errors.shipping_info" class="text-red-600 text-sm mt-1">{{ form.errors.shipping_info }}</div>
                        </div>

                        <div>
                            <label for="sort_order" class="block text-sm font-medium text-slate-300">Sort Order</label>
                            <input v-model.number="form.sort_order" type="number" id="sort_order" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        </div>

                        <div class="flex items-center gap-6">
                            <div class="flex items-center">
                                <input v-model="form.is_active" type="checkbox" id="is_active" class="rounded border-slate-600 bg-slate-900 text-indigo-500 shadow-sm">
                                <label for="is_active" class="ml-2 block text-sm text-slate-200">Active</label>
                            </div>
                            <div class="flex items-center">
                                <input v-model="form.is_featured" type="checkbox" id="is_featured" class="rounded border-slate-600 bg-slate-900 text-indigo-500 shadow-sm">
                                <label for="is_featured" class="ml-2 block text-sm text-slate-200">Featured</label>
                            </div>
                        </div>

                        <!-- Tags -->
                        <div>
                            <label class="block text-sm font-medium text-slate-300">Tags</label>
                            <p class="text-xs text-slate-400 mt-0.5 mb-2">Used for filtering on the category page.</p>
                            <!-- Suggestions from the selected category -->
                            <div v-if="categorySuggestions.length" class="flex flex-wrap gap-1.5 mb-2">
                                <span class="text-xs text-slate-500 self-center">Suggestions:</span>
                                <button
                                    v-for="s in categorySuggestions"
                                    :key="s"
                                    type="button"
                                    @click="toggleSuggestion(s)"
                                    :class="form.tags.includes(s)
                                        ? 'bg-indigo-600 border-indigo-500 text-white'
                                        : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-indigo-400'"
                                    class="border text-xs font-medium px-2.5 py-1 rounded-full transition-colors"
                                >{{ s }}</button>
                            </div>
                            <div class="flex gap-2">
                                <input
                                    v-model="tagInput"
                                    type="text"
                                    placeholder="Type a tag and press Enter"
                                    class="flex-1 rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    @keydown.enter.prevent="addTag"
                                />
                                <button type="button" @click="addTag" class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-sm font-medium">Add</button>
                            </div>
                            <div v-if="form.tags.length" class="flex flex-wrap gap-2 mt-2">
                                <span
                                    v-for="(tag, i) in form.tags"
                                    :key="i"
                                    class="inline-flex items-center gap-1 bg-slate-800 border border-slate-600 text-slate-200 text-xs font-medium px-2.5 py-1 rounded-full"
                                >
                                    {{ tag }}
                                    <button type="button" @click="removeTag(i)" class="text-slate-400 hover:text-red-400 leading-none">&times;</button>
                                </span>
                            </div>
                            <div v-if="form.errors.tags" class="text-red-600 text-sm mt-1">{{ form.errors.tags }}</div>
                        </div>

                        <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
                            <Link :href="route('admin.products.index')" class="bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-md text-sm font-medium text-center">Cancel</Link>
                            <button type="submit" :disabled="form.processing" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50">
                                Update Product
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
import ImageUpload from '@/Components/Admin/ImageUpload.vue';
import GalleryUpload from '@/Components/Admin/GalleryUpload.vue';
import VideoUpload from '@/Components/Admin/VideoUpload.vue';
import { ref, watch } from 'vue';
import { Link, useForm } from '@inertiajs/vue3';

const props = defineProps({
    product: Object,
    categories: Array,
});

const form = useForm({
    category_ids: props.product.categories?.map(c => c.id) || [],
    name: props.product.name,
    slug: props.product.slug ?? '',
    description: props.product.description ?? '',
    description_ar: props.product.description_ar ?? '',
    image: props.product.image ?? '',
    video_url: props.product.video_url ?? '',
    gallery_images: (props.product.images ?? []).map((img, i) => ({
        url:        img.url,
        alt_text:   img.alt_text ?? '',
        sort_order: img.sort_order ?? i,
    })),
    base_price: props.product.base_price ?? 0,
    discount_percentage: props.product.discount_percentage ?? 0,
    rating: props.product.rating ?? 0,
    reviews_count: props.product.reviews_count ?? 0,
    fragrance_notes: props.product.fragrance_notes ?? {},
    shipping_info: props.product.shipping_info ?? {},
    sort_order: props.product.sort_order ?? 0,
    is_active: props.product.is_active,
    is_featured: props.product.is_featured ?? false,
    tags: Array.isArray(props.product.tags) ? [...props.product.tags] : [],
});

// Tags
const tagInput = ref('');
const categorySuggestions = ref([]);

// Load tag suggestions from all selected categories
const loadSuggestions = async () => {
    if (form.category_ids.length === 0) {
        categorySuggestions.value = [];
        return;
    }

    try {
        const allTags = new Set();
        for (const catId of form.category_ids) {
            const cat = props.categories.find(c => c.id === catId);
            if (cat) {
                const res = await fetch(`/api/categories/${cat.slug}/tags`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    data.forEach(tag => allTags.add(tag));
                }
            }
        }
        categorySuggestions.value = Array.from(allTags);
    } catch {
        categorySuggestions.value = [];
    }
};
loadSuggestions();

watch(() => form.category_ids, loadSuggestions, { deep: true });

const addTag = () => {
    const val = tagInput.value.trim();
    if (val && !form.tags.includes(val)) form.tags.push(val);
    tagInput.value = '';
};
const removeTag = (i) => form.tags.splice(i, 1);
const toggleSuggestion = (s) => {
    const idx = form.tags.indexOf(s);
    if (idx === -1) form.tags.push(s);
    else form.tags.splice(idx, 1);
};

// Initialise rows from existing product data
const objectToRows = (obj) =>
    obj && typeof obj === 'object'
        ? Object.entries(obj).map(([storageKey, value]) => {
            const isObj = value && typeof value === 'object' && !Array.isArray(value);
            if (!isObj) {
                return {
                    key: storageKey,
                    key_ar: '',
                    value_en: value ?? '',
                    value_ar: '',
                };
            }
            // New shape: { key_en, key_ar, value: { en, ar } }
            const hasNestedValue = value.value && typeof value.value === 'object';
            const labelEn = value.key_en ?? storageKey;
            const labelAr = value.key_ar ?? '';
            const valEn = hasNestedValue ? (value.value.en ?? '') : (value.en ?? '');
            const valAr = hasNestedValue ? (value.value.ar ?? '') : (value.ar ?? '');
            return {
                key: labelEn,
                key_ar: labelAr,
                value_en: valEn,
                value_ar: valAr,
            };
        })
        : [];

const fragranceRows = ref(objectToRows(props.product.fragrance_notes));
const addFragranceRow = () => fragranceRows.value.push({ key: '', key_ar: '', value_en: '', value_ar: '' });
const removeFragranceRow = (i) => fragranceRows.value.splice(i, 1);

const shippingRows = ref(objectToRows(props.product.shipping_info));
const addShippingRow = () => shippingRows.value.push({ key: '', key_ar: '', value_en: '', value_ar: '' });
const removeShippingRow = (i) => shippingRows.value.splice(i, 1);

const rowsToObject = (rows) => {
    const obj = {};
    rows.forEach(({ key, key_ar, value_en, value_ar }) => {
        const normalizedKey = (key ?? '').toString().trim();
        const normalizedKeyAr = (key_ar ?? '').toString().trim();
        if (!normalizedKey && !normalizedKeyAr) return;
        const storageKey = normalizedKey || normalizedKeyAr;
        obj[storageKey] = {
            key_en: normalizedKey || null,
            key_ar: normalizedKeyAr || null,
            value: {
                en: (value_en ?? '').toString().trim(),
                ar: (value_ar ?? '').toString().trim(),
            },
        };
    });
    return obj;
};

const submit = () => {
    form.fragrance_notes = rowsToObject(fragranceRows.value);
    form.shipping_info   = rowsToObject(shippingRows.value);
    form.put(route('admin.products.update', props.product.id));
};
</script>
