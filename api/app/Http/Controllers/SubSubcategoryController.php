<?php

namespace App\Http\Controllers;

use App\Models\SubSubcategory;
use Illuminate\Http\Request;

class SubSubcategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $subSubcategories = SubSubcategory::with('subcategory.category')->get();
        return response()->json($subSubcategories);
    }

    /**
     * Store a newly created sub-subcategory.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subcategory_id' => ['required', 'exists:subcategories,id'],
            'name' => ['required', 'string', 'max:255'],
        ]);

        $exists = SubSubcategory::where('subcategory_id', $validated['subcategory_id'])
            ->where('name', trim($validated['name']))
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'The sub-subcategory name must be unique within the subcategory.'
            ], 422);
        }

        $subSubcategory = SubSubcategory::create([
            'subcategory_id' => $validated['subcategory_id'],
            'name' => trim($validated['name']),
        ]);

        return response()->json([
            'message' => 'Sub-subcategory created successfully',
            'data' => $subSubcategory
        ], 201);
    }

    /**
     * Update the specified sub-subcategory.
     */
    public function update(Request $request, SubSubcategory $subSubcategory)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $exists = SubSubcategory::where('subcategory_id', $subSubcategory->subcategory_id)
            ->where('name', trim($validated['name']))
            ->where('id', '!=', $subSubcategory->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'The sub-subcategory name must be unique within the subcategory.'
            ], 422);
        }

        $subSubcategory->update([
            'name' => trim($validated['name']),
        ]);

        return response()->json([
            'message' => 'Sub-subcategory updated successfully',
            'data' => $subSubcategory
        ]);
    }

    /**
     * Remove the specified sub-subcategory.
     */
    public function destroy(SubSubcategory $subSubcategory)
    {
        $subSubcategory->delete();

        return response()->json([
            'message' => 'Sub-subcategory deleted successfully'
        ]);
    }
}
