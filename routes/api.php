<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\VehiculeController;
use App\Http\Controllers\ParcelleController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail']);
});



// Public parcelle routes (read-only)
Route::prefix('parcelles')->group(function () {
    Route::get('/', [ParcelleController::class, 'index']);
    Route::get('/{parcelle}', [ParcelleController::class, 'show']);
    Route::get('/filter/options', [ParcelleController::class, 'filterOptions']);
});

// Public location routes (read-only)
Route::prefix('locations')->group(function () {
    Route::get('/', [LocationController::class, 'index']);
    Route::get('/{location}', [LocationController::class, 'show']);
    Route::get('/filter/options', [LocationController::class, 'filterOptions']);
});


// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Authentication routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'profile']);
    });

    // User routes
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Dashboard routes - accessible à tous les rôles authentifiés
    Route::get('/dashboard', [DashboardController::class, 'index']);



    // Protected parcelle routes - admin et location peuvent modifier
    Route::prefix('parcelles')->group(function () {
        Route::post('/', [ParcelleController::class, 'store'])->middleware('role:admin,location');
        Route::put('/{parcelle}', [ParcelleController::class, 'update'])->middleware('role:admin,location');
        Route::delete('/{parcelle}', [ParcelleController::class, 'destroy'])->middleware('role:admin,location');
    });

    // Protected location routes - admin et location peuvent modifier
    Route::prefix('locations')->group(function () {
        Route::post('/', [LocationController::class, 'store'])->middleware('role:admin,location');
        Route::put('/{location}', [LocationController::class, 'update'])->middleware('role:admin,location');
        Route::delete('/{location}', [LocationController::class, 'destroy'])->middleware('role:admin,location');
    });

    // Protected user routes - admin uniquement
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index'])->middleware('role:admin');
        Route::post('/', [UserController::class, 'store'])->middleware('role:admin');
        Route::get('/{user}', [UserController::class, 'show'])->middleware('role:admin');
        Route::put('/{user}', [UserController::class, 'update'])->middleware('role:admin');
        Route::delete('/{user}', [UserController::class, 'destroy'])->middleware('role:admin');
    });

});
