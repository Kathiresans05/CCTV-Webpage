import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductSidebar from '../components/products/ProductSidebar';
import ProductListingGrid from '../components/products/ProductListingGrid';
import ProductInquiryModal from '../components/products/ProductInquiryModal';
import { useAuth } from '../context/AuthContext';

// Image map: server sends a key, frontend resolves the asset
import bulletImg from '../assets/bullet_camera.png';
import domeImg from '../assets/dome_camera.png';
import ptzImg from '../assets/ptz_camera.png';

const IMAGE_MAP = {
    bullet_camera: bulletImg,
    dome_camera: domeImg,
    ptz_camera: ptzImg,
};

const ProductsListing = () => {
    // ── API state ────────────────────────────────────
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // ── Filter state ─────────────────────────────────
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState(50000);
    const [minRating, setMinRating] = useState(0);
    const [sortBy, setSortBy] = useState('Default Sorting');
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 9;

    // Sync searchTerm with URL query
    useEffect(() => {
        const query = searchParams.get('search');
        if (query !== null) {
            setSearchTerm(query);
            setCurrentPage(1); // Reset on URL search change
        }
    }, [searchParams]);

    // Reset pagination when any filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategories, priceRange, minRating, sortBy]);

    // ── Modal state ──────────────────────────────────
    const [inquiryProduct, setInquiryProduct] = useState(null);

    // ── Fetch products from backend ───────────────────
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                if (data.success) {
                    // Resolve local image assets from the key returned by server
                    const resolved = data.data.map(p => ({
                        ...p,
                        image: IMAGE_MAP[p.image] || bulletImg
                    }));
                    setAllProducts(resolved);
                } else {
                    setFetchError('Failed to load products.');
                }
            } catch {
                setFetchError('Could not connect to the server. Make sure the backend is running.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // ── Category counts for sidebar ─────────────────
    const categoryCounts = useMemo(() => {
        const counts = {};
        allProducts.forEach(p => {
            counts[p.category] = (counts[p.category] || 0) + 1;
        });
        return counts;
    }, [allProducts]);

    // ── Filtered & sorted products ───────────────────
    const filteredProducts = useMemo(() => {
        let result = allProducts.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
            const matchesPrice = product.price <= priceRange;
            const matchesRating = product.rating >= minRating;
            return matchesSearch && matchesCategory && matchesPrice && matchesRating;
        });

        if (sortBy === 'Price: Low to High') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'Price: High to Low') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'Newest Arrivals') {
            result.sort((a, b) => b.id - a.id);
        }

        return result;
    }, [allProducts, searchTerm, selectedCategories, priceRange, minRating, sortBy]);

    // ── Pagination Calculation ──────────────────────
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * productsPerPage;
        return filteredProducts.slice(startIndex, startIndex + productsPerPage);
    }, [filteredProducts, currentPage, productsPerPage]);

    // ── Render ──────────────────────────────────────
    return (
        <div className="bg-white min-h-screen py-4">
            <div className="w-full px-4 lg:px-10">

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-32">
                        <svg className="animate-spin h-12 w-12 text-[#B91C1C] mb-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <p className="text-gray-500 font-medium">Loading products...</p>
                    </div>
                )}

                {/* Error State */}
                {!loading && fetchError && (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
                            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Could Not Load Products</h3>
                            <p className="text-gray-500 text-sm">{fetchError}</p>
                            <p className="text-gray-400 text-xs mt-3">Run <code className="bg-gray-100 px-1 py-0.5 rounded">node server.js</code> in your project folder.</p>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                {!loading && !fetchError && (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <ProductSidebar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            selectedCategories={selectedCategories}
                            setSelectedCategories={setSelectedCategories}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                            minRating={minRating}
                            setMinRating={setMinRating}
                            categoryCounts={categoryCounts}
                        />

                        {/* Grid */}
                        <ProductListingGrid
                            products={paginatedProducts}
                            totalResults={filteredProducts.length}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => {
                                setCurrentPage(page);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            onBookNow={(product) => {
                                if (!isAuthenticated) {
                                    navigate('/signup');
                                } else {
                                    setInquiryProduct(product);
                                }
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Book Now Inquiry Modal */}
            {inquiryProduct && (
                <ProductInquiryModal
                    product={inquiryProduct}
                    onClose={() => setInquiryProduct(null)}
                />
            )}
        </div>
    );
};

export default ProductsListing;
