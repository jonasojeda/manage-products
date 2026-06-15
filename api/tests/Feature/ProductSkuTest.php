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

class ProductSkuTest extends TestCase
{
    use RefreshDatabase;

    private $brand;
    private $category;
    private $subcategory;
    private $subSubcategory;
    private $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user);

        $this->brand = Brand::create(['name' => 'Test Brand']);
        $this->category = Category::create(['name' => 'Test Category']);
        $this->subcategory = Subcategory::create([
            'category_id' => $this->category->id,
            'name' => 'Test Subcategory'
        ]);
        $this->subSubcategory = SubSubcategory::create([
            'subcategory_id' => $this->subcategory->id,
            'name' => 'Test Sub-Subcategory'
        ]);
    }

    public function test_sku_is_generated_automatically_when_not_provided(): void
    {
        $payload = [
            'ean' => '7790000000001',
            'name' => 'Product 1',
            'brand_id' => $this->brand->id,
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'sub_subcategory_id' => $this->subSubcategory->id,
            'price' => 99.99,
            'status' => 'active',
        ];

        $response = $this->postJson('/api/products', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.sku', 'SKU-1000');

        $this->assertDatabaseHas('products', [
            'name' => 'Product 1',
            'sku' => 'SKU-1000'
        ]);
    }

    public function test_sku_increments_automatically_on_subsequent_creations(): void
    {
        $payload1 = [
            'ean' => '7790000000001',
            'name' => 'Product 1',
            'brand_id' => $this->brand->id,
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'sub_subcategory_id' => $this->subSubcategory->id,
            'price' => 10.00,
            'status' => 'active',
        ];

        $response1 = $this->postJson('/api/products', $payload1);
        $response1->assertStatus(201);
        $response1->assertJsonPath('data.sku', 'SKU-1000');

        $payload2 = [
            'ean' => '7790000000002',
            'name' => 'Product 2',
            'brand_id' => $this->brand->id,
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'sub_subcategory_id' => $this->subSubcategory->id,
            'price' => 20.00,
            'status' => 'active',
        ];

        $response2 = $this->postJson('/api/products', $payload2);
        $response2->assertStatus(201);
        $response2->assertJsonPath('data.sku', 'SKU-1001');

        $this->assertDatabaseHas('products', [
            'name' => 'Product 2',
            'sku' => 'SKU-1001'
        ]);
    }

    public function test_custom_sku_can_still_be_passed_explicitly(): void
    {
        $payload = [
            'ean' => '7790000000003',
            'sku' => 'CUSTOM-SKU-99',
            'name' => 'Product with Custom SKU',
            'brand_id' => $this->brand->id,
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'sub_subcategory_id' => $this->subSubcategory->id,
            'price' => 150.00,
            'status' => 'active',
        ];

        $response = $this->postJson('/api/products', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.sku', 'CUSTOM-SKU-99');

        $this->assertDatabaseHas('products', [
            'name' => 'Product with Custom SKU',
            'sku' => 'CUSTOM-SKU-99'
        ]);
    }

    public function test_sku_increments_from_the_highest_existing_standard_sku(): void
    {
        // Seed a custom high SKU like SKU-2500
        Product::create([
            'ean' => '7790000000004',
            'sku' => 'SKU-2500',
            'name' => 'High SKU Product',
            'brand_id' => $this->brand->id,
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'sub_subcategory_id' => $this->subSubcategory->id,
            'price' => 150.00,
            'status' => 'active',
        ]);

        $payload = [
            'ean' => '7790000000005',
            'name' => 'Next Product',
            'brand_id' => $this->brand->id,
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'sub_subcategory_id' => $this->subSubcategory->id,
            'price' => 10.00,
            'status' => 'active',
        ];

        $response = $this->postJson('/api/products', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.sku', 'SKU-2501');

        $this->assertDatabaseHas('products', [
            'name' => 'Next Product',
            'sku' => 'SKU-2501'
        ]);
    }

    public function test_product_can_be_created_with_only_level_1_category(): void
    {
        $payload = [
            'ean' => '7790000000006',
            'name' => 'Partial Cat Product',
            'brand_id' => $this->brand->id,
            'category_id' => $this->category->id,
            'price' => 50.00,
            'status' => 'active',
        ];

        $response = $this->postJson('/api/products', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.subcategory_id', null);
        $response->assertJsonPath('data.sub_subcategory_id', null);

        $this->assertDatabaseHas('products', [
            'name' => 'Partial Cat Product',
            'subcategory_id' => null,
            'sub_subcategory_id' => null,
        ]);
    }

    public function test_product_can_be_created_without_brand_and_category(): void
    {
        $payload = [
            'ean' => '7790000000007',
            'name' => 'Name and EAN Only Product',
            'price' => 20.00,
            'status' => 'active',
        ];

        $response = $this->postJson('/api/products', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.brand_id', null);
        $response->assertJsonPath('data.category_id', null);

        $this->assertDatabaseHas('products', [
            'name' => 'Name and EAN Only Product',
            'brand_id' => null,
            'category_id' => null,
        ]);
    }
}
