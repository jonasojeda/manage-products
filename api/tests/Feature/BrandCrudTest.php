<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Brand;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

class BrandCrudTest extends TestCase
{
    use RefreshDatabase;

    private $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user);
    }

    public function test_brands_index_returns_all_brands(): void
    {
        Brand::create(['name' => 'Brand A']);
        Brand::create(['name' => 'Brand B']);

        $response = $this->getJson('/api/brands');

        $response->assertStatus(200);
        $response->assertJsonCount(2);
        $response->assertJsonFragment(['name' => 'Brand A']);
        $response->assertJsonFragment(['name' => 'Brand B']);
    }

    public function test_brand_crud_operations(): void
    {
        // 1. Create
        $responseCreate = $this->postJson('/api/brands', ['name' => 'Sony']);
        $responseCreate->assertStatus(201);
        $responseCreate->assertJsonPath('data.name', 'Sony');
        $brandId = $responseCreate->json('data.id');

        // 2. Prevent duplicate names
        $responseDuplicate = $this->postJson('/api/brands', ['name' => 'Sony']);
        $responseDuplicate->assertStatus(422);

        // 3. Update
        $responseUpdate = $this->putJson("/api/brands/{$brandId}", ['name' => 'Sony Electronics']);
        $responseUpdate->assertStatus(200);
        $responseUpdate->assertJsonPath('data.name', 'Sony Electronics');

        // 4. Delete
        $responseDelete = $this->deleteJson("/api/brands/{$brandId}");
        $responseDelete->assertStatus(200);
        $this->assertDatabaseMissing('brands', ['id' => $brandId]);
    }
}
