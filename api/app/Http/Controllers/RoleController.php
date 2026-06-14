<?php

namespace App\Http\Controllers;

use App\Http\Clases\App;
use App\Models\Role;
use App\Policies\UserPolicy;
use Carbon\Carbon;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * @group Role
 * 
 */
class RoleController extends Controller
{
    const GUARD_NAME = 'web';

    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->authorizeResource(Role::class, 'role');
    }

    /**
     * Obtener todos
     *
     * Obtener todos los registros
     * @authenticated
     *
     * @queryParam nroPagina int Página a mostrar. Example: 1
     * @queryParam sinPaginar boolean Para evitar la paginación y devolver todos los registros. Example: 1
     * @queryParam paginadoSimple boolean Para realizar un paginado simple con anterior/siguiente, eficiente cuando se manejan muchos datos. Example: 1
     * @queryParam nombre string Nombre de role. Example: Algo
     */
    public function index(Request $request)
    {
        $valRules = [
            'nroPagina' => 'numeric|sometimes|nullable',
            'sinPaginar' => 'boolean|sometimes|nullable',
            'paginadoSimple' => 'boolean|sometimes|nullable',
            'nombre' => 'string|max:50|sometimes|nullable',
        ];

        //Validar parametros de consulta
        if ($error = $this->validarParametros($request, $valRules)) {
            return response()->json(["message" => $error], 422);
        }

        //Parametros
        $nroPagina = $request->has('nroPagina') ? $request->query('nroPagina') : 1;
        $filtroSinPaginar = $request->query('sinPaginar');
        $filtroPaginadoSimple = $request->query('paginadoSimple');
        $filtroNombre = $request->query('nombre');

        $query = Role::when($filtroNombre, function ($query) use ($filtroNombre) {
            $query->where('name', 'LIKE', "%{$filtroNombre}%");
        })
            ->orderBy('name', 'ASC');

        if ($filtroSinPaginar == 1) {
            $listaBD = $query->get();
        } else if ($filtroPaginadoSimple == 1) {
            $listaBD = $query->simplePaginate(App::CANTIDAD_ITEMS_DEVOLVER_POR_PAGINA, ['*'], 'page', $nroPagina);
        } else {
            $listaBD = $query->paginate(App::CANTIDAD_ITEMS_DEVOLVER_POR_PAGINA, ['*'], 'page', $nroPagina);
        }

        //Datos de paginado
        $pagTotalItems = $pagTotal = $pagActual = 0;
        if ($filtroSinPaginar == 1) {
            $pagTotalItems = $listaBD->count();
            $pagTotal = 1;
        } else {
            $pagTotalItems = $filtroPaginadoSimple == 1 ? 0 : $listaBD->total();
            $pagTotal = $filtroPaginadoSimple == 1 ? 1 : ceil($pagTotalItems / App::CANTIDAD_ITEMS_DEVOLVER_POR_PAGINA);
            $pagActual = $nroPagina;
        }

        $listaDevolver = collect();
        if ($listaBD) {
            foreach ($listaBD as $item) {
                $listaDevolver->push($item->obtenerObjDatos());
            }
        }

        return response()->json([
            'data' => $listaDevolver,
            'current_page' => (int)$pagActual,
            'last_page' => $pagTotal,
            'total' => $pagTotalItems
        ], 200);
    }

    /**
     * Crear
     *
     * Crear un nuevo registro
     * @authenticated
     *
     * @bodyParam nombre string required Nombre del role. Example: Algo
     */
    public function store(Request $request)
    {
        $valRules = [
            'nombre' => 'string|max:50|required',
        ];

        //Validar parametros de consulta
        if ($error = $this->validarParametros($request, $valRules)) {
            return response()->json(["message" => $error], 422);
        }

        //Parametros
        $nombre = $request->input('nombre');

        $valExiste = Role::where('name', $nombre)
            ->exists();
        if ($valExiste) {
            $error = __('messages.er_role_already_exists');
            return response()->json(["message" => $error], 422);
        }

        $objNuevo = new Role();
        $objNuevo->name = $nombre;
        $objNuevo->guard_name = self::GUARD_NAME;
        $objNuevo->save();

        //Asigna permisos POR DEFECTO al role
        $resource = UserPolicy::PERMISSION_RESOURCE;
        $permisos = collect([
            ["name" => "Ver datos $resource"],
            ["name" => "Ver datos sesión $resource"],
            ["name" => "Ver permisos sesión $resource"],
            ["name" => "Resetear contraseña $resource"],
        ]);
        Role::findByName($objNuevo->name, 'web')->givePermissionTo($permisos);

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        return response()->json($objNuevo->obtenerObjDatos(), 201);
    }

    /**
     * Obtener datos
     *
     * Obtener datos de un registro
     * @authenticated
     *
     * @urlParam id int required ID del registro. Example: 1
     */
    public function show(Role $role)
    {
        return response()->json($role->obtenerObjDatos(), 200);
    }

    /**
     * Actualizar
     *
     * Actualizar un registro existente
     * @authenticated
     *
     * @urlParam  id int required ID del registro. Example: 1
     * @bodyParam nombre string required Nombre del estado. Example: Algo
     */
    public function update(Request $request, Role $role)
    {
        $valRules = [
            'nombre' => 'string|max:50|required',
        ];

        //Validar parametros de consulta
        if ($error = $this->validarParametros($request, $valRules)) {
            return response()->json(["message" => $error], 422);
        }

        //Parametros
        $nombre = $request->input('nombre');

        $valExiste = Role::where('id', '!=', $role->id)
            ->where('name', $nombre)
            ->exists();
        if ($valExiste) {
            $error = __('messages.er_role_already_exists');
            return response()->json(["message" => $error], 422);
        }

        //Valida si puede editar
        if ($role->name == RoleSeeder::ROL_SUPERADMINISTRADOR) {
            $error = __('messages.er_role_superadministrador_cant_be_edited');
            return response()->json(["message" => $error], 422);
        }

        $role->name = $nombre;
        $role->save();

        return response()->json($role->obtenerObjDatos(), 200);
    }

    /**
     * Eliminar
     *
     * Eliminar un registro
     * @authenticated
     *
     * @urlParam  id int required ID del registro. Example: 1
     */
    public function destroy(Role $role)
    {
        //Valida si puede editar
        if ($role->name == RoleSeeder::ROL_SUPERADMINISTRADOR) {
            $error = __('messages.er_role_superadministrador_cant_be_deleted');
            return response()->json(["message" => $error], 422);
        }

        //Para evitar problemas con validación UNIQUE en tabla ('name')
        $role->name = $role->name . ' DELETED_' . Carbon::now()->timestamp;
        $role->save();

        //Elimina
        $role->delete();

        return response()->json('Ok', 200);
    }
}
