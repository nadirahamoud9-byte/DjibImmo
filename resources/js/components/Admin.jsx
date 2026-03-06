import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Users, BarChart3, Plus, Edit, Trash2, Eye, LogOut, Loader2, Home, Building, User, Menu, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ParcelleModal from './modal/ParcelleModal';
import ParcelleDetailModal from './modal/ParcelleDetailModal';
import LocationModal from './modal/LocationModal';
import LocationDetailModal from './modal/LocationDetailModal';
import UserModal from './modal/UserModal';
import UserDetailModal from './modal/UserDetailModal';
import ProfileModal from './modal/ProfileModal';
import ProfileDetailModal from './modal/ProfileDetailModal';
import ConfirmModal from './modal/ConfirmModal';
import Pagination from './commun/Pagination'; // Assurez-vous que ce fichier existe
import Toast from './commun/Toast';
import { API_URL } from '../api';

// --- Composants Réutilisables ---
const StatCard = ({ icon: Icon, title, value, color, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center">
            <div className="flex-shrink-0">
                <Icon className={`h-8 w-8 text-${color}-600`} />
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
                {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
            </div>
        </div>
    </div>
);

const getStatusColor = (status) => {
    switch (status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'inactive': return 'bg-red-100 text-red-800';
        case 'Disponible': return 'bg-green-100 text-green-800';
        case 'Vendu': return 'bg-blue-100 text-blue-800';
        case 'Réservé': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const formatPrice = (price) => {
    if (price === undefined || price === null) return 'N/A';
    return `${Number(price).toLocaleString('fr-FR')} fdj`;
};

// Fonction pour gérer l'affichage des photos des parcelles
const getParcelleImage = (parcelle, apiBaseUrl) => {
    // Option 1: Si vous utilisez l'accessor photo_urls du modèle
    if (parcelle.photo_urls && parcelle.photo_urls.length > 0) {
        return parcelle.photo_urls[0];
    }

    // Option 2: Si vous recevez directement les photos
    if (parcelle.photos && Array.isArray(parcelle.photos) && parcelle.photos.length > 0) {
        // Construire l'URL complète
        return `${apiBaseUrl.replace('/api', '')}/storage/${parcelle.photos[0]}`;
    }

    return null;
};

// Fonction pour gérer l'affichage des photos des locations
const getLocationImage = (location, apiBaseUrl) => {
    // Option 1: Si vous utilisez l'accessor photo_urls du modèle
    if (location.photo_urls && location.photo_urls.length > 0) {
        return location.photo_urls[0];
    }

    // Option 2: Si vous recevez directement les photos
    if (location.photos && Array.isArray(location.photos) && location.photos.length > 0) {
        // Construire l'URL complète
        return `${apiBaseUrl.replace('/api', '')}/storage/${location.photos[0]}`;
    }

    return null;
};

// --- Composant Principal Admin ---
export default function Admin() {
    const { user, logout, token, updateUser } = useAuth();
    const API_BASE_URL = API_URL;

    // --- États du composant ---
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [dashboardStats, setDashboardStats] = useState([]);
    const [parcelles, setParcelles] = useState([]);
    const [locations, setLocations] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [parcelleFilterOptions, setParcelleFilterOptions] = useState({ types: [], statuses: [] });

    const [parcellePagination, setParcellePagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });

    const [locationPagination, setLocationPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });

    const [userPagination, setUserPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });

    // --- États des Modales de Parcelle ---
    const [isParcelleModalOpen, setIsParcelleModalOpen] = useState(false);
    const [showParcelleDetail, setShowParcelleDetail] = useState(false);
    const [parcelleModalMode, setParcelleModalMode] = useState('create');
    const [selectedParcelle, setSelectedParcelle] = useState(null);
    const [parcelleFormData, setParcelleFormData] = useState({});
    const [parcelleFormSubmitting, setParcelleFormSubmitting] = useState(false);
    const [parcelleFormErrors, setParcelleFormErrors] = useState({});

    // --- États des Modales de Location ---
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [showLocationDetail, setShowLocationDetail] = useState(false);
    const [locationModalMode, setLocationModalMode] = useState('create');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationFormData, setLocationFormData] = useState({});
    const [locationFormSubmitting, setLocationFormSubmitting] = useState(false);
    const [locationFormErrors, setLocationFormErrors] = useState({});

    // --- États des Modales d'Utilisateur ---
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [showUserDetail, setShowUserDetail] = useState(false);
    const [userModalMode, setUserModalMode] = useState('create');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userFormData, setUserFormData] = useState({});
    const [userFormSubmitting, setUserFormSubmitting] = useState(false);
    const [userFormErrors, setUserFormErrors] = useState({});

    // --- États pour le Profil Utilisateur ---
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [showProfileDetail, setShowProfileDetail] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [profileFormData, setProfileFormData] = useState({});
    const [profileFormSubmitting, setProfileFormSubmitting] = useState(false);
    const [profileFormErrors, setProfileFormErrors] = useState({});

    // --- États pour le Modal de Confirmation ---
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmModalData, setConfirmModalData] = useState({
        title: '',
        message: '',
        onConfirm: null,
        type: 'danger'
    });

    // --- États pour le Toast ---
    const [toast, setToast] = useState({
        isVisible: false,
        message: '',
        type: 'success'
    });

    // --- Fonction pour récupérer l'utilisateur connecté ---
    const fetchCurrentUser = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setCurrentUser(data.data);
            }
        } catch (err) {
            console.error('fetchCurrentUser error:', err);
        }
    }, [token]);

    // --- Fonctions de Récupération des Données ---

    const fetchParcelles = useCallback(async (page = 1) => {
        console.log('[Admin] fetchParcelles called with page:', page);
        try {
            const url = `${API_BASE_URL}/parcelles?page=${page}`;
            console.log('[Admin] Fetching parcelles from:', url);

            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            console.log('[Admin] Parcelles response:', response.data);

            const data = response.data.data || response.data;
            const meta = response.data.meta || {};

            console.log('[Admin] Parcelles data:', data);
            console.log('[Admin] Parcelles meta:', meta);

            setParcelles(data);
            setParcellePagination({
                current_page: meta.current_page || 1,
                last_page: meta.last_page || 1,
                per_page: meta.per_page || 10,
                total: meta.total || data.length,
            });

        } catch (err) {
            console.error("[Admin] Erreur de chargement des parcelles:", err);
            setError("Impossible de charger la liste des parcelles.");
        }
    }, [API_BASE_URL, token]);

    const fetchParcelleFilterOptions = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/parcelles/filter/options`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.data.success) {
                setParcelleFilterOptions(response.data.data);
            }
        } catch (err) {
            console.error("Erreur de chargement des options de filtres parcelles:", err);
        }
    }, [API_BASE_URL, token]);

    const fetchDashboardStats = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/dashboard`, {
                 headers: { 'Authorization': `Bearer ${token}` }
            });

            const apiStats = response.data.stats;
            const userRole = user?.role || 'admin';

            // Toutes les statistiques disponibles
            const allStats = [
                { name: 'Parcelles', value: apiStats.total_parcelles?.toLocaleString() || '0', icon: Home, color: 'green' },
                { name: 'Locations', value: apiStats.total_locations?.toLocaleString() || '0', icon: Building, color: 'purple' },
                { name: 'Utilisateurs', value: apiStats.total_utilisateurs?.toLocaleString() || '0', icon: Users, color: 'orange' },
            ];

            // Filtrer les statistiques selon le rôle
            let formattedStats = [];

            if (userRole === 'admin') {
                // Admin voit toutes les statistiques
                formattedStats = allStats;
            } else if (userRole === 'location') {
                // Utilisateur location voit les statistiques des parcelles et locations
                formattedStats = allStats.filter(stat =>
                    stat.name === 'Parcelles' || stat.name === 'Locations'
                );
            } else {
                // Par défaut, afficher toutes les statistiques
                formattedStats = allStats;
            }

            setDashboardStats(formattedStats);
        } catch (err) {
            console.error("Erreur de chargement des stats:", err);
            setError("Impossible de charger les statistiques.");
        }
    }, [API_BASE_URL, token, user?.role]);

    const fetchLocations = useCallback(async (page = 1) => {
        console.log('[Admin] fetchLocations called with page:', page);
        try {
            const url = `${API_BASE_URL}/locations?page=${page}`;
            console.log('[Admin] Fetching locations from:', url);

            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            console.log('[Admin] Locations response:', response.data);

            // Gérer les deux formats de réponse possibles
            let data, meta;
            if (response.data.data !== undefined && response.data.meta !== undefined) {
                // Format avec data et meta
                data = response.data.data;
                meta = response.data.meta;
            } else if (Array.isArray(response.data.data)) {
                // Format Laravel paginate direct
                data = response.data.data;
                meta = {
                    current_page: response.data.current_page || 1,
                    last_page: response.data.last_page || 1,
                    per_page: response.data.per_page || 10,
                    total: response.data.total || data.length,
                };
            } else {
                // Fallback
                data = response.data.data || response.data;
                meta = response.data.meta || {};
            }

            console.log('[Admin] Locations data:', data);
            console.log('[Admin] Locations meta:', meta);

            setLocations(data);
            setLocationPagination({
                current_page: meta.current_page || 1,
                last_page: meta.last_page || 1,
                per_page: meta.per_page || 10,
                total: meta.total || data.length,
            });

        } catch (err) {
            console.error("[Admin] Erreur de chargement des locations:", err);
            setError("Impossible de charger la liste des locations.");
        }
    }, [API_BASE_URL, token]);

    const fetchUsers = useCallback(async (page = 1) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/users?page=${page}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = response.data.data || response.data;
            const meta = response.data.meta || {};

            setUsers(data);
            setUserPagination({
                current_page: meta.current_page || 1,
                last_page: meta.last_page || 1,
                per_page: meta.per_page || 10,
                total: meta.total || data.length,
            });

        } catch (err) {
            console.error("Erreur de chargement des utilisateurs:", err);
            setError("Impossible de charger la liste des utilisateurs.");
        }
    }, [API_BASE_URL, token]);



    // (logique véhicules supprimée)



