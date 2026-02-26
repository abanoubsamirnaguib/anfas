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
            'settings'       => ['required', 'array'],
            'settings.*'     => ['nullable', 'string', 'max:1000'],
        ]);

        foreach ($data['settings'] as $key => $value) {
            // Only allow updating existing keys (no arbitrary key injection)
            if (Setting::where('key', $key)->exists()) {
                Setting::set($key, $value);
            }
        }

        return redirect()->back()->with('success', 'Settings saved successfully.');
    }
}
