<?php

namespace App\Http\Controllers;

use App\Http\Requests\ParcelleStoreRequest;
use App\Http\Requests\ParcelleUpdateRequest;
use App\Http\Resources\ParcelleResource;
use App\Models\Parcelle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ParcelleController extends Controller
{
    /**
     * Display a listing of the parcels with filters and search.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Parcelle::query();

            // Filtrer par créateur pour les locationadmin (ils ne voient que leurs propres parcelles)
            $user = null;
            $user = $request->user();
            
            if (!$user && $request->bearerToken()) {
                try {
                    $token = $request->bearerToken();
                    if ($token) {
                        $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                        if ($accessToken) {
                            $user = $accessToken->tokenable;
                        }
                    }
                } catch (\Exception $e) {
                    Log::debug('Token authentication failed in parcelles index: ' . $e->getMessage());
                }
            }
            
            if ($user) {
                $userRole = $user->role ?? null;
                // Seuls les locationadmin sont filtrés - les admins voient tout
                if ($userRole === 'location') {
                    $query->where('user_id', $user->id);
                }
            }

            // Apply filters
            if ($request->filled('search')) {
                $query->search($request->search);
            }

            if ($request->filled('type')) {
                $query->byType($request->type);
            }

            if ($request->filled('location')) {
                $query->byLocation($request->location);
            }

            if ($request->filled('is_featured')) {
                $query->featured();
            }

            if ($request->filled('status')) {
                if ($request->input('status') === 'active') {
                    $query->active();
                } elseif ($request->input('status') === 'inactive') {
                    $query->inactive();
                }
            }

            if ($request->filled('price_min') || $request->filled('price_max')) {
                $query->priceRange(
                    $request->input('price_min'),
                    $request->input('price_max')
                );
            }

            if ($request->filled('surface_min') || $request->filled('surface_max')) {
                $query->surfaceRange(
                    $request->input('surface_min'),
                    $request->input('surface_max')
                );
            }

            // Sorting
            $sortBy = $request->input('sort_by', 'created_at');
            $sortOrder = $request->input('sort_order', 'desc');

            if (in_array($sortBy, ['title', 'location', 'price', 'surface', 'created_at'])) {
                $query->orderBy($sortBy, $sortOrder);
            }

            // Pagination
            $perPage = min($request->input('per_page', 15), 100); // Max 100 per page
            $parcelles = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Parcelles retrieved successfully',
                'data' => ParcelleResource::collection($parcelles->items()),
                'meta' => [
                    'current_page' => $parcelles->currentPage(),
                    'last_page' => $parcelles->lastPage(),
                    'per_page' => $parcelles->perPage(),
                    'total' => $parcelles->total(),
                    'from' => $parcelles->firstItem(),
                    'to' => $parcelles->lastItem(),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Error retrieving parcelles: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while retrieving parcelles',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created parcel in storage.
     */
    public function store(ParcelleStoreRequest $request): JsonResponse
    {
        // Vérification du rôle
        $user = $request->user();
        $userRole = $user->role ?? 'admin';
        
        if ($userRole !== 'admin' && $userRole !== 'location') {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas la permission de créer une parcelle.',
            ], 403);
        }

        try {
            $data = $request->validated();

            // Handle photo uploads
            if ($request->hasFile('photos')) {
                $photoPaths = [];
                foreach ($request->file('photos') as $photo) {
                    $path = $photo->store('parcelles', 'public');
                    $photoPaths[] = $path;
                }
                $data['photos'] = $photoPaths;
            }

            // Enregistrer automatiquement le créateur de la parcelle
            $data['user_id'] = auth()->id();

            $parcelle = Parcelle::create($data);

            Log::info('Parcelle created', ['parcelle_id' => $parcelle->id, 'user_id' => auth()->id()]);

            return response()->json([
                'success' => true,
                'message' => 'Parcelle created successfully',
                'data' => new ParcelleResource($parcelle),
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            Log::error('Error creating parcelle: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the parcelle',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified parcel.
     */
    public function show(Request $request, Parcelle $parcelle): JsonResponse
    {
        try {
            // Vérifier que le locationadmin ne peut voir que ses propres parcelles
            $user = $request->user();
            
            if ($user && ($user->role ?? 'admin') === 'location') {
                if ($parcelle->user_id !== $user->id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Vous n\'avez pas la permission d\'accéder à cette parcelle.',
                    ], Response::HTTP_FORBIDDEN);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Parcelle retrieved successfully',
                'data' => new ParcelleResource($parcelle),
            ]);

        } catch (\Exception $e) {
            Log::error('Error retrieving parcelle: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while retrieving the parcelle',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update the specified parcel in storage.
     */
    public function update(ParcelleUpdateRequest $request, Parcelle $parcelle): JsonResponse
    {
        // Vérification du rôle
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $userRole = $user->role ?? 'admin';
        
        if ($userRole !== 'admin' && $userRole !== 'location') {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas la permission de modifier une parcelle.',
            ], 403);
        }

        // Vérifier que le locationadmin ne peut modifier que ses propres parcelles
        if ($userRole === 'location' && $parcelle->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas la permission de modifier cette parcelle.',
            ], Response::HTTP_FORBIDDEN);
        }

        try {
            $data = $request->validated();

            // Handle photo uploads
            if ($request->hasFile('photos')) {
                // Delete old photos
                $oldPhotos = $parcelle->photos;

                if (is_string($oldPhotos)) {
                    $oldPhotos = json_decode($oldPhotos, true) ?? [];
                }

                if (is_array($oldPhotos) && !empty($oldPhotos)) {
                    foreach ($oldPhotos as $photo) {
                        if ($photo && Storage::disk('public')->exists($photo)) {
                            Storage::disk('public')->delete($photo);
                        }
                    }
                }

                // Upload new photos
                $photoPaths = [];
                foreach ($request->file('photos') as $photo) {
                    $path = $photo->store('parcelles', 'public');
                    $photoPaths[] = $path;
                }
                $data['photos'] = $photoPaths;
            }

            $parcelle->update($data);

            Log::info('Parcelle updated', ['parcelle_id' => $parcelle->id, 'user_id' => auth()->id()]);

            return response()->json([
                'success' => true,
                'message' => 'Parcelle updated successfully',
                'data' => new ParcelleResource($parcelle->fresh()),
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating parcelle: ' . $e->getMessage(), [
                'parcelle_id' => $parcelle->id ?? null,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the parcelle',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified parcel from storage.
     */
    public function destroy(Parcelle $parcelle): JsonResponse
    {
        // Vérification du rôle
        $user = request()->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $userRole = $user->role ?? 'admin';
        
        if ($userRole !== 'admin' && $userRole !== 'location') {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas la permission de supprimer une parcelle.',
            ], 403);
        }

        // Vérifier que le locationadmin ne peut supprimer que ses propres parcelles
        if ($userRole === 'location' && $parcelle->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas la permission de supprimer cette parcelle.',
            ], Response::HTTP_FORBIDDEN);
        }

        try {
            // Delete associated photos
            $photos = $parcelle->photos;

            if (is_string($photos)) {
                $photos = json_decode($photos, true) ?? [];
            }

            if (is_array($photos) && !empty($photos)) {
                foreach ($photos as $photo) {
                    if ($photo && Storage::disk('public')->exists($photo)) {
                        Storage::disk('public')->delete($photo);
                    }
                }
            }

            $parcelle->delete();

            Log::info('Parcelle deleted', ['parcelle_id' => $parcelle->id, 'user_id' => auth()->id()]);

            return response()->json([
                'success' => true,
                'message' => 'Parcelle deleted successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting parcelle: ' . $e->getMessage(), [
                'parcelle_id' => $parcelle->id ?? null,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the parcelle',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get available filter options for parcelles.
     */
    public function filterOptions(): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Filter options retrieved successfully',
                'data' => [
                    'types' => Parcelle::getTypes(),
                    'statuses' => Parcelle::getStatuses(),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Error retrieving filter options: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while retrieving filter options',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
