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

class ExternalProductLookupTest extends TestCase
{
    use RefreshDatabase;

    private $user;
    private $brand;
    private $category;
    private $subcategory;
    private $subSubcategory;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->brand = Brand::create(['name' => 'Brand Test']);
        $this->category = Category::create(['name' => 'Category Test']);
        $this->subcategory = Subcategory::create([
            'category_id' => $this->category->id,
            'name' => 'Subcategory Test'
        ]);
        $this->subSubcategory = SubSubcategory::create([
            'subcategory_id' => $this->subcategory->id,
            'name' => 'Sub-Subcategory Test'
        ]);
    }

    public function test_unauthorized_request_returns_401(): void
    {
        $response = $this->getJson('/api/external/products/1234567890123');
        $response->assertStatus(401);
    }

    public function test_product_not_found_returns_404(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson('/api/external/products/9999999999999');
        $response->assertStatus(404);
        $response->assertJson([
            'message' => 'Product not found with EAN: 9999999999999'
        ]);
    }

    public function test_product_found_by_ean_returns_200_with_relations(): void
    {
        Sanctum::actingAs($this->user);

        $product = Product::create([
            'ean' => '7791234567890',
            'name' => 'Shampoo Clear',
            'brand_id' => $this->brand->id,
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'sub_subcategory_id' => $this->subSubcategory->id,
            'price' => 450.50,
            'status' => 'active',
        ]);

        $response = $this->getJson('/api/external/products/7791234567890');

        $response->assertStatus(200);
        $response->assertJson([
            'ean' => '7791234567890',
            'name' => 'Shampoo Clear',
            'price' => '450.50',
            'status' => 'active',
            'brand' => [
                'id' => $this->brand->id,
                'name' => 'Brand Test'
            ],
            'category' => [
                'id' => $this->category->id,
                'name' => 'Category Test'
            ],
            'subcategory' => [
                'id' => $this->subcategory->id,
                'name' => 'Subcategory Test'
            ],
            'sub_subcategory' => [
                'id' => $this->subSubcategory->id,
                'name' => 'Sub-Subcategory Test'
            ]
        ]);
    }
}
