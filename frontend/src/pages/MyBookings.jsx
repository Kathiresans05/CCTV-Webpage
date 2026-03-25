import React, { useState, useEffect, useCallback } from 'react';
import {
    Clock, CheckCircle, Wrench, BadgeCheck, XCircle,
    Search, RefreshCw, Calendar, Package, Phone, Mail,
    ChevronRight, AlertCircle, Inbox, MapPin, Filter, Plus,
    ArrowRight, IndianRupee, Heart, Star, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    pending_schedule: { color: 'text-amber-600', bg: 'bg-[#FFFBEB]', border: 'border-amber-100', dot: 'bg-amber-500', icon: Clock },
    schedule_sent: { color: 'text-amber-600', bg: 'bg-[#FFFBEB]', border: 'border-amber-100', dot: 'bg-amber-500', icon: Clock },
    reschedule_requested: { color: 'text-amber-600', bg: 'bg-[#FFFBEB]', border: 'border-amber-100', dot: 'bg-amber-500', icon: Clock },
    scheduled_confirmed: { color: 'text-blue-600', bg: 'bg-[#EFF6FF]', border: 'border-blue-100', dot: 'bg-blue-500', icon: CheckCircle },
    in_progress: { color: 'text-purple-600', bg: 'bg-[#F5F3FF]', border: 'border-purple-100', dot: 'bg-purple-500', icon: Wrench },
    completed: { color: 'text-green-600', bg: 'bg-[#F0FDF4]', border: 'border-green-100', dot: 'bg-green-500', icon: BadgeCheck },
    cancelled: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', dot: 'bg-red-400', icon: XCircle },
};

// Map legacy statuses just in case
STATUS_CONFIG['Pending'] = STATUS_CONFIG.pending_schedule;
STATUS_CONFIG['Confirmed'] = STATUS_CONFIG.scheduled_confirmed;
STATUS_CONFIG['In Progress'] = STATUS_CONFIG.in_progress;
STATUS_CONFIG['Completed'] = STATUS_CONFIG.completed;

const TABS = ['All', 'pending_schedule', 'schedule_sent', 'scheduled_confirmed', 'in_progress', 'completed'];

const StatCard = ({ label, count, config }) => {
    const Icon = config.icon;
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex-1 min-w-[180px] shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-[14px] font-semibold text-gray-400 mb-2 truncate">{label}</p>
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
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[14px] font-semibold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {status}
        </span>
    );
};

