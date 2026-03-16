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
    const [isHovered, setIsHovered] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        if (isLeftSwipe) {
            nextSlide();
        } else if (isRightSwipe) {
            prevSlide();
        }
    };

    const nextSlide = (e) => {
        if (e) e.stopPropagation();
        setActiveMediaIndex(prev => (prev + 1) % mediaItems.length);
    };

    const prevSlide = (e) => {
        if (e) e.stopPropagation();
        setActiveMediaIndex(prev => (prev - 1 + mediaItems.length) % mediaItems.length);
    };

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
        const resolvedPoster = (product.videoPoster && (product.videoPoster.startsWith('http') || product.videoPoster.startsWith('/uploads')))
            ? product.videoPoster
            : (IMAGE_MAP[product.videoPoster] || resolvedMainImage);
            
        mediaItems.push({ 
            type: 'video', 
            url: product.videoUrl, 
            poster: resolvedPoster 
        });
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
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => navigate(`/products/${product._id}`)}
            className="bg-white outline outline-1 outline-gray-200 hover:outline-2 hover:outline-gray-300 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl group h-full relative z-0 hover:z-10 cursor-pointer"
        >
            {/* Media Slider Container */}
            <div 
                className="relative w-full h-[240px] bg-[#F7F8F9] overflow-hidden group/slider"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Slides Track */}
                <div 
                    className="flex w-full h-full transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${activeMediaIndex * 100}%)` }}
                >
                    {mediaItems.map((item, idx) => (
                        <div key={idx} className="flex-shrink-0 w-full h-full flex items-center justify-center p-4">
                            {item.type === 'video' ? (
                                <div className="relative w-full h-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
                                    <iframe 
                                        className="w-full h-full pointer-events-none"
                                        src={`${item.url}?autoplay=${activeMediaIndex === idx ? 1 : 0}&mute=1&controls=0&loop=1&playlist=${item.url.split('/').pop()}`} 
                                        title="Product Video" 
                                        frameBorder="0" 
                                        allow="autoplay; encrypted-media" 
                                    ></iframe>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <PlayCircle size={40} className="text-white opacity-70 drop-shadow-lg" />
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={item.url}
                                    alt={`${product.name} - ${idx + 1}`}
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Slider Controls - Arrows */}
                {mediaItems.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover/slider:opacity-100 transition-all duration-300 z-20 border border-gray-100"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover/slider:opacity-100 transition-all duration-300 z-20 border border-gray-100"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </>
                )}

                {/* Dot Indicators */}
                {mediaItems.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                        {mediaItems.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMediaIndex(idx);
                                }}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    activeMediaIndex === idx ? 'w-4 bg-[#B91C1C]' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                                }`}
                            />
                        ))}
                    </div>
                )}

                {/* Hover Action Vertical Bar */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 flex flex-col gap-2 z-30">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
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
