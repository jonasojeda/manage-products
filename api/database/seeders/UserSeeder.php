<?php

namespace Database\Seeders;

use App\Http\Clases\App;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $users = [
            [
                'name' => 'Admin',
                'email' => 'admin@yopmail.com',
                'roles' => RoleSeeder::ROL_SUPERADMINISTRADOR,
            ],
        ];

        foreach ($users as $user) {
            if (!\App\Models\User::where('email', $user['email'])->exists()) {
                \App\Models\User::factory()->create([
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'password' => bcrypt('1234'),
                ])
                    ->assignRole($user['roles']);
            }
        }
    }
}
