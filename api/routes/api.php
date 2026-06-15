<?php

use App\Http\Controllers\Auth\AccessTokenController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SubcategoryController;
use App\Http\Controllers\SubSubcategoryController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\DashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

$router->group(['middleware' => ['auth:sanctum']], function () {
    Route::get('accessControl', [AccessTokenController::class, 'accessControl']);
    Route::get('dashboard/stats', [DashboardController::class, 'stats']);


    // Permisos
    Route::post('permisos/asignar/{permission}', [PermissionController::class, 'assign']);
    Route::post('permisos/quitar/{permission}', [PermissionController::class, 'deny']);
    Route::apiResource('permisos', PermissionController::class)->only(['index']);

    //Roles
    Route::apiResource('roles', RoleController::class)->only(['index', 'store', 'destroy'])->parameter('roles', 'rol');

    //Usuarios
    Route::get('users/me', [UserController::class, 'me']);
    Route::apiResource('users', UserController::class)->parameter('users', 'user');

    //Role
    Route::apiResource('role', \App\Http\Controllers\RoleController::class)
        ->parameter('role', 'role');

    //RolePermission
    Route::apiResource('role.permiso', \App\Http\Controllers\PermissionController::class)
        ->parameters([
            'role' => 'role'
        ]);

    // Products Catalog
    Route::post('products/import', [ProductController::class, 'import']);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('subcategories', SubcategoryController::class);
    Route::apiResource('sub-subcategories', SubSubcategoryController::class);
    Route::apiResource('brands', BrandController::class);
});

Route::get('tokens', [AccessTokenController::class, 'index']);
Route::delete('tokens', [AccessTokenController::class, 'destroyAll']);
Route::post('login', [AccessTokenController::class, 'store']);
Route::post('logout', [AccessTokenController::class, 'destroy']);
