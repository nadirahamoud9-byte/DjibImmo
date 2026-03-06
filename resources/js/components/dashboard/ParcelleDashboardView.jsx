import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, ArrowRight, RefreshCcw } from 'lucide-react';
import { API_URL } from '../../api';

const ParcelleDashboardView = ({ user, token, handleLogout }) => {
    const [parcelles, setParcelles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const userName = user?.name || 'Gestionnaire parcelles';

    const headers = useMemo(() => {
        const base = { Accept: 'application/json' };
        if (token) {
            base.Authorization = `Bearer ${token}`;
        }
        return base;
    }, [token]);

    const loadParcelles = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Pour les locationadmin, afficher toutes leurs parcelles, pour les admins, limiter à 6
            const perPage = user?.role === 'location' ? 50 : 6;
            const response = await fetch(`${API_URL}/parcelles?per_page=${perPage}&sort_by=created_at&sort_order=desc`, {
                headers,
            });

            if (response.status === 401 || response.status === 403) {
                setError("Session expirée ou non autorisée. Veuillez vous reconnecter.");
                if (typeof handleLogout === 'function') {
                    handleLogout();
                }
                return;
            }

            if (!response.ok) {
                throw new Error(`Erreur de chargement (${response.status})`);
            }

            const data = await response.json();
            setParcelles(data?.data || []);
        } catch (err) {
            setError(err.message || "Impossible de charger les parcelles.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadParcelles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatPrice = (value) => {
        if (value === null || value === undefined) return 'N/A';
        return `${Number(value).toLocaleString('fr-FR')} Fdj`;
    };

    return (
        <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'Inter, sans-serif' }}>
            <header className="bg-white shadow-md">
                <div className="max-w-6xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center">
                        <MapPin className="w-6 h-6 text-emerald-600 mr-3" />
                        <h1 className="text-2xl font-bold text-slate-900">
                            {user?.role === 'location' 
                                ? 'Mes parcelles'
                                : 'Tableau des parcelles'
                            }
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-slate-700 hidden sm:inline">
                            Bonjour, <span className="font-semibold text-emerald-600">{userName}</span>
                        </span>
                        <button
                            onClick={loadParcelles}
                            className="flex items-center px-4 py-2 border border-emerald-200 text-sm font-medium rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition duration-200 shadow-sm"
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" /> Rafraîchir
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto py-10 sm:px-6 lg:px-8">
                <div className="px-4 sm:px-0">
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="mb-8">
                        <p className="text-lg text-slate-700">
                            {user?.role === 'location' 
                                ? `Retrouvez ici toutes vos parcelles. Vous pouvez gérer uniquement les parcelles que vous avez créées.`
                                : `Aperçu des 6 dernières parcelles enregistrées. Gérez le catalogue complet depuis l'espace d'administration.`
                            }
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
                                <p className="text-emerald-600 font-medium">Chargement des parcelles...</p>
                            </div>
                        </div>
                    ) : parcelles.length === 0 ? (
                        <div className="text-center py-16 bg-white border border-dashed border-emerald-200 rounded-2xl">
                            <MapPin className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">Aucune parcelle trouvée</h3>
                            <p className="text-slate-600">
                                {user?.role === 'location' 
                                    ? "Vous n'avez pas encore créé de parcelle. Utilisez la section d'administration pour ajouter votre première parcelle."
                                    : "Ajoutez votre première parcelle pour la rendre visible ici."
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {parcelles.map((parcelle) => (
                                <div key={parcelle.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                            {parcelle.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 mb-1">
                                            {parcelle.location || 'Localisation non renseignée'}
                                        </p>
                                        <p className="text-2xl font-bold text-emerald-600 mb-4">
                                            {formatPrice(parcelle.price)}
                                        </p>
                                        <dl className="text-sm text-slate-600 space-y-1">
                                            <div className="flex justify-between">
                                                <dt>Surface</dt>
                                                <dd>{parcelle.surface ? `${parcelle.surface} m²` : '—'}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt>Type</dt>
                                                <dd>{parcelle.type || '—'}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt>Status</dt>
                                                <dd>{parcelle.status === 'inactive' ? 'Inactif' : 'Actif'}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                    <div className="mt-6 flex justify-between items-center">
                                        <span className="text-xs uppercase tracking-wide text-slate-400">
                                            {parcelle.is_featured ? 'En vedette' : 'Standard'}
                                        </span>
                                        <button className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition">
                                            Détails <ArrowRight className="w-4 h-4 ml-2" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ParcelleDashboardView;


