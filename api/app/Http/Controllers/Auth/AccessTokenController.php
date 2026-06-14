<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Support\Facades\Request;

/**
 * @group Autenticación
 * @subgroup Tokens de acceso (móvil)
 */
class AccessTokenController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum', ['except' => ['store']]);
    }

    /**
     * Mostrar los tokens de acceso
     *
     * Muestra los tokens de acceso del usuario actual.
     */
    public function index()
    {
        return Request::user()->tokens;
    }

    /**
     * Crear un token de acceso (login)
     *
     * Crea un token de acceso para el usuario actual.
     * 
     * @bodyParam email string required Correo electrónico del usuario. Example: superadmin1@yopmail.com
     * @bodyParam password string required Contraseña del usuario. Example: 1234
     */
    public function store(LoginRequest $request)
    {
        $request->authenticate();

        //Nuevo token de login
        $token = $request->user()->createToken('auth_token');

        return response()->json([
            'token_type' => 'Bearer',
            'access_token' => $token->plainTextToken,
            'data' => $request->user()->obtenerDatos()
        ]);
    }

    /**
     * Eliminar el token de acceso (logout)
     *
     * Elimina el token de acceso usado para la autenticación.
     */
    public function destroy()
    {
        Request::user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesion cerrada',
        ], 200);
    }

    /**
     * Eliminar todos los tokens de acceso
     *
     * Elimina todos los tokens de acceso del usuario actual. Equivale a cerrar todas las sesiones del usuario actual.
     */
    public function destroyAll()
    {
        Request::user()->tokens()->delete();

        return response()->json([
            'message' => 'Sesiones cerradas',
        ], 200);
    }
}
