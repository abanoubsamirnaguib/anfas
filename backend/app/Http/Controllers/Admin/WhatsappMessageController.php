<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WhatsappMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WhatsappMessageController extends Controller
{
    public function index(Request $request)
    {
        $query = WhatsappMessage::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('customer_name', 'like', '%' . $request->search . '%')
                    ->orWhere('customer_phone', 'like', '%' . $request->search . '%')
                    ->orWhere('message', 'like', '%' . $request->search . '%');
            });
        }

        $messages = $query->orderBy('created_at', 'desc')->paginate(20);

        return Inertia::render('Admin/WhatsappMessages/Index', [
            'messages' => $messages,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function show(WhatsappMessage $message)
    {
        return Inertia::render('Admin/WhatsappMessages/Show', [
            'message' => $message,
        ]);
    }

    public function updateStatus(Request $request, WhatsappMessage $message)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,sent,failed',
        ]);

        if ($validated['status'] === 'sent') {
            $message->markAsSent();
        } elseif ($validated['status'] === 'failed') {
            $message->markAsFailed();
        } else {
            $message->update(['status' => $validated['status']]);
        }

        return back()->with('success', 'Status updated successfully.');
    }

    public function destroy(WhatsappMessage $message)
    {
        $message->delete();

        return redirect()->route('admin.whatsapp-messages.index')
            ->with('success', 'Message deleted successfully.');
    }
}
