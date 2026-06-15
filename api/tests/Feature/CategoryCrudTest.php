<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\SubSubcategory;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

class CategoryCrudTest extends TestCase
{
    use RefreshDatabase;

    private $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user);
    }

    public function test_categories_index_returns_full_hierarchy(): void
    {
        $category = Category::create(['name' => 'Electronics']);
        $subcategory = Subcategory::create([
            'category_id' => $category->id,
            'name' => 'Computers'
        ]);
        $subSubcategory = SubSubcategory::create([
            'subcategory_id' => $subcategory->id,
            'name' => 'Laptops'
        ]);

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'Electronics']);
        $response->assertJsonFragment(['name' => 'Computers']);
        $response->assertJsonFragment(['name' => 'Laptops']);
    }

    public function test_category_crud_operations(): void
    {
        // 1. Create
        $responseCreate = $this->postJson('/api/categories', ['name' => 'Home']);
        $responseCreate->assertStatus(201);
        $responseCreate->assertJsonPath('data.name', 'Home');
        $categoryId = $responseCreate->json('data.id');

        // 2. Update
        $responseUpdate = $this->putJson("/api/categories/{$categoryId}", ['name' => 'Home & Living']);
        $responseUpdate->assertStatus(200);
        $responseUpdate->assertJsonPath('data.name', 'Home & Living');

        // 3. Delete
        $responseDelete = $this->deleteJson("/api/categories/{$categoryId}");
        $responseDelete->assertStatus(200);
        $this->assertDatabaseMissing('categories', ['id' => $categoryId]);
    }

    public function test_subcategory_crud_operations(): void
    {
        $category = Category::create(['name' => 'Electronics']);

        // 1. Create
        $responseCreate = $this->postJson('/api/subcategories', [
            'category_id' => $category->id,
            'name' => 'Computers'
        ]);
        $responseCreate->assertStatus(201);
        $subcategoryId = $responseCreate->json('data.id');

        // 2. Prevent duplicate names within the same category
        $responseDuplicate = $this->postJson('/api/subcategories', [
            'category_id' => $category->id,
            'name' => 'Computers'
        ]);
        $responseDuplicate->assertStatus(422);

        // 3. Update
        $responseUpdate = $this->putJson("/api/subcategories/{$subcategoryId}", [
            'name' => 'Computers & PCs'
        ]);
        $responseUpdate->assertStatus(200);
        $responseUpdate->assertJsonPath('data.name', 'Computers & PCs');

        // 4. Delete
        $responseDelete = $this->deleteJson("/api/subcategories/{$subcategoryId}");
        $responseDelete->assertStatus(200);
        $this->assertDatabaseMissing('subcategories', ['id' => $subcategoryId]);
    }

    public function test_sub_subcategory_crud_operations(): void
    {
        $category = Category::create(['name' => 'Electronics']);
        $subcategory = Subcategory::create([
            'category_id' => $category->id,
            'name' => 'Computers'
        ]);

        // 1. Create
        $responseCreate = $this->postJson('/api/sub-subcategories', [
            'subcategory_id' => $subcategory->id,
            'name' => 'Laptops'
        ]);
        $responseCreate->assertStatus(201);
        $subSubcategoryId = $responseCreate->json('data.id');

        // 2. Prevent duplicate names within the same subcategory
        $responseDuplicate = $this->postJson('/api/sub-subcategories', [
            'subcategory_id' => $subcategory->id,
            'name' => 'Laptops'
        ]);
        $responseDuplicate->assertStatus(422);

        // 3. Update
        $responseUpdate = $this->putJson("/api/sub-subcategories/{$subSubcategoryId}", [
            'name' => 'Notebooks'
        ]);
        $responseUpdate->assertStatus(200);
        $responseUpdate->assertJsonPath('data.name', 'Notebooks');

        // 4. Delete
        $responseDelete = $this->deleteJson("/api/sub-subcategories/{$subSubcategoryId}");
        $responseDelete->assertStatus(200);
        $this->assertDatabaseMissing('sub_subcategories', ['id' => $subSubcategoryId]);
    }

    public function test_subcategory_index_returns_list(): void
    {
        $category = Category::create(['name' => 'Electronics']);
        Subcategory::create(['category_id' => $category->id, 'name' => 'Computers']);

        $response = $this->getJson('/api/subcategories');
        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'Computers']);
        $response->assertJsonStructure([
            '*' => ['id', 'category_id', 'name', 'category']
        ]);
    }

    public function test_sub_subcategory_index_returns_list(): void
    {
        $category = Category::create(['name' => 'Electronics']);
        $subcategory = Subcategory::create(['category_id' => $category->id, 'name' => 'Computers']);
        SubSubcategory::create(['subcategory_id' => $subcategory->id, 'name' => 'Laptops']);

        $response = $this->getJson('/api/sub-subcategories');
        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'Laptops']);
        $response->assertJsonStructure([
            '*' => ['id', 'subcategory_id', 'name', 'subcategory' => ['id', 'category_id', 'name', 'category']]
        ]);
    }
}