// --- Fonction de suppression des parcelles ---
const deleteParcelle = async (parcelleId) => {
    if (!canModifyParcelles()) {
        showToast('Vous n\'avez pas la permission de supprimer les parcelles.', 'error');
        return;
    }

    openConfirmModal(
        'Supprimer la parcelle',
        'Êtes-vous sûr de vouloir supprimer cette parcelle ? Cette action est irréversible.',
        async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/parcelles/${parcelleId}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la suppression');
                }

                showToast('Parcelle supprimée avec succès !', 'success');
                fetchParcelles(parcellePagination.current_page);

            } catch (err) {
                showToast('Erreur lors de la suppression de la parcelle', 'error');
                console.error('deleteParcelle error:', err);
            }
        },
        'danger'
    );
};

// --- Fonction de suppression des locations ---
const deleteLocation = async (locationId) => {
    if (!canModifyLocations()) {
        showToast('Vous n\'avez pas la permission de supprimer les locations.', 'error');
        return;
    }

    openConfirmModal(
        'Supprimer la location',
        'Êtes-vous sûr de vouloir supprimer cette location ? Cette action est irréversible.',
        async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/locations/${locationId}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la suppression');
                }

                showToast('Location supprimée avec succès !', 'success');
                fetchLocations(locationPagination.current_page);

            } catch (err) {
                showToast('Erreur lors de la suppression de la location', 'error');
                console.error('deleteLocation error:', err);
            }
        },
        'danger'
    );
    };

