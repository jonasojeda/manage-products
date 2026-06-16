<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

class ApiTokenTest extends TestCase
{
    use RefreshDatabase;

    private $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user);
    }

    public function test_api_tokens_list_returns_only_custom_tokens(): void
    {
        // Create session token
        $this->user->createToken('auth_token');

        // Create API token
        $this->user->createToken('Production Server');

        $response = $this->getJson('/api/api-tokens');

        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonFragment([
            'name' => 'Production Server',
        ]);
        $response->assertJsonMissing([
            'name' => 'auth_token',
        ]);
    }

    public function test_api_token_creation(): void
    {
        $payload = [
            'name' => 'Staging API Client',
        ];

        $response = $this->postJson('/api/api-tokens', $payload);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'id',
            'name',
            'token',
            'status',
            'createdAt',
            'lastUsed',
        ]);
        $response->assertJson([
            'name' => 'Staging API Client',
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('personal_access_tokens', [
            'name' => 'Staging API Client',
        ]);
    }

    public function test_api_token_revocation(): void
    {
        $token = $this->user->createToken('Test Token');

        $response = $this->deleteJson("/api/api-tokens/{$token->accessToken->id}");

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Token revoked successfully',
        ]);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $token->accessToken->id,
        ]);
    }

    public function test_api_token_regeneration(): void
    {
        $token = $this->user->createToken('Rotate Token');
        $oldId = $token->accessToken->id;

        $response = $this->postJson("/api/api-tokens/{$oldId}/regenerate");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'id',
            'name',
            'token',
            'status',
            'createdAt',
            'lastUsed',
        ]);
        $response->assertJson([
            'name' => 'Rotate Token',
            'status' => 'active',
        ]);

        // Old token must be deleted
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $oldId,
        ]);

        // New token must exist
        $this->assertDatabaseHas('personal_access_tokens', [
            'name' => 'Rotate Token',
        ]);
    }
}
