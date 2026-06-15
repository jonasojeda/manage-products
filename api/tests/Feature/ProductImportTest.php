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

class ProductImportTest extends TestCase
{
    use RefreshDatabase;

    private $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user);
    }

    public function test_import_creates_new_products_and_nested_categories(): void
    {
        $payload = [
            'products' => [
                [
                    'ean' => '7791234567890',
                    'name' => 'Imported Smart TV',
                    'brand' => 'Samsung',
                    'category' => 'Electronics',
                    'subcategory' => 'Video',
                    'sub_subcategory' => 'Smart TVs',
                    'price' => 599.99,
                ],
                [
                    'ean' => '7791234567891',
                    'name' => 'Imported Smartphone',
                    'brand' => 'Samsung',
                    'category' => 'Electronics',
                    'subcategory' => 'Mobile',
                    'sub_subcategory' => 'Smartphones',
                    'price' => 299.99,
                ]
            ]
        ];

        $response = $this->postJson('/api/products/import', $payload);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Import completed successfully',
            'imported' => 2,
            'updated' => 0,
        ]);

        // Check Brand created
        $this->assertDatabaseHas('brands', ['name' => 'Samsung']);

        // Check Categories created
        $this->assertDatabaseHas('categories', ['name' => 'Electronics']);
        $this->assertDatabaseHas('subcategories', ['name' => 'Video']);
        $this->assertDatabaseHas('sub_subcategories', ['name' => 'Smart TVs']);

        // Check Products created and SKU auto-generated
        $this->assertDatabaseHas('products', [
            'ean' => '7791234567890',
            'name' => 'Imported Smart TV',
            'sku' => 'SKU-1000',
        ]);

        $this->assertDatabaseHas('products', [
            'ean' => '7791234567891',
            'name' => 'Imported Smartphone',
            'sku' => 'SKU-1001',
        ]);
    }

    public function test_import_updates_existing_products_matched_by_ean(): void
    {
        // Setup initial product
        $brand = Brand::create(['name' => 'LG']);
        $category = Category::create(['name' => 'Electronics']);
        $subcategory = Subcategory::create(['category_id' => $category->id, 'name' => 'Video']);
        $subSubcategory = SubSubcategory::create(['subcategory_id' => $subcategory->id, 'name' => 'TVs']);

        $product = Product::create([
            'sku' => 'SKU-1234',
            'ean' => '7791234567890',
            'name' => 'Old LG TV',
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'subcategory_id' => $subcategory->id,
            'sub_subcategory_id' => $subSubcategory->id,
            'price' => 450.00,
            'status' => 'active',
        ]);

        $payload = [
            'products' => [
                [
                    'ean' => '7791234567890',
                    'name' => 'Updated LG OLED TV',
                    'brand' => 'LG Electronics',
                    'category' => 'Home Entertainment',
                    'subcategory' => 'Television',
                    'sub_subcategory' => 'OLED TVs',
                    'price' => 999.99,
                ]
            ]
        ];

        $response = $this->postJson('/api/products/import', $payload);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Import completed successfully',
            'imported' => 0,
            'updated' => 1,
        ]);

        // LG Electronics should be created
        $this->assertDatabaseHas('brands', ['name' => 'LG Electronics']);

        // Verify product updated with new details while retaining its original SKU
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'ean' => '7791234567890',
            'name' => 'Updated LG OLED TV',
            'sku' => 'SKU-1234',
            'price' => 999.99,
        ]);

        $product->refresh();
        $this->assertEquals('Home Entertainment', $product->category->name);
        $this->assertEquals('Television', $product->subcategory->name);
        $this->assertEquals('OLED TVs', $product->subSubcategory->name);
    }

    public function test_import_with_missing_subcategory_levels(): void
    {
        $payload = [
            'products' => [
                [
                    'ean' => '7791234567899',
                    'name' => 'Imported With Level 1 Only',
                    'brand' => 'Sony',
                    'category' => 'Electronics',
                    'subcategory' => null,
                    'sub_subcategory' => '',
                    'price' => 120.00,
                ]
            ]
        ];

        $response = $this->postJson('/api/products/import', $payload);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Import completed successfully',
            'imported' => 1,
            'updated' => 0,
        ]);

        $this->assertDatabaseHas('products', [
            'ean' => '7791234567899',
            'name' => 'Imported With Level 1 Only',
            'subcategory_id' => null,
            'sub_subcategory_id' => null,
        ]);
    }

    public function test_import_without_brand_and_category(): void
    {
        $payload = [
            'products' => [
                [
                    'ean' => '7799999999999',
                    'name' => 'Imported With Name And EAN Only',
                    'brand' => null,
                    'category' => '',
                    'subcategory' => null,
                    'sub_subcategory' => null,
                    'price' => 10.00,
                ]
            ]
        ];

        $response = $this->postJson('/api/products/import', $payload);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Import completed successfully',
            'imported' => 1,
            'updated' => 0,
        ]);

        $this->assertDatabaseHas('products', [
            'ean' => '7799999999999',
            'name' => 'Imported With Name And EAN Only',
            'brand_id' => null,
            'category_id' => null,
            'subcategory_id' => null,
            'sub_subcategory_id' => null,
        ]);
    }

    public function test_import_skips_existing_products_when_option_is_true(): void
    {
        // Setup initial product
        $brand = Brand::create(['name' => 'Sony']);
        $category = Category::create(['name' => 'Electronics']);

        $product = Product::create([
            'sku' => 'SKU-7777',
            'ean' => '7791234567890',
            'name' => 'Old Product Name',
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'price' => 500.00,
            'status' => 'active',
        ]);

        $payload = [
            'skip_existing' => true,
            'products' => [
                [
                    'ean' => '7791234567890', // Exists, should be skipped
                    'name' => 'Updated Product Name',
                    'brand' => 'Sony Electronics', // New brand name that doesn't exist
                    'category' => 'Home Entertainment',
                    'price' => 600.00,
                ],
                [
                    'ean' => '7791234567891', // Does not exist, should be created
                    'name' => 'New Product',
                    'brand' => 'Sony',
                    'category' => 'Electronics',
                    'price' => 200.00,
                ]
            ]
        ];

        $response = $this->postJson('/api/products/import', $payload);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Import completed successfully',
            'imported' => 1,
            'updated' => 0,
            'skipped' => 1,
        ]);

        // Product with EAN 7791234567890 should retain old name and price (not updated)
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'ean' => '7791234567890',
            'name' => 'Old Product Name',
            'price' => 500.00,
        ]);

        // Brand 'Sony Electronics' should NOT be created because the row was skipped
        $this->assertDatabaseMissing('brands', ['name' => 'Sony Electronics']);

        // Product with EAN 7791234567891 should be created
        $this->assertDatabaseHas('products', [
            'ean' => '7791234567891',
            'name' => 'New Product',
            'price' => 200.00,
        ]);
    }

    public function test_import_handles_duplicate_eans_in_same_payload_gracefully(): void
    {
        $payload = [
            'skip_existing' => true,
            'products' => [
                [
                    'ean' => '7798888888888',
                    'name' => 'First Product Appearance',
                    'brand' => 'Sony',
                    'price' => 100.00,
                ],
                [
                    'ean' => '7798888888888', // Duplicate EAN in same batch
                    'name' => 'Second Product Appearance',
                    'brand' => 'Sony',
                    'price' => 200.00,
                ]
            ]
        ];

        $response = $this->postJson('/api/products/import', $payload);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Import completed successfully',
            'imported' => 1,
            'updated' => 0,
            'skipped' => 1, // Second one should be skipped
        ]);

        $this->assertDatabaseHas('products', [
            'ean' => '7798888888888',
            'name' => 'First Product Appearance',
        ]);
    }
}
