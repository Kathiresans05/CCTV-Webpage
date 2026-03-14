import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Heart, Loader2, ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

import { useNavigate } from 'react-router-dom';

import bullet1 from '../../assets/bullet_1.png';
import bullet2 from '../../assets/bullet_2.png';
import bullet3 from '../../assets/bullet_3.png';
import bullet4 from '../../assets/bullet_4.png';
import dome1 from '../../assets/dome_1.png';
import dome2 from '../../assets/dome_2.png';
import dome3 from '../../assets/dome_3.png';
import dome4 from '../../assets/dome_4.png';
import bulletDefault from '../../assets/bullet_camera.png';
import domeDefault from '../../assets/dome_camera.png';
import ptzDefault from '../../assets/ptz_camera.png';

const IMAGE_MAP = {
    bullet_1: bullet1, bullet_2: bullet2, bullet_3: bullet3, bullet_4: bullet4,
    dome_1: dome1, dome_2: dome2, dome_3: dome3, dome_4: dome4,
    bullet_camera: bulletDefault, dome_camera: domeDefault, ptz_camera: ptzDefault
};

const ProductCard = ({ product, onBookNow }) => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);

    // Compute media items combining images and video
    const mediaItems = [];
    
    // Resolve main image
    const resolvedMainImage = (product.image && (product.image.startsWith('http') || product.image.startsWith('/uploads'))) 
        ? product.image 
        : (IMAGE_MAP[product.image] || bulletDefault);

    // Resolve gallery images
    const images = Array.isArray(product.productImages) && product.productImages.length > 0 
        ? product.productImages.map(img => 
             (img && (img.startsWith('http') || img.startsWith('/uploads'))) 
                 ? img 
                 : (IMAGE_MAP[img] || img)
          ).filter(Boolean).filter((val, index, self) => self.indexOf(val) === index)
        : [resolvedMainImage].filter(Boolean);
        
    images.forEach(img => {
        if (img) mediaItems.push({ type: 'image', url: img });
    });

    if (product.videoUrl) {
        mediaItems.push({ type: 'video', url: product.videoUrl });
    }

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
        <div className="bg-white outline outline-1 outline-gray-200 hover:outline-2 hover:outline-gray-300 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl group h-full relative z-0 hover:z-10">
            {/* Media Container */}
            <div className="relative w-full bg-[#F7F8F9] flex flex-col">
                {/* Main Viewer */}
                <div className="relative w-full h-[240px] overflow-hidden flex items-center justify-center p-4">
                    {mediaItems.length > 0 && mediaItems[activeMediaIndex].type === 'video' ? (
                        <div className="w-full h-full bg-black flex items-center justify-center rounded-lg overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                            <iframe 
                                className="w-full h-full pointer-events-none"
                                src={`${mediaItems[activeMediaIndex].url}?autoplay=1&mute=1&controls=0&loop=1`} 
                                title="Product Video" 
                                frameBorder="0" 
                                allow="autoplay; encrypted-media" 
                            ></iframe>
                        </div>
                    ) : (
                        <img
                            src={mediaItems.length > 0 ? mediaItems[activeMediaIndex].url : resolvedMainImage}
                            alt={product.name}
                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                    )}

                    {/* Navigation Arrows */}
                    {mediaItems.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMediaIndex(prev => prev === 0 ? mediaItems.length - 1 : prev - 1);
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white text-gray-700 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMediaIndex(prev => prev === mediaItems.length - 1 ? 0 : prev + 1);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white text-gray-700 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </>
                    )}

                    {/* Hover Action Vertical Bar */}
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
                            className="bg-white text-gray-400 p-2.5 rounded-full shadow-lg flex items-center justify-center hover:text-red-500 transition-colors active:scale-95 disabled:opacity-50"
                            title="Add to Cart"
                        >
                            {isAddingToCart ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                        </button>
                    </div>

                    {/* Subtle Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>

                {/* Thumbnails Row */}
                {mediaItems.length > 1 && (
                    <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide py-1">
                        {mediaItems.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMediaIndex(idx);
                                }}
                                className={`relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                                    activeMediaIndex === idx ? 'border-primary-red shadow-sm transform scale-105' : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                                }`}
                            >
                                {item.type === 'video' ? (
                                    <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                                        {/* Show simplified static thumbnail for video rather than nested iframe parsing for performance */}
                                        <PlayCircle size={16} className="text-white absolute z-10 drop-shadow-md" />
                                        {resolvedMainImage && <img src={resolvedMainImage} className="w-full h-full object-cover opacity-50 blur-[1px]" alt="video thumb" />}
                                    </div>
                                ) : (
                                    <img src={item.url} alt={`thumb-${idx}`} className="w-full h-full object-contain bg-white" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
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
                            className="flex-1 bg-[#0b0f1a] text-white py-2.5 rounded-full font-bold text-[13px] hover:bg-black transition-all duration-300 whitespace-nowrap"
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
