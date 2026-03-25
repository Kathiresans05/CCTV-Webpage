import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Home, ChevronRight, CheckCircle2, Truck, ShieldCheck, PenTool, Smartphone, PlayCircle, Star, MessageSquare } from 'lucide-react';
import ServiceBookingModal from '../components/products/ServiceBookingModal';
import { useAuth } from '../context/AuthContext';

// Import newly generated assets for the gallery
import bullet1 from '../assets/bullet_1.png';
import bullet2 from '../assets/bullet_2.png';
import bullet3 from '../assets/bullet_3.png';
import bullet4 from '../assets/bullet_4.png';
import dome1 from '../assets/dome_1.png';
import dome2 from '../assets/dome_2.png';
import dome3 from '../assets/dome_3.png';
import dome4 from '../assets/dome_4.png';
import bulletDefault from '../assets/bullet_camera.png';
import domeDefault from '../assets/dome_camera.png';
import ptzDefault from '../assets/ptz_camera.png';

const IMAGE_MAP = {
    bullet_1: bullet1, bullet_2: bullet2, bullet_3: bullet3, bullet_4: bullet4,
    dome_1: dome1, dome_2: dome2, dome_3: dome3, dome_4: dome4,
    bullet_camera: bulletDefault, dome_camera: domeDefault, ptz_camera: ptzDefault
};

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [isZoomed, setIsZoomed] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsBookingModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isAuthenticated && product) {
            const pendingAction = sessionStorage.getItem('pendingAction');
            if (pendingAction === 'bookNow') {
                const returnUrl = sessionStorage.getItem('returnUrl');
                if (returnUrl === window.location.pathname + window.location.search) {
                    setIsBookingModalOpen(true);
                    sessionStorage.removeItem('pendingAction');
                    sessionStorage.removeItem('pendingProduct');
                    sessionStorage.removeItem('returnUrl');
                }
            }
        }
    }, [isAuthenticated, product]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`);
                const data = await res.json();
                if (data.success) {
                    const resolvedProduct = {
                        ...data.data,
                        image: (data.data.image && (data.data.image.startsWith('http') || data.data.image.startsWith('/uploads'))) 
                            ? data.data.image 
                            : (IMAGE_MAP[data.data.image] || bulletDefault),
                        productImages: (data.data.productImages || []).map(img => 
                            (img && (img.startsWith('http') || img.startsWith('/uploads'))) 
                                ? img 
                                : (IMAGE_MAP[img] || img)
                        )
                    };
                    setProduct(resolvedProduct);
                    setActiveImageIndex(0);
                } else {
                    setError('Product not found');
                }
            } catch (err) {
                setError('Failed to fetch product details');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
        
        const fetchReviews = async () => {
            try {
                const res = await fetch(`/api/reviews/product/${id}`);
                const data = await res.json();
                if (data.success) {
                    setReviews(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch reviews', err);
            } finally {
                setReviewsLoading(false);
            }
        };
        fetchReviews();

        window.scrollTo(0, 0);
    }, [id]);

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left - window.scrollX) / width) * 100;
        const y = ((e.pageY - top - window.scrollY) / height) * 100;
        setZoomPosition({ x, y });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Product not found'}</h2>
                <Link to="/products" className="text-primary-red hover:underline flex items-center">
                    <ChevronRight size={16} className="rotate-180 mr-1" /> Back to Products
                </Link>
            </div>
        );
    }

    const images = (product.productImages && product.productImages.length > 0 
        ? product.productImages 
        : [product.image]).filter((url, index, self) => self.indexOf(url) === index);

    // Prepare consolidated media items
    const mediaItems = images.map(img => ({ type: 'image', url: img }));
    if (product.videoUrl) {
        const resolvedPoster = (product.videoPoster && (product.videoPoster.startsWith('http') || product.videoPoster.startsWith('/uploads')))
            ? product.videoPoster
            : (IMAGE_MAP[product.videoPoster] || images[0]);
            
        mediaItems.push({ 
            type: 'video', 
            url: product.videoUrl, 
            poster: resolvedPoster 
        });
    }

    const nextMedia = () => setActiveImageIndex((prev) => (prev + 1) % mediaItems.length);
    const prevMedia = () => setActiveImageIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);

    return (
        <div className="min-h-screen bg-[#F5F7FA] pb-24">
            {/* Header/Breadcrumb Area */}
            <div className="bg-[#0b0f1a] pt-28 pb-16 relative overflow-hidden">
                <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 line-clamp-2">{product.name}</h1>
                    <div className="mt-3">
                        <nav className="flex items-center justify-center space-x-2 text-gray-400 text-[14px]">
                            <Link to="/" className="hover:text-red-500 transition-colors flex items-center">
                                <Home size={14} className="mr-1" /> Home
                            </Link>
                            <ChevronRight size={12} />
                            <Link to="/products" className="hover:text-red-500 transition-colors">Products</Link>
                            <ChevronRight size={12} />
                            <span className="text-white font-medium truncate max-w-[200px]">{product.name}</span>
                        </nav>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-8 -mt-6 relative z-20">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col lg:flex-row">
                    
                    {/* Left Column: Image Gallery Area */}
                    <div className="lg:w-3/5 p-6 md:p-10 bg-white flex flex-col md:flex-row gap-6 border-b lg:border-b-0 lg:border-r border-gray-100">
                        
                        {/* Thumbnails list (Amazon style - Vertical on Desktop) */}
                        <div className="flex md:flex-col gap-3 order-2 md:order-1 overflow-x-auto md:overflow-y-auto scrollbar-hide py-1 md:pr-2 max-h-[500px]">
                            {mediaItems.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={`relative w-16 h-16 md:w-20 md:h-24 rounded-xl overflow-hidden border-2 transition-all p-1 bg-gray-50 flex-shrink-0 ${
                                        activeImageIndex === idx ? 'border-primary-red ring-4 ring-red-50' : 'border-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                    {item.type === 'video' ? (
                                        <div className="w-full h-full relative">
                                            <img src={item.poster} alt="video thumb" className="w-full h-full object-contain opacity-60" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <PlayCircle size={24} className="text-white drop-shadow-md" />
                                            </div>
                                        </div>
                                    ) : (
                                        <img src={item.url} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-contain" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Main Preview */}
                        <div className="flex-1 order-1 md:order-2 relative group flex items-center justify-center bg-gray-50 rounded-2xl overflow-hidden min-h-[400px] md:min-h-[500px]">
                            <div className="absolute top-4 left-4 z-10 bg-primary-red text-white text-[14px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                {product.category}
                            </div>
                            
                            {/* Navigation Arrows */}
                            {mediaItems.length > 1 && (
                                <>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); prevMedia(); }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    >
                                        <ChevronRight size={20} className="rotate-180" />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}

                            {mediaItems[activeImageIndex].type === 'video' ? (
                                <div className="w-full h-full flex items-center justify-center bg-black overflow-hidden shadow-inner">
                                    <iframe 
                                        className="w-full h-full max-h-[500px] aspect-video"
                                        src={`${mediaItems[activeImageIndex].url}?autoplay=1&mute=1&controls=1&rel=0`}
                                        title="Product Video" 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ) : (
                                <div 
                                    className="relative w-full h-full flex items-center justify-center cursor-crosshair overflow-hidden"
                                    onMouseEnter={() => setIsZoomed(true)}
                                    onMouseLeave={() => setIsZoomed(false)}
                                    onMouseMove={handleMouseMove}
                                >
                                    <img 
                                        src={mediaItems[activeImageIndex].url} 
                                        alt={product.name} 
                                        className={`max-h-[450px] w-auto object-contain transition-transform duration-300 ${isZoomed ? 'opacity-0' : 'opacity-100'}`}
                                    />
                                    
                                    {isZoomed && (
                                        <div 
                                            className="absolute inset-0 pointer-events-none z-20"
                                            style={{
                                                backgroundImage: `url(${mediaItems[activeImageIndex].url})`,
                                                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                                backgroundSize: '250%',
                                                backgroundRepeat: 'no-repeat'
                                            }}
                                        ></div>
                                    )}
                                    
                                    {/* Zoom Instructions */}
                                    {!isZoomed && (
                                        <div className="absolute bottom-4 right-4 bg-black/10 backdrop-blur-md px-3 py-1 rounded-lg text-[14px] text-gray-500 font-medium pointer-events-none">
                                            Roll over image to zoom
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Key Info & Overview */}
                    <div className="lg:w-2/5 p-8 md:p-12 flex flex-col bg-white">
                        <div className="mb-2 uppercase text-[14px] font-bold text-gray-400 tracking-widest">{product.brand} • SKU: {product.sku}</div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h2>
                        
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="text-4xl font-black text-primary-navy">₹{product.price?.toLocaleString('en-IN') || '0'}</div>
                            <div className="flex flex-col">
                                <div className="text-[14px] font-bold text-green-600 uppercase tracking-widest">Available Now</div>
                                <div className="text-[14px] text-gray-400">Inclusive of all taxes</div>
                            </div>
                        </div>

                        <div className="space-y-6 mb-10">
                            <div>
                                <h4 className="text-[14px] font-bold text-gray-400 uppercase tracking-widest mb-3">Product Description</h4>
                                <p className="text-gray-600 text-[14px] leading-relaxed">
                                    {product.description || 'No description available.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <p className="text-[14px] * 1.2 font-bold text-gray-400 uppercase">Status</p>
                                    <p className="text-[14px] font-bold text-green-700 mt-1">{product.status === 'instock' ? 'In Stock' : (product.status || 'Checking...')}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <p className="text-[14px] * 1.2 font-bold text-gray-400 uppercase">Warranty</p>
                                    <p className="text-[14px] font-bold text-primary-navy mt-1">1 Year Brand</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto space-y-4">
                            <button 
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        sessionStorage.setItem('pendingAction', 'bookNow');
                                        sessionStorage.setItem('returnUrl', window.location.pathname + window.location.search);
                                        sessionStorage.setItem('pendingProduct', JSON.stringify(product));
                                        window.dispatchEvent(new Event('openAuthModal'));
                                    } else {
                                        setIsBookingModalOpen(true);
                                    }
                                }}
                                className="w-full bg-primary-red hover:bg-red-700 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg transform hover:-translate-y-1 flex justify-center items-center group"
                            >
                                Book Installation Now
                                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <div className="flex items-center justify-between px-2 text-[14px] font-bold text-gray-400 uppercase tracking-widest">
                                <span className="flex items-center"><ShieldCheck size={14} className="mr-1 text-green-500" /> Secure Checkout</span>
                                <span className="flex items-center"><Truck size={14} className="mr-1 text-blue-500" /> Fast Delivery</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Video Overview Section */}
                <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex flex-col md:flex-row gap-12">
                        {/* Video Container */}
                        <div className="w-full md:w-3/5 lg:w-2/3">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 border-l-4 border-primary-red pl-4">Product Overview</h3>
                                <span className="text-[14px] font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full uppercase tracking-wider">4K Product Reveal</span>
                            </div>
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 shadow-lg group">
                                <iframe 
                                    className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
                                    src={product.videoUrl} 
                                    title="Product Video" 
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>

                        {/* Specifications List */}
                        <div className="w-full md:w-2/5 lg:w-1/3 flex flex-col justify-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Key Specifications</h3>
                            <ul className="space-y-4">
                                {product.specs?.map((spec, index) => (
                                    <li key={index} className="flex items-start group">
                                        <div className="mr-3 bg-green-50 p-1 rounded-full text-green-500 flex-shrink-0">
                                            <CheckCircle2 size={18} />
                                        </div>
                                        <span className="text-gray-700 font-medium">{spec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 bg-red-50 text-primary-red rounded-full flex items-center justify-center mb-4">
                            <Truck size={24} />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Fast Delivery</h4>
                        <p className="text-[14px] text-gray-500">24-48 hours dispatch for quick security setup.</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 bg-red-50 text-primary-red rounded-full flex items-center justify-center mb-4">
                            <ShieldCheck size={24} />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Official Warranty</h4>
                        <p className="text-[14px] text-gray-500">Minimum 1-year brand warranty on all products.</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 bg-red-50 text-primary-red rounded-full flex items-center justify-center mb-4">
                            <PenTool size={24} />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Expert Installation</h4>
                        <p className="text-[14px] text-gray-500">Professional setup by verified technicians.</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 bg-red-50 text-primary-red rounded-full flex items-center justify-center mb-4">
                            <Smartphone size={24} />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Mobile Monitoring</h4>
                        <p className="text-[14px] text-gray-500">Access live feeds securely via your smartphone.</p>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-gray-50/50 to-white">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <MessageSquare className="text-primary-red" />
                                Customer Reviews
                            </h3>
                            <p className="text-gray-500 text-[14px] mt-1 font-medium">What our verified owners are saying about this {product.brand} product</p>
                        </div>

                        {product.numReviews > 0 && (
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="text-4xl font-black text-gray-900">{product.rating?.toFixed(1)}</div>
                                    <div className="flex text-amber-400 mt-1">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} size={14} fill={s <= Math.round(product.rating) ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                    <p className="text-[14px] font-black text-gray-400 uppercase tracking-widest mt-2">{product.numReviews} Reviews</p>
                                </div>
                                <div className="h-12 w-[1px] bg-gray-100 hidden md:block" />
                                <div className="space-y-1.5 hidden md:block">
                                    {[5, 4, 3, 2, 1].map(r => {
                                        const count = reviews.filter(rev => rev.rating === r).length;
                                        const percent = product.numReviews > 0 ? (count / product.numReviews) * 100 : 0;
                                        return (
                                            <div key={r} className="flex items-center gap-2">
                                                <span className="text-[14px] font-bold text-gray-400 w-2">{r}</span>
                                                <Star size={10} className="text-amber-400 fill-amber-400" />
                                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber-400" style={{ width: `${percent}%` }} />
                                                </div>
                                                <span className="text-[14px] font-bold text-gray-400 w-6">{Math.round(percent)}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-8">
                        {reviewsLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red"></div>
                            </div>
                        ) : reviews.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {reviews.map((review) => (
                                    <div key={review._id} className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-gray-200 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary-red/10 text-primary-red flex items-center justify-center font-bold text-[14px]">
                                                    {review.user?.name?.charAt(0) || review.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-[14px] leading-none">{review.user?.name || review.name}</h4>
                                                    <p className="text-[14px] text-gray-400 font-bold uppercase tracking-tight mt-1">Verified Purchase</p>
                                                </div>
                                            </div>
                                            <div className="text-[14px] text-gray-400 font-medium italic">
                                                {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>
                                        
                                        <div className="flex text-amber-400 mb-3">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} size={14} fill={s <= review.rating ? "currentColor" : "none"} />
                                            ))}
                                        </div>
                                        
                                        <p className="text-gray-600 text-[14px] leading-relaxed font-serif italic">
                                            "{review.comment}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <MessageSquare size={48} className="text-gray-100 mx-auto mb-4" />
                                <h4 className="text-lg font-bold text-gray-300 uppercase tracking-widest">No Reviews Yet</h4>
                                <p className="text-gray-400 text-[14px] mt-2 max-w-sm mx-auto">Be the first to share your experience after your installation is complete!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Booking Modal - only mount when user explicitly clicks Book Now */}
            {isBookingModalOpen && (
                <ServiceBookingModal 
                    product={product} 
                    onClose={() => setIsBookingModalOpen(false)} 
                />
            )}
        </div>
    );
};

export default ProductDetailsPage;

