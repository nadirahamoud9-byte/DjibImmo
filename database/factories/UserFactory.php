<?php

namespace Database\Factories;

use App\Models\User; // ← ajoute ça !
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    /**
     * Le modèle associé au factory
     */
    protected $model = User::class; // ← INDISPENSABLE sur Railway !!!

    public function definition(): array
    {
        $faker = $this->faker ?? fake();

        return [
            'name' => $faker->name(),
            'email' => $faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'admin',
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn () => [
            'email_verified_at' => null,
        ]);
    }
}
