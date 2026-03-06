import { Link, useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
    const navigate = useNavigate();

    const handleNavClick = (path) => {
        // Scroll vers le haut immédiatement
        window.scrollTo({ top: 0, behavior: 'instant' });
        // Naviguer vers la route
        navigate(path);
        // S'assurer que le scroll est bien en haut après un court délai
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }, 0);
    };

    const handleTestimonialsClick = (e) => {
        e.preventDefault();
        if (window.location.pathname === '/') {
            // Si on est déjà sur la page d'accueil, scroll vers la section
            const testimonialsSection = document.getElementById('testimonials');
            if (testimonialsSection) {
                testimonialsSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // Sinon, naviguer vers la page d'accueil puis scroll
            navigate('/');
            setTimeout(() => {
                const testimonialsSection = document.getElementById('testimonials');
                if (testimonialsSection) {
                    testimonialsSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    };

    const handleAboutUsClick = (e) => {
        e.preventDefault();
        navigate('/contact');
        setTimeout(() => {
            const aboutSection = document.getElementById('about-us');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    return (
        <footer className="bg-black border-t-2 border-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div>
                        <a 
                            href="/" 
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavClick('/');
                            }}
                            className="block"
                        >
                            <h3 className="text-2xl font-bold mb-4 text-white hover:text-white/80 transition-colors">
                                DjibImmo
                            </h3>
                        </a>
                        <p className="text-white/70 leading-relaxed mb-6 text-sm">
                            Votre plateforme de confiance pour parcelles et locations à Djibouti.
                        </p>
                        <div className="flex gap-3">
                            <a 
                                href="https://facebook.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-white/10 hover:bg-white/20 border border-white/20 w-10 h-10 flex items-center justify-center transition-colors"
                            >
                                <Facebook className="h-5 w-5 text-white" />
                            </a>
                            <a 
                                href="https://instagram.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-white/10 hover:bg-white/20 border border-white/20 w-10 h-10 flex items-center justify-center transition-colors"
                            >
                                <Instagram className="h-5 w-5 text-white" />
                            </a>
                            <a 
                                href="https://twitter.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-white/10 hover:bg-white/20 border border-white/20 w-10 h-10 flex items-center justify-center transition-colors"
                            >
                                <Twitter className="h-5 w-5 text-white" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-lg text-white">Services</h4>
                        <ul className="space-y-3 text-white/70">
                            <li>
                                <a 
                                    href="/properties" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavClick('/properties');
                                    }}
                                    className="hover:text-white transition-colors text-sm block cursor-pointer"
                                >
                                    Parcelles
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="/rentals" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavClick('/rentals');
                                    }}
                                    className="hover:text-white transition-colors text-sm block cursor-pointer"
                                >
                                    Locations
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="/contact" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavClick('/contact');
                                    }}
                                    className="hover:text-white transition-colors text-sm block cursor-pointer"
                                >
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-lg text-white">À Propos</h4>
                        <ul className="space-y-3 text-white/70">
                            <li>
                                <a 
                                    href="#about-us" 
                                    onClick={handleAboutUsClick}
                                    className="hover:text-white transition-colors text-sm block cursor-pointer"
                                >
                                    Qui sommes-nous
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#testimonials" 
                                    onClick={handleTestimonialsClick}
                                    className="hover:text-white transition-colors text-sm block cursor-pointer"
                                >
                                    Témoignages
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="/contact" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavClick('/contact');
                                    }}
                                    className="hover:text-white transition-colors text-sm block cursor-pointer"
                                >
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-lg text-white">Contact</h4>
                        <ul className="space-y-3 text-white/70">
                            <li className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 flex-shrink-0 text-white" />
                                <a href="tel:+25377123456" className="hover:text-white transition-colors">
                                    +253 77 12 34 56
                                </a>
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 flex-shrink-0 text-white" />
                                <a href="mailto:contact@DjibImmo.dj" className="hover:text-white transition-colors">
                                    contact@DjibImmo.dj
                                </a>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-white" />
                                <span>Djibouti, République de Djibouti</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/20 pt-8 text-center text-white/70 text-sm">
                    <p>&copy; 2024 DjibImmo. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
}
