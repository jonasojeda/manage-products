<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\SubSubcategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get statistics for the dashboard.
     */
    public function stats(Request $request)
    {
        return response()->json([
            'products_count' => Product::count(),
            'brands_count' => Brand::count(),
            'categories_count' => Category::count(),
            'subcategories_count' => Subcategory::count(),
            'sub_subcategories_count' => SubSubcategory::count(),
            'tokens_count' => DB::table('personal_access_tokens')->count(),
        ]);
    }
}
