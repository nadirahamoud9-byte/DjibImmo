<?php

namespace Database\Seeders;

use App\Models\Parcelle;
use Illuminate\Database\Seeder;

class ParcelleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Génère un lot de parcelles réalistes via la factory
        Parcelle::factory()
            ->count(30)
            ->create();
    }
}

