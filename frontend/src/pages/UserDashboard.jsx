import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
    User, Package, Heart, LogOut, Settings,
    LayoutDashboard, Trash2, ShoppingCart, Star,
    ArrowRight, Inbox, Loader2, ShieldCheck
} from 'lucide-react';
import MyBookings from './MyBookings';
import BulkInquiryModal from '../components/products/BulkInquiryModal';

// Image map: server sends a key, frontend resolves the asset
import bulletImg from '../assets/bullet_camera.png';
import domeImg from '../assets/dome_camera.png';
import ptzImg from '../assets/ptz_camera.png';

const IMAGE_MAP = {
    bullet_camera: bulletImg,
    dome_camera: domeImg,
    ptz_camera: ptzImg,
};


const UserDashboard = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Sync activeTab with URL 'tab' param
    const currentTab = searchParams.get('tab') || 'dashboard';
    const [activeTab, setActiveTab] = useState(currentTab);

    // Wishlist fetching state
    const [allProducts, setAllProducts] = useState([]);
    const [wishlistIds, setWishlistIds] = useState([]);
    const [loadingWishlist, setLoadingWishlist] = useState(false);

    // Cart fetching state
    const [cartItems, setCartItems] = useState([]);
    const [loadingCart, setLoadingCart] = useState(false);
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showInquiryModal, setShowInquiryModal] = useState(false);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId });
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // ── Cart & Wishlist Logic ───────────────────────────────────────────
    useEffect(() => {
        if (!user?.email) return;

        const fetchData = async () => {
            if (activeTab === 'wishlist') setLoadingWishlist(true);
            if (activeTab === 'cart') setLoadingCart(true);

            try {
                // Fetch all products first for mapping
                const prodRes = await fetch('/api/products');
                const prodData = await prodRes.json();
                if (prodData.success) setAllProducts(prodData.data);

                if (activeTab === 'wishlist') {
                    const wishRes = await fetch(`/api/wishlist?email=${user.email}`);
                    const wishData = await wishRes.json();
                    if (wishData.success) setWishlistIds(wishData.data.map(item => item.productId));
                }

                if (activeTab === 'cart') {
                    const cartRes = await fetch(`/api/cart?email=${user.email}`);
                    const cartData = await cartRes.json();
                    if (cartData.success) setCartItems(cartData.data);
                }
            } catch (err) {
                console.error(`Failed to load ${activeTab} data`, err);
            } finally {
                setLoadingWishlist(false);
                setLoadingCart(false);
            }
        };

        fetchData();
    }, [activeTab, user?.email]);

    const wishlistedProducts = useMemo(() => {
        return allProducts
            .filter(p => wishlistIds.includes(p.id))
            .map(p => ({
                ...p,
                image: IMAGE_MAP[p.image] || bulletImg
            }));
    }, [allProducts, wishlistIds]);

    const mappedCartItems = useMemo(() => {
        return cartItems.map(item => {
            const product = allProducts.find(p => p.id === item.productId);
            return {
                ...item,
                productDetails: product ? {
                    ...product,
                    image: IMAGE_MAP[product.image] || bulletImg
                } : null
            };
        }).filter(item => item.productDetails !== null);
    }, [allProducts, cartItems]);

    const removeFromWishlist = async (productId) => {
        try {
            const res = await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, productId })
            });
            const data = await res.json();
            if (data.success) {
                setWishlistIds(prev => prev.filter(id => id !== productId));
            }
        } catch (err) {
            console.error('Remove failed', err);
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, productId, action: 'remove' })
            });
            const data = await res.json();
            if (data.success) {
                setCartItems(prev => prev.filter(item => item.productId !== productId));
            }
        } catch (err) {
            console.error('Cart remove failed', err);
        }
    };

    const handleCheckout = async () => {
        setIsProcessing(true);
        try {
            // Simulate a small delay for "Processing" feel
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Clear cart items one by one or via a bulk action if supported
            // Assuming we just clear the local state and notify the user for this demo
            // In a real app, this would be a single POST to /api/checkout
            for (const item of cartItems) {
                await fetch('/api/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email, productId: item.productId, action: 'remove' })
                });
            }

            setCartItems([]);
            setCheckoutSuccess(true);
            setShowInquiryModal(false);
        } catch (err) {
            console.error('Checkout failed', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const onInquirySuccess = () => {
        setCartItems([]);
        setCheckoutSuccess(true);
        setShowInquiryModal(false);
    };

    const TABS = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'cart', label: 'My Cart', icon: ShoppingCart },
        { id: 'bookings', label: 'My Bookings', icon: Package },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
        { id: 'profile', label: 'Profile Settings', icon: User },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-3xl font-bold text-primary-navy tracking-tight mb-2">Welcome back, {user?.name}!</h2>
                        <p className="text-gray-500 mb-10 font-medium">Here is an overview of your account activity.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 group shadow-sm hover:shadow-md transition-all">
                                <Package size={28} className="text-primary-red mb-4" />
                                <h3 className="text-lg font-bold text-gray-800">Bookings</h3>
                                <p className="text-gray-500 text-xs mt-1 leading-relaxed">Track your recent bookings, service appointments, and hardware orders.</p>
                                <button onClick={() => handleTabChange('bookings')} className="mt-6 text-primary-red font-bold text-xs flex items-center gap-1.5 group-hover:gap-2 transition-all">
                                    View Bookings <ArrowRight size={14} />
                                </button>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 group shadow-sm hover:shadow-md transition-all">
                                <Heart size={28} className="text-red-500 mb-4" />
                                <h3 className="text-lg font-bold text-gray-800">Wishlist</h3>
                                <p className="text-gray-500 text-xs mt-1 leading-relaxed">Products you have saved for later. Compare and plan your security setup.</p>
                                <button onClick={() => handleTabChange('wishlist')} className="mt-6 text-red-600 font-bold text-xs flex items-center gap-1.5 group-hover:gap-2 transition-all">
                                    View Wishlist <ArrowRight size={14} />
                                </button>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 group shadow-sm hover:shadow-md transition-all">
                                <User size={28} className="text-gray-600 mb-4" />
                                <h3 className="text-lg font-bold text-gray-800">Profile</h3>
                                <p className="text-gray-500 text-xs mt-1 leading-relaxed">Manage your account details, contact information, and security settings.</p>
                                <button onClick={() => handleTabChange('profile')} className="mt-6 text-gray-600 font-bold text-xs flex items-center gap-1.5 group-hover:gap-2 transition-all">
                                    Edit Profile <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'bookings':
                return (
                    <div className="bg-white p-2 lg:p-4 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <MyBookings isDashboardComponent={true} />
                    </div>
                );

            case 'cart':
                if (checkoutSuccess) {
                    return (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden py-24 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                <ShieldCheck size={40} />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Thank you for choosing SecureVision. Our technical team will contact you shortly to schedule your installation.</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleTabChange('bookings')}
                                    className="bg-[#0b0f1a] text-white py-3 px-8 rounded-xl font-bold text-sm hover:bg-black transition-colors"
                                >
                                    Track Installation
                                </button>
                                <button
                                    onClick={() => setCheckoutSuccess(false)}
                                    className="border border-gray-200 text-gray-700 py-3 px-8 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-primary-navy">Shopping Cart {isProcessing && <span className="ml-2 text-xs text-red-600 animate-pulse font-bold">(Processing...)</span>}</h2>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">Review your security assets before checkout</p>
                            </div>
                            {mappedCartItems.length > 0 && (
                                <div className="text-right">
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Subtotal</p>
                                    <p className="text-2xl font-bold text-[#800000]">₹{mappedCartItems.reduce((acc, item) => acc + (item.productDetails.price * (item.quantity || 1)), 0).toLocaleString('en-IN')}</p>
                                </div>
                            )}
                        </div>

                        {loadingCart ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <Loader2 size={40} className="text-red-600 animate-spin mb-3" />
                                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Loading your cart...</p>
                            </div>
                        ) : mappedCartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <ShoppingCart size={48} className="text-gray-200 mb-4" />
                                <h3 className="text-lg font-bold text-gray-700 mb-2">Your cart is empty</h3>
                                <p className="text-gray-500 mb-8 max-w-xs mx-auto">Ready to secure your space? Choose from our premium surveillance hardware.</p>
                                <Link to="/products" className="bg-[#800000] text-white py-3 px-8 rounded-full font-bold text-sm hover:bg-black transition-colors shadow-lg shadow-red-900/10">
                                    Explore Hardware
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {mappedCartItems.map(item => (
                                    <div key={item.id} className="p-6 flex items-center gap-6 hover:bg-gray-50/50 transition-colors">
                                        <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 p-3">
                                            <img src={item.productDetails.image} alt={item.productDetails.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-[15px]">{item.productDetails.name}</h4>
                                                    <p className="text-xs text-gray-500 mt-0.5">Quantity: {item.quantity || 1}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-primary-navy">₹{(item.productDetails.price * (item.quantity || 1)).toLocaleString('en-IN')}</p>
                                                    <button
                                                        onClick={() => removeFromCart(item.productId)}
                                                        className="text-[10px] text-red-500 font-bold uppercase tracking-widest hover:underline mt-1"
                                                    >
                                                        Remove Item
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Secured & Ready</span>
                                                </div>
                                                <button className="text-[#800000] text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                                    Checkout Now <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="p-8 bg-gray-50/50 flex justify-end">
                                    <button
                                        onClick={() => setShowInquiryModal(true)}
                                        disabled={isProcessing}
                                        className="bg-[#0b0f1a] text-white px-10 py-4 rounded-full font-bold text-[15px] hover:bg-black transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        )}

                        {showInquiryModal && (
                            <BulkInquiryModal
                                items={mappedCartItems}
                                user={user}
                                onClose={() => setShowInquiryModal(false)}
                                onSuccess={onInquirySuccess}
                            />
                        )}
                    </div>
                );


            case 'wishlist':
                return (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-primary-navy">My Wishlist</h2>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">Items you've saved for later</p>
                        </div>

                        {loadingWishlist ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <Loader2 size={40} className="text-red-600 animate-spin mb-3" />
                                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Loading favorites...</p>
                            </div>
                        ) : wishlistedProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <Heart size={48} className="text-gray-200 mb-4" />
                                <h3 className="text-lg font-bold text-gray-700 mb-2">Your wishlist is empty</h3>
                                <p className="text-gray-500 mb-8 max-w-xs mx-auto">Browse our collection of high-end security solutions and save your favorites here.</p>
                                <Link to="/products" className="bg-[#B91C1C] text-white py-3 px-8 rounded-full font-bold text-sm hover:bg-red-800 transition-colors shadow-lg shadow-red-900/10">
                                    Browse Products
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {wishlistedProducts.map(product => (
                                    <div key={product.id} className="p-6 flex items-center gap-6 hover:bg-gray-50/50 transition-colors">
                                        <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 p-3">
                                            <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-[15px]">{product.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex items-center text-orange-400">
                                                            <Star size={12} fill="currentColor" />
                                                            <span className="text-xs font-bold text-gray-500 ml-1">{product.rating}</span>
                                                        </div>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="text-xs font-bold text-green-600 uppercase tracking-wider">In Stock</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-[#B91C1C]">₹{product.price.toLocaleString('en-IN')}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">MSRP: ₹{(product.price * 1.2).toLocaleString('en-IN')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 mt-4">
                                                <Link
                                                    to="/products"
                                                    className="inline-flex items-center gap-2 bg-[#0b0f1a] text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-black transition-colors"
                                                >
                                                    <ShoppingCart size={14} />
                                                    View Product
                                                </Link>
                                                <button
                                                    onClick={() => removeFromWishlist(product.id)}
                                                    className="inline-flex items-center gap-2 text-gray-400 hover:text-red-600 text-xs font-bold transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'profile':
                return (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-50 mb-6">
                            <h2 className="text-xl font-bold text-primary-navy">Profile Settings</h2>
                        </div>
                        <div className="space-y-6 max-w-lg p-4">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
                                    <User size={32} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{user?.name}</h4>
                                    <p className="text-sm text-gray-500">{user?.email}</p>
                                    <button className="text-[#B91C1C] text-[10px] font-bold uppercase tracking-widest mt-1 hover:underline">Change Avatar</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                                    <input type="text" defaultValue={user?.name} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 font-medium focus:outline-none" readOnly />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                                    <input type="email" defaultValue={user?.email} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 font-medium focus:outline-none" readOnly />
                                </div>
                            </div>
                            <div className="pt-6 mt-6 border-t border-gray-50">
                                <p className="text-xs text-gray-400 italic">Advanced profile controls are being finalized for the next security update.</p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white min-h-screen flex flex-col lg:flex-row font-sans">

            {/* Sidebar navigation - Full height, flush to edge */}
            <div className="w-full lg:w-[280px] flex-shrink-0">
                <div className="bg-[#0F172A] shadow-xl overflow-y-auto sticky top-0 flex flex-col pt-8 pb-4 h-screen z-10 custom-scrollbar border-r border-slate-800/50">

                    <div className="px-5 mb-4 px-6 pt-2">
                        <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-4">Main Menu</h4>
                        <nav className="space-y-1">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition-all text-[14px] font-semibold
                                                    ${isActive
                                                ? 'bg-[#B91C1C] text-white shadow-lg shadow-red-900/20'
                                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                            }
                                                `}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500'} strokeWidth={isActive ? 2.5 : 2} />
                                            <span className="tracking-wide">{tab.label}</span>
                                        </div>
                                        {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Pushed to bottom User snippet */}
                    <div className="mt-auto px-4 mt-8 pb-4">
                        <div className="bg-[#1C3643] rounded-xl p-3 flex items-center justify-between relative group cursor-pointer hover:bg-[#162a34] transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-[#252F3D] text-[#D0E5ED] rounded-lg border border-[#3A4556] flex items-center justify-center font-bold text-lg">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#1C3643]"></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-bold text-sm leading-tight group-hover:text-gray-100">{user?.name}</span>
                                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Customer</span>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                                className="text-slate-500 hover:text-red-400 p-2 transition-colors"
                                title="Logout"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-x-hidden">


                <div className="px-8 lg:px-12 pt-8 lg:pt-12 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                        <Link to="/" className="hover:text-primary-red transition-colors">Home</Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-primary-red">User Dashboard</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-8 bg-[#B91C1C] rounded-full"></div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-[#0F172A] tracking-tight leading-none">
                                    Account <span className="text-primary-red">Dashboard</span>
                                </h1>
                            </div>
                            <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-2xl">
                                Welcome back, <span className="text-[#0F172A] font-bold">{user?.name}</span>. Manage your security assets, track orders, and oversee your facility's protection.
                            </p>
                        </div>
                        <div className="hidden lg:flex bg-white p-4 rounded-2xl border border-gray-100 shadow-sm px-6 items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                <Star size={20} fill="currentColor" />
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Security Status</div>
                                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                    Live & Protected
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 lg:px-12 pb-12 overflow-y-auto">
                    {renderTabContent()}
                </div>

            </div>
        </div>
    );
};

export default UserDashboard;

