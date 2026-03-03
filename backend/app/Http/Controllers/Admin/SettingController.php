<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function edit()
    {
        $settings = Setting::orderBy('group')->orderBy('key')->get()
            ->keyBy('key')
            ->map(fn ($s) => ['value' => $s->value, 'label' => $s->label, 'group' => $s->group]);

        return Inertia::render('Admin/Settings', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'settings'                         => ['required', 'array'],
            'settings.whatsapp_phone'          => ['nullable', 'string', 'max:30'],
            'settings.shop_name'               => ['nullable', 'string', 'max:200'],
            'settings.about_us_description'    => ['nullable', 'string', 'max:20000'],
            'settings.about_us_description_ar' => ['nullable', 'string', 'max:20000'],
            'settings.contact_phone'           => ['nullable', 'string', 'max:30'],
            'settings.contact_email'           => ['nullable', 'email', 'max:200'],
            'settings.social_facebook'         => ['nullable', 'string', 'max:500'],
            'settings.social_instagram'        => ['nullable', 'string', 'max:500'],
            'settings.social_tiktok'           => ['nullable', 'string', 'max:500'],
            'settings.social_youtube'          => ['nullable', 'string', 'max:500'],
        ]);

        foreach ($data['settings'] as $key => $value) {
            // Only allow updating existing keys (no arbitrary key injection)
            if (Setting::where('key', $key)->exists()) {
                Setting::set($key, $value ?? '');
            }
        }

        return redirect()->back()->with('success', 'Settings saved successfully.');
    }
}
