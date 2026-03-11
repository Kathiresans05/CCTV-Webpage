import React, { useState, useEffect, useCallback } from 'react';
import {
    Clock, CheckCircle, Wrench, BadgeCheck, XCircle,
    Search, RefreshCw, Calendar, Package, Phone, Mail,
    ChevronRight, AlertCircle, Inbox, MapPin, Filter, Plus,
    ArrowRight, IndianRupee, Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    Pending: { color: 'text-amber-600', bg: 'bg-[#FFFBEB]', border: 'border-amber-100', dot: 'bg-amber-500', icon: Clock },
    Confirmed: { color: 'text-blue-600', bg: 'bg-[#EFF6FF]', border: 'border-blue-100', dot: 'bg-blue-500', icon: CheckCircle },
    'In Progress': { color: 'text-purple-600', bg: 'bg-[#F5F3FF]', border: 'border-purple-100', dot: 'bg-purple-500', icon: Wrench },
    Completed: { color: 'text-green-600', bg: 'bg-[#F0FDF4]', border: 'border-green-100', dot: 'bg-green-500', icon: BadgeCheck },
    Cancelled: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', dot: 'bg-red-400', icon: XCircle },
};

const TABS = ['All', 'Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

const StatCard = ({ label, count, config }) => {
    const Icon = config.icon;
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex-1 min-w-[180px] shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-xs font-semibold text-gray-400 mb-2 truncate">{label}</p>
                    <p className="text-3xl font-bold text-[#0F172A] leading-none">{count}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                    <Icon size={22} className={config.color} />
                </div>
            </div>
        </div>
    );
};

// ── Status Badge ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {status}
        </span>
    );
};

