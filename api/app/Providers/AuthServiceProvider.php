<?php

namespace App\Providers;

// use Illuminate\Support\Facades\Gate;

use App\Models\Cliente;
use App\Models\Deposito;
use App\Models\Empleado;
use App\Models\EmpleadoLicencia;
use App\Models\Indumentaria;
use App\Models\PuestoTrabajo;
use App\Models\Servicio;
use App\Models\Ubicacion;
use App\Models\User;
use App\Policies\ClientePolicy;
use App\Policies\DepositoPolicy;
use App\Policies\EmpleadoLicenciaPolicy;
use App\Policies\EmpleadoPolicy;
use App\Policies\IndumentariaPolicy;
use App\Policies\PermissionPolicy;
use App\Policies\PuestoTrabajoPolicy;
use App\Policies\RolePolicy;
use App\Policies\ServicioPolicy;
use App\Policies\UbicacionPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Permission::class => PermissionPolicy::class,
        Role::class => RolePolicy::class,
        User::class => UserPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}