// --- Fonctions de Gestion des Parcelles ---
const closeParcelleModal = () => {
    setIsParcelleModalOpen(false);
    setSelectedParcelle(null);
    setParcelleFormErrors({});
    fetchParcelles(parcellePagination.current_page);
};

const closeParcelleDetailModal = () => {
    setShowParcelleDetail(false);
    setSelectedParcelle(null);
};

const openCreateParcelleModal = () => {
    setParcelleModalMode('create');
    setSelectedParcelle({});
    setParcelleFormData({
        title: '', location: '', price: '', type: '', surface: '', rooms: '',
        bedrooms: '', bathrooms: '', description: '', is_featured: false,
        contact_number: '', status: 'active',
    });
    setParcelleFormErrors({});
    setIsParcelleModalOpen(true);
};

const openEditParcelleModal = (parcelle) => {
    setParcelleModalMode('edit');
    setSelectedParcelle(parcelle);
    setParcelleFormData({
        id: parcelle.id,
        title: parcelle.title ?? '',
        location: parcelle.location ?? '',
        price: parcelle.price ?? '',
        type: parcelle.type ?? '',
        surface: parcelle.surface ?? '',
        rooms: parcelle.rooms ?? '',
        bedrooms: parcelle.bedrooms ?? '',
        bathrooms: parcelle.bathrooms ?? '',
        description: parcelle.description ?? '',
        is_featured: !!parcelle.is_featured,
        contact_number: parcelle.contact_number ?? '',
        status: parcelle.status ?? 'active',
    });
    setParcelleFormErrors({});
    setIsParcelleModalOpen(true);
};

const openParcelleDetailModal = (parcelle) => {
    setSelectedParcelle(parcelle);
    setShowParcelleDetail(true);
};

const submitParcelle = async (e) => {
    e.preventDefault();

    if (!token) {
        setParcelleFormErrors({ general: ['Vous devez être connecté pour effectuer cette action.'] });
        return;
    }

    if (!canModifyParcelles()) {
        setParcelleFormErrors({ general: ['Vous n\'avez pas la permission de modifier les parcelles.'] });
        return;
    }

    setParcelleFormSubmitting(true);
    setParcelleFormErrors({});

    try {
        const body = new FormData();

        Object.entries(parcelleFormData).forEach(([key, val]) => {
            if (key === 'is_featured') {
                body.append(key, val ? '1' : '0');
            } else if (val !== undefined && val !== null) {
                body.append(key, String(val));
            }
        });

        if (parcelleFormData.photos && parcelleFormData.photos.length > 0) {
            for (let i = 0; i < parcelleFormData.photos.length; i++) {
                body.append('photos[]', parcelleFormData.photos[i]);
            }
        }

        let url = `${API_BASE_URL}/parcelles`;
        let method = 'POST';

        if (parcelleModalMode === 'edit') {
            body.append('_method', 'PUT');
            url = `${API_BASE_URL}/parcelles/${parcelleFormData.id}`;
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body,
        });
        const data = await response.json();

        if (!response.ok || data.success === false) {
            setParcelleFormErrors(data.errors || { general: [data.message || 'Erreur inconnue lors de la soumission.'] });
            return;
        }

        // alert(`Parcelle ${parcelleModalMode === 'create' ? 'ajoutée' : 'modifiée'} avec succès !`);
        closeParcelleModal();

    } catch (err) {
        setParcelleFormErrors({ general: ['Erreur de connexion au serveur.'] });
        console.error('submitParcelle error:', err);
    } finally {
        setParcelleFormSubmitting(false);
    }
};

// --- Fonctions de Gestion des Locations ---
const closeLocationModal = () => {
    setIsLocationModalOpen(false);
    setSelectedLocation(null);
    setLocationFormErrors({});
    fetchLocations(locationPagination.current_page);
};

const closeLocationDetailModal = () => {
    setShowLocationDetail(false);
    setSelectedLocation(null);
};

const openCreateLocationModal = () => {
    setLocationModalMode('create');
    setSelectedLocation({});
    setLocationFormData({
        title: '', location: '', price: '', type: '', surface: '', rooms: '',
        bedrooms: '', bathrooms: '', description: '', is_featured: false,
        contact_number: '', status: 'active',
    });
    setLocationFormErrors({});
    setIsLocationModalOpen(true);
};

