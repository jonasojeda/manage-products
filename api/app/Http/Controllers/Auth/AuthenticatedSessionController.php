<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;

/**
 * @group Autenticación
 * @subgroup Sesiones (SPA)
 */
class AuthenticatedSessionController extends Controller
{
    /**
     * Iniciar sesión
     * 
     * Inicia sesión en la aplicación con los datos proporcionados.
     * 
     * @bodyParam email string required Correo electrónico del usuario. Example: superadmin1@yopmail.com
     * @bodyParam password string required Contraseña del usuario. Example: 1234
     * @response 204 {}
     */
    public function store(LoginRequest $request)
    {
        $request->authenticate();

        $request->session()->regenerate();

        return Response::noContent();
    }

    /**
     * Cerrar sesión
     * 
     * Cierra la sesión del usuario actual.
     * 
     * @response 204 {}
     */
    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->json(["message" => "Ok"], 200);
    }
}
