<template>
    <div class="space-y-4">

        <!-- Current gallery grid -->
        <div v-if="items.length" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div
                v-for="(item, i) in items"
                :key="i"
                class="relative group bg-slate-950 border border-slate-700 rounded-lg overflow-hidden"
            >
                <!-- Image preview -->
                <img
                    :src="item.url"
                    :alt="item.alt_text || ''"
                    class="w-full h-32 object-cover"
                />

                <!-- Overlay controls -->
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <!-- Move buttons -->
                    <div class="flex justify-between">
                        <button
                            type="button"
                            @click="moveUp(i)"
                            :disabled="i === 0"
                            class="text-white bg-black/40 rounded px-1.5 py-0.5 text-xs disabled:opacity-30 hover:bg-black/70"
                            title="Move left"
                        >&#8592;</button>
                        <button
                            type="button"
                            @click="remove(i)"
                            class="text-red-400 bg-black/40 rounded px-1.5 py-0.5 text-xs hover:bg-red-600 hover:text-white"
                            title="Remove"
                        >&#10005;</button>
                        <button
                            type="button"
                            @click="moveDown(i)"
                            :disabled="i === items.length - 1"
                            class="text-white bg-black/40 rounded px-1.5 py-0.5 text-xs disabled:opacity-30 hover:bg-black/70"
                            title="Move right"
                        >&#8594;</button>
                    </div>

                    <!-- Alt text input -->
                    <input
                        v-model="item.alt_text"
                        @input="emit"
                        type="text"
                        placeholder="Alt text…"
                        class="w-full bg-black/60 border border-slate-600 text-white text-xs rounded px-2 py-1 placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                    />
                </div>

                <!-- Position badge -->
                <span class="absolute top-1 left-1 bg-black/50 text-slate-300 text-xs px-1.5 py-0.5 rounded">
                    {{ i + 1 }}
                </span>
            </div>
        </div>

        <p v-else class="text-sm text-slate-500 italic">No gallery images yet.</p>

        <!-- Add new image -->
        <div class="border border-dashed border-slate-700 rounded-lg p-4">
            <p class="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wide">Add Image to Gallery</p>
            <ImageUpload v-model="newUrl" folder="products" />
            <div v-if="newUrl" class="mt-3 flex gap-2 items-end">
                <div class="flex-1">
                    <label class="text-xs text-slate-400 block mb-1">Alt text (optional)</label>
                    <input
                        v-model="newAlt"
                        type="text"
                        placeholder="Describe the image"
                        class="block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
                <button
                    type="button"
                    @click="addImage"
                    class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium flex-shrink-0"
                >
                    Add
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import ImageUpload from './ImageUpload.vue';

const props = defineProps({
    modelValue: {
        type: Array,
        default: () => [],
    },
});

const emits = defineEmits(['update:modelValue']);

// Internal copy so mutations don't directly touch the prop
const items = ref(props.modelValue.map((img, i) => ({
    url:        img.url       ?? img,
    alt_text:   img.alt_text  ?? '',
    sort_order: img.sort_order ?? i,
})));

// Keep in sync if parent resets the value
watch(() => props.modelValue, (val) => {
    items.value = val.map((img, i) => ({
        url:        img.url       ?? img,
        alt_text:   img.alt_text  ?? '',
        sort_order: img.sort_order ?? i,
    }));
}, { deep: true });

const emit = () => {
    emits('update:modelValue', items.value.map((img, i) => ({
        url:        img.url,
        alt_text:   img.alt_text,
        sort_order: i,
    })));
};

// Move item left/right
const moveUp = (i) => {
    if (i === 0) return;
    [items.value[i - 1], items.value[i]] = [items.value[i], items.value[i - 1]];
    emit();
};
const moveDown = (i) => {
    if (i === items.value.length - 1) return;
    [items.value[i], items.value[i + 1]] = [items.value[i + 1], items.value[i]];
    emit();
};
const remove = (i) => {
    items.value.splice(i, 1);
    emit();
};

// Add new image
const newUrl = ref('');
const newAlt = ref('');

const addImage = () => {
    if (!newUrl.value) return;
    items.value.push({ url: newUrl.value, alt_text: newAlt.value, sort_order: items.value.length });
    emit();
    newUrl.value = '';
    newAlt.value = '';
};
</script>
