<?php

namespace App\Http\Controllers;

use App\Http\Clases\App;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request as ClientRequest;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

/**
 * @group Usuarios
 */
class UserController extends Controller
{

    // public function __construct()
    // {
    //     //control de los permisos
    //     $this->authorizeResource(User::class, 'user');
    // }

    /**
     * Obtener todos
     */
    public function index(ClientRequest $request)
    {
        //Query parameters
        $validated = $request->validate([
            //Example: matias@gmail
            'email' => 'string|sometimes',
            'nombre' => 'string|sometimes',
            // Example: 3
            'rol_id' => 'numeric|sometimes',
            //Example: 1
            'ubicacion_id' => 'numeric|sometimes',
            //Example: 1
            'trabajando' => 'boolean|sometimes',
            //Example: 1
            'ubicacion_trabajando_id' => 'numeric|sometimes',
            //Example: 1
            'nroPagina' => 'numeric|sometimes',
            //Example: 0
            'sinPaginar' => 'boolean|sometimes',
        ]);

        //Parametros
        $email = Request::query('email');
        $nombre = Request::query('nombre');
        $rol_id = Request::query('rol_id');
        $ubicacion_id = Request::query('ubicacion_id');
        $trabajando = Request::query('trabajando');
        $ubicacion_trabajando_id = Request::query('ubicacion_trabajando_id');
        $sinPaginar = $request->query('sinPaginar');
        $nroPagina = $request->has('nroPagina') ? $request->query('nroPagina') : 1;


        $listaBD = User::orderBy('email', 'asc')
            ->when($rol_id != null, function ($query) use ($rol_id) {
                $query->whereHas('roles', function ($query) use ($rol_id) {
                    $query->where('roles.id', $rol_id);
                });
            })
            ->when($ubicacion_id != null, function ($query) use ($ubicacion_id) {
                $query->whereHas('ubicacionuser', function ($query1) use ($ubicacion_id) {
                    $query1->where('ubicacion_id', $ubicacion_id);
                });
            })->when($email != null, function ($query) use ($email) {
                $query->where('email', 'LIKE', "%{$email}%");
            })->when($nombre != null, function ($query) use ($nombre) {
                $query->where('name', 'LIKE', "%{$nombre}%");
            })->when($trabajando !== null, function ($query) use ($trabajando) {
                $query->where('working', $trabajando);
            })->when($ubicacion_trabajando_id !== null, function ($query) use ($ubicacion_trabajando_id) {
                $query->where('ubicacion_trabajando_id', $ubicacion_trabajando_id);
            });


        if ($sinPaginar) {
            $listaBD = $listaBD->get();
        } else {
            $listaBD = $listaBD->paginate(App::CANTIDAD_ITEMS_DEVOLVER_POR_PAGINA, ['*'], 'page', $nroPagina);
        }

        $listaDevolver = collect();
        if ($listaBD) {
            foreach ($listaBD as $item) {
                $listaDevolver->push($item->obtenerDatos());
            }
        }

        //Datos de paginado
        $pagTotalItems = $sinPaginar == true  ? count($listaBD) : $listaBD->total();
        $pagTotal = $sinPaginar == true  ? 1 : ceil($pagTotalItems / App::CANTIDAD_ITEMS_DEVOLVER_POR_PAGINA);
        $pagActual = $nroPagina;

        return response()->json([
            'data' => $listaDevolver,
            'current_page' => (int) $pagActual,
            'last_page' => $pagTotal,
            'total' => $pagTotalItems
        ], 200);
    }

    /**
     * Crear usuario
     */
    public function store(ClientRequest $request)
    {
        //Body parameters
        $validated = $request->validate([
            'name' => ['string', 'required'],
            'email' => ['string', 'required'],
            'password' => ['string', 'required'],
            'rol_id' => ['numeric', 'sometimes'],
            'foto_perfil' => ['file', 'mimes:jpeg,png,jpg,webp', 'max:100000', 'sometimes'],
        ]);
        $foto_perfil = $request->has('foto_perfil') ? $request->file('foto_perfil') : null;

        $userBD = User::where('email', $request->input('email'))->first();
        if ($userBD) {
            return response()->json(["message" => "Ya existe un usuario con el mismo mail"], 422);
        }

        $objBDNuevo = new User();
        $objBDNuevo->name = $request->input('name');
        $objBDNuevo->email = $request->input('email');
        $objBDNuevo->password = Hash::make($request->input('password'));
        $objBDNuevo->foto_perfil = $foto_perfil ? Storage::put(App::STORAGE_IMAGENES_PERFIL, $foto_perfil, 'public') : null;
        $objBDNuevo->save();

        if ($request->has('rol_id')) {
            $objBDNuevo->assignRole(Role::find($request->input('rol_id')));
        }

        return response()->json($objBDNuevo->obtenerDatos(), 201);
    }


    /**
     * Obtener datos
     * 
     * Devuelve datos de un usuario
     */
    public function show(User $user)
    {
        return response()->json($user->obtenerDatos());
    }

    /**
     * Actualizar
     * 
     * Se actualiza un usuario
     */
    public function update(ClientRequest $request, User $user)
    {
        //Body parameters
        $validated = $request->validate([
            'name' => ['string', 'sometimes'],
            'email' => ['string', 'sometimes'],
            'password' => ['string', 'sometimes'],
            // 'telefono' => ['string', 'regex:/^\+(?:[0-9] ?){6,14}[0-9]$/'],
            'rol_id' => ['numeric', 'sometimes'],
            'foto_perfil' => ['file', 'mimes:jpeg,png,jpg,webp', 'max:100000', 'sometimes'],
        ]);
        $foto_perfil = $request->has('foto_perfil') ? $request->file('foto_perfil') : null;

        $user->update($request->all());
        $user->foto_perfil = $foto_perfil ? Storage::put(App::STORAGE_IMAGENES_PERFIL, $foto_perfil, 'public') : $user->foto_perfil;

        if ($request->has('password')) {
            $user->password = Hash::make($request->input('password'));
        }
        if ($request->has('rol_id')) {
            $rolesViejos = $user->getRoleNames();
            if ($rolesViejos) {
                foreach ($rolesViejos as $rol) {
                    $user->removeRole($rol);
                }
            }
            $user->assignRole(Role::find($request->input('rol_id')));
        }
        $user->save();

        return response()->json($user->obtenerDatos(), 200);
    }

    /**
     * Eliminar usuario
     */
    public function destroy(User $user)
    {
        if ($user->ubicacionuser) {
            foreach ($user->ubicacionuser as $ubicacionuser) {
                $ubicacionuser->delete();
            }
        }
        $user->delete();
        return response()->json($user->obtenerDatos(), 200);
    }


    /**
     * Devolver los datos del usuario autenticado
     *
     * @authenticated
     */
    public function me()
    {
        $user = Request::user();

        return response()->json($user->obtenerDatos(), 200);
    }
}
