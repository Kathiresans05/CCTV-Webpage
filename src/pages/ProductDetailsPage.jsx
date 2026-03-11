import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, ChevronRight, CheckCircle2, Truck, ShieldCheck, PenTool, Smartphone, PlayCircle } from 'lucide-react';
import ServiceBookingModal from '../components/products/ServiceBookingModal';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`);
                const data = await res.json();
                if (data.success) {
                    setProduct(data.data);
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
        window.scrollTo(0, 0);
    }, [id]);

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

    return (
        <div className="min-h-screen bg-[#F5F7FA] pb-24">
            {/* Header/Breadcrumb Area */}
            <div className="bg-[#0b0f1a] pt-28 pb-16 relative overflow-hidden">
                <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 line-clamp-2">{product.name}</h1>
                    <div className="mt-3">
                        <nav className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
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
                    
                    {/* Left Column: Image Area */}
                    <div className="lg:w-1/2 p-8 md:p-12 bg-gray-50 flex items-center justify-center relative border-b lg:border-b-0 lg:border-r border-gray-100">
                        <div className="absolute top-4 left-4 bg-primary-red text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                            {product.category}
                        </div>
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="max-h-[400px] w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    {/* Right Column: Key Info & Overview */}
                    <div className="lg:w-1/2 p-8 md:p-12 flex flex-col">
                        <div className="mb-2 uppercase text-xs font-bold text-gray-400 tracking-widest">{product.brand} • SKU: {product.sku}</div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{product.name}</h2>
                        
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="text-3xl font-extrabold text-[#B91C1C]">₹{product.price.toLocaleString('en-IN')}</div>
                            <div className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                                {product.status === 'instock' ? 'In Stock' : product.status}
                            </div>
                        </div>

                        <p className="text-gray-600 leading-relaxed mb-8">
                            {product.description}
                        </p>

                        <div className="mt-auto">
                            <button 
                                onClick={() => setIsBookingModalOpen(true)}
                                className="w-full bg-[#0b0f1a] hover:bg-black text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-black/20 flex justify-center items-center group"
                            >
                                Book Installation Now
                                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center">
                                <ShieldCheck size={14} className="mr-1 text-green-500" /> Secure checkout & verified installers
                            </p>
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
                                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full uppercase tracking-wider">4K Product Reveal</span>
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
                        <p className="text-sm text-gray-500">24-48 hours dispatch for quick security setup.</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 bg-red-50 text-primary-red rounded-full flex items-center justify-center mb-4">
                            <ShieldCheck size={24} />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Official Warranty</h4>
                        <p className="text-sm text-gray-500">Minimum 1-year brand warranty on all products.</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 bg-red-50 text-primary-red rounded-full flex items-center justify-center mb-4">
                            <PenTool size={24} />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Expert Installation</h4>
                        <p className="text-sm text-gray-500">Professional setup by verified technicians.</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 bg-red-50 text-primary-red rounded-full flex items-center justify-center mb-4">
                            <Smartphone size={24} />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Mobile Monitoring</h4>
                        <p className="text-sm text-gray-500">Access live feeds securely via your smartphone.</p>
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

