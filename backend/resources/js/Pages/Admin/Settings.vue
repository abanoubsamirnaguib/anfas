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
                                    <span class="text-green-400">💬</span> WhatsApp Phone Number
                                    <span class="text-slate-500 font-normal ml-1">(digits only, with country code)</span>
                                </label>
                                <input
                                    v-model="form.settings.whatsapp_phone"
                                    type="text"
                                    placeholder="e.g. 201234567899"
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

                    <!-- About Us group -->
                    <div class="bg-slate-900 border border-slate-800 rounded-xl mb-6 overflow-hidden">
                        <div class="px-6 py-4 border-b border-slate-800">
                            <h3 class="text-slate-200 font-semibold text-sm uppercase tracking-widest">About Us</h3>
                            <p class="text-slate-400 text-xs mt-1">This section appears on the main page below the product categories.</p>
                        </div>
                        <div class="p-6">
                            <label class="block text-sm font-medium text-slate-300 mb-2">Description</label>

                            <!-- Rich-text toolbar -->
                            <div class="flex flex-wrap gap-1 mb-0 p-2 bg-slate-800 border border-slate-700 rounded-t-md">
                                <button type="button" @click="exec('bold')"
                                    class="editor-btn font-bold" title="Bold">B</button>
                                <button type="button" @click="exec('italic')"
                                    class="editor-btn italic" title="Italic">I</button>
                                <button type="button" @click="exec('underline')"
                                    class="editor-btn underline" title="Underline">U</button>
                                <div class="w-px bg-slate-600 mx-1 self-stretch"></div>
                                <button type="button" @click="execBlock('h2')"
                                    class="editor-btn" title="Heading 2">H2</button>
                                <button type="button" @click="execBlock('h3')"
                                    class="editor-btn" title="Heading 3">H3</button>
                                <button type="button" @click="execBlock('p')"
                                    class="editor-btn" title="Paragraph">¶</button>
                                <div class="w-px bg-slate-600 mx-1 self-stretch"></div>
                                <button type="button" @click="exec('insertUnorderedList')"
                                    class="editor-btn" title="Bullet list">• List</button>
                                <button type="button" @click="exec('insertOrderedList')"
                                    class="editor-btn" title="Numbered list">1. List</button>
                                <div class="w-px bg-slate-600 mx-1 self-stretch"></div>
                                <button type="button" @click="exec('justifyLeft')"
                                    class="editor-btn" title="Align left">⬅</button>
                                <button type="button" @click="exec('justifyCenter')"
                                    class="editor-btn" title="Center">⬌</button>
                                <button type="button" @click="exec('justifyRight')"
                                    class="editor-btn" title="Align right">➡</button>
                                <div class="w-px bg-slate-600 mx-1 self-stretch"></div>
                                <button type="button" @click="insertLink"
                                    class="editor-btn" title="Insert link">🔗 Link</button>
                                <button type="button" @click="exec('removeFormat')"
                                    class="editor-btn text-red-400" title="Clear formatting">✕ Clear</button>
                            </div>

                            <!-- Editable content area -->
                            <div
                                ref="editorRef"
                                contenteditable="true"
                                @input="onEditorInput"
                                @paste.prevent="onEditorPaste"
                                class="editor-content min-h-[180px] p-4 bg-slate-950 border border-t-0 border-slate-700 rounded-b-md text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                style="word-break: break-word;"
                            ></div>
                            <p class="text-slate-500 text-xs mt-1">Formatting is preserved exactly as you type — bold, headings, lists, etc. are all shown to users on the website.</p>
                        </div>
                    </div>

                    <!-- Social Media group -->
                    <div class="bg-slate-900 border border-slate-800 rounded-xl mb-6 overflow-hidden">
                        <div class="px-6 py-4 border-b border-slate-800">
                            <h3 class="text-slate-200 font-semibold text-sm uppercase tracking-widest">Social Media &amp; Contact</h3>
                            <p class="text-slate-400 text-xs mt-1">Enter full URLs or numbers. Leave empty to hide an icon on the website.</p>
                        </div>
                        <div class="p-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-slate-300 mb-1">
                                        <span class="text-green-400">💬</span> WhatsApp &amp; Call Number
                                        <span class="text-slate-500 font-normal ml-1">(with country code)</span>
                                    </label>
                                    <input
                                        v-model="form.settings.contact_phone"
                                        type="text"
                                        placeholder="+201234567899"
                                        class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    <p class="text-slate-500 text-xs mt-1">Used for both the Call and WhatsApp icons.</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-300 mb-1">
                                        <span class="text-red-400">✉️</span> Email Address
                                        <span class="text-slate-500 font-normal ml-1">(e.g. hello@yourshop.com)</span>
                                    </label>
                                    <input
                                        v-model="form.settings.contact_email"
                                        type="email"
                                        placeholder="hello@yourshop.com"
                                        class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-300 mb-1">
                                        <span class="text-blue-400">📘</span> Facebook URL
                                    </label>
                                    <input
                                        v-model="form.settings.social_facebook"
                                        type="url"
                                        placeholder="https://facebook.com/yourpage"
                                        class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-300 mb-1">
                                        <span class="text-pink-400">📸</span> Instagram URL
                                    </label>
                                    <input
                                        v-model="form.settings.social_instagram"
                                        type="url"
                                        placeholder="https://instagram.com/yourprofile"
                                        class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-300 mb-1">
                                        <span class="text-slate-300">🎵</span> TikTok URL
                                    </label>
                                    <input
                                        v-model="form.settings.social_tiktok"
                                        type="url"
                                        placeholder="https://tiktok.com/@yourprofile"
                                        class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-300 mb-1">
                                        <span class="text-red-400">▶️</span> YouTube URL
                                    </label>
                                    <input
                                        v-model="form.settings.social_youtube"
                                        type="url"
                                        placeholder="https://youtube.com/@yourchannel"
                                        class="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
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
import { ref, onMounted } from 'vue';

