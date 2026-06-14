<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    use HandlesAuthorization;

    public const PERMISSION_RESOURCE = 'Usuarios';

    /**
     * Determine whether the user can view any models.
     *
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(User $user)
    {
        $accion = 'Ver';
        return $user->hasPermissionTo("$accion " . self::PERMISSION_RESOURCE)
            ? $this->allow()
            : Response::deny(__('messages.er_no_permission'));
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param  \App\Models\User $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(User $user)
    {
        $accion = 'Ver';
        return $user->hasPermissionTo("$accion " . self::PERMISSION_RESOURCE)
            ? $this->allow()
            : Response::deny(__('messages.er_no_permission'));
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  \App\Models\User $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(User $user)
    {
        $accion = 'Crear';
        return $user->hasPermissionTo("$accion " . self::PERMISSION_RESOURCE)
            ? $this->allow()
            : Response::deny(__('messages.er_no_permission'));
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  \App\Models\User $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function update(User $user)
    {
        $accion = 'Actualizar';
        return $user->hasPermissionTo("$accion " . self::PERMISSION_RESOURCE)
            ? $this->allow()
            : Response::deny(__('messages.er_no_permission'));
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  \App\Models\User $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $user)
    {
        $accion = 'Eliminar';
        return $user->hasPermissionTo("$accion " . self::PERMISSION_RESOURCE)
            ? $this->allow()
            : Response::deny(__('messages.er_no_permission'));
    }

    // //******************************************************************************************************************
    // //Custom
    // //******************************************************************************************************************
    // /**
    //  * getOperadores.
    //  *
    //  * @param  \App\Models\User $user
    //  * @return \Illuminate\Auth\Access\Response|bool
    //  */
    // public function getOperadores(User $user)
    // {
    //     $accion = 'Ver operadores';
    //     return $user->hasPermissionTo("$accion " . self::PERMISSION_RESOURCE)
    //         ? $this->allow()
    //         : Response::deny(__('messages.er_no_permission'));
    // }

    /**
     * me.
     *
     * @param  \App\Models\User $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    // public function me(User $user)
    // {
    //     $accion = 'Ver datos sesión';
    //     return $user->hasPermissionTo("$accion " . self::PERMISSION_RESOURCE)
    //         ? $this->allow()
    //         : Response::deny(__('messages.er_no_permission'));
    // }
}
