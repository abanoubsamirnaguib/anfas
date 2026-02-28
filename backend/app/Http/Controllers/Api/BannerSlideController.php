<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BannerSlide;

class BannerSlideController extends Controller
{
    /**
     * Return all active banner slides for the storefront slider.
     */
    public function index()
    {
        $slides = BannerSlide::active()->get(['id', 'image_url', 'video_url', 'link_url', 'title', 'subtitle', 'sort_order']);

        return response()->json($slides);
    }
}
