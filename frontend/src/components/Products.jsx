import React, { useState, useEffect } from 'react';
import { ShoppingCart, Eye, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ServiceBookingModal from './products/ServiceBookingModal';

// Import local professional images
import bulletImg from '../assets/bullet_camera.png';
import domeImg from '../assets/dome_camera.png';
import ptzImg from '../assets/ptz_camera.png';

const Products = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [inquiryProduct, setInquiryProduct] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            const pendingAction = sessionStorage.getItem('pendingAction');
            if (pendingAction === 'bookNow') {
                const pendingProductStr = sessionStorage.getItem('pendingProduct');
                if (pendingProductStr) {
                    try {
                        const product = JSON.parse(pendingProductStr);
                        const returnUrl = sessionStorage.getItem('returnUrl');
                        if (returnUrl === window.location.pathname + window.location.search) {
                            setInquiryProduct(product);
                            sessionStorage.removeItem('pendingAction');
                            sessionStorage.removeItem('pendingProduct');
                            sessionStorage.removeItem('returnUrl');
                        }
                    } catch (e) {
                        console.error('Failed to parse pending product', e);
                    }
                }
            }
        }
    }, [isAuthenticated]);
    const products = [
        {
            name: '4K Dome CCTV Camera',
            price: '₹7,499',
            rating: 4.8,
            specs: ['4K Resolution', 'Night Vision 30m', 'Vandal-proof', 'IP67 Weatherproof'],
            image: domeImg
        },
        {
            name: 'Smart Bullet Camera',
            price: '₹9,899',
            rating: 4.9,
            specs: ['1080p HD', 'Motion Detection', 'Built-in Mic', 'Outdoor Ready'],
            image: bulletImg
        },
        {
            name: '360° PTZ Camera',
            price: '₹20,799',
            rating: 5.0,
            specs: ['36x Optical Zoom', 'Auto-tracking', 'Starlight Tech', 'Pan/Tilt/Zoom'],
            image: ptzImg
        },
        {
            name: '8-Channel DVR System',
            price: '₹16,599',
            rating: 4.7,
            specs: ['1TB HDD Included', 'H.265+ Compression', 'Mobile Access', 'HDMI/VGA Output'],
            image: bulletImg
        },
        {
            name: 'Network Video Recorder (NVR)',
            price: '₹24,899',
            rating: 4.9,
            specs: ['16 Channels', 'PoE Support', '4K Output', 'Intelligent Search'],
            image: domeImg
        },
        {
            name: 'Wireless Battery Camera',
            price: '₹12,399',
            rating: 4.8,
            specs: ['100% Wire-free', 'Solar Compatible', '2-Way Audio', 'Cloud Storage'],
            image: ptzImg
        }
    ];

    return (
        <section id="products" className="py-20 bg-gray-50 border-t border-gray-100">
            <div className="container mx-auto px-4 md:px-8">

                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div className="max-w-2xl">
                        <span className="text-red-700 font-bold uppercase tracking-wider text-sm mb-2 block">Security Store</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0b2239] mb-4">Featured Products</h2>
                        <div className="h-1 w-20 bg-red-700 rounded"></div>
                    </div>
                    <Link to="/products" className="hidden md:flex items-center text-red-700 font-medium hover:text-[#0b2239] transition-colors mt-6 md:mt-0 pb-2">
                        View All Products &rarr;
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product, idx) => (
                        <div key={idx} className="bg-white rounded-lg border border-gray-100 overflow-hidden group custom-shadow flex flex-col h-full">
                            {/* Product Image */}
                            <div className="relative h-56 bg-white overflow-hidden p-6 border-b border-gray-50 flex items-center justify-center">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="max-h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
                                />

                                {/* Top-Right Corner Actions (Consistent with main listing) */}
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300 flex flex-col gap-2 z-20">
                                    <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-red-700 shadow-lg transition-colors" title="Quick View">
                                        <Eye size={16} />
                                    </button>
                                    <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-red-700 shadow-lg transition-colors" title="Add to Cart">
                                        <ShoppingCart size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="p-6 flex-grow flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-[#0b2239] leading-tight flex-1 mr-4 hover:text-red-700 cursor-pointer">{product.name}</h3>
                                    <div className="flex items-center space-x-1 text-amber-500 text-sm">
                                        <Star size={14} fill="currentColor" />
                                        <span className="font-medium">{product.rating}</span>
                                    </div>
                                </div>

                                <p className="text-2xl font-bold text-red-700 mb-4">{product.price}</p>

                                <ul className="text-sm text-gray-500 mb-6 space-y-2 flex-grow">
                                    {product.specs.map((spec, sIdx) => (
                                        <li key={sIdx} className="flex items-center before:content-[''] before:w-1.5 before:h-1.5 before:bg-red-400 before:rounded-full before:mr-2">
                                            {spec}
                                        </li>
                                    ))}
                                </ul>

                                <div className="grid grid-cols-2 gap-3 mt-auto">
                                    <button className="border border-red-700 text-red-700 hover:bg-red-50 py-2 rounded font-medium transition-colors text-sm text-center">
                                        View Details
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (!isAuthenticated) {
                                                sessionStorage.setItem('pendingAction', 'bookNow');
                                                sessionStorage.setItem('returnUrl', window.location.pathname + window.location.search);
                                                sessionStorage.setItem('pendingProduct', JSON.stringify(product));
                                                navigate('/signup');
                                            }
                                            else setInquiryProduct(product);
                                        }}
                                        className="bg-[#0b2239] hover:bg-black text-white py-2 rounded font-medium shadow-sm transition-colors text-sm flex items-center justify-center"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 text-center md:hidden">
                    <Link to="/products" className="bg-[#0b2239] text-white px-8 py-3 rounded font-medium shadow inline-block">
                        View All Products
                    </Link>
                </div>

            </div>

            {/* Service Booking Modal */}
            {inquiryProduct && (
                <ServiceBookingModal
                    product={inquiryProduct}
                    onClose={() => setInquiryProduct(null)}
                />
            )}
        </section>
    );
};

export default Products;
