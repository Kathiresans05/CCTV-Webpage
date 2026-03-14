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
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const categories = Object.keys(categoryCounts).map(catName => ({
        name: catName,
        count: categoryCounts[catName]
    }));


    const handleCategoryToggle = (categoryName) => {
        setSelectedCategories(prev =>
            prev.includes(categoryName)
                ? prev.filter(c => c !== categoryName)
                : [...prev, categoryName]
        );
    };

    return (
        <aside className="w-full lg:w-1/4">


            {/* Price Filter — moved to top */}
            <div className="bg-[#ffffff] p-4 border-y border-r border-gray-200 shadow-sm">
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

            {/* Categories Section */}
            <div className="bg-[#ffffff] p-4 border-y border-r border-gray-200 shadow-sm">
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


        </aside>
    );
};

export default ProductSidebar;
