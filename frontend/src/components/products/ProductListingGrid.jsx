import React from 'react';
import ProductCard from './ProductCard';

const ProductListingGrid = ({ products, totalResults, sortBy, setSortBy, onBookNow, currentPage, totalPages, onPageChange }) => {
    // ── Pre-calculate displayed range ────────────────
    const startIdx = products.length > 0 ? (currentPage - 1) * 9 + 1 : 0;
    const endIdx = products.length > 0 ? startIdx + products.length - 1 : 0;

    return (
        <div className="flex-1 space-y-6">
            {/* Top Bar (Results Info & Sort) */}
            <div className="bg-white p-3 border border-gray-200 rounded shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-[13px] text-gray-600 font-medium">
                    Showing <span className="text-navy-900 font-bold">{startIdx}-{endIdx}</span> of <span className="text-navy-900 font-bold">{totalResults}</span> results
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-[13px] text-gray-500 font-medium whitespace-nowrap">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-[13px] border-gray-200 rounded bg-white py-1.5 pl-3 pr-8 focus:ring-red-700 focus:border-red-700 font-bold text-navy-900 appearance-none cursor-pointer outline-none min-w-[160px]"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234B5563'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.5rem center',
                            backgroundSize: '1rem'
                        }}
                    >
                        <option>Default Sorting</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                        <option>Newest Arrivals</option>
                    </select>
                </div>
            </div>

            {/* Product Grid */}
            {products.length === 0 ? (
                <div className="bg-white p-12 border border-gray-200 rounded text-center">
                    <p className="text-gray-500 font-medium">No products match your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onBookNow={() => onBookNow(product)}
                        />
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center space-x-2 pb-8">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 border rounded text-sm font-medium transition-all ${currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-red-700'}`}
                    >
                        Previous
                    </button>

                    <div className="flex items-center space-x-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => onPageChange(i + 1)}
                                className={`w-10 h-10 flex items-center justify-center rounded text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-red-700 text-white shadow-md' : 'border border-gray-300 text-gray-600 hover:bg-red-50 hover:text-red-700'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 border rounded text-sm font-medium transition-all ${currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-red-700'}`}
                    >
                        Next
                    </button>
                </div>
            )}


        </div>
    );
};

export default ProductListingGrid;
