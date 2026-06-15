<?php

namespace App\Http\Controllers;

use App\Models\Subcategory;
use Illuminate\Http\Request;

class SubcategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $subcategories = Subcategory::with('category')->get();
        return response()->json($subcategories);
    }

    /**
     * Store a newly created subcategory.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
        ]);

        $exists = Subcategory::where('category_id', $validated['category_id'])
            ->where('name', trim($validated['name']))
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'The subcategory name must be unique within the category.'
            ], 422);
        }

        $subcategory = Subcategory::create([
            'category_id' => $validated['category_id'],
            'name' => trim($validated['name']),
        ]);

        return response()->json([
            'message' => 'Subcategory created successfully',
            'data' => $subcategory
        ], 201);
    }

    /**
     * Update the specified subcategory.
     */
    public function update(Request $request, Subcategory $subcategory)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $exists = Subcategory::where('category_id', $subcategory->category_id)
            ->where('name', trim($validated['name']))
            ->where('id', '!=', $subcategory->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'The subcategory name must be unique within the category.'
            ], 422);
        }

        $subcategory->update([
            'name' => trim($validated['name']),
        ]);

        return response()->json([
            'message' => 'Subcategory updated successfully',
            'data' => $subcategory
        ]);
    }

    /**
     * Remove the specified subcategory.
     */
    public function destroy(Subcategory $subcategory)
    {
        $subcategory->delete();

        return response()->json([
            'message' => 'Subcategory deleted successfully'
        ]);
    }
}