// ── Booking Card ─────────────────────────────────────────────────────────────
const BookingCard = ({ booking }) => {
    const date = new Date(booking.createdAt);
    const formattedDate = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    const formattedTime = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.Pending;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-5 group">
            <div className="flex flex-col sm:flex-row gap-5">
                {/* Product Thumbnail */}
                <div className="w-full sm:w-24 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-50 relative">
                    <Package size={28} className="text-gray-200" />
                    <button className="absolute top-2 right-2 text-gray-300 hover:text-primary-red transition-colors">
                        <Heart size={14} />
                    </button>
                    {/* Placeholder image logic */}
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(booking.productName)}&background=f8fafc&color=cbd5e1&size=128&bold=true`}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-3">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 leading-tight group-hover:text-[#2563EB] transition-colors truncate">
                                {booking.productName}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 font-medium">
                                <span className="uppercase tracking-wider">CCTV Solutions</span>
                                <span>•</span>
                                <span className="font-mono">#{booking.orderId}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
                                {booking.status}
                            </span>
                            <div className="text-right">
                                <p className="text-xl font-bold text-gray-900 leading-none">₹{booking.productPrice || 0}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{booking.status}</p>
                            </div>
                        </div>
                    </div>

                    {/* Meta Row */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6 border-t border-gray-50 pt-4 mt-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium whitespace-nowrap">
                            <Calendar size={14} className="text-gray-300" />
                            {booking.preferredDate ? new Date(booking.preferredDate).toLocaleDateString('en-IN') : formattedDate}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium whitespace-nowrap">
                            <Clock size={14} className="text-gray-300" />
                            {booking.preferredTime || formattedTime}
                        </div>
                        <div className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                            SCHEDULED
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium flex-1 min-w-0">
                            <MapPin size={14} className="text-gray-300 flex-shrink-0" />
                            <span className="truncate">{booking.address || 'N/A'}</span>
                        </div>
                        <button className="text-[#B91C1C] text-xs font-bold hover:underline py-1 flex items-center gap-1">
                            View Details <ArrowRight size={12} />
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const MyBookings = ({ isDashboardComponent = false }) => {
    const { token } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [lastRefreshed, setLastRefreshed] = useState(null);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/bookings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setBookings(data.data);
                setLastRefreshed(new Date());
            } else {
                setError('Failed to load bookings.');
            }
        } catch {
            setError('Cannot connect to server. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // ── Stats ──────────────────────────────────────────────────────────────
    const stats = {
        Pending: bookings.filter(b => b.status === 'Pending').length,
        Confirmed: bookings.filter(b => b.status === 'Confirmed').length,
        'In Progress': bookings.filter(b => b.status === 'In Progress').length,
        Completed: bookings.filter(b => b.status === 'Completed').length,
    };

    // ── Filter ─────────────────────────────────────────────────────────────
    const filtered = bookings.filter(b => {
        const tabMatch = activeTab === 'All' || b.status === activeTab;
        const search = searchTerm.toLowerCase();
        const textMatch = !search ||
            b.orderId.toLowerCase().includes(search) ||
            b.name.toLowerCase().includes(search) ||
            b.productName.toLowerCase().includes(search) ||
            b.email.toLowerCase().includes(search);
        return tabMatch && textMatch;
    });

    return (
        <div className={`${isDashboardComponent ? '' : 'bg-[#F5F7FA] min-h-screen py-8'} font-sans`}>
            <div className={`w-full ${isDashboardComponent ? 'px-2 lg:px-4' : 'px-4 lg:px-8'}`}>


                {/* ── Page Header ── */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isDashboardComponent ? 'mb-6' : 'mb-8'}`}>
                    <div>
                        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">My Bookings</h1>
                        <p className="text-gray-500 mt-1 text-sm font-medium">Manage and track all your service bookings</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchBookings}
                            disabled={loading}
                            className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-gray-50 disabled:opacity-60"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                        <Link
                            to="/products"
                            className="flex items-center gap-2 bg-[#B91C1C] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-[#991B1B] transition-all"
                        >
                            Book New Service
                        </Link>

                    </div>
                </div>

                {/* ── Stats Cards ─────────────────────────────────────── */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <StatCard
                        label="Total Bookings"
                        count={bookings.length}
                        config={{ icon: Package, color: 'text-blue-600', bg: 'bg-[#EFF6FF]' }}
                    />
                    <StatCard
                        label="Completed"
                        count={stats.Completed}
                        config={STATUS_CONFIG.Completed}
                    />
                    <StatCard
                        label="Active"
                        count={stats.Pending + stats.Confirmed + stats['In Progress']}
                        config={STATUS_CONFIG['In Progress']}
                    />
                    <StatCard
                        label="Total Spent"
                        count={`₹${(bookings.length * 799).toLocaleString()}`}
                        config={{ icon: IndianRupee, color: 'text-orange-600', bg: 'bg-[#FFF7ED]' }}
                    />
                </div>

                {/* ── Search & Filter Row ─────────────────────────────────────── */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="zoho-search-bar flex-1 w-full group shadow-none border-gray-100 bg-white">
                            <Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by service, provider, or booking ID..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-700 placeholder-gray-400 h-full p-0 ml-3"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600 transition-colors ml-2">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Filter size={18} className="text-gray-400" />
                            <select
                                value={activeTab}
                                onChange={(e) => setActiveTab(e.target.value)}
                                className="flex-1 md:w-48 appearance-none bg-white border border-gray-100 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-blue-300 transition-colors cursor-pointer"
                            >
                                {TABS.map(tab => (
                                    <option key={tab} value={tab}>{tab === 'All' ? 'All Status' : tab}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* ── Booking List Section ─────────────────────────────────────── */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-[#0F172A]">All Bookings ({filtered.length})</h2>
                </div>

                <div className="space-y-4">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <svg className="animate-spin h-8 w-8 text-[#B91C1C] mb-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>

                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest text-center">Syncing with server...</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-gray-100">
                            <AlertCircle size={32} className="text-red-400 mb-3" />
                            <h3 className="text-sm font-bold text-gray-800 mb-1">Connection Error</h3>
                            <p className="text-gray-400 text-xs max-w-xs mb-4">{error}</p>
                            <button onClick={fetchBookings} className="text-[#B91C1C] text-xs font-bold uppercase hover:underline">Try Again</button>

                        </div>
                    )}

                    {!loading && !error && filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-xl border border-gray-100">
                            <Inbox size={48} className="text-gray-100 mb-4" />
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                {bookings.length === 0 ? 'No Data Available' : 'No Matches Found'}
                            </h3>
                            <p className="text-gray-400 text-xs mt-2">Try adjusting your filters or search keywords.</p>
                        </div>
                    )}

                    {!loading && !error && filtered.length > 0 && (
                        <div className="space-y-4">
                            {filtered.map(booking => (
                                <BookingCard key={booking.orderId} booking={booking} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyBookings;
