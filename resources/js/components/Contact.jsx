import React from 'react';
import { Phone, Mail, MessageCircle, ArrowRight } from 'lucide-react';

export default function Contact() {

    const contactInfo = [
        {
            icon: Phone,
            title: "Téléphone",
            details: ["+253 77 12 34 56", "+253 21 35 67 89"],
            action: "tel:+25377123456"
        },
        {
            icon: Mail,
            title: "Email",
            details: ["contact@DjibImmo.dj", "info@DjibImmo.dj"],
            action: "mailto:contact@DjibImmo.dj"
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section - Noir et Blanc */}
            <div className="relative bg-white">
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="min-h-[60vh] flex items-center py-20">
                        <div className="w-full text-center">
                            {/* Titre principal */}
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6 leading-tight tracking-tight">
                                Contactez-Nous
                            </h1>

                            <div className="w-24 h-0.5 bg-black mx-auto mb-6"></div>

                            <p className="text-xl md:text-2xl text-black/90 mb-4 max-w-3xl mx-auto font-light">
                                Nous sommes là pour vous aider
                            </p>
                            <p className="text-lg md:text-xl text-black/70 mb-12 max-w-2xl mx-auto font-light">
                                Contactez-nous directement par téléphone, WhatsApp ou email
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Informations de contact */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Comment nous joindre</h2>
                    <div className="w-20 h-0.5 bg-black mx-auto mb-6"></div>
                    <p className="text-lg text-black/70 max-w-2xl mx-auto">
                        Choisissez le moyen de communication qui vous convient le mieux
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {contactInfo.map((info, index) => (
                        <div key={index} className="group bg-white border-2 border-black p-8 hover:shadow-lg transition-all duration-300">
                            <div className="bg-black w-16 h-16 flex items-center justify-center mx-auto mb-6">
                                <info.icon className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-black mb-4 text-center">{info.title}</h3>
                            <div className="text-center space-y-2 mb-8">
                                {info.details.map((detail, idx) => (
                                    <p key={idx} className="text-black/70 text-base">{detail}</p>
                                ))}
                            </div>
                            {info.action && (
                                <div className="text-center">
                                    <a
                                        href={info.action}
                                        className="group/btn inline-flex items-center gap-2 bg-black text-white px-6 py-3 hover:bg-black/90 transition-colors duration-200 font-semibold border-2 border-black"
                                    >
                                        <info.icon className="h-4 w-4" />
                                        {info.title === "Téléphone" ? "Appeler" : "Envoyer un email"}
                                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* About Us Section - Noir et Blanc */}
                <div id="about-us" className="relative bg-white py-20 mb-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Qui Sommes-Nous</h2>
                            <div className="w-20 h-0.5 bg-black mx-auto mb-6"></div>
                            <p className="text-lg text-black/70 max-w-2xl mx-auto">
                                Votre partenaire de confiance à Djibouti
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-white border-2 border-black p-8">
                                <h3 className="text-2xl font-bold text-black mb-4">Notre Mission</h3>
                                <p className="text-black/70 leading-relaxed mb-4">
                                    DjibImmo est la plateforme de référence à Djibouti pour vos besoins en parcelles et locations. Nous nous engageons à offrir un service de qualité, transparent et accessible à tous.
                                </p>
                                <p className="text-black/70 leading-relaxed">
                                    Notre mission est de simplifier vos recherches et de vous connecter avec les meilleures opportunités, tout en garantissant sécurité et confiance dans chaque transaction.
                                </p>
                            </div>

                            <div className="bg-white border-2 border-black p-8">
                                <h3 className="text-2xl font-bold text-black mb-4">Nos Valeurs</h3>
                                <ul className="space-y-4 text-black/70">
                                    <li className="flex items-start gap-3">
                                        <span className="text-black font-bold mt-1">•</span>
                                        <span><strong className="text-black">Transparence :</strong> Des prix clairs et des informations complètes sur chaque annonce</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-black font-bold mt-1">•</span>
                                        <span><strong className="text-black">Fiabilité :</strong> Tous nos produits sont vérifiés et certifiés par nos experts</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-black font-bold mt-1">•</span>
                                        <span><strong className="text-black">Service Client :</strong> Une équipe dévouée disponible pour vous accompagner à chaque étape</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-black font-bold mt-1">•</span>
                                        <span><strong className="text-black">Innovation :</strong> Une plateforme moderne et intuitive pour une expérience optimale</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white border-2 border-black p-8">
                                <h3 className="text-2xl font-bold text-black mb-4">Pourquoi Nous Choisir</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-bold text-black mb-2">1000+ Clients Satisfaits</h4>
                                        <p className="text-black/70 text-sm">Des milliers de clients nous font confiance pour leurs projets</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-black mb-2">Vérification Complète</h4>
                                        <p className="text-black/70 text-sm">Tous nos produits sont inspectés et certifiés</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-black mb-2">Support 7j/7</h4>
                                        <p className="text-black/70 text-sm">Une équipe disponible pour répondre à toutes vos questions</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-black mb-2">Prix Compétitifs</h4>
                                        <p className="text-black/70 text-sm">Les meilleurs prix du marché sans frais cachés</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* WhatsApp Section - Noir et Blanc */}
                <div className="relative bg-white border-2 border-black p-12 text-center mb-16">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-black w-24 h-24 flex items-center justify-center mx-auto mb-6">
                            <MessageCircle className="h-12 w-12 text-white" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Chattez avec nous sur WhatsApp</h2>
                        <div className="w-20 h-0.5 bg-black mx-auto mb-6"></div>
                        <p className="text-xl mb-8 text-black/70 leading-relaxed">
                            Réponse rapide garantie ! Envoyez-nous un message directement.
                        </p>
                        <a
                            href="https://wa.me/25377123456?text=Bonjour, je suis intéressé par vos services DjibImmo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-3 bg-black text-white px-10 py-5 hover:bg-black/90 transition-colors duration-200 text-lg font-semibold border-2 border-black"
                        >
                            <MessageCircle className="h-6 w-6" />
                            Ouvrir WhatsApp
                            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
