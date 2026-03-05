import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Star, X } from 'lucide-react';

const ProductSidebar = ({
    searchTerm,
    setSearchTerm,
    selectedCategories,
    setSelectedCategories,
    priceRange,
    setPriceRange,
    minRating,
    setMinRating,
    categoryCounts
}) => {
    const [openSections, setOpenSections] = useState({
        categories: true,
        price: true,
        rating: true,
        tags: true,
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const categories = Object.keys(categoryCounts).map(catName => ({
        name: catName,
        count: categoryCounts[catName]
    }));

    const tags = ["4K UHD", "Night Vision", "AI Motion", "Solar Powered", "Weatherproof", "Smart Tracking", "Two-Way Audio", "Face Recognition"];

    const handleCategoryToggle = (categoryName) => {
        setSelectedCategories(prev =>
            prev.includes(categoryName)
                ? prev.filter(c => c !== categoryName)
                : [...prev, categoryName]
        );
    };

    return (
        <aside className="w-full lg:w-1/4 space-y-4">
            {/* Pill Search Section */}
            <div className="bg-white p-4 border border-gray-200 rounded shadow-sm">
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-10 pr-10 py-2.5 text-[13px] bg-gray-100 border-transparent rounded-full focus:bg-white focus:border-gray-200 focus:ring-0 transition-all placeholder-gray-400 font-medium"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} strokeWidth={2} />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-700 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Categories Section */}
            <div className="bg-white p-4 border border-gray-200 rounded shadow-sm">
                <div
                    className="flex justify-between items-center cursor-pointer mb-3"
                    onClick={() => toggleSection('categories')}
                >
                    <h3 className="text-[14px] font-bold text-navy-900 uppercase tracking-wider">Categories</h3>
                    {openSections.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                {openSections.categories && (
                    <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        <ul className="space-y-2">
                            {categories.map((cat, idx) => (
                                <li key={idx} className="flex justify-between items-center text-sm text-gray-600 hover:text-red-700 cursor-pointer transition-colors group">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(cat.name)}
                                            onChange={() => handleCategoryToggle(cat.name)}
                                            className="rounded border-gray-300 text-red-700 focus:ring-red-700 w-4 h-4 cursor-pointer"
                                        />
                                        <span onClick={() => handleCategoryToggle(cat.name)} className="cursor-pointer">{cat.name}</span>
                                    </div>
                                    <span className="text-xs text-gray-400 font-bold bg-gray-50 px-2 py-0.5 rounded-full group-hover:bg-red-50 group-hover:text-red-700 transition-colors">
                                        {cat.count}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Price Filter */}
            <div className="bg-white p-4 border border-gray-200 rounded shadow-sm">
                <div
                    className="flex justify-between items-center cursor-pointer mb-3"
                    onClick={() => toggleSection('price')}
                >
                    <h3 className="text-[14px] font-bold text-gray-800 uppercase tracking-wider">Price</h3>
                    {openSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                {openSections.price && (
                    <div className="space-y-3">
                        <input
                            type="range"
                            min="1000"
                            max="50000"
                            step="500"
                            value={priceRange}
                            onChange={(e) => setPriceRange(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-700"
                        />
                        <div className="flex justify-between text-xs font-bold text-gray-700">
                            <span>₹1,000</span>
                            <span>₹{priceRange.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Rating Filter */}
            <div className="bg-white p-4 border border-gray-200 rounded shadow-sm">
                <div
                    className="flex justify-between items-center cursor-pointer mb-3"
                    onClick={() => toggleSection('rating')}
                >
                    <h3 className="text-[14px] font-bold text-gray-800 uppercase tracking-wider">Customer Review</h3>
                    {openSections.rating ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                {openSections.rating && (
                    <div className="space-y-2">
                        {[4, 3, 2, 1].map((rating) => (
                            <div
                                key={rating}
                                onClick={() => setMinRating(rating)}
                                className={`flex items-center space-x-2 group cursor-pointer text-sm transition-colors ${minRating === rating ? 'text-red-700' : 'text-gray-600 hover:text-orange-600'}`}
                            >
                                <div className="flex text-yellow-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            fill={i < rating ? "currentColor" : "none"}
                                            className={i < rating ? "" : "text-gray-300"}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium">& Up</span>
                            </div>
                        ))}
                        <button
                            onClick={() => setMinRating(0)}
                            className="text-xs text-red-700 hover:underline mt-2"
                        >
                            Reset Rating
                        </button>
                    </div>
                )}
            </div>

            {/* Product Tags */}
            <div className="bg-white p-4 border border-gray-200 rounded shadow-sm">
                <div
                    className="flex justify-between items-center cursor-pointer mb-3"
                    onClick={() => toggleSection('tags')}
                >
                    <h3 className="text-[14px] font-bold text-gray-800 uppercase tracking-wider">Tags</h3>
                    {openSections.tags ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                {openSections.tags && (
                    <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                            <button
                                key={tag}
                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded text-[11px] text-gray-700 transition-all font-bold"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default ProductSidebar;
