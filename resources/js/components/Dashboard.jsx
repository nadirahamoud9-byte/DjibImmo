import React from 'react';
import AdminDashboardView from './dashboard/AdminDashboardView';
import ParcelleDashboardView from './dashboard/ParcelleDashboardView';
import TerrainDashboardView from './dashboard/TerrainDashboardView';

const RoleFallbackView = ({ user, handleLogout }) => (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md bg-white shadow-lg border border-slate-200 rounded-2xl p-8">
            <h1 className="text-xl font-semibold text-slate-900 mb-3">Aucun accès disponible</h1>
            <p className="text-slate-600 mb-6">
                Bonjour {user?.name || 'utilisateur'}, votre rôle actuel ne correspond à aucun tableau de bord configuré.
                Veuillez contacter un administrateur si vous pensez qu’il s’agit d’une erreur.
            </p>
            {typeof handleLogout === 'function' && (
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-700 transition"
                >
                    Se déconnecter
                </button>
            )}
        </div>
    </div>
);

const ROLE_COMPONENTS = {
    admin: AdminDashboardView,
    parcelle: ParcelleDashboardView,
    terrains: TerrainDashboardView,
};

const Dashboard = ({ userData, handleLogout }) => {
    const user = userData?.user || {};
    const token = userData?.token || null;
    const userRole = (user?.role || 'admin').toLowerCase();

    const ViewComponent = ROLE_COMPONENTS[userRole] || RoleFallbackView;

    return (
        <ViewComponent
            user={user}
            token={token}
            handleLogout={handleLogout}
        />
    );
};

export default Dashboard;
