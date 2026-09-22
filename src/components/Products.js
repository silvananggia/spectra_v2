import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from '../utils/i18n';
import { SkeletonCard } from './Skeleton';
import '../assets/style/ColorPalette.css';
import './Products.scss';
import { fetchProductsAsync } from '../redux/slices/product';
import { getDownloadUrl } from '../services/product.service';

const Products = () => {
    const dispatch = useDispatch();
    const { t, currentLanguage } = useTranslation();
    const { products, loading, error, filters } = useSelector((state) => state.product);
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [previewImage, setPreviewImage] = useState(null);
    const [previewTitle, setPreviewTitle] = useState('');
    const [sortOrder, setSortOrder] = useState('latest'); // 'latest' or 'oldest'
    const [currentPage, setCurrentPage] = useState(1);
    
    // Initialize filters from URL query parameters
    const [regionFilter, setRegionFilter] = useState(searchParams.get('region') || '');
    const [eventTypeFilter, setEventTypeFilter] = useState(searchParams.get('category') || t('products.allEvents'));
    
    const itemsPerPage = 9;

    // Update filters when URL query parameters change (on mount or external navigation)
    useEffect(() => {
        const regionParam = searchParams.get('region') || '';
        const categoryParam = searchParams.get('category') || t('products.allEvents');
        
        setRegionFilter(regionParam);
        setEventTypeFilter(categoryParam);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchParams.toString()]); // Use toString() to detect actual URL changes

    // Fetch products from API using Redux
    useEffect(() => {
        const queryParams = {
            page: 1,
            limit: 100, // Get all products for client-side filtering
        };
        
        // Add search filters if they exist
        if (regionFilter && regionFilter.trim() !== '') {
            queryParams.region = regionFilter.trim();
        }
        if (eventTypeFilter && eventTypeFilter !== t('products.allEvents')) {
            queryParams.category = eventTypeFilter;
        }
        
        dispatch(fetchProductsAsync(queryParams));
    }, [dispatch, regionFilter, eventTypeFilter]);

    // Sort products (filtering is now done on backend)
    const sortedProducts = [...products].sort((a, b) => {
        if (sortOrder === 'latest') {
            return b.releaseDate - a.releaseDate;
        } else {
            return a.releaseDate - b.releaseDate;
        }
    });

    // Pagination
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = sortedProducts.slice(startIndex, endIndex);

    // Handle download
    const handleDownload = (productId, filename) => {
        const downloadUrl = getDownloadUrl(productId);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImagePreview = (imageUrl, title) => {
        setPreviewImage(imageUrl);
        setPreviewTitle(title);
    };

    const closePreview = () => {
        setPreviewImage(null);
        setPreviewTitle('');
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && previewImage) {
                closePreview();
            }
        };
        
        if (previewImage) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            window.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [previewImage]);

    const handleSearch = () => {
        // Update URL query parameters
        const newParams = new URLSearchParams();
        const trimmedRegion = regionFilter ? regionFilter.trim() : '';
        const trimmedCategory = eventTypeFilter && eventTypeFilter !== t('products.allEvents') ? eventTypeFilter : '';
        
        if (trimmedRegion !== '') {
            newParams.set('region', trimmedRegion);
        } else {
            // Explicitly remove region param if empty
            newParams.delete('region');
        }
        
        if (trimmedCategory !== '') {
            newParams.set('category', trimmedCategory);
        } else {
            // Explicitly remove category param if empty
            newParams.delete('category');
        }
        
        // Update URL without page reload
        setSearchParams(newParams);
        
        // Reset to first page when searching
        setCurrentPage(1);
    };

    // Function to format date based on language
    const formatDate = (dateString) => {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        if (currentLanguage === 'id') {
            const months = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ];
            const day = String(date.getDate()).padStart(2, '0');
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            return `${day} ${month} ${year}`;
        } else {
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' });
        }
    };

    return (
        <main className="products-page">
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <Link to="/">{t('products.breadcrumbHome')}</Link>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">{t('products.breadcrumbProducts')}</span>
            </div>

            {/* Page Title */}
            <h1 className="page-title">{t('products.title')}</h1>

            {/* Search and Filter Section */}
            <section className="search-section">
                <div className="search-container">
                    <div className="form-field">
                        <label htmlFor="region">{t('products.searchRegion')}</label>
                        <input 
                            type="text" 
                            id="region" 
                            value={regionFilter}
                            onChange={(e) => setRegionFilter(e.target.value)}
                            className="form-input"
                            placeholder={t('products.searchPlaceholder')}
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="incident">{t('products.searchEventType')}</label>
                        <select 
                            id="incident" 
                            value={eventTypeFilter}
                            onChange={(e) => setEventTypeFilter(e.target.value)}
                            className="form-select"
                        >
                            <option>{t('products.allEvents')}</option>
                            <option>{t('home.banjir')}</option>
                            <option>{t('home.longsor')}</option>
                            <option>QR</option>
                            <option>PCS</option>
                        </select>
                    </div>
                    <button className="btn-search" onClick={handleSearch}>
                        {t('common.search')}
                    </button>
                </div>
            </section>

            {/* Filter Tabs */}
            <section className="filter-tabs">
                <button 
                    className={`filter-tab ${sortOrder === 'latest' ? 'active' : ''}`}
                    onClick={() => {
                        setSortOrder('latest');
                        setCurrentPage(1);
                    }}
                >
                    <span className="tab-icon">✓</span>
                    {t('products.latest')}
                </button>
                <button 
                    className={`filter-tab ${sortOrder === 'oldest' ? 'active' : ''}`}
                    onClick={() => {
                        setSortOrder('oldest');
                        setCurrentPage(1);
                    }}
                >
                    {t('products.oldest')}
                </button>
            </section>

            {/* Products Grid */}
            <section className="products-grid-section">
                {loading ? (
                    <div className="products-grid">
                        <SkeletonCard count={itemsPerPage} />
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {currentProducts.length > 0 ? (
                            currentProducts.map((product) => (
                                <div key={product.id} className="release-card">
                                    <div 
                                        className="card-image"
                                        onClick={() => product.thumbnail && handleImagePreview(product.thumbnail, product.title)}
                                    >
                                        {product.thumbnail ? (
                                            <img 
                                                src={product.thumbnail} 
                                                alt={product.title}
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                                }}
                                            />
                                        ) : (
                                            <div style={{ 
                                                width: '100%', 
                                                height: '200px', 
                                                backgroundColor: '#ddd', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center' 
                                            }}>
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-content">
                                        <h3 className="card-title">{product.title}</h3>
                                        {product.date && (
                                            <p className="card-date">{t('products.releaseDate')}: {formatDate(product.date)}</p>
                                        )}
                                        <button 
                                            className="btn-access"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownload(product.id, product.filename);
                                            }}
                                        >
                                            {t('products.access')}
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <p>{t('products.noResults')}</p>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Pagination */}
            {totalPages > 1 && (
                <section className="pagination-section">
                    <button 
                        className="pagination-btn"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        ← {t('common.previous')}
                    </button>
                    <div className="pagination-numbers">
                        {currentPage > 3 && (
                            <>
                                <button 
                                    className="pagination-number"
                                    onClick={() => setCurrentPage(1)}
                                >
                                    1
                                </button>
                                {currentPage > 4 && <span className="pagination-ellipsis">...</span>}
                            </>
                        )}
                        {[...Array(totalPages)].map((_, index) => {
                            const page = index + 1;
                            if (
                                page === currentPage ||
                                page === currentPage - 1 ||
                                page === currentPage + 1 ||
                                page === 1 ||
                                page === totalPages
                            ) {
                                return (
                                    <button
                                        key={page}
                                        className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                );
                            }
                            return null;
                        })}
                        {currentPage < totalPages - 2 && (
                            <>
                                {currentPage < totalPages - 3 && <span className="pagination-ellipsis">...</span>}
                                <button 
                                    className="pagination-number"
                                    onClick={() => setCurrentPage(totalPages)}
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}
                    </div>
                    <button 
                        className="pagination-btn"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                    >
                        {t('common.next')} →
                    </button>
                </section>
            )}

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="preview-modal" onClick={closePreview}>
                    <div className="preview-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={closePreview}
                            className="preview-close"
                            aria-label="Close preview"
                        >
                            ×
                        </button>
                        <h3 className="preview-title">{previewTitle}</h3>
                        <img
                            src={previewImage}
                            alt={previewTitle}
                            className="preview-image"
                        />
                        <p className="preview-instruction">
                            {t('products.pressEscape')} {t('products.clickToClose')}
                        </p>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Products;
