import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Heart, Loader2, ChevronLeft, ChevronRight, PlayCircle, X } from 'lucide-react';
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
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

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
        <>
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => navigate(`/products/${product._id}`)}
            className="w-full bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100/80 overflow-hidden flex flex-col transition-all duration-300 group cursor-pointer relative"
        >
            {/* Wishlist Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleToggleWishlist(e);
                }}
                disabled={isTogglingWishlist}
                className="absolute top-3 right-3 z-30 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow hover:scale-110 transition-transform text-gray-400 hover:text-red-500"
            >
                {isTogglingWishlist ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "text-red-500" : ""} />}
            </button>

            {/* Image Slider Container */}
            <div 
                className="relative w-full h-[250px] bg-white overflow-hidden flex items-center justify-center p-4"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Slides Track */}
                <div 
                    className="flex w-full h-full transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${activeMediaIndex * 100}%)` }}
                >
                    {mediaItems.map((item, idx) => (
                        <div key={idx} className="w-full h-full flex-shrink-0 flex items-center justify-center">
                            {item.type === 'video' ? (
                                <div 
                                    className="relative w-full h-full flex items-center justify-center group/video cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsVideoModalOpen(true);
                                    }}
                                >
                                    <img 
                                        src={item.poster || resolvedMainImage || bulletDefault} 
                                        alt={`${product.name} Video Thumbnail`}
                                        className="w-full h-full object-contain mix-blend-multiply opacity-80 transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <PlayCircle size={48} className="text-gray-800 opacity-80 group-hover/video:scale-110 group-hover/video:text-red-600 transition-all duration-300 drop-shadow-md bg-white/50 rounded-full" />
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={item.url}
                                    alt={`${product.name} - ${idx + 1}`}
                                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Slider Controls */}
                {mediaItems.length > 1 && (
                    <>
                        {/* Arrows */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        >
                            <ChevronRight size={18} />
                        </button>

                        {/* Dots */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                            {mediaItems.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMediaIndex(idx);
                                    }}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${activeMediaIndex === idx ? 'w-4 bg-gray-800' : 'w-1.5 bg-gray-300 hover:bg-gray-400'}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Product Details Component */}
            <div className="p-5 flex flex-col flex-grow bg-white z-10">
                {/* Title */}
                <h3 className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2 mb-1">
                    {product.name}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex items-center bg-green-600 px-1.5 py-0.5 rounded text-white text-[14px] font-bold">
                        {product.rating} <Star size={10} fill="currentColor" strokeWidth={0} className="ml-0.5" />
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-500 text-[14px] line-clamp-2 mb-4 flex-grow">
                    {product.description || "Professional CCTV surveillance camera."}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                    <span className="text-[14px] text-gray-400 line-through">₹{(product.price * 1.2).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    <span className="text-[14px] font-bold text-green-600 ml-auto">20% off</span>
                </div>

                {/* Buttons Row */}
                <div className="flex gap-2 mt-auto">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/products/${product._id}`);
                        }}
                        className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium text-[14px] hover:border-gray-800 hover:text-gray-900 transition-colors"
                    >
                        View Details
                    </button>
                    {onBookNow ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onBookNow(product);
                            }}
                            className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg font-medium text-[14px] hover:bg-black transition-colors"
                        >
                            Book Now
                        </button>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            disabled={isAddingToCart}
                            className="flex-1 bg-[#ff9f00] text-white py-2.5 rounded-lg font-medium text-[14px] hover:bg-[#f39800] transition-colors flex items-center justify-center gap-1.5"
                        >
                            {isAddingToCart ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />} 
                            Add to Cart
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Video Overlay Modal */}
        {isVideoModalOpen && (
            <div 
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" 
                onClick={() => setIsVideoModalOpen(false)}
            >
                <div 
                    className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        onClick={() => setIsVideoModalOpen(false)}
                        className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="w-full aspect-video">
                        {/* We use an iframe structure for the embedded video player url */}
                        <iframe 
                            className="w-full h-full"
                            src={`${mediaItems.find(m => m.type === 'video')?.url}?autoplay=1`} 
                            title="Product Video" 
                            frameBorder="0" 
                            allow="autoplay; fullscreen; encrypted-media"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default ProductCard;
