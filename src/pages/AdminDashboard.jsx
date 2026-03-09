import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
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
    X,
    XCircle,
    ChevronRight,
    ChevronLeft,
    TrendingUp,
    AlertTriangle,
    Mail,
    Calendar,
    Briefcase,
    Bell,
    MapPin,
    Eye,
    Edit,
    Trash2,
    Plus,
    UserCheck,
    Truck,
    ShieldAlert,
    ShieldCheck,
    User,
    Camera,
    Play
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
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Map URL path to tab ID
    const pathMapping = {
        '/admin': 'overview',
        '/admin/dashboard': 'overview',
        '/admin/employees': 'employees',
        '/admin/products': 'products',
        '/admin/bookings': 'bookings',
        '/admin/enquiries': 'enquiries',
        '/admin/attendance': 'attendance',
        '/admin/reports': 'reports',
        '/admin/settings': 'settings',
        '/admin/notifications': 'notifications'
    };

    // Reverse mapping for navigation
    const tabToPath = {
        'overview': '/admin/dashboard',
        'employees': '/admin/employees',
        'products': '/admin/products',
        'bookings': '/admin/bookings',
        'enquiries': '/admin/enquiries',
        'attendance': '/admin/attendance',
        'reports': '/admin/reports',
        'settings': '/admin/settings',
        'notifications': '/admin/notifications'
    };

    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const path = location.pathname;
        if (pathMapping[path]) {
            setActiveTab(pathMapping[path]);
        }
    }, [location.pathname]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        navigate(tabToPath[tabId]);
    };
    const [bookings, setBookings] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [enquiries, setEnquiries] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    
    // Modal & Form State
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingBooking, setEditingBooking] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [employeeForm, setEmployeeForm] = useState({ name: '', email: '', phone: '', password: '', role: 'employee', address: '' });
    const [productForm, setProductForm] = useState({ name: '', sku: '', category: '', brand: '', price: '', quantity: '', image: '' });
    const [bookingForm, setBookingForm] = useState({ status: '', assignedEmployee: '' });
    const [stockAdjustment, setStockAdjustment] = useState({ quantity: 0, type: 'add' });
    const [settings, setSettings] = useState({
        companyName: 'SecureVision CCTV',
        email: 'admin@securevision.com',
        phone: '+91 98765 43210',
        address: '123 Secure Tower, IT Corridor, Chennai'
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const [bRes, sRes, eRes, qRes, aRes, nRes] = await Promise.all([
                fetch('/api/admin/bookings', { headers }),
                fetch('/api/products', { headers }),
                fetch('/api/admin/employees', { headers }),
                fetch('/api/admin/enquiries', { headers }),
                fetch('/api/admin/attendance', { headers }),
                fetch('/api/notifications', { headers })
            ]);

            const [bData, sData, eData, qData, aData, nData] = await Promise.all([
                bRes.json(), sRes.json(), eRes.json(), qRes.json(), aRes.json(), nRes.json()
            ]);

            if (bData.success) setBookings(bData.data);
            if (sData.success) setStocks(sData.data);
            if (eData.success) setEmployees(eData.data);
            if (qData.success) setEnquiries(qData.data);
            if (aData.success) setAttendance(aData.data);
            if (nData.success) setNotifications(nData.data);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingEmployee ? `/api/admin/employees/${editingEmployee._id}` : '/api/admin/employees';
            const method = editingEmployee ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(employeeForm)
            });
            
            const data = await res.json();
            
            if (data.success) {
                alert(editingEmployee ? 'Staff member updated successfully!' : 'New employee registered successfully!');
                setShowEmployeeModal(false);
                setEditingEmployee(null);
                setEmployeeForm({ name: '', email: '', phone: '', password: '', role: 'employee', address: '' });
                fetchAllData();
            } else {
                alert(`Error: ${data.message || 'Failed to save employee'}`);
            }
        } catch (error) {
            console.error('Error saving employee:', error);
            alert(`Network or Server Error: ${error.message}`);
        }
    };

    const deleteEmployee = async (id) => {
        if (!window.confirm('Are you sure you want to remove this employee?')) return;
        try {
            const res = await fetch(`/api/admin/employees/${id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) fetchAllData();
        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingProduct ? `/api/admin/products/${editingProduct._id}` : '/api/admin/products';
            const method = editingProduct ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productForm)
            });
            const data = await res.json();
            if (data.success) {
                setShowProductModal(false);
                setEditingProduct(null);
                setProductForm({ name: '', sku: '', category: '', brand: '', price: '', quantity: '', image: '' });
                fetchAllData();
            }
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            const res = await fetch(`/api/admin/products/${id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) fetchAllData();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleBookingUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/admin/bookings/${editingBooking._id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bookingForm)
            });
            const data = await res.json();
            if (data.success) {
                setShowBookingModal(false);
                setEditingBooking(null);
                fetchAllData();
            }
        } catch (error) {
            console.error('Error updating booking:', error);
        }
    };

    const handleStockAdjustmentSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/admin/products/${editingProduct._id}/stock`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(stockAdjustment)
            });
            const data = await res.json();
            if (data.success) {
                setShowStockModal(false);
                setEditingProduct(null);
                setStockAdjustment({ quantity: 0, type: 'add' });
                fetchAllData();
            }
        } catch (error) {
            console.error('Error adjusting stock:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/read-all', { 
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchAllData();
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    const updateEnquiryStatus = async (id, status) => {
        try {
            const res = await fetch(`/api/admin/enquiries/${id}/status`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) fetchAllData();
        } catch (error) {
            console.error('Error updating enquiry status:', error);
        }
    };

    const handleSettingsUpdate = async (e) => {
        e.preventDefault();
        alert('Configuration synchronized with enterprise vault (Demo)');
    };

    const renderOverview = () => {
        // Calculate dynamic values for new KPI cards
        const kpis = {
            operations: [
                { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'text-primary-navy', bg: 'bg-primary-navy/10', trend: '+12%' },
                { label: 'Pending', value: bookings.filter(b => b.status === 'Pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10', trend: 'Needs action' },
                { label: 'In Progress', value: bookings.filter(b => b.status === 'In Progress').length, icon: Truck, color: 'text-orange-500', bg: 'bg-orange-500/10', trend: 'Active' },
                { label: 'Completed', value: bookings.filter(b => b.status === 'Completed').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10', trend: '+5%' }
            ],
            staff: [
                { label: 'Total Employees', value: employees.length, icon: Users, color: 'text-primary-navy', bg: 'bg-bg-soft', trend: 'Stable' },
                { label: 'Present Today', value: attendance.length, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-500/10', trend: 'Live' },
                { label: 'Technicians Active', value: employees.filter(e => e.isActive).length, icon: Play, color: 'text-status-info-text', bg: 'bg-status-info-bg', trend: 'Field' }
            ]
        };

        const renderKpiCard = (stat, idx) => (
            <div key={idx} className="bg-white border border-border-soft rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:border-primary-navy/20 transition-all cursor-default h-32">
                <div className="flex justify-between items-start">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
                        <stat.icon size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-[9px] font-black text-text-muted bg-bg-soft px-2 py-0.5 rounded-full tracking-wider uppercase">
                        {stat.trend}
                    </span>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-2xl font-extrabold text-primary-navy tracking-tight leading-none mt-1">{stat.value}</h3>
                </div>
            </div>
        );

        return (
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* 1. Operations */}
                <div>
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Briefcase size={14} className="text-primary-navy/40" /> Operations
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                        {kpis.operations.map((stat, i) => renderKpiCard(stat, i))}
                    </div>
                </div>

                {/* 2. Staff */}
                <div>
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Users size={14} className="text-primary-navy/40" /> Staff
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {kpis.staff.map((stat, i) => renderKpiCard(stat, i))}
                    </div>
                </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings - Zoho Style Table-lite */}
                <div className="lg:col-span-2 zoho-card p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-primary-navy">Recent Booking Requests</h3>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Incoming installation inquiries</p>
                        </div>
                        <button onClick={() => setActiveTab('bookings')} className="zoho-btn-secondary px-5 py-2.5 rounded-lg text-xs">View All</button>
                    </div>
                    <div className="space-y-4">
                        {bookings.slice(0, 5).map(b => (
                            <div key={b.bookingId} className="flex items-center justify-between p-4 bg-bg-soft/30 rounded-2xl border border-transparent hover:border-border-soft hover:bg-white hover:shadow-sm transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-full bg-white border border-border-soft flex items-center justify-center font-bold text-text-muted shadow-sm group-hover:border-primary-navy/20">
                                        {b.customerName[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-primary-navy">{b.customerName}</p>
                                        <p className="text-[11px] text-text-muted font-medium mt-0.5">{b.productName} • {b.city || 'NY Office'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`status-chip ${
                                        b.status === 'Completed' ? 'bg-status-success-bg text-status-success-text' : 
                                        b.status === 'Pending' ? 'bg-status-warning-bg text-status-warning-text' : 
                                        'bg-status-info-bg text-status-info-text'
                                    }`}>{b.status}</span>
                                    <p className="text-[10px] text-text-muted mt-1.5 font-bold">{new Date(b.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Operations Alerts & Activity */}
                <div className="space-y-8">

                    <div className="bg-primary-navy p-8 rounded-[16px] text-white shadow-xl shadow-navy-dark/40 relative overflow-hidden">
                        <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
                            <LayoutDashboard size={100} />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Technician Pulse</h4>
                            <div className="space-y-5">
                                {attendance.slice(0, 3).map((a, i) => (
                                    <div key={i} className="flex items-center gap-4 transition-transform hover:translate-x-1 cursor-default">
                                        <div className="w-1 h-8 bg-primary-red rounded-full" />
                                        <div>
                                            <p className="text-[13px] font-bold text-white">{a.employeeId?.name || 'Staff Member'}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">Clocked In • {new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
    const renderBookings = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                     <h3 className="text-xl font-bold text-primary-navy">Booking Registry</h3>
                     <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Operational Installation Queue</p>
                </div>
            </div>

            <div className="zoho-card overflow-hidden">
                <div className="p-5 border-b border-border-soft flex items-center justify-between bg-white">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                        <input type="text" placeholder="Search operational registry..." className="zoho-input pl-9" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="zoho-table">
                        <thead>
                            <tr className="zoho-table-header">
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">System Details</th>
                                <th className="px-6 py-4">Deployment Site</th>
                                <th className="px-6 py-4 text-center">Assigned</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-soft">
                            {bookings.map(b => (
                                <tr key={b._id} className="hover:bg-bg-soft/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-tighter">#SV-{b.bookingId.substring(0, 8).toUpperCase()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-primary-navy leading-none">{b.customerName}</p>
                                        <p className="text-[10px] text-text-muted mt-1 font-medium">{new Date(b.createdAt).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-text-muted">{b.customerPhone}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-primary-navy truncate max-w-[140px]">{b.productName}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-text-muted">
                                            <MapPin size={12} className="shrink-0" />
                                            <p className="text-[11px] font-semibold truncate max-w-[150px]">{b.address}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className="w-7 h-7 rounded-lg bg-primary-navy text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                                                {b.assignedEmployeeName?.[0] || b.assignedEmployee?.name?.[0] || '?'}
                                            </div>
                                            <p className="text-[10px] font-bold text-primary-navy truncate max-w-[80px] text-center">
                                                {b.assignedEmployeeName || b.assignedEmployee?.name || (b.status === 'Pending' ? 'Pending Assignment' : 'Unassigned')}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`status-chip inline-block ${
                                            b.status === 'Completed' ? 'bg-status-success-bg text-status-success-text' : 
                                            b.status === 'Pending' ? 'bg-status-warning-bg text-status-warning-text' : 
                                            'bg-status-info-bg text-status-info-text'
                                        }`}>{b.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button 
                                                onClick={() => {
                                                    setEditingBooking(b);
                                                    setBookingForm({ status: b.status, assignedEmployee: b.assignedEmployee?._id || '' });
                                                    setShowBookingModal(true);
                                                }}
                                                className="zoho-btn-secondary px-4 py-2 rounded-lg text-[10px] shrink-0"
                                            >
                                                Modify
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderTracking = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-between items-center">
                <div>
                     <h3 className="text-xl font-bold text-primary-navy">Installation Tracking</h3>
                     <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Live Deployment Status</p>
                </div>
            </div>

            <div className="zoho-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="zoho-table">
                        <thead>
                            <tr className="zoho-table-header">
                                <th className="px-6 py-4">Job ID</th>
                                <th className="px-6 py-4">Site Detail</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Assigned Personnel</th>
                                <th className="px-6 py-4">Timeline</th>
                                <th className="px-6 py-4">Deployment Status</th>
                                <th className="px-6 py-4">Site Evidence</th>
                                <th className="px-6 py-4 text-right">Observation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-soft">
                            {bookings.filter(b => ['Accepted', 'In Progress', 'Completed'].includes(b.status)).map(b => (
                                <tr key={b._id} className="hover:bg-bg-soft/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="text-[10px] font-black text-text-muted uppercase">#SV-{b.bookingId.substring(0,8).toUpperCase()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-primary-navy leading-none">{b.customerName}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[11px] font-semibold text-text-muted">{b.productName}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-primary-navy text-white flex items-center justify-center font-bold text-[9px]">
                                                {b.assignedEmployeeName?.[0] || b.assignedEmployee?.name?.[0] || 'T'}
                                            </div>
                                            <p className="text-[11px] font-bold text-primary-navy truncate max-w-[100px]">
                                                {b.assignedEmployeeName || b.assignedEmployee?.name || 'Unassigned'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {b.startTime && <p className="text-[9px] font-bold text-text-muted flex items-center gap-1"><Clock size={8} /> IN: {new Date(b.startTime).toLocaleTimeString()}</p>}
                                            {b.completionTime && <p className="text-[9px] font-bold text-status-success-text flex items-center gap-1"><Clock size={8} /> OUT: {new Date(b.completionTime).toLocaleTimeString()}</p>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`status-chip ${
                                            b.status === 'Completed' ? 'bg-status-success-bg text-status-success-text' : 'bg-status-info-bg text-status-info-text'
                                        }`}>{b.status}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {b.proofPhoto ? (
                                            <div className="w-10 h-10 rounded-lg bg-bg-soft border border-border-soft overflow-hidden cursor-zoom-in shadow-sm hover:scale-105 transition-transform">
                                                <img src={b.proofPhoto} alt="Proof" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-text-muted bg-bg-soft px-2 py-1 rounded border border-border-soft">No Evidence</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="text-[10px] text-text-muted font-medium max-w-[120px] truncate ml-auto italic">
                                            {b.completionNotes || 'No notes available'}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderAttendance = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                     <h3 className="text-xl font-bold text-primary-navy">Attendance Logs</h3>
                     <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Personnel Presence Audit</p>
                </div>
            </div>

            <div className="zoho-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="zoho-table">
                        <thead>
                            <tr className="zoho-table-header">
                                <th className="px-6 py-4">Personnel</th>
                                <th className="px-6 py-4">Audit Date</th>
                                <th className="px-6 py-4">Clock In</th>
                                <th className="px-6 py-4">Clock Out</th>
                                <th className="px-6 py-4">Session Duration</th>
                                <th className="px-6 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-soft">
                            {attendance.map((a, i) => (
                                <tr key={i} className="hover:bg-bg-soft/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary-navy text-white flex items-center justify-center font-bold text-[10px]">
                                                {a.employeeId?.name?.[0] || 'E'}
                                            </div>
                                            <p className="text-sm font-bold text-primary-navy">{a.employeeId?.name || 'Unknown Staff'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-text-muted tracking-tight">{new Date(a.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-status-success-text">
                                            <Clock size={12} />
                                            <p className="text-sm font-bold tracking-tight">{a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {a.checkOut ? (
                                            <div className="flex items-center gap-2 text-primary-red">
                                                <Clock size={12} />
                                                <p className="text-sm font-bold tracking-tight">{new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-black uppercase text-text-muted bg-bg-soft px-2 py-0.5 rounded border border-border-soft tracking-wider">Active</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-extrabold text-primary-navy">{a.totalHours || '0.00'} Hours</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`status-chip ${a.status === 'FULL_DAY' ? 'bg-status-success-bg text-status-success-text' : 'bg-status-warning-bg text-status-warning-text'}`}>
                                            {a.status?.replace('_', ' ') || 'ACTIVE'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderEnquiries = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                     <h3 className="text-xl font-bold text-primary-navy">Customer Enquiries</h3>
                     <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Communication Registry</p>
                </div>
            </div>

            <div className="zoho-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="zoho-table">
                        <thead>
                            <tr className="zoho-table-header">
                                <th className="px-6 py-4">Inquirer</th>
                                <th className="px-6 py-4 uppercase">Credentials</th>
                                <th className="px-6 py-4 uppercase">Inquiry Focus</th>
                                <th className="px-6 py-4 uppercase">Interaction</th>
                                <th className="px-6 py-4 uppercase">Registry Date</th>
                                <th className="px-6 py-4 uppercase text-center">Disposition</th>
                                <th className="px-6 py-4 uppercase text-right">Clearance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-soft">
                            {enquiries.map(q => (
                                <tr key={q._id} className="hover:bg-bg-soft/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-primary-navy leading-none">{q.firstName} {q.lastName || ''}</p>
                                        <p className="text-[10px] text-text-muted mt-1.5 font-semibold">{q.phone || 'No Phone'}</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-text-muted">{q.email}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-primary-navy truncate max-w-[150px]">{q.subject || 'Sales Inquiry'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[11px] text-text-muted font-medium truncate max-w-[200px] italic">"{q.message}"</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-tight">{new Date(q.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`status-chip ${
                                            q.status === 'New' ? 'bg-status-danger-bg text-status-danger-text ring-1 ring-primary-red/20' : 'bg-bg-soft text-text-muted'
                                        }`}>{q.status || 'New'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button 
                                                onClick={() => updateEnquiryStatus(q._id, 'Processed')}
                                                className="zoho-btn-secondary px-4 py-2 rounded-xl text-[10px]"
                                            >
                                                Update Status
                                            </button>
                                            <button 
                                                onClick={() => updateEnquiryStatus(q._id, 'Closed')}
                                                className="p-2 text-text-muted hover:text-primary-red bg-bg-soft hover:bg-white rounded-lg transition-all border border-transparent hover:border-border-soft"
                                            >
                                                <CheckCircle2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderNotifications = () => (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
             <div className="zoho-card p-10">
                <div className="flex justify-between items-center mb-10">
                     <div>
                        <h3 className="text-xl font-bold text-primary-navy flex items-center gap-3">
                            <Bell size={24} className="text-primary-red" />
                            Operations Alerts
                        </h3>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">System-wide critical events</p>
                     </div>
                     <button onClick={markAllAsRead} className="text-xs font-black text-primary-red bg-primary-red/5 px-4 py-2 rounded-xl hover:bg-primary-red hover:text-white transition-all">Acknowledge All</button>
                </div>
                <div className="space-y-4">
                    {notifications.length > 0 ? notifications.map(n => (
                        <div key={n._id} className="flex gap-5 p-5 rounded-3xl hover:bg-bg-soft transition-all border border-transparent hover:border-border-soft group cursor-default">
                             <div className="w-12 h-12 rounded-2xl bg-bg-soft flex items-center justify-center text-primary-navy group-hover:bg-primary-navy group-hover:text-white transition-all shadow-sm">
                                <Bell size={20} />
                             </div>
                             <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                     <p className="font-bold text-[15px] text-primary-navy group-hover:text-primary-red transition-colors">{n.title}</p>
                                     <span className="text-[10px] font-bold text-text-muted bg-white px-2 py-0.5 rounded-lg border border-border-soft">{new Date(n.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-[13px] text-text-muted mt-2 leading-relaxed font-medium">{n.message}</p>
                             </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 bg-bg-soft/50 rounded-[40px] border-2 border-dashed border-border-soft">
                             <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center mx-auto mb-6 text-text-muted shadow-sm">
                                <ShieldAlert size={32} />
                             </div>
                             <p className="text-text-muted font-bold uppercase tracking-[0.2em] text-xs">No Operational Alerts Detected</p>
                        </div>
                    )}
                </div>
             </div>
        </div>
    );

    const renderSettings = () => (
        <div className="max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h3 className="text-xl font-bold text-primary-navy uppercase tracking-tight">System Configuration</h3>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Foundational Site Controls & Security</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 zoho-card p-10 space-y-8">
                    <div className="flex items-center gap-3 border-b border-border-soft pb-6">
                        <Settings size={20} className="text-primary-red" />
                        <h4 className="text-sm font-bold text-primary-navy uppercase tracking-widest">Enterprise Profile</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Entity Identity</label>
                            <input 
                                type="text" 
                                value={settings.companyName} 
                                onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                                className="zoho-input" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Support Channel</label>
                            <input 
                                type="email" 
                                value={settings.email}
                                onChange={(e) => setSettings({...settings, email: e.target.value})}
                                className="zoho-input" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Operations Contact</label>
                            <input 
                                type="text" 
                                value={settings.phone}
                                onChange={(e) => setSettings({...settings, phone: e.target.value})}
                                className="zoho-input" 
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Command Center Address</label>
                            <textarea 
                                value={settings.address}
                                onChange={(e) => setSettings({...settings, address: e.target.value})}
                                className="zoho-input min-h-[100px] py-4" 
                            />
                        </div>
                    </div>
                    <button onClick={handleSettingsUpdate} className="zoho-btn-secondary w-full py-4 text-sm rounded-2xl">Commit Configuration Changes</button>
                </div>

                <div className="lg:col-span-5 space-y-10">
                    <div className="zoho-card p-10">
                        <h4 className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] border-b border-border-soft pb-6 mb-8 text-center">Authorized Administrator</h4>
                        <div className="flex flex-col items-center">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary-red rounded-[32px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <div className="w-24 h-24 rounded-[32px] bg-primary-navy text-white flex items-center justify-center font-extrabold text-3xl border-4 border-white shadow-2xl relative z-10 transition-transform group-hover:scale-105 duration-500">
                                    {user?.name?.[0]}
                                </div>
                            </div>
                            <div className="text-center mt-6">
                                <p className="text-xl font-bold text-primary-navy">{user?.name}</p>
                                <p className="text-xs font-bold text-text-muted mt-1">{user?.email}</p>
                                <div className="mt-4 px-4 py-1.5 bg-primary-navy text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Full Access Control</div>
                            </div>
                        </div>
                    </div>

                    <div className="zoho-card p-10 space-y-6">
                        <div className="flex items-center gap-3 border-b border-border-soft pb-6">
                            <ShieldCheck size={20} className="text-primary-red" />
                            <h4 className="text-sm font-bold text-primary-navy uppercase tracking-widest">Security Override</h4>
                        </div>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">New Access Token</label>
                                <input type="password" placeholder="••••••••" className="zoho-input" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Confirm Authorization</label>
                                <input type="password" placeholder="••••••••" className="zoho-input" />
                            </div>
                            <button className="zoho-btn-secondary w-full py-4 text-xs font-black">Update Security Credentials</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderEmployees = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                     <h3 className="text-xl font-bold text-primary-navy">Staff Management</h3>
                     <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Field Technicians & Office Personnel</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingEmployee(null);
                        setEmployeeForm({ name: '', email: '', phone: '', password: '', role: 'employee', address: '' });
                        setShowEmployeeModal(true);
                    }}
                    className="zoho-btn-secondary px-6 py-3 rounded-xl flex items-center gap-2"
                >
                    <Plus size={18} />
                    Register Employee
                </button>
            </div>

            <div className="zoho-card overflow-hidden">
                <div className="p-6 border-b border-border-soft flex items-center justify-between">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                        <input type="text" placeholder="Search operational staff..." className="zoho-input pl-9" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="zoho-table">
                        <thead>
                            <tr className="zoho-table-header">
                                <th className="px-6 py-4">ID Reference</th>
                                <th className="px-6 py-4">Information</th>
                                <th className="px-6 py-4 uppercase">Credentials</th>
                                <th className="px-6 py-4 uppercase">Designation</th>
                                <th className="px-6 py-4 uppercase">Duty Status</th>
                                <th className="px-6 py-4 uppercase text-center">Job Load</th>
                                <th className="px-6 py-4 uppercase text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-soft">
                            {employees.map(e => (
                                <tr key={e._id} className="hover:bg-bg-soft/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase"># {e._id.substring(18)}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-primary-navy text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                                {e.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-primary-navy leading-none">{e.name}</p>
                                                <p className="text-[10px] text-text-muted mt-1 font-semibold">{e.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-text-muted">{e.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-bg-soft text-primary-navy px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border border-border-soft">
                                            {e.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${e.isActive ? 'bg-status-success-text shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-text-muted'}`} />
                                            <span className={`text-[10px] font-bold uppercase ${e.isActive ? 'text-status-success-text' : 'text-text-muted'}`}>
                                                {e.isActive ? 'Active' : 'Offline'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <p className="text-sm font-extrabold text-primary-navy">{e.assignedJobs || 0}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button 
                                                onClick={() => {
                                                    setEditingEmployee(e);
                                                    setEmployeeForm({ ...e, password: '' });
                                                    setShowEmployeeModal(true);
                                                }}
                                                className="zoho-btn-secondary px-4 py-2 rounded-lg text-[10px]"
                                            >
                                                Configure
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderProducts = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-between items-center">
                <div>
                     <h3 className="text-xl font-bold text-primary-navy">Product Catalog</h3>
                     <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">CCTV Hardware & Registry</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingProduct(null);
                        setProductForm({ name: '', sku: '', category: '', brand: '', price: '', quantity: '', image: '' });
                        setShowProductModal(true);
                    }}
                    className="zoho-btn-secondary px-6 py-3 rounded-xl flex items-center gap-2"
                >
                    <Plus size={18} />
                    New Hardware Entry
                </button>
            </div>

            <div className="zoho-card overflow-hidden">
                <div className="p-6 border-b border-border-soft flex items-center justify-between">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                        <input type="text" placeholder="Search inventory catalog..." className="zoho-input pl-9" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="zoho-table">
                        <thead>
                            <tr className="zoho-table-header">
                                <th className="px-6 py-4 uppercase">Item Image</th>
                                <th className="px-6 py-4">Hardware Info</th>
                                <th className="px-6 py-4 uppercase">Reference ID</th>
                                <th className="px-6 py-4 uppercase">Classification</th>
                                <th className="px-6 py-4 uppercase">Manufacturer</th>
                                <th className="px-6 py-4 uppercase">Unit Value</th>
                                <th className="px-6 py-4 uppercase text-center">Available</th>
                                <th className="px-6 py-4 uppercase text-center">Stock State</th>
                                <th className="px-6 py-4 uppercase text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-soft">
                            {stocks.map(s => (
                                <tr key={s._id} className="hover:bg-bg-soft/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="w-12 h-12 bg-bg-soft rounded-lg overflow-hidden border border-border-soft flex items-center justify-center shadow-inner group-hover:border-primary-navy/20 transition-all">
                                            {s.productImage ? <img src={s.productImage} className="w-full h-full object-cover" alt="" /> : <Package className="text-text-muted" size={20} />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-primary-navy group-hover:text-primary-red transition-colors">{s.name}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase"># {s.sku}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-primary-navy">{s.category}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[10px] text-text-muted font-bold uppercase">{s.brand}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-extrabold text-primary-navy">₹{s.price.toLocaleString()}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <p className="text-sm font-extrabold text-primary-navy">{s.quantity}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`status-chip ${
                                            s.quantity < 10 ? 'bg-status-danger-bg text-status-danger-text' : 
                                            s.quantity < 20 ? 'bg-status-warning-bg text-status-warning-text' : 
                                            'bg-status-success-bg text-status-success-text'
                                        }`}>{s.quantity < 10 ? 'Critical' : s.quantity < 20 ? 'Warning' : 'Stable'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button 
                                                onClick={() => {
                                                    setEditingProduct(s);
                                                    setProductForm({ ...s });
                                                    setShowProductModal(true);
                                                }}
                                                className="zoho-btn-secondary px-4 py-2 rounded-lg text-[10px]"
                                            >
                                                Update
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderInventory = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-between items-center">
                <div>
                     <h3 className="text-xl font-bold text-primary-navy">Inventory Registry</h3>
                     <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Real-time Stock Audit & Reorder Metrics</p>
                </div>
            </div>

            <div className="zoho-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="zoho-table">
                        <thead>
                            <tr className="zoho-table-header">
                                <th className="px-6 py-4 uppercase text-left">Hardware Identifier</th>
                                <th className="px-6 py-4 uppercase text-left">SKU Reference</th>
                                <th className="px-6 py-4 uppercase text-center">Available Quantity</th>
                                <th className="px-6 py-4 uppercase text-center">Reorder Threshold</th>
                                <th className="px-6 py-4 uppercase text-center">Operational Status</th>
                                <th className="px-6 py-4 uppercase text-left">Last Audit</th>
                                <th className="px-6 py-4 uppercase text-right">Stock Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-soft">
                            {stocks.map(s => (
                                <tr key={s._id} className="hover:bg-bg-soft/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-primary-navy leading-none">{s.name}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest"># {s.sku}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <p className="text-sm font-extrabold text-primary-navy">{s.quantity} Units</p>
                                    </td>
                                    <td className="px-6 py-4 text-center text-[10px] font-bold text-text-muted uppercase">
                                        {s.reorderLevel || 5} Units
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`status-chip ${
                                            s.quantity > (s.reorderLevel || 5) ? 'bg-status-success-bg text-status-success-text' : 'bg-status-danger-bg text-status-danger-text'
                                        }`}>{s.quantity > (s.reorderLevel || 5) ? 'Operational' : 'Critical Level'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-[10px] text-text-muted font-black tracking-tighter uppercase whitespace-nowrap">
                                        {new Date(s.updatedAt).toLocaleDateString()} @ {new Date(s.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button 
                                                onClick={() => {
                                                    setEditingProduct(s);
                                                    setShowStockModal(true);
                                                }}
                                                className="zoho-btn-secondary px-4 py-2 rounded-lg text-[10px] whitespace-nowrap"
                                            >
                                                Inbound Update
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );


    const renderEmployeeModal = () => (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 ${showEmployeeModal ? 'visible' : 'invisible'}`}>
            <div className={`absolute inset-0 bg-[#0B1739]/60 backdrop-blur-md transition-opacity duration-500 ${showEmployeeModal ? 'opacity-100' : 'opacity-0'}`} onClick={() => setShowEmployeeModal(false)}></div>
            <div className={`bg-white w-full max-w-xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden transition-all duration-500 transform ${showEmployeeModal ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-12 scale-95 opacity-0'}`}>
                <div className="p-8 border-b border-border-soft flex justify-between items-center bg-bg-soft/30">
                    <div>
                        <h3 className="text-xl font-bold text-primary-navy">{editingEmployee ? 'Staff Configuration' : 'Personnel Registration'}</h3>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Operational Access Management</p>
                    </div>
                    <button onClick={() => setShowEmployeeModal(false)} className="w-10 h-10 rounded-full bg-white border border-border-soft flex items-center justify-center text-text-muted hover:text-primary-red hover:border-primary-red transition-all shadow-sm">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleEmployeeSubmit} className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Legal Name</label>
                            <input required type="text" value={employeeForm.name} onChange={e => setEmployeeForm({...employeeForm, name: e.target.value})} className="zoho-input" placeholder="e.g. John Carter" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Official Email</label>
                            <input required type="email" value={employeeForm.email} onChange={e => setEmployeeForm({...employeeForm, email: e.target.value})} className="zoho-input" placeholder="john@securevision.com" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Contact Number</label>
                            <input required type="text" value={employeeForm.phone} onChange={e => setEmployeeForm({...employeeForm, phone: e.target.value})} className="zoho-input" placeholder="+91 00000 00000" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Access Token</label>
                            <input required={!editingEmployee} type="password" value={employeeForm.password} onChange={e => setEmployeeForm({...employeeForm, password: e.target.value})} className="zoho-input" placeholder={editingEmployee ? 'Unchanged' : 'Min 6 characters'} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Operational Area / Home Base</label>
                        <textarea value={employeeForm.address} onChange={e => setEmployeeForm({...employeeForm, address: e.target.value})} className="zoho-input h-24 resize-none py-3" placeholder="Primary service area or residence address..." />
                    </div>
                    <div className="pt-4">
                        <button type="submit" className="zoho-btn-secondary w-full py-4 text-sm rounded-2xl">
                            {editingEmployee ? 'Commit Changes' : 'Execute Registration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderProductModal = () => (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 ${showProductModal ? 'visible' : 'invisible'}`}>
            <div className={`absolute inset-0 bg-[#0B1739]/60 backdrop-blur-md transition-opacity duration-500 ${showProductModal ? 'opacity-100' : 'opacity-0'}`} onClick={() => setShowProductModal(false)}></div>
            <div className={`bg-white w-full max-w-xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden transition-all duration-500 transform ${showProductModal ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-12 scale-95 opacity-0'}`}>
                <div className="p-8 border-b border-border-soft flex justify-between items-center bg-bg-soft/30">
                    <div>
                        <h3 className="text-xl font-bold text-primary-navy">{editingProduct ? 'Hardware Update' : 'New Hardware Entry'}</h3>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">CCTV Inventory Registry</p>
                    </div>
                    <button onClick={() => setShowProductModal(false)} className="w-10 h-10 rounded-full bg-white border border-border-soft flex items-center justify-center text-text-muted hover:text-primary-red hover:border-primary-red transition-all shadow-sm">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleProductSubmit} className="p-10 space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Hardware Label</label>
                        <input required type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="zoho-input" placeholder="e.g. Sony 4K Bullet Camera" />
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">SKU Reference</label>
                            <input required type="text" value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} className="zoho-input" placeholder="SV-CAM-001" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Classification</label>
                            <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="zoho-input">
                                <option value="">Select Class</option>
                                <option value="Bullet Camera">Bullet Camera</option>
                                <option value="Dome Camera">Dome Camera</option>
                                <option value="PTZ Camera">PTZ Camera</option>
                                <option value="DVR/NVR">DVR/NVR</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Manufacturer</label>
                            <input required type="text" value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value})} className="zoho-input" placeholder="Sony, Hikvision, etc." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Unit Value (₹)</label>
                            <input required type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="zoho-input" placeholder="0.00" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Initial Inbound Quantity</label>
                        <input required type="number" value={productForm.quantity} onChange={e => setProductForm({...productForm, quantity: e.target.value})} className="zoho-input" placeholder="Stock balance..." />
                    </div>
                    <div className="pt-4">
                        <button type="submit" className="zoho-btn-secondary w-full py-4 text-sm rounded-2xl">
                            {editingProduct ? 'Commit Updates' : 'Execute Catalog Entry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderBookingModal = () => (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 ${showBookingModal ? 'visible' : 'invisible'}`}>
            <div className={`absolute inset-0 bg-[#0B1739]/60 backdrop-blur-md transition-opacity duration-500 ${showBookingModal ? 'opacity-100' : 'opacity-0'}`} onClick={() => setShowBookingModal(false)}></div>
            <div className={`bg-white w-full max-w-md rounded-[32px] shadow-2xl relative z-10 overflow-hidden transition-all duration-500 transform ${showBookingModal ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-12 scale-95 opacity-0'}`}>
                <div className="p-8 border-b border-border-soft flex justify-between items-center bg-bg-soft/30">
                    <div>
                        <h3 className="text-xl font-bold text-primary-navy">Booking Directive</h3>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Resource Assignment</p>
                    </div>
                    <button onClick={() => setShowBookingModal(false)} className="w-10 h-10 rounded-full bg-white border border-border-soft flex items-center justify-center text-text-muted hover:text-primary-red hover:border-primary-red transition-all shadow-sm">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleBookingUpdate} className="p-10 space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Operational Status</label>
                        <select value={bookingForm.status} onChange={e => setBookingForm({...bookingForm, status: e.target.value})} className="zoho-input">
                            <option value="Pending">Pending Audit</option>
                            <option value="Accepted">Accepted / Formalized</option>
                            <option value="In Progress">Active Execution</option>
                            <option value="Completed">Completed / Certified</option>
                            <option value="Cancelled">Void / Cancelled</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Assign Lead Technician</label>
                        <select value={bookingForm.assignedEmployee} onChange={e => setBookingForm({...bookingForm, assignedEmployee: e.target.value})} className="zoho-input">
                            <option value="">Awaiting Assignment</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="pt-4">
                        <button type="submit" className="zoho-btn-secondary w-full py-4 text-sm rounded-2xl">
                            Apply Directives
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderStockModal = () => (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 ${showStockModal ? 'visible' : 'invisible'}`}>
            <div className={`absolute inset-0 bg-[#0B1739]/60 backdrop-blur-md transition-opacity duration-500 ${showStockModal ? 'opacity-100' : 'opacity-0'}`} onClick={() => setShowStockModal(false)}></div>
            <div className={`bg-white w-full max-w-sm rounded-[32px] shadow-2xl relative z-10 overflow-hidden transition-all duration-500 transform ${showStockModal ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-12 scale-95 opacity-0'}`}>
                <div className="p-8 border-b border-border-soft flex justify-between items-center bg-bg-soft/30">
                    <div>
                        <h3 className="text-xl font-bold text-primary-navy">Inventory Audit</h3>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Stock Adjustment</p>
                    </div>
                    <button onClick={() => setShowStockModal(false)} className="w-10 h-10 rounded-full bg-white border border-border-soft flex items-center justify-center text-text-muted hover:text-primary-red hover:border-primary-red transition-all shadow-sm">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleStockAdjustmentSubmit} className="p-10 space-y-8">
                    <div className="flex gap-2 p-1.5 bg-bg-soft rounded-2xl border border-border-soft shadow-inner">
                        <button type="button" onClick={() => setStockAdjustment({...stockAdjustment, type: 'add'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${stockAdjustment.type === 'add' ? 'bg-white text-emerald-600 shadow-lg' : 'text-text-muted hover:text-primary-navy'}`}>Inbound (+)</button>
                        <button type="button" onClick={() => setStockAdjustment({...stockAdjustment, type: 'remove'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${stockAdjustment.type === 'remove' ? 'bg-white text-primary-red shadow-lg' : 'text-text-muted hover:text-primary-navy'}`}>Outbound (-)</button>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Delta Quantity</label>
                        <input required type="number" min="1" value={stockAdjustment.quantity} onChange={e => setStockAdjustment({...stockAdjustment, quantity: parseInt(e.target.value)})} className="zoho-input" placeholder="0" />
                    </div>
                    <div className="p-6 bg-primary-navy/[0.03] border border-border-soft rounded-2xl">
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Target Hardware</p>
                        <p className="text-sm text-primary-navy font-bold mt-1 truncate">{editingProduct?.name}</p>
                        <div className="mt-4 pt-4 border-t border-border-soft flex justify-between items-center">
                            <span className="text-[10px] text-text-muted font-bold uppercase">Current Assets</span>
                            <span className="text-sm font-extrabold text-primary-navy">{editingProduct?.quantity} Units</span>
                        </div>
                    </div>
                    <div className="pt-4">
                        <button type="submit" className="zoho-btn-secondary w-full py-4 text-sm rounded-2xl">
                            Confirm Audit Release
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-bg-soft font-sans overflow-hidden">
            {/* Sidebar - CCTV Operations Navy */}
            <aside className={`bg-primary-navy text-white transition-all duration-300 ease-in-out border-r border-navy-dark/50 flex flex-col ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
                <div className="p-6 flex items-center justify-between border-b border-navy-light/20 h-20">
                    {!isSidebarCollapsed && (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary-red rounded-lg flex items-center justify-center shadow-lg shadow-red-900/30">
                                <TrendingUp size={18} className="text-white" />
                            </div>
                            <span className="font-extrabold text-lg tracking-tight uppercase">Secure<span className="text-primary-red">Vision</span></span>
                        </div>
                    )}
                    <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 hover:bg-navy-light/30 rounded-lg transition-colors text-slate-400">
                        {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {[
                        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'bookings', label: 'Bookings', icon: Calendar },
                        { id: 'products', label: 'Products', icon: Package },
                        { id: 'employees', label: 'Employees', icon: Users },
                        { id: 'attendance', label: 'Attendance', icon: UserCheck },
                        { id: 'tracking', label: 'Tracking', icon: Truck },
                        { id: 'enquiries', label: 'Enquiries', icon: Mail },
                        { id: 'settings', label: 'Settings', icon: Settings },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                                activeTab === item.id 
                                ? 'bg-primary-red text-white shadow-lg shadow-red-900/40' 
                                : 'text-slate-400 hover:bg-navy-light/20 hover:text-white'
                            }`}
                        >
                            <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'} />
                            {!isSidebarCollapsed && <span className="text-sm font-bold tracking-wide">{item.label}</span>}
                            {activeTab === item.id && !isSidebarCollapsed && (
                                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-navy-light/20">
                    <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-all font-bold">
                        <LogOut size={20} />
                        {!isSidebarCollapsed && <span className="text-xs uppercase tracking-widest">Logout System</span>}
                    </button>
                </div>
            </aside>

            {/* Main Surface */}
            <main className="flex-grow flex flex-col overflow-hidden">
                <header className="h-20 bg-white border-b border-border-soft flex items-center justify-between px-8 sticky top-0 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-primary-navy tracking-tight capitalize">{activeTab.replace('-', ' ')}</h2>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Operations Management Panel</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => handleTabChange('notifications')}
                            className="p-2.5 text-text-muted hover:text-primary-navy bg-bg-soft rounded-xl transition-all relative"
                        >
                            <Bell size={20} />
                            {notifications.some(n => !n.isRead) && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary-red rounded-full ring-2 ring-white" />}
                        </button>
                        
                        <div className="h-10 w-px bg-border-soft" />

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-primary-navy leading-none">{user?.name}</p>
                                <p className="text-[10px] font-black text-primary-red uppercase tracking-tighter mt-1">Super Admin</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary-navy text-white flex items-center justify-center font-bold shadow-lg">
                                {user?.name?.[0]}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-grow overflow-y-auto bg-bg-soft custom-scrollbar">
                    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
                        {loading ? (
                            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                                <div className="w-12 h-12 border-4 border-primary-navy/10 border-t-primary-red rounded-full animate-spin"></div>
                                <p className="text-text-muted font-bold tracking-widest uppercase text-xs">Initializing Secure Environment...</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {activeTab === 'overview' && renderOverview()}
                                {activeTab === 'bookings' && renderBookings()}
                                {activeTab === 'products' && renderProducts()}
                                {activeTab === 'employees' && renderEmployees()}
                                {activeTab === 'attendance' && renderAttendance()}
                                {activeTab === 'tracking' && renderTracking()}
                                {activeTab === 'enquiries' && renderEnquiries()}
                                {activeTab === 'notifications' && renderNotifications()}
                                {activeTab === 'settings' && renderSettings()}
                            </div>
                        )}
                    </div>
                </div>
                {renderEmployeeModal()}
                {renderProductModal()}
                {renderBookingModal()}
                {renderStockModal()}
            </main>
        </div>
    );
};

export default AdminDashboard;
