<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class ImageUploadController extends Controller
{
    /**
     * Accept any common image format, convert to WebP, store publicly.
     */
    public function store(Request $request)
    {
        $request->validate([
            'image'  => 'required|file|image|max:15360', // max 15 MB
            'folder' => 'nullable|string|in:images,category,products',
        ]);

        try {
            // Load and process image with Intervention
            $image = Image::read($request->file('image'));

            // Optional: resize if too large (max width/height 2000px, maintain aspect ratio)
            if ($image->width() > 2000 || $image->height() > 2000) {
                $image->scale(width: 2000, height: 2000);
            }

            // Determine storage sub-folder (default: images)
            $folder = $request->input('folder', 'images');

            // Generate unique filename
            $filename = Str::uuid() . '.webp';
            $relativePath = $folder . '/' . $filename;
            $absolutePath = storage_path('app/public/' . $relativePath);

            // Ensure directory exists
            if (! is_dir(storage_path('app/public/' . $folder))) {
                mkdir(storage_path('app/public/' . $folder), 0755, true);
            }

            // Convert & save as WebP (quality 85)
            $image->toWebp(quality: 85)->save($absolutePath);

            // Return the public URL (requires storage:link)
            $url = Storage::disk('public')->url($relativePath);

            return response()->json(['url' => $url]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to process image: ' . $e->getMessage()], 500);
        }
    }
}
