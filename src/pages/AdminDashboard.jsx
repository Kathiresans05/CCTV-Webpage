import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    XCircle,
    ChevronRight,
    ChevronLeft,
    TrendingUp
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const AdminDashboard = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Protection: Must be authenticated and have admin role
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/bookings');
            const data = await response.json();
            if (data.success) {
                setBookings(data.data);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateBookingStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:5000/api/bookings/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            if (data.success) {
                // Update local state
                setBookings(prev => prev.map(b => b.orderId === orderId ? { ...b, status: newStatus } : b));
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Analytics Data
    const stats = [
        { label: 'Total Inquiries', value: bookings.length, icon: Package, color: 'text-red-500', bg: 'bg-red-50' },
        { label: 'Pending', value: bookings.filter(b => b.status === 'Pending').length, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { label: 'Completed', value: bookings.filter(b => b.status === 'Completed').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Customers', value: new Set(bookings.map(b => b.email)).size, icon: Users, color: 'text-rose-500', bg: 'bg-rose-50' },
    ];

    const chartData = [
        { name: 'Mon', inquiries: 4 },
        { name: 'Tue', inquiries: 7 },
        { name: 'Wed', inquiries: bookings.length },
        { name: 'Thu', inquiries: 5 },
        { name: 'Fri', inquiries: 8 },
        { name: 'Sat', inquiries: 3 },
        { name: 'Sun', inquiries: 2 },
    ];

    const filteredBookings = bookings.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderOverview = () => (
        <div className="space-y-8 animate-in fade-in duration-700 font-sans">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md h-[150px] flex flex-col justify-between group">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</h3>
                            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center border border-transparent`}>
                                <stat.icon size={18} className={stat.color} />
                            </div>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                            <p className="text-[11px] font-medium text-emerald-400 mt-2 flex items-center gap-1">
                                <TrendingUp size={12} /> +12.5% increase
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Analytics Overview</h3>
                            <p className="text-gray-500 text-sm font-medium mt-1">Daily Inquiry performance</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Live System</span>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorInq" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#B91C1C" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#B91C1C" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 500 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 500 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#111827' }}
                                />
                                <Area type="monotone" dataKey="inquiries" stroke="#B91C1C" strokeWidth={3} fillOpacity={1} fill="url(#colorInq)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
                    <div className="space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                        {bookings.slice(0, 5).map((b, i) => (
                            <div key={i} className="flex gap-4 items-start border-b border-gray-100 pb-4 last:border-none">
                                <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-xs border border-transparent
                                    ${b.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {b.name.charAt(0)}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-semibold text-gray-900">{b.name}</p>
                                        <span className="text-[10px] text-gray-400 font-medium">{new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{b.productName}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setActiveTab('bookings')} className="w-full mt-6 py-3 bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-all border border-gray-200">
                        View All Inquiries
                    </button>
                </div>
            </div>
        </div>
    );

    const renderBookings = () => (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in zoom-in-95 duration-700 font-sans">
            <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Lead Management</h3>
                    <p className="text-gray-500 text-sm font-medium mt-1">Manage and track customer inquiries</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:ring-1 focus:ring-red-500 outline-none w-64 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredBookings.map((b) => (
                            <tr key={b.orderId} className="hover:bg-gray-50 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-700">
                                            {b.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{b.name}</p>
                                            <p className="text-xs text-gray-500">{b.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-sm font-medium text-gray-700">{b.productName}</p>
                                    <p className="text-[10px] font-medium text-gray-400 mt-1">ID: {b.orderId}</p>
                                </td>
                                <td className="px-8 py-6 text-sm text-gray-500">
                                    {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                                        ${b.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            b.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                b.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                        {b.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <select
                                        value={b.status}
                                        onChange={(e) => updateBookingStatus(b.orderId, e.target.value)}
                                        className="bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 px-3 py-1.5 focus:ring-1 focus:ring-red-500 outline-none cursor-pointer"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredBookings.length === 0 && (
                    <div className="py-20 text-center">
                        <Search size={32} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 font-medium text-sm">No records found</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-[#F5F7FA] min-h-screen flex flex-col lg:flex-row font-sans text-gray-800 selection:bg-red-500/10">
            {/* Sidebar */}
            <div className={`transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarCollapsed ? 'w-20' : 'w-[260px]'}`}>
                <div className="bg-[#0F172A] border-r border-slate-800/50 flex flex-col h-screen sticky top-0 custom-scrollbar relative">

                    {/* Toggle Button Tab - Repositioned to clear header */}
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="absolute -right-3 top-24 w-6 h-12 bg-[#B91C1C] text-white rounded-r-lg flex items-center justify-center shadow-lg hover:bg-red-700 transition-all z-30 group"
                        title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>

                    {/* Logo Area removed for minimal sidebar */}

                    <div className="px-4 py-6 flex-grow overflow-hidden">
                        <p className={`text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-4 ${isSidebarCollapsed ? 'hidden' : ''}`}>
                            Main Menu
                        </p>
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab('overview')}
                                title={isSidebarCollapsed ? "Dashboard" : ""}
                                className={`w-full flex items-center rounded-xl transition-all text-sm font-medium
                                    ${isSidebarCollapsed ? 'justify-center py-3' : 'space-x-3 px-4 py-2.5'}
                                    ${activeTab === 'overview' ? 'bg-[#B91C1C] text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                            >
                                <LayoutDashboard size={18} />
                                {!isSidebarCollapsed && <span className="animate-in fade-in duration-300">Dashboard</span>}
                            </button>

                            <button
                                onClick={() => setActiveTab('bookings')}
                                title={isSidebarCollapsed ? "Inquiries" : ""}
                                className={`w-full flex items-center rounded-xl transition-all text-sm font-medium
                                    ${isSidebarCollapsed ? 'justify-center py-3' : 'space-x-3 px-4 py-2.5'}
                                    ${activeTab === 'bookings' ? 'bg-[#B91C1C] text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                            >
                                <Package size={18} />
                                {!isSidebarCollapsed && <span className="animate-in fade-in duration-300">Inquiries</span>}
                            </button>

                            <button
                                title={isSidebarCollapsed ? "Customers" : ""}
                                className={`w-full flex items-center rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 text-sm font-medium transition-all
                                    ${isSidebarCollapsed ? 'justify-center py-3' : 'space-x-3 px-4 py-2.5'}`}
                            >
                                <Users size={18} />
                                {!isSidebarCollapsed && <span className="animate-in fade-in duration-300">Customers</span>}
                            </button>
                        </nav>
                    </div>

                    <div className="mt-auto p-4">
                        <div className={`pt-4 border-t border-slate-800 ${isSidebarCollapsed ? 'px-0' : 'px-0'}`}>
                            <nav className="space-y-1">
                                <button
                                    title={isSidebarCollapsed ? "Settings" : ""}
                                    className={`w-full flex items-center rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 text-sm font-medium transition-all
                                        ${isSidebarCollapsed ? 'justify-center py-3' : 'space-x-3 px-4 py-2.5'}`}
                                >
                                    <Settings size={18} />
                                    {!isSidebarCollapsed && <span className="animate-in fade-in duration-300">Settings</span>}
                                </button>
                                <button
                                    onClick={logout}
                                    title={isSidebarCollapsed ? "Sign Out" : ""}
                                    className={`w-full flex items-center rounded-xl text-rose-400/80 hover:bg-rose-950/20 hover:text-rose-400 text-sm font-medium transition-all
                                        ${isSidebarCollapsed ? 'justify-center py-3' : 'space-x-3 px-4 py-2.5'}`}
                                >
                                    <LogOut size={18} />
                                    {!isSidebarCollapsed && <span className="animate-in fade-in duration-300">Sign Out</span>}
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-h-screen overflow-x-hidden flex flex-col bg-[#F5F7FA]">
                {/* Header removed for minimal layout */}
                <div className="mb-10 px-8 lg:px-12 pt-8 lg:pt-12">
                    <h2 className="text-3xl font-bold text-gray-900">
                        {activeTab === 'overview' ? 'Dashboard Overview' : 'Inquiry Registry'}
                    </h2>
                    <p className="text-gray-500 text-sm font-medium mt-2">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>

                {/* Content */}
                <main className="flex-grow px-8 lg:px-12 pb-12">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center py-20">
                            <div className="w-10 h-10 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
                            <p className="mt-4 text-gray-500 font-medium text-xs">Preparing your view...</p>
                        </div>
                    ) : (
                        <div className="max-w-[1400px] mx-auto w-full">
                            {activeTab === 'overview' ? renderOverview() : renderBookings()}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
