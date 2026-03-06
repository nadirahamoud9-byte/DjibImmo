<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Parcelle;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $userRole = $user->role ?? 'user';

        // Si ADMIN → voir tout
        if ($userRole === 'admin') {

            $totalParcelles = Parcelle::count();
            $totalLocations = Location::where('status', 'active')->count();
            $totalUtilisateurs = User::count();

        } 
        // Si utilisateur normal → voir seulement ses données
        else {

            $totalParcelles = Parcelle::where('user_id', $user->id)->count();
            $totalLocations = Location::where('user_id', $user->id)
                                      ->where('status', 'active')
                                      ->count();

            $totalUtilisateurs = 0; // il ne voit pas les utilisateurs
        }

        $stats = [
            'total_parcelles' => $totalParcelles,
            'total_locations' => $totalLocations,
            'total_utilisateurs' => $totalUtilisateurs,
        ];

        $message = "Bienvenue sur le tableau de bord, {$user->name} !";

        return response()->json([
            'message' => $message,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $userRole,
            ],
            'stats' => $stats,
        ]);
    }
}