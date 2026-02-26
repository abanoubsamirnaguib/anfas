<template>
    <div>
        <!-- Preview -->
        <div v-if="modelValue" class="mb-3 relative inline-block">
            <img :src="modelValue" class="h-32 w-32 object-cover rounded-lg border border-gray-200 shadow-sm" alt="Image preview" />
            <button
                type="button"
                @click="clear"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
            >✕</button>
        </div>

        <!-- Drop zone / picker -->
        <div
            class="relative flex flex-col items-center justify-center border-2 rounded-lg p-4 cursor-pointer transition-colors"
            :class="dragging
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-dashed border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50'"
            @dragover.prevent="dragging = true"
            @dragleave.prevent="dragging = false"
            @drop.prevent="onDrop"
            @click="fileInput.click()"
        >
            <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFileChange"
            />

            <div v-if="uploading" class="flex flex-col items-center gap-2">
                <svg class="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span class="text-sm text-indigo-600">Converting & uploading…</span>
            </div>

            <div v-else class="flex flex-col items-center gap-1 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4-4 4 4m4-4l2-2 2 2M4 20h16M12 4v12"/>
                </svg>
                <span class="text-sm">{{ modelValue ? 'Replace image' : 'Click or drag an image here' }}</span>
                <span class="text-xs">JPG, PNG, GIF, WebP — will be saved as WebP</span>
            </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm mt-1">{{ error }}</div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    folder: {
        type: String,
        default: 'images',
    },
});

const emit = defineEmits(['update:modelValue']);

const fileInput = ref(null);
const uploading = ref(false);
const dragging = ref(false);
const error = ref('');

const upload = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
        error.value = 'Please select a valid image file.';
        return;
    }

    error.value = '';
    uploading.value = true;

    const data = new FormData();
    data.append('image', file);
    data.append('folder', props.folder);

    try {
        const res = await axios.post(route('admin.upload-image'), data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        emit('update:modelValue', res.data.url);
    } catch (err) {
        error.value = err.response?.data?.message
            ?? err.response?.data?.error
            ?? 'Upload failed. Please try again.';
    } finally {
        uploading.value = false;
        dragging.value = false;
        // Reset so the same file can be re-selected
        if (fileInput.value) fileInput.value.value = '';
    }
};

const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
};

const onDrop = (e) => {
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
};

const clear = () => {
    emit('update:modelValue', '');
    error.value = '';
};
</script>
