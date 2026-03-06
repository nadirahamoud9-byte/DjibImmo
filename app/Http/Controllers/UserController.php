<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Vérification du rôle - admin uniquement
        $user = $request->user();
        $userRole = $user->role ?? 'admin';
        
        if ($userRole !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas la permission d\'accéder à la liste des utilisateurs.',
            ], 403);
        }

        try {
            $perPage = $request->get('per_page', 10);
            $users = User::paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $users->items(),
                'meta' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des utilisateurs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Vérification du rôle - admin uniquement
        $user = $request->user();
        $userRole = $user->role ?? 'admin';
        
        if ($userRole !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas la permission de créer un utilisateur.',
            ], 403);
        }

        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'role' => 'required|string|in:admin,vehicule,location',
                'status' => 'nullable|string|in:active,inactive,suspended',
            ], [
                'name.required' => 'Le nom est obligatoire.',
                'name.string' => 'Le nom doit être une chaîne de caractères.',
                'name.max' => 'Le nom ne peut pas dépasser 255 caractères.',
                'email.required' => 'L\'email est obligatoire.',
                'email.email' => 'L\'email doit être une adresse email valide.',
                'email.unique' => 'Cette adresse email est déjà utilisée.',
                'password.required' => 'Le mot de passe est obligatoire.',
                'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
                'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
                'role.required' => 'Le rôle est obligatoire.',
                'role.string' => 'Le rôle doit être une chaîne de caractères.',
                'role.in' => 'Le rôle sélectionné n\'est pas valide.',
                'status.in' => 'Le statut sélectionné n\'est pas valide.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role ?? 'admin',
                'status' => $request->status ?? 'active',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur créé avec succès',
                'data' => $user
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        // Vérification du rôle - admin uniquement
        $currentUser = request()->user();
        $userRole = $currentUser->role ?? 'admin';
        
        if ($userRole !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas la permission d\'accéder aux détails d\'un utilisateur.',
            ], 403);
        }

        try {
            return response()->json([
                'success' => true,
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        // Vérification du rôle - admin uniquement
        $currentUser = $request->user();
        $userRole = $currentUser->role ?? 'admin';
        
        if ($userRole !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas la permission de modifier un utilisateur.',
            ], 403);
        }

        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
                'password' => 'nullable|string|min:8|confirmed',
                'role' => 'nullable|string|in:admin,vehicule,location',
                'status' => 'nullable|string|in:active,inactive,suspended',
            ], [
                'name.required' => 'Le nom est obligatoire.',
                'name.string' => 'Le nom doit être une chaîne de caractères.',
                'name.max' => 'Le nom ne peut pas dépasser 255 caractères.',
                'email.required' => 'L\'email est obligatoire.',
                'email.email' => 'L\'email doit être une adresse email valide.',
                'email.unique' => 'Cette adresse email est déjà utilisée.',
                'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
                'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
                'role.in' => 'Le rôle sélectionné n\'est pas valide.',
                'role.nullable' => 'Le rôle est obligatoire.',
                'role.string' => 'Le rôle doit être une chaîne de caractères.',
                'status.in' => 'Le statut sélectionné n\'est pas valide.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updateData = [
                'name' => $request->name,
                'email' => $request->email,
                'status' => $request->status ?? $user->status,
                'role' => $request->role ?? $user->role,
            ];

            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $user->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur modifié avec succès',
                'data' => $user->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la modification de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        // Vérification du rôle - admin uniquement
        $currentUser = request()->user();
        $userRole = $currentUser->role ?? 'admin';
        
        if ($userRole !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas la permission de supprimer un utilisateur.',
            ], 403);
        }

        try {
            // Empêcher la suppression de son propre compte
            if ($user->id === auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez pas supprimer votre propre compte'
                ], 403);
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
