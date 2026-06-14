<?php

namespace Database\Seeders;

use Spatie\Permission\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //roles
        $resource = 'roles';
        $permisos = collect([
            ['name' => "Ver {$resource}"],
            ['name' => "Crear {$resource}"],
            ['name' => "Actualizar {$resource}"],
            ['name' => "Eliminar {$resource}"],
        ]);
        $permisos->each(function ($permiso) use ($resource) {
            $permiso['group'] = $resource;
            if (!\Spatie\Permission\Models\Permission::where('name', $permiso['name'])->exists())
                Permission::create($permiso);
        });

        //Asignando permisos
        Role::findByName('Superadministrador')->givePermissionTo($permisos);
        Role::findByName('Administrador')->givePermissionTo($permisos);
        //-----------------------------------------------------------------------------------
        //permisos
        $resource = 'permisos';
        $permisos = collect([
            ['name' => "Ver {$resource}"],
            ['name' => "Crear {$resource}"],
            ['name' => "Actualizar {$resource}"],
            ['name' => "Eliminar {$resource}"],
            ['name' => "Assign {$resource}"],
            ['name' => "Deny {$resource}"],
        ]);
        $permisos->each(function ($permiso) use ($resource) {
            $permiso['group'] = $resource;
            if (!\Spatie\Permission\Models\Permission::where('name', $permiso['name'])->exists())
                Permission::create($permiso);
        });

        //Asignando permisos
        Role::findByName('Superadministrador')->givePermissionTo($permisos);
        Role::findByName('Administrador')->givePermissionTo($permisos);
        //-----------------------------------------------------------------------------------
    }
}