// ── Booking Card ─────────────────────────────────────────────────────────────
const BookingCard = ({ booking, onScheduleResponse, isResponding }) => {
    const date = new Date(booking.createdAt);
    const formattedDate = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    const formattedTime = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending_schedule;

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
                            <div className="flex items-center gap-2 text-[14px] text-gray-400 mt-1 font-medium">
                                <span className="uppercase tracking-wider">CCTV Solutions</span>
                                <span>•</span>
                                <span className="font-mono">#{booking.bookingId}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-[14px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
                                {booking.status.replace(/_/g, ' ')}
                            </span>
                            <div className="text-right">
                                <p className="text-xl font-bold text-gray-900 leading-none">₹{booking.productPrice || 0}</p>
                                <p className="text-[14px] text-gray-400 font-bold uppercase tracking-widest mt-1">{booking.status.replace(/_/g, ' ')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Meta Row */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6 border-t border-gray-50 pt-4 mt-1">
                        <div className="flex items-center gap-2 text-[14px] text-gray-500 font-medium whitespace-nowrap">
                            <Calendar size={14} className="text-gray-300" />
                            {booking.proposedDate ? new Date(booking.proposedDate).toLocaleDateString('en-IN') : formattedDate}
                        </div>
                        <div className="flex items-center gap-2 text-[14px] text-gray-500 font-medium whitespace-nowrap">
                            <Clock size={14} className="text-gray-300" />
                            {booking.proposedTimeSlot || 'Not assigned'}
                        </div>
                        {['scheduled_confirmed', 'in_progress', 'completed'].includes(booking.status) && (
                            <div className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[14px] font-bold uppercase tracking-widest rounded-lg">
                                SCHEDULED
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-[14px] text-gray-500 font-medium flex-1 min-w-0">
                            <MapPin size={14} className="text-gray-300 flex-shrink-0" />
                            <span className="truncate">{booking.address || 'N/A'}</span>
                        </div>
                        <button className="text-[#B91C1C] text-[14px] font-bold hover:underline py-1 flex items-center gap-1">
                            View Details <ArrowRight size={12} />
                        </button>
                    </div>

                    {/* Review Action */}
                    {booking.status === 'completed' && (
                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex text-amber-400">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                                </div>
                                <span className="text-[14px] text-gray-400 font-medium italic">How was your service experience?</span>
                            </div>
                            <button 
                                onClick={() => window.dispatchEvent(new CustomEvent('openReviewModal', { detail: booking }))}
                                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[14px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                            >
                                Rate & Review
                            </button>
                        </div>
                    )}

                    {/* Schedule Response Row (Premium Version) */}
                    {booking.status === 'schedule_sent' && (
                        <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] border border-amber-200/50 shadow-sm relative overflow-hidden group/alert">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -mr-16 -mt-16 transition-transform group-hover/alert:scale-110 duration-700" />
                            
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/80 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
                                        <Calendar size={20} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-[14px] font-black text-amber-900 uppercase tracking-widest">Action Required: Confirm Schedule</h4>
                                        <p className="text-[14px] text-amber-800/80 mt-1 font-medium leading-relaxed">
                                            The technician has proposed a visit for <span className="text-amber-900 font-bold">{booking.proposedDate ? new Date(booking.proposedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Next Available Date'}</span> at <span className="text-amber-900 font-bold">{booking.proposedTimeSlot}</span>.
                                        </p>
                                        {booking.adminNote && (
                                            <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-white/50 border border-amber-200/50">
                                                <AlertCircle size={14} className="text-amber-600 mt-0.5" />
                                                <p className="text-[14px] text-amber-900/70 font-bold italic tracking-tight">"{booking.adminNote}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto self-end md:self-center">
                                    <button 
                                        onClick={() => onScheduleResponse(booking._id, 'reschedule')}
                                        disabled={isResponding === booking._id}
                                        className="flex-1 md:flex-none px-6 py-3 text-[14px] font-black uppercase tracking-[0.15em] text-amber-700 bg-white/80 border border-amber-200 rounded-xl hover:bg-white hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        Change Time
                                    </button>
                                    <button 
                                        onClick={() => onScheduleResponse(booking._id, 'accept')}
                                        disabled={isResponding === booking._id}
                                        className="flex-1 md:flex-none px-8 py-3 text-[14px] font-black uppercase tracking-[0.15em] text-white bg-[#D97706] rounded-xl shadow-lg shadow-amber-600/20 hover:bg-[#B45309] hover:shadow-amber-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isResponding === booking._id ? (
                                            <>
                                                <RefreshCw size={14} className="animate-spin" /> Confirming
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={14} strokeWidth={3} /> Accept Schedule
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const MyBookings = ({ isDashboardComponent = false }) => {
    const { token, isAuthenticated, loading: authLoading } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [lastRefreshed, setLastRefreshed] = useState(null);
    const [isResponding, setIsResponding] = useState(null);
    
    // Review State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        const handleOpenReview = (e) => {
            setSelectedBooking(e.detail);
            setShowReviewModal(true);
        };
        window.addEventListener('openReviewModal', handleOpenReview);
        return () => window.removeEventListener('openReviewModal', handleOpenReview);
    }, []);

    const submitReview = async () => {
        if (!reviewForm.comment.trim()) return alert('Please add a comment');
        setIsSubmittingReview(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    rating: reviewForm.rating,
                    comment: reviewForm.comment,
                    productId: selectedBooking.productId, 
                    bookingId: selectedBooking._id
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Thank you for your review!');
                setShowReviewModal(false);
                setReviewForm({ rating: 5, comment: '' });
                fetchBookings();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to submit review');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleScheduleResponse = async (bookingId, action) => {
        setIsResponding(bookingId);
        try {
            const res = await fetch(`/api/bookings/${bookingId}/schedule`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            if (data.success) {
                fetchBookings();
            } else {
                const debugInfo = data.debug ? `\n\nUser: ${data.debug.userEmail}\nBooking: ${data.debug.bookingEmail}` : '';
                alert(data.message + debugInfo);
            }
        } catch (error) {
            console.error(error);
            alert('Cannot connect to server.');
        } finally {
            setIsResponding(null);
        }
    };

    const fetchBookings = useCallback(async () => {
        if (!token) return; // Wait for token to be available
        
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/bookings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.status === 401) {
                // Token is invalid or expired
                localStorage.removeItem('secureVisionUser');
                localStorage.removeItem('secureVisionToken');
                window.location.href = '/login';
                return;
            }

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
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchBookings();
        } else if (!authLoading && !isAuthenticated) {
            setLoading(false);
            setBookings([]);
        }
    }, [fetchBookings, token, authLoading, isAuthenticated]);

    // ── Stats ──────────────────────────────────────────────────────────────
    const stats = {
        Pending: bookings.filter(b => ['Pending', 'pending_schedule', 'schedule_sent', 'reschedule_requested'].includes(b.status)).length,
        Confirmed: bookings.filter(b => ['Confirmed', 'scheduled_confirmed'].includes(b.status)).length,
        'In Progress': bookings.filter(b => ['In Progress', 'in_progress'].includes(b.status)).length,
        Completed: bookings.filter(b => ['Completed', 'completed'].includes(b.status)).length,
    };

    // ── Filter ─────────────────────────────────────────────────────────────
    const filtered = bookings.filter(b => {
        // Tab Match Logic (Grouped)
        let tabMatch = activeTab === 'All';
        if (activeTab === 'Pending') {
            tabMatch = ['Pending', 'pending_schedule', 'schedule_sent', 'reschedule_requested'].includes(b.status);
        } else if (activeTab === 'Confirmed') {
            tabMatch = ['Confirmed', 'scheduled_confirmed'].includes(b.status);
        } else if (activeTab === 'In Progress') {
            tabMatch = ['In Progress', 'in_progress'].includes(b.status);
        } else if (activeTab === 'Completed') {
            tabMatch = ['Completed', 'completed'].includes(b.status);
        } else if (activeTab === b.status) {
            tabMatch = true;
        }

        const search = searchTerm.toLowerCase().trim();
        if (!search) return tabMatch;

        const bId = b.bookingId || '';
        const cName = b.customerName || '';
        const pName = b.productName || '';
        const cEmail = b.customerEmail || '';

        const textMatch = 
            bId.toLowerCase().includes(search) ||
            cName.toLowerCase().includes(search) ||
            pName.toLowerCase().includes(search) ||
            cEmail.toLowerCase().includes(search);
            
        return tabMatch && textMatch;
    });

    return (
        <div className={`${isDashboardComponent ? '' : 'bg-[#F5F7FA] min-h-screen py-8'} font-sans`}>
            <div className={`w-full ${isDashboardComponent ? 'px-2 lg:px-4' : 'px-4 lg:px-8'}`}>


                {/* ── Page Header ── */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isDashboardComponent ? 'mb-6' : 'mb-8'}`}>
                    <div>
                        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">My Bookings</h1>
                        <p className="text-gray-500 mt-1 text-[14px] font-medium">Manage and track all your service bookings</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchBookings}
                            disabled={loading}
                            className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm text-gray-700 px-4 py-2 rounded-lg text-[14px] font-semibold transition-all hover:bg-gray-50 disabled:opacity-60"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                        <Link
                            to="/products"
                            className="flex items-center gap-2 bg-[#B91C1C] text-white px-4 py-2 rounded-lg text-[14px] font-semibold shadow-sm hover:bg-[#991B1B] transition-all"
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
                                className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium text-gray-700 placeholder-gray-400 h-full p-0 ml-3"
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
                                className="flex-1 md:w-48 appearance-none bg-white border border-gray-100 px-4 py-3 rounded-xl text-[14px] font-medium text-gray-700 outline-none focus:border-blue-300 transition-colors cursor-pointer"
                            >
                                {TABS.map(tab => (
                                    <option key={tab} value={tab}>{tab === 'All' ? 'All Status' : tab.replace(/_/g, ' ')}</option>
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

                            <p className="text-gray-400 text-[14px] font-bold uppercase tracking-widest text-center">Syncing with server...</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-gray-100">
                            <AlertCircle size={32} className="text-red-400 mb-3" />
                            <h3 className="text-[14px] font-bold text-gray-800 mb-1">Connection Error</h3>
                            <p className="text-gray-400 text-[14px] max-w-xs mb-4">{error}</p>
                            <button onClick={fetchBookings} className="text-[#B91C1C] text-[14px] font-bold uppercase hover:underline">Try Again</button>

                        </div>
                    )}

                    {!loading && !error && filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-xl border border-gray-100">
                            <Inbox size={48} className="text-gray-100 mb-4" />
                            <h3 className="text-[14px] font-bold text-gray-400 uppercase tracking-widest">
                                {bookings.length === 0 ? 'No Data Available' : 'No Matches Found'}
                            </h3>
                            <p className="text-gray-400 text-[14px] mt-2">Try adjusting your filters or search keywords.</p>
                        </div>
                    )}

                    {!loading && !error && filtered.length > 0 && (
                        <div className="space-y-4">
                            {filtered.map(booking => (
                                <BookingCard 
                                    key={booking._id} 
                                    booking={booking} 
                                    onScheduleResponse={handleScheduleResponse}
                                    isResponding={isResponding}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Review Modal ─────────────────────────────────────── */}
                {showReviewModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="bg-amber-500 p-8 text-white relative">
                                <button 
                                    onClick={() => setShowReviewModal(false)}
                                    className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                        <Star size={24} fill="white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight">Product Review</h3>
                                        <p className="text-amber-100 text-[14px] font-bold uppercase tracking-wider opacity-80">Ref: #{selectedBooking?.bookingId}</p>
                                    </div>
                                </div>
                                <p className="text-[14px] font-medium text-amber-50 mt-2 font-serif italic line-clamp-1">"{selectedBooking?.productName}"</p>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="text-center">
                                    <p className="text-[14px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Rate Your Experience</p>
                                    <div className="flex justify-center gap-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                className="transition-transform active:scale-90"
                                            >
                                                <Star 
                                                    size={42} 
                                                    className={star <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} 
                                                    strokeWidth={1.5}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[14px] font-bold text-amber-600 mt-4 uppercase tracking-wider">
                                        {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewForm.rating - 1]}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[14px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Detailed Feedback</label>
                                    <textarea
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        placeholder="Tell us about the product quality and installation service..."
                                        className="w-full min-h-[140px] bg-gray-50 border border-gray-100 rounded-2xl p-5 text-[14px] font-medium focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all resize-none placeholder:text-gray-300"
                                    />
                                </div>

                                <button
                                    onClick={submitReview}
                                    disabled={isSubmittingReview || !reviewForm.comment.trim()}
                                    className="w-full py-5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-[14px] shadow-xl shadow-amber-500/20 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3"
                                >
                                    {isSubmittingReview ? (
                                        <RefreshCw size={16} className="animate-spin" />
                                    ) : 'Publish Review'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
