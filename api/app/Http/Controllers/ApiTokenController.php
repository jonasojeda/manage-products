<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ApiTokenController extends Controller
{
    /**
     * Display a listing of personal access tokens (excluding frontend login tokens).
     */
    public function index(Request $request)
    {
        $tokens = $request->user()->tokens()
            ->where('name', '!=', 'auth_token')
            ->latest()
            ->get()
            ->map(function ($token) {
                return [
                    'id' => $token->id,
                    'name' => $token->name,
                    'token' => '••••••••' . substr($token->token, -8),
                    'status' => 'active',
                    'createdAt' => $token->created_at ? $token->created_at->toDateString() : null,
                    'lastUsed' => $token->last_used_at ? $token->last_used_at->diffForHumans() : '—',
                ];
            });

        return response()->json($tokens);
    }

    /**
     * Store a newly created personal access token.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $tokenResult = $request->user()->createToken($request->name);

        return response()->json([
            'id' => $tokenResult->accessToken->id,
            'name' => $tokenResult->accessToken->name,
            'token' => $tokenResult->plainTextToken,
            'status' => 'active',
            'createdAt' => $tokenResult->accessToken->created_at->toDateString(),
            'lastUsed' => '—',
        ], 201);
    }

    /**
     * Remove the specified personal access token.
     */
    public function destroy(Request $request, $id)
    {
        $request->user()->tokens()
            ->where('name', '!=', 'auth_token')
            ->where('id', $id)
            ->delete();

        return response()->json([
            'message' => 'Token revoked successfully'
        ]);
    }

    /**
     * Regenerate the specified personal access token.
     */
    public function regenerate(Request $request, $id)
    {
        $token = $request->user()->tokens()
            ->where('name', '!=', 'auth_token')
            ->findOrFail($id);

        $name = $token->name;

        // Revoke old token
        $token->delete();

        // Create new token with same name
        $tokenResult = $request->user()->createToken($name);

        return response()->json([
            'id' => $tokenResult->accessToken->id,
            'name' => $tokenResult->accessToken->name,
            'token' => $tokenResult->plainTextToken,
            'status' => 'active',
            'createdAt' => $tokenResult->accessToken->created_at->toDateString(),
            'lastUsed' => '—',
        ]);
    }
}
