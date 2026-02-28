<template>
    <div>
        <!-- Preview -->
        <div v-if="modelValue" class="mb-3 relative inline-block">
            <video
                :src="modelValue"
                class="h-32 rounded-lg border border-gray-600 shadow-sm"
                style="max-width: 240px;"
                controls
                muted
                preload="metadata"
            />
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
                ? 'border-indigo-500 bg-indigo-950'
                : 'border-dashed border-slate-600 bg-slate-800 hover:border-indigo-400 hover:bg-slate-700'"
            @dragover.prevent="dragging = true"
            @dragleave.prevent="dragging = false"
            @drop.prevent="onDrop"
            @click="fileInput.click()"
        >
            <input
                ref="fileInput"
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                class="hidden"
                @change="onFileChange"
            />

            <!-- Progress bar -->
            <div v-if="uploading" class="w-full flex flex-col items-center gap-2">
                <svg class="animate-spin h-6 w-6 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span class="text-sm text-indigo-400">Uploading video… {{ progress }}%</span>
                <div class="w-full bg-slate-700 rounded-full h-1.5">
                    <div class="bg-indigo-500 h-1.5 rounded-full transition-all" :style="{ width: progress + '%' }"></div>
                </div>
            </div>

            <div v-else class="flex flex-col items-center gap-1 text-slate-400">
                <!-- Video icon -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
                </svg>
                <span class="text-sm">{{ modelValue ? 'Replace video' : 'Click or drag a video here' }}</span>
                <span class="text-xs text-slate-500">MP4, WebM, MOV — max 25 MB</span>
            </div>
        </div>

        <div v-if="error" class="text-red-400 text-sm mt-1">{{ error }}</div>
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
        default: 'banner-videos',
    },
});

const emit = defineEmits(['update:modelValue']);

const fileInput = ref(null);
const uploading = ref(false);
const dragging  = ref(false);
const progress  = ref(0);
const error     = ref('');

const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

const upload = async (file) => {
    if (!file) return;

    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!validTypes.includes(file.type)) {
        error.value = 'Please select a valid video file (MP4, WebM, MOV, AVI).';
        return;
    }

    if (file.size > MAX_SIZE) {
        error.value = `File is too large. Maximum size is 25 MB (file is ${(file.size / 1024 / 1024).toFixed(1)} MB).`;
        return;
    }

    error.value   = '';
    uploading.value = true;
    progress.value  = 0;

    const data = new FormData();
    data.append('video', file);
    data.append('folder', props.folder);

    try {
        const res = await axios.post(route('admin.upload-video'), data, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (e) => {
                if (e.total) progress.value = Math.round((e.loaded / e.total) * 100);
            },
        });
        emit('update:modelValue', res.data.url);
    } catch (err) {
        error.value = err.response?.data?.message
            ?? err.response?.data?.error
            ?? 'Upload failed. Please try again.';
    } finally {
        uploading.value = false;
        dragging.value  = false;
        if (fileInput.value) fileInput.value.value = '';
    }
};

const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
};

const onDrop = (e) => {
    dragging.value = false;
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
};

const clear = () => {
    emit('update:modelValue', '');
    error.value = '';
};
</script>
