<?php

use App\Http\Controllers\Api\BannerSlideController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DiscountCodeController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\WhatsappMessageController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are for the Ionic React frontend to consume
|
*/

// Public API Routes
Route::prefix('v1')->group(function () {
    // Banner Slides (homepage slider)
    Route::get('banner-slides', [BannerSlideController::class, 'index']);

    // Categories and Products
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/{category:slug}', [CategoryController::class, 'show']);
    Route::get('categories/{category:slug}/products', [ProductController::class, 'index']);
    Route::get('categories/{categorySlug}/tags', [ProductController::class, 'tags']);
    Route::get('products/featured', [ProductController::class, 'featured']);
    Route::get('products/{product:slug}', [ProductController::class, 'show']);
    
    // Discount Codes
    Route::post('discount-codes/validate', [DiscountCodeController::class, 'validate']);
    
    // WhatsApp Messages
    Route::post('whatsapp-messages', [WhatsappMessageController::class, 'store']);

    // Settings (public)
    Route::get('settings', [SettingController::class, 'index']);
});