const openEditLocationModal = (location) => {
    setLocationModalMode('edit');
    setSelectedLocation(location);
    setLocationFormData({
        id: location.id,
        title: location.title ?? '',
        location: location.location ?? '',
        price: location.price ?? '',
        type: location.type ?? '',
        surface: location.surface ?? '',
        rooms: location.rooms ?? '',
        bedrooms: location.bedrooms ?? '',
        bathrooms: location.bathrooms ?? '',
        description: location.description ?? '',
        is_featured: !!location.is_featured,
        contact_number: location.contact_number ?? '',
        status: location.status ?? 'active',
    });
    setLocationFormErrors({});
    setIsLocationModalOpen(true);
};

const openLocationDetailModal = (location) => {
    setSelectedLocation(location);
    setShowLocationDetail(true);
};

const submitLocation = async (e) => {
    e.preventDefault();

    if (!token) {
        setLocationFormErrors({ general: ['Vous devez être connecté pour effectuer cette action.'] });
        return;
    }

    if (!canModifyLocations()) {
        setLocationFormErrors({ general: ['Vous n\'avez pas la permission de modifier les locations.'] });
        return;
    }

    setLocationFormSubmitting(true);
    setLocationFormErrors({});

    try {
        const body = new FormData();

        Object.entries(locationFormData).forEach(([key, val]) => {
            if (key === 'is_featured') {
                body.append(key, val ? '1' : '0');
            } else if (val !== undefined && val !== null) {
                body.append(key, String(val));
            }
        });

        if (locationFormData.photos && locationFormData.photos.length > 0) {
            for (let i = 0; i < locationFormData.photos.length; i++) {
                body.append('photos[]', locationFormData.photos[i]);
            }
        }

        let url = `${API_BASE_URL}/locations`;
        let method = 'POST';

        if (locationModalMode === 'edit') {
            body.append('_method', 'PUT');
            url = `${API_BASE_URL}/locations/${locationFormData.id}`;
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body,
        });
        const data = await response.json();

        if (!response.ok || data.success === false) {
            setLocationFormErrors(data.errors || { general: [data.message || 'Erreur inconnue lors de la soumission.'] });
            return;
        }

        // alert(`Location ${locationModalMode === 'create' ? 'ajoutée' : 'modifiée'} avec succès !`);
        closeLocationModal();

    } catch (err) {
        setLocationFormErrors({ general: ['Erreur de connexion au serveur.'] });
        console.error('submitLocation error:', err);
    } finally {
        setLocationFormSubmitting(false);
    }
};

// Fonction pour gérer les changements dans le formulaire des locations
const handleLocationChange = (e) => {
    const { name, type, value, checked, files } = e.target;

    if (type === 'file' && name === 'images') {
        setLocationFormData(prev => ({ ...prev, photos: files }));
        return;
    }

    setLocationFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
    }));
};

// --- Fonctions de Gestion des Utilisateurs ---
const closeUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(null);
    setUserFormErrors({});
    fetchUsers(userPagination.current_page);
};

const closeUserDetailModal = () => {
    setShowUserDetail(false);
    setSelectedUser(null);
};

const openCreateUserModal = () => {
    setUserModalMode('create');
    setSelectedUser({});
    setUserFormData({
        name: '', email: '', password: '', password_confirmation: '',role:'admin', status: 'active'
    });
    setUserFormErrors({});
    setIsUserModalOpen(true);
};

const openEditUserModal = (user) => {
    setUserModalMode('edit');
    setSelectedUser(user);
    setUserFormData({
        id: user.id,
        name: user.name ?? '',
        email: user.email ?? '',
        password: '',
        password_confirmation: '',
        role: user.role ?? 'admin',
        status: user.status ?? 'active'
    });
    setUserFormErrors({});
    setIsUserModalOpen(true);
};

const openUserDetailModal = (user) => {
    setSelectedUser(user);
    setShowUserDetail(true);
};

const submitUser = async (e) => {
    e.preventDefault();

    if (!token) {
        setUserFormErrors({ general: ['Vous devez être connecté pour effectuer cette action.'] });
        return;
    }

    setUserFormSubmitting(true);
    setUserFormErrors({});

    try {
        const body = new FormData();

        Object.entries(userFormData).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                body.append(key, String(val));
            }
        });

        let url = `${API_BASE_URL}/users`;
        let method = 'POST';

        if (userModalMode === 'edit') {
            body.append('_method', 'PUT');
            url = `${API_BASE_URL}/users/${userFormData.id}`;
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body,
        });
        const data = await response.json();

        if (!response.ok || data.success === false) {
            setUserFormErrors(data.errors || { general: [data.message || 'Erreur inconnue lors de la soumission.'] });
            return;
        }

        // alert(`Utilisateur ${userModalMode === 'create' ? 'ajouté' : 'modifié'} avec succès !`);
        closeUserModal();

    } catch (err) {
        setUserFormErrors({ general: ['Erreur de connexion au serveur.'] });
        console.error('submitUser error:', err);
    } finally {
        setUserFormSubmitting(false);
    }
};

