<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Spatie\Permission\Models\Role;

class RolePolicy
{
    use HandlesAuthorization;
    const resource = 'roles';

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo("Ver " . self::resource, 'web')
            ? $this->allow()
            : $this->deny('No tiene permiso para ver ' . self::resource);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Role $role)
    {
        return $user->hasPermissionTo("Ver " . self::resource, 'web')
            ? $this->allow()
            : $this->deny('No tiene permiso para ver ' . self::resource);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user)
    {
        return $user->hasPermissionTo("Crear " . self::resource, 'web')
            ? $this->allow()
            : $this->deny('No tiene permiso para Crear ' . self::resource);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Role $role)
    {
        return $user->hasPermissionTo("Actualizar " . self::resource, 'web')
            ? $this->allow()
            : $this->deny('No tiene permiso para Editar ' . self::resource);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Role $role)
    {
        return $user->hasPermissionTo("Eliminar " . self::resource, 'web')
            ? $this->allow()
            : $this->deny('No tiene permiso para Eliminar ' . self::resource);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Role $role)
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Role $role)
    {
        //
    }
}
