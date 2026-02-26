<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DiscountCodeRequest;
use App\Models\DiscountCode;
use Inertia\Inertia;

class DiscountCodeController extends Controller
{
    public function index()
    {
        $discountCodes = DiscountCode::orderBy('created_at', 'desc')->paginate(20);

        return Inertia::render('Admin/DiscountCodes/Index', [
            'discountCodes' => $discountCodes,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/DiscountCodes/Create');
    }

    public function store(DiscountCodeRequest $request)
    {
        $validated = $request->validated();

        DiscountCode::create($validated);

        return redirect()->route('admin.discount-codes.index')
            ->with('success', 'Discount code created successfully.');
    }

    public function edit(DiscountCode $discountCode)
    {
        return Inertia::render('Admin/DiscountCodes/Edit', [
            'discountCode' => $discountCode,
        ]);
    }

    public function update(DiscountCodeRequest $request, DiscountCode $discountCode)
    {
        $validated = $request->validated();

        $discountCode->update($validated);

        return redirect()->route('admin.discount-codes.index')
            ->with('success', 'Discount code updated successfully.');
    }

    public function destroy(DiscountCode $discountCode)
    {
        $discountCode->delete();

        return redirect()->route('admin.discount-codes.index')
            ->with('success', 'Discount code deleted successfully.');
    }
}