const deleteUser = async (userId) => {
    openConfirmModal(
        'Supprimer l\'utilisateur',
        'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.',
        async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la suppression');
                }

                showToast('Utilisateur supprimé avec succès !', 'success');
                fetchUsers(userPagination.current_page);

            } catch (err) {
                showToast('Erreur lors de la suppression de l\'utilisateur', 'error');
                console.error('deleteUser error:', err);
            }
        },
        'danger'
    );
};

// Fonction pour gérer les changements dans le formulaire des utilisateurs
const handleUserChange = (e) => {
    const { name, type, value, checked } = e.target;

    setUserFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
    }));
};

// --- Fonction pour ouvrir le Modal de Confirmation ---
const openConfirmModal = (title, message, onConfirm, type = 'danger') => {
    setConfirmModalData({
        title,
        message,
        onConfirm: () => {
            onConfirm();
            setShowConfirmModal(false);
        },
        type
    });
    setShowConfirmModal(true);
};

const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmModalData({
        title: '',
        message: '',
        onConfirm: null,
        type: 'danger'
    });
};

// --- Fonction pour afficher le Toast ---
const showToast = (message, type = 'success') => {
    setToast({
        isVisible: true,
        message,
        type
    });
};

const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
};

// --- Fonctions de Gestion du Profil ---
const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setProfileFormErrors({});
    fetchCurrentUser();
};

const closeProfileDetailModal = () => {
    setShowProfileDetail(false);
};

const openProfileModal = () => {
    if (currentUser) {
        setProfileFormData({
            name: currentUser.name || '',
            email: currentUser.email || '',
            current_password: '',
            password: '',
            password_confirmation: ''
        });
        setProfileFormErrors({});
        setIsProfileModalOpen(true);
    }
};

const openProfileDetailModal = () => {
    setShowProfileDetail(true);
};

const submitProfile = async (e) => {
    e.preventDefault();

    if (!token) {
        setProfileFormErrors({ general: ['Vous devez être connecté pour effectuer cette action.'] });
        return;
    }

    setProfileFormSubmitting(true);
    setProfileFormErrors({});

    try {
        // Préparer les données JSON (pas besoin de FormData pour le profil)
        const requestData = {};

        // Ajouter les champs requis
        if (profileFormData.name !== undefined && profileFormData.name !== null && profileFormData.name !== '') {
            requestData.name = profileFormData.name;
        }

        if (profileFormData.email !== undefined && profileFormData.email !== null && profileFormData.email !== '') {
            requestData.email = profileFormData.email;
        }

        // Ajouter les mots de passe seulement s'ils sont remplis
        if (profileFormData.current_password !== undefined && profileFormData.current_password !== null && profileFormData.current_password !== '') {
            requestData.current_password = profileFormData.current_password;
        }

        if (profileFormData.password !== undefined && profileFormData.password !== null && profileFormData.password !== '') {
            requestData.password = profileFormData.password;
        }

        if (profileFormData.password_confirmation !== undefined && profileFormData.password_confirmation !== null && profileFormData.password_confirmation !== '') {
            requestData.password_confirmation = profileFormData.password_confirmation;
        }

        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(requestData),
        });

        const data = await response.json();

        if (!response.ok || data.success === false) {
            setProfileFormErrors(data.errors || { general: [data.message || 'Erreur inconnue lors de la soumission.'] });
            setProfileFormSubmitting(false);
            return;
        }

        // Mettre à jour l'utilisateur dans le contexte et le state local
        if (data.data) {
            setCurrentUser(data.data);
            // Mettre à jour le contexte d'authentification pour que l'utilisateur soit mis à jour partout
            if (updateUser) {
                updateUser(data.data);
            }
        }

        showToast('Profil modifié avec succès !', 'success');
        closeProfileModal();

    } catch (err) {
        setProfileFormErrors({ general: ['Erreur de connexion au serveur.'] });
        console.error('submitProfile error:', err);
    } finally {
        setProfileFormSubmitting(false);
    }
};

const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData((prev) => ({
        ...prev,
        [name]: value,
    }));
};


