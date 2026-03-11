import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Heart, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, onBookNow }) => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

    // Initial check for wishlist status
    useEffect(() => {
        if (isAuthenticated && user?.email) {
            const checkWishlist = async () => {
                try {
                    const res = await fetch(`/api/wishlist?email=${user.email}`);
                    const data = await res.json();
                    if (data.success) {
                        setIsWishlisted(data.data.some(item => item.productId === product.id));
                    }
                } catch (err) {
                    console.error('Error checking wishlist', err);
                }
            };
            checkWishlist();
        }
    }, [isAuthenticated, user, product.id]);

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        if (!isAuthenticated) return toast.error('Please login to add items to cart!');

        setIsAddingToCart(true);
        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, productId: product.id })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Added to cart successfully!');
                window.dispatchEvent(new Event('cartUpdated')); // Tell Navbar to sync
            } else {
                toast.error(data.message || 'Failed to add to cart');
            }
        } catch (err) {
            console.error('Add to cart failed', err);
            toast.error('Network error');
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleToggleWishlist = async (e) => {
        e.stopPropagation();
        if (!isAuthenticated) return toast.error('Please login to use wishlist!');

        setIsTogglingWishlist(true);
        try {
            const res = await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, productId: product.id })
            });
            const data = await res.json();
            if (data.success) {
                setIsWishlisted(data.action === 'added');
                toast.success(data.action === 'added' ? 'Added to wishlist!' : 'Removed from wishlist!');
                window.dispatchEvent(new Event('wishlistUpdated')); // Tell Navbar to sync
            } else {
                toast.error(data.message || 'Failed to update wishlist');
            }
        } catch (err) {
            console.error('Wishlist toggle failed', err);
            toast.error('Network error');
        } finally {
            setIsTogglingWishlist(false);
        }
    };

    return (
        <div className="bg-white border border-gray-100 rounded-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl group h-full relative">
            {/* Image Container */}
            <div className="relative w-full h-[240px] bg-[#F7F8F9] overflow-hidden flex items-center justify-center cursor-pointer p-6">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />

                {/* Hover Action Vertical Bar - Moved to Top-Right "Box" Area */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 flex flex-col gap-2 z-20">
                    <button
                        onClick={handleToggleWishlist}
                        disabled={isTogglingWishlist}
                        className={`p-2.5 rounded-full shadow-lg transition-all duration-300 ${isWishlisted ? 'bg-white text-red-500' : 'bg-white text-gray-400 hover:text-red-500'}`}
                        title="Add to Wishlist"
                    >
                        {isTogglingWishlist ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />}
                    </button>

                    <button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                        className="bg-primary-red text-white p-2.5 rounded-full shadow-lg flex items-center justify-center hover:bg-red-800 transition-colors active:scale-95 disabled:opacity-50"
                        title="Add to Cart"
                    >
                        {isAddingToCart ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                    </button>
                </div>

                {/* Subtle Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>


            {/* Product Info */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-[17px] font-semibold text-primary-navy leading-tight flex-grow">
                        {product.name}
                    </h3>
                    <div className="flex items-center space-x-1 text-orange-400 flex-shrink-0 pt-0.5">
                        <Star size={14} fill="currentColor" stroke="none" />
                        <span className="text-sm font-medium text-gray-600">{product.rating}</span>
                    </div>
                </div>

                {/* Price + Buttons Section */}
                <div className="mt-auto pt-4 flex flex-col gap-3">
                    {/* Price */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-[11px] uppercase tracking-wider mb-0.5">Starting from</p>
                            <span className="text-2xl font-bold text-[#B91C1C] leading-none">₹{product.price.toLocaleString('en-IN')}</span>
                        </div>
                        <span className="text-xs text-gray-400 line-through self-end mb-0.5">₹{(product.price * 1.2).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>

                    {/* Buttons Row */}
                    <div className="flex gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/products/${product._id}`);
                            }}
                            className="flex-1 bg-transparent border border-gray-300 text-gray-700 py-2.5 rounded-full font-bold text-[13px] hover:border-primary-red hover:text-primary-red transition-all duration-300 whitespace-nowrap"
                        >
                            View Details
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onBookNow) onBookNow(product);
                            }}
                            className="flex-1 bg-[#0b0f1a] text-white py-2.5 rounded-full font-bold text-[13px] hover:bg-black transition-all duration-300 shadow-md whitespace-nowrap"
                        >
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
