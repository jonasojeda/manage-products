<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\SubSubcategory;
use App\Models\Product;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Illuminate\Support\Facades\DB;

class DashboardStatsTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_stats_endpoint_requires_authentication(): void
    {
        $response = $this->getJson('/api/dashboard/stats');
        $response->assertStatus(401);
    }

    public function test_dashboard_stats_endpoint_returns_correct_counts(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Create 2 Brands
        Brand::create(['name' => 'Brand A']);
        Brand::create(['name' => 'Brand B']);

        // Create 1 Category
        $category = Category::create(['name' => 'Category 1']);

        // Create 2 Subcategories
        $sub1 = Subcategory::create(['category_id' => $category->id, 'name' => 'Sub 1']);
        $sub2 = Subcategory::create(['category_id' => $category->id, 'name' => 'Sub 2']);

        // Create 3 Subsubcategories
        SubSubcategory::create(['subcategory_id' => $sub1->id, 'name' => 'Subsub 1']);
        SubSubcategory::create(['subcategory_id' => $sub1->id, 'name' => 'Subsub 2']);
        SubSubcategory::create(['subcategory_id' => $sub2->id, 'name' => 'Subsub 3']);

        // Create 1 Product
        Product::create([
            'name' => 'Test Product',
            'sku' => 'PROD-0001',
            'ean' => '1234567890123',
            'brand_id' => null,
            'category_id' => null,
        ]);

        // Access token count should be checked. Let's create a couple of tokens in the table for testing
        DB::table('personal_access_tokens')->insert([
            [
                'tokenable_type' => User::class,
                'tokenable_id' => $user->id,
                'name' => 'test-token-1',
                'token' => hash('sha256', 'token-1'),
                'abilities' => '[]',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tokenable_type' => User::class,
                'tokenable_id' => $user->id,
                'name' => 'test-token-2',
                'token' => hash('sha256', 'token-2'),
                'abilities' => '[]',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        $response = $this->getJson('/api/dashboard/stats');

        $response->assertStatus(200);
        $response->assertJson([
            'products_count' => 1,
            'brands_count' => 2,
            'categories_count' => 1,
            'subcategories_count' => 2,
            'sub_subcategories_count' => 3,
            'tokens_count' => 2,
        ]);
    }
}
