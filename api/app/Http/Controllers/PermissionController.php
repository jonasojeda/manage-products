<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Response;
use Spatie\Permission\Models\Role;


/**
 * @group Permission
 */
class PermissionController extends Controller
{
    private const PERMISSION_RESOURCE = 'roles';

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Mostrar todos los permisos indicando si está asignado o no a un rol en particular
     *
     * @urlParam role_id required El ID del rol. Example: 1
     * @queryParam grupo El nombre del grupo. Example: Algo
     */
    public function index(Request $request, Role $role)
    {
        if (!auth()->user()->can('Ver ' . self::PERMISSION_RESOURCE)) {
            $error = __('messages.er_no_permission');
            return response()->json(["message" => $error], 403);
        }

        $filtroGrupo = $request->has('grupo') ? $request->input('grupo') : null;

        //Permisos existentes agrupados por grupo
        $permissionBD = Permission::select('id', 'group AS grupo', 'name AS nombre')
            ->when($filtroGrupo !== null, function ($query) use ($filtroGrupo) {
                $query->where('group', 'LIKE', "%{$filtroGrupo}%");
            })
            ->orderBy('group', 'ASC')
            ->orderBy('name', 'ASC')
            ->get();
        $colGrupos = $permissionBD->groupBy('grupo')->all();

        //Indica que permisos están asignados al rol indicado
        $permissionAssignedID = $role->permissions->pluck('id')->all();
        foreach ($colGrupos as $grupo) {
            foreach ($grupo as $permiso) {
                $permisoID = $permiso['id'];

                $permiso['asignado'] = in_array($permisoID, $permissionAssignedID) ? 1 : 0;
            }
        }

        return response()->json([
            'data' => $colGrupos,
            'current_page' => 1,
            'last_page' => 1,
            'total' => sizeof($colGrupos)
        ], 200);
    }

    /**
     * Asignar un permiso a un rol
     *
     * @urlParam role_id required El ID del rol. Example: 1
     * @bodyParam permisoID numeric required El ID del permiso a asignar. Example: 1
     */
    public function store(Request $request, Role $role)
    {
        if (!auth()->user()->can('Crear ' . self::PERMISSION_RESOURCE)) {
            $error = __('messages.er_no_permission');
            return response()->json(["message" => $error], 403);
        }

        $permisoID = $request->input('permisoID');

        $objPermisoBD = Permission::find($permisoID);

        if (!$objPermisoBD) {
            $error = __('messages.er_not_found');
            return response()->json(["message" => $error], 422);
        }

        $role->givePermissionTo($objPermisoBD->name);

        return Response::json($objPermisoBD, 201);
    }

    /**
     * Eliminar un permiso de un rol
     *
     * @urlParam role_id required El ID del rol. Example: 1
     * @urlParam permission_id required El ID del permiso a eliminar. Example: 1
     */
    public function destroy(Role $role, Permission $permiso)
    {
        if (!auth()->user()->can('Eliminar ' . self::PERMISSION_RESOURCE)) {
            $error = __('messages.er_no_permission');
            return response()->json(["message" => $error], 403);
        }

        $role->revokePermissionTo($permiso);

        return Response::json('Ok', 200);
    }
}
