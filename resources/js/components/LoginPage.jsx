import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirection si déjà connecté
    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/admin/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                setSuccess('Connexion réussie ! Redirection en cours...');
                const from = location.state?.from?.pathname || '/admin/dashboard';
                setTimeout(() => {
                    navigate(from, { replace: true });
                }, 1500);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Une erreur inattendue est survenue');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                {/* Panel gauche: branding */}
                <div className="hidden lg:flex flex-col justify-center text-white space-y-6">
                    <Link
                        to="/"
                        className="inline-flex items-center text-sm text-slate-300 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour au site
                    </Link>
                    <div>
                        <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight mb-4">
                            DjibImmo
                        </h1>
                        <p className="text-slate-300 text-sm max-w-md">
                            Espace d’administration sécurisé pour gérer vos parcelles et locations à Djibouti, avec une interface moderne et simple à utiliser.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="border border-white/10 rounded-xl p-4">
                            <p className="text-xs uppercase text-slate-400 mb-1">Fiabilité</p>
                            <p className="font-semibold">Données centralisées et sécurisées</p>
                        </div>
                        <div className="border border-white/10 rounded-xl p-4">
                            <p className="text-xs uppercase text-slate-400 mb-1">Performance</p>
                            <p className="font-semibold">Interface rapide et réactive</p>
                        </div>
                    </div>
                </div>

                {/* Panel droit: carte de connexion */}
                <div className="w-full">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl px-6 py-8 sm:px-8 sm:py-10">
                        <div className="mb-6 text-center lg:text-left">
                            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30 mb-4">
                                <span className="text-white font-bold text-xl">D</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white">
                                Connexion à l’espace admin
                            </h2>
                            <p className="mt-1 text-sm text-slate-300">
                                Entrez vos identifiants pour accéder au tableau de bord.
                            </p>
                        </div>

                        {/* Messages */}
                        {error && (
                            <div className="mb-4 bg-red-500/10 border border-red-500/40 rounded-lg p-4 flex items-start">
                                <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-medium text-red-200">Erreur de connexion</h3>
                                    <p className="text-sm text-red-100 mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/40 rounded-lg p-4 flex items-start">
                                <CheckCircle className="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-medium text-emerald-200">Connexion réussie</h3>
                                    <p className="text-sm text-emerald-100 mt-1">{success}</p>
                                </div>
                            </div>
                        )}

                        {/* Formulaire */}
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-200">
                                        Adresse email
                                    </label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="appearance-none relative block w-full pl-10 pr-3 py-3 rounded-xl bg-slate-950/60 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                                            placeholder="admin@example.com"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                {/* Mot de passe */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                                        Mot de passe
                                    </label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="appearance-none relative block w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950/60 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                                            placeholder="••••••••"
                                            disabled={isSubmitting}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={isSubmitting}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-200" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-slate-400 hover:text-slate-200" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-slate-600 rounded bg-slate-900"
                                        disabled={isSubmitting}
                                    />
                                    <label htmlFor="remember-me" className="ml-2 text-slate-200">
                                        Se souvenir de moi
                                    </label>
                                </div>

                                <Link
                                    to="/forgot-password"
                                    className="font-medium text-blue-400 hover:text-blue-300"
                                >
                                    Mot de passe oublié ?
                                </Link>
                            </div>

                            {/* Bouton de connexion */}
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="group relative w-full flex justify-center py-3 px-4 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-500/30"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Connexion en cours...
                                        </>
                                    ) : (
                                        'Se connecter'
                                    )}
                                </button>

                                <p className="text-xs text-slate-400">
                                    Astuce: en développement, vous pouvez utiliser l’utilisateur par défaut
                                    <span className="font-mono text-slate-200"> admin@example.com / password</span>.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
