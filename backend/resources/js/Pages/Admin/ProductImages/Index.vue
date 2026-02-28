<template>
    <AdminLayout>
        <template #header>
            <div class="flex flex-col lg:flex-row justify-between lg:items-center gap-3">
                <h2 class="font-semibold text-2xl text-slate-100 leading-tight">
                    Images — {{ product.name }}
                </h2>
                <div class="flex flex-wrap gap-2">
                    <Link :href="route('admin.products.attributes.index', product.id)" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium">Attributes</Link>
                    <Link :href="route('admin.products.edit', product.id)" class="bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-lg text-sm font-medium">Edit Product</Link>
                    <Link :href="route('admin.products.index')" class="text-slate-300 hover:text-slate-100 px-4 py-2">Back</Link>
                </div>
            </div>
        </template>

        <div class="py-6 sm:py-8 space-y-8">
            <div class="max-w-3xl mx-auto">

                <!-- Add Image Form -->
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
                    <h3 class="text-lg font-semibold text-slate-100 mb-4">Add Image</h3>
                    <form @submit.prevent="submitAdd" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">Image</label>
                            <ImageUpload v-model="addForm.url" folder="products" />
                            <div v-if="addForm.errors.url" class="text-red-600 text-sm mt-1">{{ addForm.errors.url }}</div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-300 mb-1">Alt Text</label>
                                <input v-model="addForm.alt_text" type="text" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="Describe the image" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-300 mb-1">Sort Order</label>
                                <input v-model.number="addForm.sort_order" type="number" min="0" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                        </div>
                        <div class="flex justify-end">
                            <button type="submit" :disabled="addForm.processing || !addForm.url" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50">
                                Add Image
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Image List -->
                <div class="bg-slate-900 border border-slate-800 rounded-xl">
                    <div class="p-4 sm:p-6">
                        <p v-if="images.length === 0" class="text-slate-400">No gallery images yet. Add images above.</p>

                        <div v-else class="space-y-4">
                            <div
                                v-for="img in images"
                                :key="img.id"
                                class="flex items-start gap-4 bg-slate-950 border border-slate-800 rounded-lg p-4"
                            >
                                <!-- Preview -->
                                <img :src="img.url" :alt="img.alt_text || 'Image'" class="w-20 h-20 object-cover rounded-md flex-shrink-0" />

                                <!-- Edit inline -->
                                <div v-if="editingId === img.id" class="flex-1 space-y-3">
                                    <div>
                                        <label class="block text-xs text-slate-400 mb-1">Image</label>
                                        <ImageUpload v-model="editForm.url" folder="products" />
                                    </div>
                                    <div class="grid grid-cols-2 gap-3">
                                        <div>
                                            <label class="block text-xs text-slate-400 mb-1">Alt Text</label>
                                            <input v-model="editForm.alt_text" type="text" class="block w-full rounded-md border-slate-700 bg-slate-900 text-slate-100 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                        </div>
                                        <div>
                                            <label class="block text-xs text-slate-400 mb-1">Sort Order</label>
                                            <input v-model.number="editForm.sort_order" type="number" min="0" class="block w-full rounded-md border-slate-700 bg-slate-900 text-slate-100 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                        </div>
                                    </div>
                                    <div class="flex gap-2">
                                        <button @click="saveEdit(img)" :disabled="editForm.processing" class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-3 py-1.5 rounded disabled:opacity-50">Save</button>
                                        <button @click="editingId = null" class="text-slate-400 hover:text-slate-200 text-sm px-3 py-1.5">Cancel</button>
                                    </div>
                                </div>

                                <!-- View mode -->
                                <div v-else class="flex-1 min-w-0">
                                    <p class="text-sm text-slate-200 truncate">{{ img.alt_text || '(no alt text)' }}</p>
                                    <p class="text-xs text-slate-500 mt-0.5">Sort: {{ img.sort_order }}</p>
                                    <p class="text-xs text-slate-600 truncate mt-0.5">{{ img.url }}</p>
                                </div>

                                <!-- Actions -->
                                <div v-if="editingId !== img.id" class="flex gap-3 flex-shrink-0">
                                    <button @click="startEdit(img)" class="text-indigo-300 hover:text-indigo-200 text-sm">Edit</button>
                                    <button @click="deleteImage(img)" class="text-red-400 hover:text-red-300 text-sm">Delete</button>
                                </div>
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
import ImageUpload from '@/Components/Admin/ImageUpload.vue';
import { ref } from 'vue';
import { Link, useForm, router } from '@inertiajs/vue3';

const props = defineProps({
    product: Object,
    images: Array,
});

// ─── Add form ────────────────────────────────────────────────────────────────
const addForm = useForm({
    url: '',
    alt_text: '',
    sort_order: props.images.length,
});

const submitAdd = () => {
    addForm.post(route('admin.products.images.store', props.product.id), {
        onSuccess: () => addForm.reset(),
    });
};

// ─── Edit inline ─────────────────────────────────────────────────────────────
const editingId = ref(null);
const editForm = useForm({ url: '', alt_text: '', sort_order: 0 });

const startEdit = (img) => {
    editingId.value = img.id;
    editForm.url = img.url;
    editForm.alt_text = img.alt_text ?? '';
    editForm.sort_order = img.sort_order;
};

const saveEdit = (img) => {
    editForm.put(route('admin.products.images.update', [props.product.id, img.id]), {
        onSuccess: () => { editingId.value = null; },
    });
};

// ─── Delete ──────────────────────────────────────────────────────────────────
const deleteImage = (img) => {
    if (confirm('Delete this image?')) {
        router.delete(route('admin.products.images.destroy', [props.product.id, img.id]));
    }
};
</script>
