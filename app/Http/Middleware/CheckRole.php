<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        // Si l'utilisateur n'est pas authentifié
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié.',
            ], 401);
        }

        $userRole = $user->role ?? 'admin';

        // Les admins ont accès à tout
        if ($userRole === 'admin') {
            return $next($request);
        }

        // Si plusieurs rôles sont passés comme une seule chaîne séparée par des virgules
        // (ex: 'admin,vehicule'), les diviser en tableau
        $allowedRoles = [];
        foreach ($roles as $role) {
            if (str_contains($role, ',')) {
                $allowedRoles = array_merge($allowedRoles, explode(',', $role));
            } else {
                $allowedRoles[] = $role;
            }
        }

        // Vérifier si le rôle de l'utilisateur est dans les rôles autorisés
        if (!in_array($userRole, $allowedRoles)) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas la permission d\'effectuer cette action.',
            ], 403);
        }

        return $next($request);
    }
}