// Fonction pour gérer les changements dans le formulaire des parcelles
const handleParcelleChange = (e) => {
    const { name, type, value, checked, files } = e.target;

    if (type === 'file' && name === 'images') {
        setParcelleFormData(prev => ({ ...prev, photos: files }));
        return;
    }

    setParcelleFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
    }));
};


    // --- Fonction pour vérifier si un onglet est accessible ---
    const canAccessTab = useCallback((tabId) => {
        const userRole = user?.role || 'admin';

        if (userRole === 'admin') return true;

        if (userRole === 'location') {
            return ['dashboard', 'locations', 'parcelles'].includes(tabId);
        }

        return false;
    }, [user?.role]);

    // --- Fonctions pour vérifier les permissions de modification ---

    const canModifyParcelles = useCallback(() => {
        const userRole = user?.role || 'admin';
        return userRole === 'admin' || userRole === 'location';
    }, [user?.role]);

    const canModifyLocations = useCallback(() => {
        const userRole = user?.role || 'admin';
        return userRole === 'admin' || userRole === 'location';
    }, [user?.role]);

    // Vérifier si une parcelle peut être modifiée par l'utilisateur actuel
    const canModifyThisParcelle = useCallback((parcelle) => {
        const userRole = user?.role || 'admin';
        // L'admin peut modifier toutes les parcelles
        if (userRole === 'admin') {
            return true;
        }
        // Le locationadmin ne peut modifier que ses propres parcelles
        if (userRole === 'location') {
            return parcelle?.user_id === user?.id;
        }
        return false;
    }, [user?.role, user?.id]);

    // Vérifier si une location peut être modifiée par l'utilisateur actuel
    const canModifyThisLocation = useCallback((location) => {
        const userRole = user?.role || 'admin';
        // L'admin peut modifier toutes les locations
        if (userRole === 'admin') {
            return true;
        }
        // Le locationadmin ne peut modifier que ses propres locations
        if (userRole === 'location') {
            return location?.user_id === user?.id;
        }
        return false;
    }, [user?.role, user?.id]);

    // --- Fonction pour déterminer les onglets disponibles selon le rôle ---
    const getAvailableTabs = useCallback(() => {
        const userRole = user?.role || 'admin';
        const allTabs = [
            { id: 'dashboard', name: 'Tableau de bord', icon: BarChart3 },
            { id: 'parcelles', name: 'Parcelles', icon: Home },
            { id: 'locations', name: 'Locations', icon: Building },
            { id: 'users', name: 'Utilisateurs', icon: Users },
        ];

        if (userRole === 'admin') {
            return allTabs;
        } else if (userRole === 'location') {
            return [
                { id: 'dashboard', name: 'Tableau de bord', icon: BarChart3 },
                { id: 'locations', name: 'Locations', icon: Building },
                { id: 'parcelles', name: 'Parcelles', icon: Home }
            ];
        }

        // Par défaut, retourner tous les onglets
        return allTabs;
    }, [user?.role]);

    // --- Effet pour rediriger si l'onglet actif n'est pas accessible ---
    useEffect(() => {
        if (user && !canAccessTab(activeTab)) {
            const availableTabs = getAvailableTabs();
            if (availableTabs.length > 0) {
                setActiveTab(availableTabs[0].id);
            }
        }
    }, [user, activeTab, canAccessTab, getAvailableTabs]);

    // --- Effet de Chargement Initial ---
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            await fetchCurrentUser();

            const userRole = user?.role || 'admin';

            if (userRole === 'admin' || userRole === 'location') {
                await fetchParcelleFilterOptions();
            }

            if (activeTab === 'dashboard') {
                await fetchDashboardStats();
            } else if (activeTab === 'parcelles' && canAccessTab('parcelles')) {
                await fetchParcelles(parcellePagination.current_page);
            } else if (activeTab === 'locations' && canAccessTab('locations')) {
                await fetchLocations(locationPagination.current_page);
            } else if (activeTab === 'users' && canAccessTab('users')) {
                await fetchUsers(userPagination.current_page);
            }

            setIsLoading(false);
        };

        loadData();
    }, [activeTab, fetchCurrentUser, fetchDashboardStats, fetchParcelles, fetchParcelleFilterOptions, fetchLocations, fetchUsers, parcellePagination.current_page, locationPagination.current_page, userPagination.current_page, user, canAccessTab, getAvailableTabs, canModifyParcelles, canModifyLocations]);


    const handleParcellesPageChange = useCallback((page) => {
        if (fetchParcelles && typeof fetchParcelles === 'function') {
            fetchParcelles(page);
        } else {
            console.error('[Admin] fetchParcelles is not a function');
        }
    }, [fetchParcelles]);

    const handleLocationsPageChange = useCallback((page) => {
        if (fetchLocations && typeof fetchLocations === 'function') {
            fetchLocations(page);
        } else {
            console.error('[Admin] fetchLocations is not a function');
        }
    }, [fetchLocations]);

    const handleUsersPageChange = useCallback((page) => {
        if (fetchUsers && typeof fetchUsers === 'function') {
            fetchUsers(page);
        } else {
            console.error('[Admin] fetchUsers is not a function');
        }
    }, [fetchUsers]);

    const tabs = getAvailableTabs();
    const activeTabMeta = tabs.find(t => t.id === activeTab);

    if (isLoading && (activeTab === 'dashboard' || activeTab === 'parcelles' || activeTab === 'locations' || activeTab === 'users')) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600 mr-3" />
                <p className="text-lg text-gray-700">Chargement des données...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Overlay mobile */}
            {isSidebarOpen && (
                <button
                    type="button"
                    aria-label="Fermer le menu"
                    className="fixed inset-0 bg-black/40 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transform transition-transform duration-200 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0`}
            >
                <div className="h-full flex flex-col">
                    <div className="px-5 py-5 border-b border-slate-200 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">DjibImmo</p>
                            <p className="text-lg font-bold text-slate-900">Administration</p>
                        </div>
                        <button
                            type="button"
                            className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-700"
                            onClick={() => setIsSidebarOpen(false)}
                            aria-label="Fermer"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold">
                                {(currentUser?.name || user?.name || 'A').slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{currentUser?.name || user?.name || 'Administrateur'}</p>
                                <p className="text-xs text-slate-500 truncate">{currentUser?.email || user?.email || ''}</p>
                            </div>
                        </div>
                    </div>

                    <nav className="px-3 py-2 flex-1 overflow-y-auto">
                        {tabs.map((tab) => {
                            const IconComponent = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                                        isActive
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    <IconComponent className="h-5 w-5" />
                                    <span className="truncate">{tab.name}</span>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="px-3 py-3 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition"
                        >
                            <LogOut className="h-4 w-4" />
                            Déconnexion
                        </button>
                    </div>
                </div>
            </aside>

            {/* Contenu */}
            <div className="flex-1 min-w-0 flex flex-col">
                <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
                    <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                type="button"
                                className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-700"
                                onClick={() => setIsSidebarOpen(true)}
                                aria-label="Ouvrir le menu"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                                    {activeTabMeta?.name || 'Administration'}
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 truncate">
                                    Bienvenue, {currentUser?.name || user?.name || 'Administrateur'}.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {currentUser && (
                                <button
                                    onClick={openProfileDetailModal}
                                    className="hidden sm:inline-flex items-center px-3 py-2 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition"
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    {currentUser.name}
                                </button>
                            )}
                            <button
                                onClick={logout}
                                className="hidden md:inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                            <strong>Erreur :</strong> {error}
                        </div>
                    )}

                    {/* Tab Content: Dashboard */}
                    {activeTab === 'dashboard' && canAccessTab('dashboard') && (
                        <div className={`grid grid-cols-1 gap-6 mb-8 ${
                            dashboardStats.length === 1 ? 'md:grid-cols-1' :
                            dashboardStats.length === 2 ? 'md:grid-cols-2' :
                            dashboardStats.length === 3 ? 'md:grid-cols-3' :
                            'md:grid-cols-4'
                        }`}>
                            {dashboardStats.map((stat) => (
                                <StatCard
                                    key={stat.name}
                                    icon={stat.icon}
                                    title={stat.name}
                                    value={stat.value}
                                    color={stat.color}
                                />
                            ))}
                        </div>
                    )}

                    {/* Tab Content: Parcelles */}
                    {activeTab === 'parcelles' && canAccessTab('parcelles') && (
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Gestion des parcelles ({parcellePagination.total})</h2>
                                {canModifyParcelles() && (
                                    <button
                                        onClick={openCreateParcelleModal}
                                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Ajouter une parcelle
                                    </button>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parcelle</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {parcelles.length > 0 ? parcelles.map(parcelle => {
                                            const parcelleImage = getParcelleImage(parcelle, API_BASE_URL);
                                            return (
                                            <tr key={parcelle.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="relative w-16 h-12 overflow-hidden rounded-lg">
                                                        {parcelleImage ? (
                                                            <img
                                                                src={parcelleImage}
                                                                alt={parcelle.title || 'Parcelle'}
                                                                className="w-full h-full object-cover object-center"
                                                                onError={(e) => {
                                                                    // Fallback si l'image ne charge pas
                                                                    e.target.style.display = 'none';
                                                                    const fallbackDiv = e.target.nextElementSibling;
                                                                    if (fallbackDiv) {
                                                                        fallbackDiv.style.display = 'flex';
                                                                    }
                                                                }}
                                                            />
                                                        ) : null}
                                                        {/* Fallback pour image manquante ou erreur */}
                                                        <div
                                                            className={`absolute inset-0 bg-gray-200 flex items-center justify-center ${parcelleImage ? 'hidden' : 'flex'}`}
                                                        >
                                                            <Home className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{parcelle.title || 'N/A'}</div>
                                                    <div className="text-sm text-gray-500">{parcelle.location || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                        {parcelle.type ? parcelle.type.charAt(0).toUpperCase() + parcelle.type.slice(1) : 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(parcelle.price)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(parcelle.status)}`}>
                                                        {parcelle.status === 'active' ? 'Disponible' : parcelle.status === 'inactive' ? 'InDisponible' : parcelle.status || 'Inconnu'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => openParcelleDetailModal(parcelle)} className="text-blue-600 hover:text-blue-900"><Eye className="h-4 w-4" /></button>
                                                        {canModifyThisParcelle(parcelle) && (
                                                            <>
                                                                <button onClick={() => openEditParcelleModal(parcelle)} className="text-yellow-600 hover:text-yellow-900"><Edit className="h-4 w-4" /></button>
                                                                <button onClick={() => deleteParcelle(parcelle.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Aucune parcelle trouvée.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {parcelles.length > 0 && (
                                <div className="p-4" style={{ position: 'relative', zIndex: 1000, pointerEvents: 'auto' }}>
                                    <Pagination pagination={parcellePagination} onPageChange={handleParcellesPageChange} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab Content: Locations */}
                    {activeTab === 'locations' && canAccessTab('locations') && (
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Gestion des locations ({locationPagination.total})</h2>
                                {canModifyLocations() && (
                                    <button
                                        onClick={openCreateLocationModal}
                                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Ajouter une location
                                    </button>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {locations.length > 0 ? locations.map(location => {
                                            const locationImage = getLocationImage(location, API_BASE_URL);
                                            return (
                                            <tr key={location.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="relative w-16 h-12 overflow-hidden rounded-lg">
                                                        {locationImage ? (
                                                            <img
                                                                src={locationImage}
                                                                alt={location.title || 'Location'}
                                                                className="w-full h-full object-cover object-center"
                                                                onError={(e) => {
                                                                    // Fallback si l'image ne charge pas
                                                                    e.target.style.display = 'none';
                                                                    const fallbackDiv = e.target.nextElementSibling;
                                                                    if (fallbackDiv) {
                                                                        fallbackDiv.style.display = 'flex';
                                                                    }
                                                                }}
                                                            />
                                                        ) : null}
                                                        {/* Fallback pour image manquante ou erreur */}
                                                        <div
                                                            className={`absolute inset-0 bg-gray-200 flex items-center justify-center ${locationImage ? 'hidden' : 'flex'}`}
                                                        >
                                                            <Building className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{location.title || 'N/A'}</div>
                                                    <div className="text-sm text-gray-500">{location.location || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                        {location.type ? location.type.charAt(0).toUpperCase() + location.type.slice(1) : 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(location.price)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(location.status)}`}>
                                                        {location.status === 'active' ? 'Disponible' : location.status === 'inactive' ? 'InDisponible' : location.status || 'Inconnu'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => openLocationDetailModal(location)} className="text-blue-600 hover:text-blue-900"><Eye className="h-4 w-4" /></button>
                                                        {canModifyThisLocation(location) && (
                                                            <>
                                                                <button onClick={() => openEditLocationModal(location)} className="text-yellow-600 hover:text-yellow-900"><Edit className="h-4 w-4" /></button>
                                                                <button onClick={() => deleteLocation(location.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Aucune location trouvée.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {locations.length > 0 && (
                                <div className="p-4" style={{ position: 'relative', zIndex: 1000, pointerEvents: 'auto' }}>
                                    <Pagination pagination={locationPagination} onPageChange={handleLocationsPageChange} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab Content: Users */}
                    {activeTab === 'users' && canAccessTab('users') && (
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Gestion des utilisateurs ({userPagination.total})</h2>
                                <button
                                    onClick={openCreateUserModal}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    Ajouter un utilisateur
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de creation</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.length > 0 ? users.map(user => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {user.status === 'active' ? 'Active' :
                                                         user.status === 'inactive' ? 'InActive' :
                                                         user.status === 'suspended' ? 'Suspendu' : user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => openUserDetailModal(user)} className="text-blue-600 hover:text-blue-900"><Eye className="h-4 w-4" /></button>
                                                        <button onClick={() => openEditUserModal(user)} className="text-yellow-600 hover:text-yellow-900"><Edit className="h-4 w-4" /></button>
                                                        <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Aucun utilisateur trouvé.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {users.length > 0 && (
                                <div className="p-4" style={{ position: 'relative', zIndex: 1000, pointerEvents: 'auto' }}>
                                    <Pagination pagination={userPagination} onPageChange={handleUsersPageChange} />
                                </div>
                            )}
                        </div>
                    )}
                </main>

            {/* Modales des Parcelles */}
            {isParcelleModalOpen && (
                <ParcelleModal
                    modalMode={parcelleModalMode}
                    formData={parcelleFormData}
                    formErrors={parcelleFormErrors}
                    formSubmitting={parcelleFormSubmitting}
                    filterOptions={parcelleFilterOptions}
                    closeModal={closeParcelleModal}
                    handleChange={handleParcelleChange}
                    submitParcelle={submitParcelle}
                />
            )}

            {showParcelleDetail && selectedParcelle && (
                <ParcelleDetailModal
                    parcelle={selectedParcelle}
                    onClose={closeParcelleDetailModal}
                    formatPrice={formatPrice}
                />
            )}

            {/* Modales des Locations */}
            {isLocationModalOpen && (
                <LocationModal
                    modalMode={locationModalMode}
                    formData={locationFormData}
                    formErrors={locationFormErrors}
                    formSubmitting={locationFormSubmitting}
                    closeModal={closeLocationModal}
                    filterOptions={parcelleFilterOptions} // ✅ AJOUTÉ
                    handleChange={handleLocationChange}
                    submitLocation={submitLocation}
                />
            )}

            {showLocationDetail && selectedLocation && (
                <LocationDetailModal
                    location={selectedLocation}
                    onClose={closeLocationDetailModal}
                    API_URL={API_BASE_URL}
                />
            )}

            {/* Modales des Utilisateurs */}
            {isUserModalOpen && (
                <UserModal
                    modalMode={userModalMode}
                    formData={userFormData}
                    formErrors={userFormErrors}
                    formSubmitting={userFormSubmitting}
                    closeModal={closeUserModal}
                    handleChange={handleUserChange}
                    submitUser={submitUser}
                />
            )}

            {showUserDetail && selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={closeUserDetailModal}
                    onEdit={() => openEditUserModal(selectedUser)}
                />
            )}

            {/* Modal de Confirmation */}
            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={closeConfirmModal}
                onConfirm={confirmModalData.onConfirm}
                title={confirmModalData.title}
                message={confirmModalData.message}
                type={confirmModalData.type}
            />

            {/* Toast de Notification */}
            <Toast
                isVisible={toast.isVisible}
                onClose={closeToast}
                message={toast.message}
                type={toast.type}
            />

            {/* Modales du Profil */}
            {isProfileModalOpen && (
                <ProfileModal
                    isOpen={isProfileModalOpen}
                    onClose={closeProfileModal}
                    user={currentUser}
                    formData={profileFormData}
                    formErrors={profileFormErrors}
                    formSubmitting={profileFormSubmitting}
                    handleChange={handleProfileChange}
                    submitProfile={submitProfile}
                />
            )}

            {showProfileDetail && currentUser && (
                <ProfileDetailModal
                    user={currentUser}
                    onClose={closeProfileDetailModal}
                    onEdit={openProfileModal}
                />
            )}
            </div>
          </div> 
    );
}

