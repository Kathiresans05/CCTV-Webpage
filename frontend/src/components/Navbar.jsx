import React, { useState, useEffect, useRef } from 'react';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Menu, X, ShieldCheck, LogOut, User as UserIcon, ShoppingCart, Heart, RotateCw, Search, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
    const [tempSearchQuery, setTempSearchQuery] = useState('');
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const accountDropdownRef = useRef(null);

    // Close all overlays on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsAccountDropdownOpen(false);
    }, [location.pathname, location.search]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsMobileMenuOpen(false);
                setIsAccountDropdownOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Outside click for Account Dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
                setIsAccountDropdownOpen(false);
            }
        };

        if (isAccountDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAccountDropdownOpen]);

    const [bookingsCount, setBookingsCount] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch live data when user is logged in
    useEffect(() => {
        const fetchData = async () => {
            if (!isAuthenticated || !user?.email) {
                setBookingsCount(0);
                setCartCount(0);
                setWishlistCount(0);
                return;
            }
            try {
                const headers = { 'Authorization': `Bearer ${user.token}` };
                // Fetch Bookings
                const bookRes = await fetch(`/api/bookings?email=${user.email}`, { headers });
                const bookData = await bookRes.json();
                if (bookData.success) setBookingsCount(bookData.data.length);

                // Fetch Cart
                const cartRes = await fetch(`/api/cart?email=${user.email}`, { headers });
                const cartData = await cartRes.json();
                if (cartData.success) setCartCount(cartData.data.length);

                // Fetch Wishlist
                const wishRes = await fetch(`/api/wishlist?email=${user.email}`, { headers });
                const wishData = await wishRes.json();
                if (wishData.success) setWishlistCount(wishData.data.length);
            } catch (err) {
                console.error('Failed to fetch navbar data', err);
            }
        };

        fetchData(); // Initial fetch

        // Setup event listener for global state updates
        window.addEventListener('cartUpdated', fetchData);
        window.addEventListener('wishlistUpdated', fetchData);

        return () => {
            window.removeEventListener('cartUpdated', fetchData);
            window.removeEventListener('wishlistUpdated', fetchData);
        };
    }, [isAuthenticated, user]);

    const navLinks = [
        { name: 'Home', path: '/', isExternal: false },
        { name: 'About', path: '/about', isExternal: false },
        { name: 'Products', path: '/products', isExternal: false },
        { name: 'Contact', path: '/contact', isExternal: false },
    ];

    const filteredLinks = navLinks.filter(link => !link.protected || isAuthenticated);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            {/* Top Bar */}
            <div className="bg-[#0b0f1a] text-white py-2 px-4 md:px-8 text-sm hidden md:flex justify-between items-center transition-all duration-300">
                <div className="flex space-x-6">
                    <div className="flex items-center space-x-2">
                        <Phone size={14} className="text-red-400" />
                        <span>+1 (800) 123-4567</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Mail size={14} className="text-red-400" />
                        <span>info@securevision.com</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <MapPin size={14} className="text-red-400" />
                        <span>123 Security Ave, NY</span>
                    </div>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="flex space-x-4 border-r border-white/20 pr-6">
                        <a href="#" className="hover:text-red-400 transition-colors"><Facebook size={16} /></a>
                        <a href="#" className="hover:text-red-400 transition-colors"><Twitter size={16} /></a>
                        <a href="#" className="hover:text-red-400 transition-colors"><Instagram size={16} /></a>
                        <a href="#" className="hover:text-red-400 transition-colors"><Linkedin size={16} /></a>
                    </div>

                    {/* Auth Links in Top Bar */}
                    <div className="flex items-center">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 text-white">
                                    <UserIcon size={16} className="text-red-400" />
                                    <span className="font-medium text-xs">{user.name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 text-white/70 hover:text-red-400 text-xs transition-colors"
                                >
                                    <LogOut size={14} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4 text-xs font-medium text-white">
                                <UserIcon size={16} className="text-red-400" />
                                <div className="flex items-center space-x-1">
                                    <Link to="/login" className="hover:text-red-400 transition-colors">Login</Link>
                                    <span className="text-white/20">/</span>
                                    <Link to="/signup" className="hover:text-red-400 transition-colors">Register</Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-[#ffffff] shadow-md py-3' : 'bg-[#ffffff] py-5'}`}>
                <div className="w-full px-4 md:px-8 flex justify-between items-center">

                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <ShieldCheck size={32} className="text-primary-red" />
                        <div className="flex flex-col">
                            <span className="font-bold text-xl text-primary-navy leading-tight">SecureVision</span>
                            <span className="text-xs text-primary-red font-semibold tracking-wider">CCTV SOLUTIONS</span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex space-x-8 items-center">
                        {filteredLinks.map((link) => {
                            // Check if link matches path AND hash if a hash is specified in the link
                            const linkPath = link.path.split('#')[0];
                            const linkHash = link.path.split('#')[1];

                            const isPathActive = location.pathname === linkPath || (linkPath !== '/' && location.pathname.startsWith(linkPath));
                            const isHashActive = !linkHash || location.hash === `#${linkHash}`;
                            const isActive = isPathActive && isHashActive;

                            return link.isExternal ? (
                                <a
                                    key={link.name}
                                    href={link.path}
                                    className={`font-medium text-[15px] transition-colors ${isActive ? 'text-[#800000]' : 'text-gray-700 hover:text-red-700'}`}
                                >
                                    {link.name}
                                </a>
                            ) : (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => {
                                        // Manual scroll if already on the page with this hash
                                        if (linkHash && location.pathname === linkPath && location.hash === `#${linkHash}`) {
                                            const el = document.getElementById(linkHash);
                                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    className={`font-medium text-[15px] transition-colors ${isActive ? 'text-[#800000]' : 'text-gray-700 hover:text-red-700'}`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Side Icons & Toggle */}
                    <div className="flex items-center space-x-6">
                        {/* Action Icons (Desktop) */}
                        <div className="hidden sm:flex items-center space-x-6 text-gray-700">
                            {/* Permanent Pill Search Bar */}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (tempSearchQuery.trim()) {
                                        navigate(`/products?search=${encodeURIComponent(tempSearchQuery.trim())}`);
                                    }
                                }}
                                className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-64 border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all shadow-sm"
                            >
                                <Search size={16} className="text-gray-400 mr-2" strokeWidth={2} />
                                <input
                                    type="text"
                                    value={tempSearchQuery}
                                    onChange={(e) => setTempSearchQuery(e.target.value)}
                                    placeholder="Search products..."
                                    className="bg-transparent border-none focus:ring-0 text-[13px] w-full placeholder-gray-400 font-medium"
                                />
                                {tempSearchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setTempSearchQuery('')}
                                        className="text-gray-400 hover:text-red-600 ml-1"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </form>

                            {/* Wishlist */}
                            <Link
                                to="/dashboard?tab=wishlist"
                                className="relative hover:text-red-600 transition-colors"
                                title="My Wishlist"
                            >
                                <Heart size={22} strokeWidth={1.5} />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>

                            {/* Shopping Cart (Point to Cart tab) */}
                            <Link
                                to="/dashboard?tab=cart"
                                className="relative hover:text-red-600 transition-colors"
                                title="My Cart"
                            >
                                <ShoppingCart size={22} strokeWidth={1.5} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* My Account Dropdown */}
                            <div className="relative" ref={accountDropdownRef}>
                                <button
                                    onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                                    className="flex items-center space-x-1.5 hover:text-red-700 transition-colors py-2 uppercase text-[13px] font-bold tracking-wider"
                                >
                                    <UserIcon size={20} className="text-gray-700" strokeWidth={2} />
                                    <span>My Account</span>
                                </button>

                                {isAccountDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsAccountDropdownOpen(false)}
                                        ></div>
                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            {isAuthenticated ? (
                                                <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Welcome</p>
                                                    <p className="text-gray-900 font-bold text-[15px] truncate">{user.name}</p>
                                                </div>
                                            ) : (
                                                <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                                                    <p className="text-gray-900 font-bold text-[15px]">Hello, Guest</p>
                                                </div>
                                            )}

                                            <div className="py-2">
                                                {isAuthenticated ? (
                                                    <>
                                                        <Link
                                                            to="/dashboard"
                                                            className="flex items-center space-x-3 px-5 py-3 text-[14px] text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors font-medium border-l-2 border-transparent hover:border-red-600"
                                                            onClick={() => setIsAccountDropdownOpen(false)}
                                                        >
                                                            <LayoutDashboard size={18} className="opacity-70" />
                                                            <span>User Dashboard</span>
                                                        </Link>
                                                        {user?.role === 'admin' && (
                                                            <Link
                                                                to="/admin"
                                                                className="flex items-center space-x-3 px-5 py-3 text-[14px] text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors font-medium border-l-2 border-transparent hover:border-red-600"
                                                                onClick={() => setIsAccountDropdownOpen(false)}
                                                            >
                                                                <ShieldCheck size={18} className="opacity-70" />
                                                                <span>Admin Portal</span>
                                                            </Link>
                                                        )}
                                                        <button
                                                            onClick={() => { handleLogout(); setIsAccountDropdownOpen(false); }}
                                                            className="w-full flex items-center space-x-3 px-5 py-3 text-[14px] text-red-600 hover:bg-red-50 transition-colors font-bold border-l-2 border-transparent hover:border-red-600 mt-1"
                                                        >
                                                            <LogOut size={18} />
                                                            <span>Log Out</span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="px-2 py-2 space-y-1">
                                                        <Link
                                                            to="/login"
                                                            className="block w-full text-center py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-bold transition-all"
                                                            onClick={() => setIsAccountDropdownOpen(false)}
                                                        >
                                                            Log In
                                                        </Link>
                                                        <Link
                                                            to="/signup"
                                                            className="block w-full text-center py-2.5 px-4 bg-red-700 hover:bg-red-800 text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-red-500/10"
                                                            onClick={() => setIsAccountDropdownOpen(false)}
                                                        >
                                                            Sign Up
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            className="lg:hidden text-primary-navy"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 w-full bg-[#ffffff] shadow-lg border-t border-gray-100 flex flex-col py-4 px-6 z-40">
                        {filteredLinks.map((link) => (
                            link.isExternal ? (
                                <a
                                    key={link.name}
                                    href={link.path}
                                    className="py-3 border-b border-gray-50 text-gray-800 font-medium hover:text-red-700"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ) : (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="py-3 border-b border-gray-50 text-gray-800 font-medium hover:text-red-700"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            )
                        ))}
                        {isAuthenticated && (
                            <div className="flex flex-col border-b border-gray-50 pb-2 mb-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-1">Account</p>
                                <Link
                                    to="/dashboard"
                                    className="py-3 text-gray-800 font-medium hover:text-red-700 flex items-center space-x-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <LayoutDashboard size={18} className="text-red-600" />
                                    <span>User Dashboard</span>
                                </Link>
                                {user?.role === 'admin' && (
                                    <Link
                                        to="/admin"
                                        className="py-3 text-gray-800 font-medium hover:text-red-700 flex items-center space-x-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <ShieldCheck size={18} className="text-red-600" />
                                        <span>Admin Portal</span>
                                    </Link>
                                )}
                            </div>
                        )}
                        {isAuthenticated ? (
                            <button
                                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                className="mt-4 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold"
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        ) : (
                            <div className="flex flex-col space-y-3 mt-6">
                                <Link
                                    to="/login"
                                    className="w-full text-center py-3 border border-gray-200 rounded font-medium text-gray-800"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="w-full text-center py-3 bg-red-700 text-white rounded font-medium"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </header>
        </>
    );
};

export default Navbar;
