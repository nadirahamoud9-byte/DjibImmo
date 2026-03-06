import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    LayoutDashboard,
    LogOut,
    Car,
    Wrench,
    Users,
    User,
} from 'lucide-react';
import { API_URL } from '../../api';

const COLOR_MAP = {
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
};

const StatCard = ({ icon: Icon, title, value, color }) => {
    const palette = COLOR_MAP[color] || COLOR_MAP.indigo;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className={`p-3 inline-flex items-center justify-center rounded-full ${palette.bg} ${palette.text} mb-4`}>
                <Icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{Number(value || 0).toLocaleString('fr-FR')}</p>
        </div>
    );
};

const AdminDashboardView = ({ user, token, handleLogout }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const headers = { Accept: 'application/json' };
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }

                const response = await axios.get(`${API_URL}/dashboard`, { headers });

                setDashboardData({
                    stats: response?.data?.stats || {},
                    message: response?.data?.message,
                });
            } catch (err) {
                const status = err?.response?.status;
                if (status === 401 || status === 403) {
                    setError('Session expirée ou non autorisée. Veuillez vous reconnecter.');
                    if (typeof handleLogout === 'function') {
                        handleLogout();
                    }
                } else {
                    setError("Impossible de charger les données du tableau de bord administrateur.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboard();
    }, [token, handleLogout]);

    const userName = user?.name || 'Administrateur';
    const stats = dashboardData?.stats || {};
    const welcomeMessage = dashboardData?.message || `Bienvenue sur votre espace, ${userName}.`;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50">
                <div className="text-center p-10 bg-white rounded-xl shadow-lg">
                    <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-lg font-medium text-slate-700">Chargement du tableau de bord...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'Inter, sans-serif' }}>
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center">
                        <LayoutDashboard className="w-6 h-6 text-indigo-600 mr-3" />
                        <h1 className="text-2xl font-bold text-slate-900">Tableau de Bord Admin</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-slate-700 hidden sm:inline">
                            Bienvenue, <span className="font-semibold text-indigo-600">{userName}</span>
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 transition duration-200 shadow-md"
                        >
                            <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
                <div className="px-4 sm:px-0">
                    {error && <p className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</p>}

                    <div className="mb-8 p-6 bg-indigo-50 border border-indigo-200 rounded-xl shadow-sm">
                        <p className="text-lg font-semibold text-indigo-800">{welcomeMessage}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard icon={Users} title="Nouveaux clients (mois)" value={stats.nouveaux_clients} color="emerald" />
                        <StatCard icon={User} title="Techniciens disponibles" value={stats.techniciens_Disponibles} color="pink" />
                    </div>

                    <div className="mt-12">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Actions rapides</h2>
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                            <div className="flex flex-wrap gap-4">
                                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Gérer les utilisateurs</button>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Ajouter une parcelle</button>
                                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Voir toutes les demandes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboardView;


