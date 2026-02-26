<?php

use App\Http\Controllers\Admin\BannerSlideController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DiscountCodeController;
use App\Http\Controllers\Admin\ImageUploadController;
use App\Http\Controllers\Admin\ProductAttributeController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\WhatsappMessageController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('admin.dashboard');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin Routes
Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Banner Slides
    Route::resource('banner-slides', BannerSlideController::class)->except(['show']);

    // Image Upload (WebP conversion)
    Route::post('upload-image', [ImageUploadController::class, 'store'])->name('upload-image');

    // Categories
    Route::resource('categories', CategoryController::class);

    // Products
    Route::resource('products', ProductController::class);
    
    // Product Attributes (nested under products)
    Route::prefix('products/{product}')->name('products.')->group(function () {
        Route::get('attributes', [ProductAttributeController::class, 'index'])->name('attributes.index');
        Route::get('attributes/create', [ProductAttributeController::class, 'create'])->name('attributes.create');
        Route::post('attributes', [ProductAttributeController::class, 'store'])->name('attributes.store');
        Route::get('attributes/{attribute}', [ProductAttributeController::class, 'edit'])->name('attributes.edit');
        Route::put('attributes/{attribute}', [ProductAttributeController::class, 'update'])->name('attributes.update');
        Route::delete('attributes/{attribute}', [ProductAttributeController::class, 'destroy'])->name('attributes.destroy');
    });

    // Discount Codes
    Route::resource('discount-codes', DiscountCodeController::class);

    // WhatsApp Messages
    Route::get('whatsapp-messages', [WhatsappMessageController::class, 'index'])->name('whatsapp-messages.index');
    Route::get('whatsapp-messages/{message}', [WhatsappMessageController::class, 'show'])->name('whatsapp-messages.show');
    Route::patch('whatsapp-messages/{message}/status', [WhatsappMessageController::class, 'updateStatus'])->name('whatsapp-messages.update-status');
    Route::delete('whatsapp-messages/{message}', [WhatsappMessageController::class, 'destroy'])->name('whatsapp-messages.destroy');

    // Settings
    Route::get('settings', [SettingController::class, 'edit'])->name('settings.edit');
    Route::put('settings', [SettingController::class, 'update'])->name('settings.update');
});

require __DIR__.'/auth.php';
