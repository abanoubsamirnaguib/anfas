<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\DiscountCode;
use App\Models\WhatsappMessage;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_categories' => Category::count(),
            'total_products' => Product::count(),
            'active_products' => Product::where('is_active', true)->count(),
            'featured_products' => Product::where('is_featured', true)->count(),
            'total_discount_codes' => DiscountCode::count(),
            'active_discount_codes' => DiscountCode::where('is_active', true)->count(),
            'total_messages' => WhatsappMessage::count(),
            'pending_messages' => WhatsappMessage::where('status', 'pending')->count(),
        ];

        $recentProducts = Product::with(['category'])
            ->latest()
            ->take(5)
            ->get();

        $recentMessages = WhatsappMessage::latest()
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentProducts' => $recentProducts,
            'recentMessages' => $recentMessages,
        ]);
    }
}
