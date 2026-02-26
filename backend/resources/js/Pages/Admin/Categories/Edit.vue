<template>
    <AdminLayout>
        <template #header>
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h2 class="font-semibold text-2xl text-slate-100 leading-tight">Edit Category</h2>
                <Link :href="route('admin.categories.index')" class="text-slate-300 hover:text-slate-100">Back to Categories</Link>
            </div>
        </template>

        <div class="py-6 sm:py-8">
            <div class="max-w-3xl mx-auto">
                <div class="bg-slate-900 border border-slate-800 overflow-hidden rounded-xl">
                    <form @submit.prevent="submit" class="p-6 space-y-6">
                        <div>
                            <label for="name" class="block text-sm font-medium text-slate-300">Name *</label>
                            <input v-model="form.name" type="text" id="name" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                            <div v-if="form.errors.name" class="text-red-600 text-sm mt-1">{{ form.errors.name }}</div>
                        </div>

                        <div>
                            <label for="slug" class="block text-sm font-medium text-slate-300">Slug</label>
                            <input v-model="form.slug" type="text" id="slug" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            <div v-if="form.errors.slug" class="text-red-600 text-sm mt-1">{{ form.errors.slug }}</div>
                        </div>

                        <div>
                            <label for="tagline" class="block text-sm font-medium text-slate-300">Tagline</label>
                            <input v-model="form.tagline" type="text" id="tagline" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        </div>

                        <div>
                            <label for="description" class="block text-sm font-medium text-slate-300">Description</label>
                            <textarea v-model="form.description" id="description" rows="4" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">Cover Image</label>
                            <ImageUpload v-model="form.cover_image" folder="category" />
                            <div v-if="form.errors.cover_image" class="text-red-600 text-sm mt-1">{{ form.errors.cover_image }}</div>
                        </div>

                        <div>
                            <label for="sort_order" class="block text-sm font-medium text-slate-300">Sort Order</label>
                            <input v-model.number="form.sort_order" type="number" id="sort_order" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        </div>

                        <div class="flex items-center">
                            <input v-model="form.is_active" type="checkbox" id="is_active" class="rounded border-slate-600 bg-slate-900 text-indigo-500 shadow-sm">
                            <label for="is_active" class="ml-2 block text-sm text-slate-200">Active</label>
                        </div>

                        <!-- Tags -->
                        <div>
                            <label class="block text-sm font-medium text-slate-300">Filter Tags</label>
                            <p class="text-xs text-slate-400 mt-0.5 mb-2">Tags shown as filter chips on the category page. Tags are also auto-collected from products.</p>
                            <!-- Suggestions from products -->
                            <div v-if="productSuggestions.length" class="flex flex-wrap gap-1.5 mb-2">
                                <span class="text-xs text-slate-500 self-center">From products:</span>
                                <button
                                    v-for="s in productSuggestions"
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
                            <Link :href="route('admin.categories.index')" class="bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-md text-sm font-medium text-center">Cancel</Link>
                            <button type="submit" :disabled="form.processing" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50">
                                Update Category
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
import { Link, useForm } from '@inertiajs/vue3';
import { ref, onMounted } from 'vue';

const props = defineProps({
    category: Object,
});

const form = useForm({
    name: props.category.name,
    slug: props.category.slug ?? '',
    tagline: props.category.tagline ?? '',
    description: props.category.description ?? '',
    cover_image: props.category.cover_image ?? '',
    sort_order: props.category.sort_order ?? 0,
    is_active: props.category.is_active,
    tags: Array.isArray(props.category.tags) ? [...props.category.tags] : [],
});

const tagInput = ref('');
const productSuggestions = ref([]);

// Load tags that exist on the products of this category
onMounted(async () => {
    if (!props.category.slug) return;
    try {
        const res = await fetch(`/api/categories/${props.category.slug}/tags?products_only=1`);
        const data = await res.json();
        productSuggestions.value = Array.isArray(data) ? data : [];
    } catch { productSuggestions.value = []; }
});

const addTag = () => {
    const val = tagInput.value.trim();
    if (val && !form.tags.includes(val)) form.tags.push(val);
    tagInput.value = '';
};

const removeTag = (index) => form.tags.splice(index, 1);

const toggleSuggestion = (s) => {
    const idx = form.tags.indexOf(s);
    if (idx === -1) form.tags.push(s);
    else form.tags.splice(idx, 1);
};

const submit = () => {
    form.put(route('admin.categories.update', props.category.id));
};
</script>
