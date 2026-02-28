<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class VideoUploadController extends Controller
{
    /**
     * Accept a video file (mp4, webm, mov, avi), store it publicly, return the URL.
     * Maximum 25 MB.
     */
    public function store(Request $request)
    {
        $request->validate([
            'video'  => 'required|file|mimetypes:video/mp4,video/webm,video/quicktime,video/x-msvideo,video/mpeg|max:25600',
            'folder' => 'nullable|string|in:videos,banner-videos',
        ]);

        try {
            $file   = $request->file('video');
            $folder = $request->input('folder', 'videos');
            $ext    = strtolower($file->getClientOriginalExtension()) ?: 'mp4';

            // Generate unique filename
            $filename     = Str::uuid() . '.' . $ext;
            $relativePath = $folder . '/' . $filename;

            // Ensure directory exists under public/storage
            $dir = public_path('storage/' . $folder);
            if (! is_dir($dir)) {
                mkdir($dir, 0755, true);
            }

            // Move file to public storage
            $file->move($dir, $filename);

            $url = Storage::disk('public')->url($relativePath);

            return response()->json(['url' => $url]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to upload video: ' . $e->getMessage()], 500);
        }
    }
}
