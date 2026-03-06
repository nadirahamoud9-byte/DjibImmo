import React from 'react';

const Pagination = ({ pagination, onPageChange }) => {
    // Vérifier que pagination existe et a les propriétés nécessaires
    if (!pagination || typeof pagination !== 'object') {
        return null;
    }

    const { current_page = 1, last_page = 1 } = pagination;

    // N'affiche la pagination que si il y a plus d'une page
    if (!last_page || last_page <= 1) {
        return null;
    }

    // S'assurer que current_page est valide
    const safeCurrentPage = Math.max(1, Math.min(current_page || 1, last_page));

    // Fonction simple pour gérer le changement de page
    const handlePageChange = (newPage) => {
        console.log('[Pagination] handlePageChange called with:', newPage);
        console.log('[Pagination] onPageChange type:', typeof onPageChange);
        console.log('[Pagination] last_page:', last_page);

        if (newPage >= 1 && newPage <= last_page) {
            if (onPageChange && typeof onPageChange === 'function') {
                console.log('[Pagination] Calling onPageChange with page:', newPage);
                try {
                    onPageChange(newPage);
                } catch (error) {
                    console.error('[Pagination] Error calling onPageChange:', error);
                }
            } else {
                console.error('[Pagination] onPageChange is not a function:', typeof onPageChange);
            }
        } else {
            console.warn('[Pagination] Invalid page number:', newPage, 'valid range: 1 to', last_page);
        }
    };

    // Calculer les pages à afficher
    const getPagesToShow = () => {
        const pages = [];

        if (last_page <= 5) {
            // Afficher toutes les pages si 5 ou moins
            for (let i = 1; i <= last_page; i++) {
                pages.push(i);
            }
        } else {
            // Afficher 5 pages avec la page courante au centre si possible
            if (safeCurrentPage <= 3) {
                // Début : afficher les 5 premières pages
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
            } else if (safeCurrentPage >= last_page - 2) {
                // Fin : afficher les 5 dernières pages
                for (let i = last_page - 4; i <= last_page; i++) {
                    pages.push(i);
                }
            } else {
                // Milieu : afficher 2 pages avant, la page courante, et 2 pages après
                for (let i = safeCurrentPage - 2; i <= safeCurrentPage + 2; i++) {
                    pages.push(i);
                }
            }
        }

        return pages;
    };

    const pagesToShow = getPagesToShow();

    return (
        <div
            className="flex justify-center items-center gap-2"
            onClick={(e) => {
                console.log('[Pagination] Container clicked');
                e.stopPropagation();
            }}
        >
            {/* Bouton Précédent */}
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('[Pagination] Previous button clicked, current page:', safeCurrentPage);
                    if (safeCurrentPage > 1) {
                        handlePageChange(safeCurrentPage - 1);
                    }
                }}
                disabled={safeCurrentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
                Précédent
            </button>

            {/* Numéros de page */}
            <div className="flex gap-1">
                {pagesToShow.map((page) => (
                    <button
                        key={page}
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('[Pagination] Page button clicked:', page);
                            handlePageChange(page);
                        }}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            page === safeCurrentPage
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                        style={{ cursor: 'pointer' }}
                    >
                        {page}
                    </button>
                ))}
            </div>

            {/* Bouton Suivant */}
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('[Pagination] Next button clicked, current page:', safeCurrentPage);
                    if (safeCurrentPage < last_page) {
                        handlePageChange(safeCurrentPage + 1);
                    }
                }}
                disabled={safeCurrentPage === last_page}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ cursor: safeCurrentPage === last_page ? 'not-allowed' : 'pointer' }}
            >
                Suivant
            </button>
        </div>
    );
};

export default Pagination;
