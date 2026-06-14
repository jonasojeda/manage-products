<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public const ROL_SUPERADMINISTRADOR = "Superadministrador";
    public const ROL_ADMINISTRADOR = "Administrador";
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::create(['name' => self::ROL_SUPERADMINISTRADOR]);
        Role::create(['name' => self::ROL_ADMINISTRADOR]);
    }
}