const props = defineProps({
    settings: Object,
});

const editorRef = ref(null);

const form = useForm({
    settings: {
        whatsapp_phone:       props.settings?.whatsapp_phone?.value       ?? '',
        shop_name:            props.settings?.shop_name?.value            ?? '',
        about_us_description: props.settings?.about_us_description?.value ?? '',
        contact_phone:        props.settings?.contact_phone?.value        ?? '',
        contact_email:        props.settings?.contact_email?.value        ?? '',
        social_facebook:      props.settings?.social_facebook?.value      ?? '',
        social_instagram:     props.settings?.social_instagram?.value     ?? '',
        social_tiktok:        props.settings?.social_tiktok?.value        ?? '',
        social_youtube:       props.settings?.social_youtube?.value       ?? '',
    },
});

// Bootstrap the contenteditable area with saved HTML on mount
onMounted(() => {
    if (editorRef.value) {
        editorRef.value.innerHTML = form.settings.about_us_description || '';
    }
});

const onEditorInput = () => {
    form.settings.about_us_description = editorRef.value?.innerHTML ?? '';
};

// Paste as plain text only – prevents importing foreign CSS/styles
const onEditorPaste = (e) => {
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
    onEditorInput();
};

const exec = (command, value = null) => {
    editorRef.value?.focus();
    document.execCommand(command, false, value);
    onEditorInput();
};

const execBlock = (tag) => {
    editorRef.value?.focus();
    document.execCommand('formatBlock', false, tag);
    onEditorInput();
};

const insertLink = () => {
    const url = prompt('Enter URL (include https://):', 'https://');
    if (url) exec('createLink', url);
};

const submit = () => {
    form.put(route('admin.settings.update'), {
        preserveScroll: true,
    });
};
</script>

<style scoped>
.editor-btn {
    @apply px-2 py-1 text-xs text-slate-200 hover:bg-slate-700 rounded cursor-pointer select-none transition-colors;
}

/* Preview styles inside the contenteditable */
.editor-content :deep(h2) {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0.6em 0 0.3em;
    color: #C9A96E;
}
.editor-content :deep(h3) {
    font-size: 1rem;
    font-weight: 600;
    margin: 0.5em 0 0.25em;
    color: #e2e8f0;
}
.editor-content :deep(p) {
    margin: 0.25em 0;
}
.editor-content :deep(ul) {
    list-style: disc;
    padding-left: 1.4rem;
    margin: 0.3em 0;
}
.editor-content :deep(ol) {
    list-style: decimal;
    padding-left: 1.4rem;
    margin: 0.3em 0;
}
.editor-content :deep(a) {
    color: #818cf8;
    text-decoration: underline;
}
</style>
