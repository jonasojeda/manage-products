<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::with(['brand', 'category', 'subcategory', 'subSubcategory']);

        // Search filter (SKU or Name)
        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                  ->orWhere('sku', 'like', "%{$q}%");
            });
        }

        // Brand filter by ID
        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->input('brand_id'));
        }

        // Brand filter by Name (matches frontend mock filters)
        if ($request->filled('brand') && $request->input('brand') !== 'all') {
            $brandName = $request->input('brand');
            $query->whereHas('brand', function ($b) use ($brandName) {
                $b->where('name', $brandName);
            });
        }

        // Status filter
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $perPage = $request->input('per_page', 8);
        $products = $query->latest()->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'sku' => ['required', 'string', 'unique:products,sku'],
            'name' => ['required', 'string', 'max:255'],
            'brand_id' => ['required', 'exists:brands,id'],
            'category_id' => ['required', 'exists:categories,id'],
            'subcategory_id' => ['required', 'exists:subcategories,id'],
            'sub_subcategory_id' => ['required', 'exists:sub_subcategories,id'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', Rule::in(['active', 'draft', 'archived'])],
        ]);

        $product = Product::create($validated);
        
        $product->load(['brand', 'category', 'subcategory', 'subSubcategory']);

        return response()->json([
            'message' => 'Product created successfully',
            'data' => $product
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $product->load(['brand', 'category', 'subcategory', 'subSubcategory']);
        return response()->json($product);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'sku' => ['sometimes', 'required', 'string', Rule::unique('products', 'sku')->ignore($product->id)],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'brand_id' => ['sometimes', 'required', 'exists:brands,id'],
            'category_id' => ['sometimes', 'required', 'exists:categories,id'],
            'subcategory_id' => ['sometimes', 'required', 'exists:subcategories,id'],
            'sub_subcategory_id' => ['sometimes', 'required', 'exists:sub_subcategories,id'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'status' => ['sometimes', 'required', Rule::in(['active', 'draft', 'archived'])],
        ]);

        $product->update($validated);

        $product->load(['brand', 'category', 'subcategory', 'subSubcategory']);

        return response()->json([
            'message' => 'Product updated successfully',
            'data' => $product
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully'
        ]);
    }
}
