<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BannerSlide;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BannerSlideController extends Controller
{
    public function index()
    {
        $slides = BannerSlide::orderBy('sort_order')->get();

        return Inertia::render('Admin/BannerSlides/Index', [
            'slides' => $slides,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/BannerSlides/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'image_url'  => 'required|string|url',
            'video_url'  => 'nullable|string|url',
            'link_url'   => 'nullable|string',
            'title'      => 'nullable|string|max:255',
            'subtitle'   => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
            'is_active'  => 'boolean',
        ]);

        BannerSlide::create($validated);

        return redirect()->route('admin.banner-slides.index')
            ->with('success', 'Banner slide created successfully.');
    }

    public function edit(BannerSlide $bannerSlide)
    {
        return Inertia::render('Admin/BannerSlides/Edit', [
            'slide' => $bannerSlide,
        ]);
    }

    public function update(Request $request, BannerSlide $bannerSlide)
    {
        $validated = $request->validate([
            'image_url'  => 'required|string|url',
            'video_url'  => 'nullable|string|url',
            'link_url'   => 'nullable|string',
            'title'      => 'nullable|string|max:255',
            'subtitle'   => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
            'is_active'  => 'boolean',
        ]);

        $bannerSlide->update($validated);

        return redirect()->route('admin.banner-slides.index')
            ->with('success', 'Banner slide updated successfully.');
    }

    public function destroy(BannerSlide $bannerSlide)
    {
        $bannerSlide->delete();

        return redirect()->route('admin.banner-slides.index')
            ->with('success', 'Banner slide deleted successfully.');
    }
}
