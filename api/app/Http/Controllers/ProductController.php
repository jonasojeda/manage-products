<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\SubSubcategory;
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
            'sku' => ['nullable', 'string', 'unique:products,sku'],
            'ean' => ['required', 'string', 'unique:products,ean'],
            'name' => ['required', 'string', 'max:255'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'subcategory_id' => ['nullable', 'exists:subcategories,id'],
            'sub_subcategory_id' => ['nullable', 'exists:sub_subcategories,id'],
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
            'ean' => ['sometimes', 'required', 'string', Rule::unique('products', 'ean')->ignore($product->id)],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'brand_id' => ['sometimes', 'nullable', 'exists:brands,id'],
            'category_id' => ['sometimes', 'nullable', 'exists:categories,id'],
            'subcategory_id' => ['sometimes', 'nullable', 'exists:subcategories,id'],
            'sub_subcategory_id' => ['sometimes', 'nullable', 'exists:sub_subcategories,id'],
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

    /**
     * Import products from JSON payload.
     */
    public function import(Request $request)
    {
        ini_set('max_execution_time', 300);
        ini_set('memory_limit', '512M');

        $request->validate([
            'products' => ['required', 'array'],
            'products.*.name' => ['required', 'string', 'max:255'],
            'products.*.ean' => ['required', 'string', 'max:255'],
            'products.*.brand' => ['nullable', 'string', 'max:255'],
            'products.*.category' => ['nullable', 'string', 'max:255'],
            'products.*.subcategory' => ['nullable', 'string', 'max:255'],
            'products.*.sub_subcategory' => ['nullable', 'string', 'max:255'],
            'products.*.price' => ['nullable', 'numeric', 'min:0'],
        ]);

        $productsInput = $request->input('products');
        $eans = array_map(function ($item) {
            return trim($item['ean']);
        }, $productsInput);

        // Batch fetch existing products by EAN
        $existingProducts = Product::whereIn('ean', $eans)
            ->get()
            ->keyBy(function ($product) {
                return trim($product->ean);
            });

        $importedCount = 0;
        $updatedCount = 0;

        $brandsCache = [];
        $categoriesCache = [];
        $subcategoriesCache = [];
        $subSubcategoriesCache = [];

        foreach ($productsInput as $item) {
            // Find or create brand
            $brand = null;
            if (isset($item['brand']) && trim($item['brand']) !== '') {
                $brandName = trim($item['brand']);
                $brandKey = strtolower($brandName);
                if (isset($brandsCache[$brandKey])) {
                    $brand = $brandsCache[$brandKey];
                } else {
                    $brand = Brand::firstOrCreate(['name' => $brandName]);
                    $brandsCache[$brandKey] = $brand;
                }
            }

            // Find or create category
            $category = null;
            $subcategory = null;
            $subSubcategory = null;

            if (isset($item['category']) && trim($item['category']) !== '') {
                $catName = trim($item['category']);
                $catKey = strtolower($catName);
                if (isset($categoriesCache[$catKey])) {
                    $category = $categoriesCache[$catKey];
                } else {
                    $category = Category::firstOrCreate(['name' => $catName]);
                    $categoriesCache[$catKey] = $category;
                }

                // Find or create subcategory under this category
                if (isset($item['subcategory']) && trim($item['subcategory']) !== '') {
                    $subName = trim($item['subcategory']);
                    $subKey = $category->id . '_' . strtolower($subName);
                    if (isset($subcategoriesCache[$subKey])) {
                        $subcategory = $subcategoriesCache[$subKey];
                    } else {
                        $subcategory = Subcategory::firstOrCreate([
                            'category_id' => $category->id,
                            'name' => $subName
                        ]);
                        $subcategoriesCache[$subKey] = $subcategory;
                    }

                    // Find or create sub-subcategory under this subcategory
                    if (isset($item['sub_subcategory']) && trim($item['sub_subcategory']) !== '') {
                        $subSubName = trim($item['sub_subcategory']);
                        $subSubKey = $subcategory->id . '_' . strtolower($subSubName);
                        if (isset($subSubcategoriesCache[$subSubKey])) {
                            $subSubcategory = $subSubcategoriesCache[$subSubKey];
                        } else {
                            $subSubcategory = SubSubcategory::firstOrCreate([
                                'subcategory_id' => $subcategory->id,
                                'name' => $subSubName
                            ]);
                            $subSubcategoriesCache[$subSubKey] = $subSubcategory;
                        }
                    }
                }
            }

            $productData = [
                'name' => trim($item['name']),
                'brand_id' => $brand ? $brand->id : null,
                'category_id' => $category ? $category->id : null,
                'subcategory_id' => $subcategory ? $subcategory->id : null,
                'sub_subcategory_id' => $subSubcategory ? $subSubcategory->id : null,
                'price' => isset($item['price']) && $item['price'] !== '' ? $item['price'] : null,
                'status' => 'active',
            ];

            $ean = trim($item['ean']);
            $product = $existingProducts->get($ean);

            if ($product) {
                // Update existing product
                $product->update($productData);
                $updatedCount++;
            } else {
                // Create new product
                $productData['ean'] = $ean;
                Product::create($productData);
                $importedCount++;
            }
        }

        return response()->json([
            'message' => 'Import completed successfully',
            'imported' => $importedCount,
            'updated' => $updatedCount
        ]);
    }
}
