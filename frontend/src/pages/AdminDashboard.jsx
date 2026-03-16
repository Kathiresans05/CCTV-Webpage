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
    Play,
    Check,
    Download,
    FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';

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
        // Clear all open modals/overlays on tab change
        setShowEmployeeModal(false);
        setShowProductModal(false);
        setShowBookingModal(false);
        setShowStockModal(false);
        setEditingEmployee(null);
        setEditingProduct(null);
        setEditingBooking(null);
        navigate(tabToPath[tabId]);
    };

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setShowEmployeeModal(false);
                setShowProductModal(false);
                setShowBookingModal(false);
                setShowStockModal(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const [bookings, setBookings] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [enquiries, setEnquiries] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [bookingSearchQuery, setBookingSearchQuery] = useState('');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [bookingsFilter, setBookingsFilter] = useState('All');
    
    // Attendance History State
    const [selectedAttendanceEmployee, setSelectedAttendanceEmployee] = useState('all');
    const [selectedAttendanceMonth, setSelectedAttendanceMonth] = useState(new Date().getMonth());
    const [selectedAttendanceYear, setSelectedAttendanceYear] = useState(new Date().getFullYear());
    const [attendanceSubTab, setAttendanceSubTab] = useState('today');
    const [attendanceSearchQuery, setAttendanceSearchQuery] = useState('');
    const [reportSearchQuery, setReportSearchQuery] = useState('');
    const [reportStartDate, setReportStartDate] = useState(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    );
    const [reportEndDate, setReportEndDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    
    // Modal & Form State
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingBooking, setEditingBooking] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [employeeForm, setEmployeeForm] = useState({ name: '', email: '', phone: '', password: '', role: 'employee', address: '' });
    const initialProductForm = { 
        name: '', 
        sku: '', 
        category: '', 
        brand: '', 
        price: '', 
        quantity: '', 
        productImage: '', 
        productImages: [],
        modelNumber: '',
        resolution: '',
        lensSize: '',
        nightVisionDistance: '',
        warranty: '',
        description: ''
    };
    const [productForm, setProductForm] = useState(initialProductForm);
    const [bookingForm, setBookingForm] = useState({ status: '', assignedEmployee: '' });
    const [stockAdjustment, setStockAdjustment] = useState({ quantity: 0, type: 'add' });
    const [settings, setSettings] = useState({
        companyName: 'SecureVision CCTV',
        email: 'admin@securevision.com',
        phone: '+91 98765 43210',
        address: '123 Secure Tower, IT Corridor, Chennai',
        logo: ''
    });

    useEffect(() => {
        fetchAllData();
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const [bRes, sRes, eRes, qRes, aRes, lRes, nRes] = await Promise.all([
                fetch('/api/admin/bookings', { headers }),
                fetch('/api/products', { headers }),
                fetch('/api/admin/employees', { headers }),
                fetch('/api/admin/enquiries', { headers }),
                fetch('/api/admin/attendance', { headers }),
                fetch('/api/admin/leaves', { headers }),
                fetch('/api/notifications', { headers })
            ]);

            const [bData, sData, eData, qData, aData, lData, nData] = await Promise.all([
                bRes.json(), sRes.json(), eRes.json(), qRes.json(), aRes.json(), lRes.json(), nRes.json()
            ]);

            if (bData.success) setBookings(bData.data);
            if (sData.success) setStocks(sData.data);
            if (eData.success) setEmployees(eData.data);
            if (qData.success) setEnquiries(qData.data);
            if (aData.success) setAttendance(aData.data);
            if (lData.success) setLeaves(lData.data);
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
                toast.success(editingEmployee ? 'Staff member updated successfully!' : 'New employee registered successfully!');
                setShowEmployeeModal(false);
                setEditingEmployee(null);
                setEmployeeForm({ name: '', email: '', phone: '', password: '', role: 'employee', address: '' });
                fetchAllData();
            } else {
                toast.error(`Error: ${data.message || 'Failed to save employee'}`);
            }
        } catch (error) {
            console.error('Error saving employee:', error);
            toast.error(`Network or Server Error: ${error.message}`);
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

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach(file => formData.append('images', file));

        try {
            const res = await fetch('/api/upload-multiple', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                // If single image was selected, set it as main image too
                const newUrls = data.urls;
                setProductForm({ 
                    ...productForm, 
                    productImage: productForm.productImage || newUrls[0],
                    productImages: [...(productForm.productImages || []), ...newUrls].slice(0, 6)
                });
                toast.success(`Successfully uploaded ${newUrls.length} images`);
            } else {
                toast.error(`Upload Failed: ${data.message || 'Unknown Server Error'}`);
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            toast.error(`Error uploading images: ${error.message}`);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingProduct ? `/api/admin/products/${editingProduct._id}` : '/api/admin/products';
            const method = editingProduct ? 'PUT' : 'POST';

            // Mapping frontend fields to backend Stock model
            const submissionData = {
                ...productForm,
                productName: productForm.name,
                productId: productForm.sku || `PRD-${Date.now()}`, // Stock model requires productId
                price: Number(productForm.price),
                quantity: Number(productForm.quantity),
                modelNumber: productForm.modelNumber,
                resolution: productForm.resolution,
                lensSize: productForm.lensSize,
                nightVisionDistance: productForm.nightVisionDistance,
                warranty: productForm.warranty,
                description: productForm.description
            };

            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submissionData)
            });
            const data = await res.json();
            if (data.success) {
                toast.success(editingProduct ? 'Hardware updated successfully' : 'New hardware added to catalog');
                setShowProductModal(false);
                setEditingProduct(null);
                setProductForm(initialProductForm);
                fetchAllData();
            } else {
                toast.error(`Catalog Entry Failed: ${data.message || 'Please check all required fields.'}`);
            }
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error(`Execution Error: ${error.message}`);
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

    const handleLeaveStatusUpdate = async (id, status, adminNotes = '') => {
        try {
            const res = await fetch(`/api/admin/leaves/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, adminNotes })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Leave request ${status.toLowerCase()} successfully`);
                fetchAllData();
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Error updating leave status:', error);
            toast.error('Error connecting to server');
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
        toast.success('Business configuration updated successfully');
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('images', file);

        try {
            const res = await fetch('/api/upload-multiple', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setSettings({ ...settings, logo: data.urls[0] });
                toast.success('Company logo uploaded successfully');
            } else {
                toast.error(`Logo Upload Failed: ${data.message || 'Unknown Error'}`);
            }
        } catch (error) {
            console.error('Error uploading logo:', error);
            toast.error(`Error uploading logo: ${error.message}`);
        }
    };

    const renderOverview = () => {
        // Calculate dynamic values for new KPI cards
        const kpis = {
            operations: [
                { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'text-primary-navy', bg: 'bg-primary-navy/10', trend: '+12%', onClick: () => { setActiveTab('bookings'); setBookingsFilter('All'); } },
                { label: 'Pending', value: bookings.filter(b => b.status === 'Pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10', trend: 'Needs action', onClick: () => { setActiveTab('bookings'); setBookingsFilter('Pending'); } },
                { label: 'In Progress', value: bookings.filter(b => b.status === 'In Progress').length, icon: Truck, color: 'text-orange-500', bg: 'bg-orange-500/10', trend: 'Active', onClick: () => { setActiveTab('bookings'); setBookingsFilter('In Progress'); } },
                { label: 'Completed', value: bookings.filter(b => b.status === 'Completed').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10', trend: '+5%', onClick: () => { setActiveTab('bookings'); setBookingsFilter('Completed'); } }
            ],
            staff: [
                { label: 'Total Employees', value: employees.length, icon: Users, color: 'text-primary-navy', bg: 'bg-bg-soft', trend: 'Stable' },
                { label: 'Present Today', value: attendance.length, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-500/10', trend: 'Live' },
                { label: 'Technicians Active', value: employees.filter(e => e.isActive).length, icon: Play, color: 'text-status-info-text', bg: 'bg-status-info-bg', trend: 'Field' }
            ]
        };

        const renderKpiCard = (stat, idx) => (
            <div 
                key={idx} 
                onClick={stat.onClick}
                className={`bg-white border border-border-soft rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:border-primary-navy/20 transition-all h-32 ${stat.onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-95' : 'cursor-default'}`}
            >
                <div className="flex justify-between items-start">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
                        <stat.icon size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-[9px] font-black text-text-muted bg-bg-soft px-2 py-0.5 rounded-full tracking-wider uppercase">
                        {stat.trend}
                    </span>
                </div>
                <div>
                    <p className="crm-label">{stat.label}</p>
                    <h3 className="crm-section-title mt-1">{stat.value}</h3>
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

                    <div className="bg-primary-navy p-8 rounded-[16px] text-white relative overflow-hidden">
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

            <div className="zoho-card overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        {['All', 'Pending', 'In Progress', 'Completed'].map(f => (
                            <button
                                key={f}
                                onClick={() => setBookingsFilter(f)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                    bookingsFilter === f 
                                    ? 'bg-primary-navy text-white' 
                                    : 'bg-bg-soft text-text-muted hover:bg-white border border-transparent hover:border-border-soft'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="zoho-search-bar w-96 group">
                        <Search className="text-gray-400 group-focus-within:text-[#2563EB] transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search operational registry (Customer, ID)..." 
                            value={bookingSearchQuery}
                            onChange={(e) => setBookingSearchQuery(e.target.value)}
                        />
                        {bookingSearchQuery && (
                            <button 
                                onClick={() => setBookingSearchQuery('')}
                                className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
                            >
                                <X size={16} />
                            </button>
                        )}
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
                                <th className="px-6 py-4">Schedule</th>
                                <th className="px-6 py-4">Deployment Site</th>
                                <th className="px-6 py-4 text-center">Assigned</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-soft">
                            {bookings
                                .filter(b => 
                                    bookingsFilter === 'All' || b.status === bookingsFilter
                                )
                                .filter(b => 
                                    b.customerName?.toLowerCase().includes(bookingSearchQuery.toLowerCase()) || 
                                    b.bookingId?.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
                                    b.customerPhone?.includes(bookingSearchQuery)
                                )
                                .map(b => (
                                <tr key={b._id} className="hover:bg-bg-soft/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-tighter">#SV-{b.bookingId.substring(0, 8).toUpperCase()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="crm-card-title leading-none">{b.customerName}</p>
                                        <p className="crm-body text-[10px] mt-1">{new Date(b.createdAt).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-text-muted">{b.customerPhone}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-primary-navy truncate max-w-[140px]">{b.productName}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[11px] font-bold text-primary-navy flex items-center gap-1">
                                                <Calendar size={10} className="text-primary-red" />
                                                {b.preferredDate ? new Date(b.preferredDate).toLocaleDateString() : 'N/A'}
                                            </p>
                                            <p className="text-[10px] font-bold text-text-muted flex items-center gap-1">
                                                <Clock size={10} />
                                                {b.preferredTime || 'N/A'}
                                            </p>
                                        </div>
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
                                            {b.acceptedAt && <p className="text-[9px] font-bold text-text-muted flex items-center gap-1"><Clock size={8}/> Accepted: {new Date(b.acceptedAt).toLocaleDateString()} {new Date(b.acceptedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</p>}
                                            {b.startedAt && <p className="text-[9px] font-bold text-blue-500 flex items-center gap-1"><Clock size={8}/> Started: {new Date(b.startedAt).toLocaleDateString()} {new Date(b.startedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</p>}
                                            {b.completedAt && <p className="text-[9px] font-bold text-status-success-text flex items-center gap-1"><Clock size={8}/> Done: {new Date(b.completedAt).toLocaleDateString()} {new Date(b.completedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</p>}
                                            {!b.acceptedAt && !b.startedAt && !b.completedAt && <span className="text-[9px] text-text-muted">—</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`status-chip ${
                                            b.status === 'Completed' ? 'bg-status-success-bg text-status-success-text' : 'bg-status-info-bg text-status-info-text'
                                        }`}>{b.status}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {b.proofPhotos && b.proofPhotos.length > 0 ? (
                                            <div className="flex gap-1 flex-wrap">
                                                {b.proofPhotos.map((photo, idx) => (
                                                    <a key={idx} href={photo} target="_blank" rel="noreferrer">
                                                        <div className="w-10 h-10 rounded-lg bg-bg-soft border border-border-soft overflow-hidden cursor-zoom-in shadow-sm hover:scale-110 transition-transform">
                                                            <img src={photo} alt={`Proof ${idx+1}`} className="w-full h-full object-cover" />
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        ) : b.proofPhoto ? (
                                            <a href={b.proofPhoto} target="_blank" rel="noreferrer">
                                                <div className="w-10 h-10 rounded-lg bg-bg-soft border border-border-soft overflow-hidden cursor-zoom-in shadow-sm hover:scale-110 transition-transform">
                                                    <img src={b.proofPhoto} alt="Proof" className="w-full h-full object-cover" />
                                                </div>
                                            </a>
                                        ) : (
                                            <span className="text-[10px] text-text-muted bg-bg-soft px-2 py-1 rounded border border-border-soft">No Evidence</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="text-[10px] text-text-muted font-medium max-w-[120px] truncate ml-auto italic">
                                            {b.workNotes || 'No notes available'}
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

    const renderAttendance = () => {
        // 1. Generate date range
        const start = new Date(reportStartDate);
        const end = new Date(reportEndDate);
        const reportDays = [];
        let current = new Date(start);
        
        // Safety break for invalid dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return <div className="p-10 text-center text-text-muted">Invalid Date Range Selected</div>;
        }

        while (current <= end) {
            reportDays.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        // Show newest dates first
        reportDays.reverse();

        // 2. Filter employees by search query
        const filteredEmployees = employees.filter(emp => 
            (emp.name || '').toLowerCase().includes(reportSearchQuery.toLowerCase())
        );

        // 3. Prepare report data
        const reportRows = [];
        filteredEmployees.forEach(emp => {
            reportDays.forEach(day => {
                const record = attendance.find(a => 
                    a.employeeId?._id === emp._id && 
                    new Date(a.date).toDateString() === day.toDateString()
                );
                
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const status = record ? (record.checkOut ? 'Present' : 'Active') : 'Absent';
                
                reportRows.push({
                    id: `${emp._id}-${day.getTime()}`,
                    employeeName: emp.name,
                    empRole: emp.role,
                    date: day,
                    login: record?.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '—',
                    logout: record?.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : (record ? 'Active' : '—'),
                    workingHours: record?.totalHours || '0.0',
                    status: status,
                    isWeekend: isWeekend
                });
            });
        });

        const handleExport = () => {
            if (reportRows.length === 0) {
                toast.error("No data to export");
                return;
            }
            
            const excelData = reportRows.map(row => ({
                'Employee Name': row.employeeName,
                'Designation': row.empRole,
                'Date': row.date.toLocaleDateString(),
                'Day': row.date.toLocaleDateString(undefined, { weekday: 'long' }),
                'Login Time': row.login,
                'Logout Time': row.logout,
                'Working Hours': row.workingHours,
                'Status': row.status
            }));

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");
            
            // Auto-size columns (rough approximation)
            const wscols = [
                {wch: 25}, {wch: 20}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 10}
            ];
            worksheet['!cols'] = wscols;

            XLSX.writeFile(workbook, `Attendance_Report_${reportStartDate}_to_${reportEndDate}.xlsx`);
            toast.success("Excel report generated");
        };

        return (
            <div className="space-y-6 animate-in fade-in duration-700">
                {/* Compact Report Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-[24px] border border-border-soft shadow-sm">
                    <div className="flex flex-wrap items-center gap-4 flex-grow">
                        <div className="zoho-search-bar w-full lg:w-72 group">
                            <Search className="text-gray-400 group-focus-within:text-primary-navy transition-colors" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search by employee name..." 
                                value={reportSearchQuery}
                                onChange={(e) => setReportSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex items-center gap-3">
                             <div className="flex items-center gap-3 bg-bg-soft px-4 py-2.5 rounded-2xl border border-border-soft">
                                <Calendar size={14} className="text-primary-navy" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-text-muted uppercase leading-none mb-1">From Date</span>
                                    <input 
                                        type="date" 
                                        value={reportStartDate}
                                        onChange={(e) => setReportStartDate(e.target.value)}
                                        className="bg-transparent text-xs font-bold text-primary-navy border-none focus:ring-0 p-0 h-4"
                                    />
                                </div>
                             </div>
                             <div className="flex items-center gap-3 bg-bg-soft px-4 py-2.5 rounded-2xl border border-border-soft">
                                <Calendar size={14} className="text-primary-navy" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-text-muted uppercase leading-none mb-1">To Date</span>
                                    <input 
                                        type="date" 
                                        value={reportEndDate}
                                        onChange={(e) => setReportEndDate(e.target.value)}
                                        className="bg-transparent text-xs font-bold text-primary-navy border-none focus:ring-0 p-0 h-4"
                                    />
                                </div>
                             </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl text-[11px] font-bold transition-all shadow-lg shadow-emerald-200/50 uppercase tracking-wider"
                    >
                        <FileSpreadsheet size={16} />
                        Export Excel
                    </button>
                </div>

                {/* Report Table */}
                <div className="zoho-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="zoho-table">
                            <thead>
                                <tr className="zoho-table-header uppercase">
                                    <th className="px-6 py-4">Employee Name</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Login</th>
                                    <th className="px-6 py-4">Logout</th>
                                    <th className="px-6 py-4 text-center">Working Hours</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-soft">
                                {reportRows.length > 0 ? reportRows.map((row) => (
                                    <tr key={row.id} className={`hover:bg-bg-soft/50 transition-colors ${row.isWeekend ? 'bg-bg-soft/10' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary-navy text-white flex items-center justify-center font-bold text-xs uppercase">
                                                    {row.employeeName[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-primary-navy">{row.employeeName}</p>
                                                    <p className="text-[10px] text-text-muted font-semibold uppercase">{row.empRole}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <p className="text-xs font-bold text-primary-navy">{row.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                                <p className="text-[9px] text-text-muted font-bold uppercase">{row.date.getFullYear()}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-primary-navy">{row.login}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className={`text-xs font-bold ${row.logout === 'Active' ? 'text-emerald-600 animate-pulse' : 'text-primary-navy'}`}>{row.logout}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <p className="text-xs font-black text-primary-navy">
                                                {row.workingHours} <span className="text-[9px] text-text-muted font-bold uppercase">hrs</span>
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`status-chip pointer-events-none ${
                                                row.status === 'Absent' ? 'bg-status-danger-bg text-primary-red border border-primary-red/20' :
                                                row.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                                'bg-status-success-bg text-status-success-text border border-emerald-100'
                                            }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <Search size={40} className="text-text-muted opacity-20 mb-4" />
                                                <p className="text-text-muted font-bold uppercase tracking-[0.2em] text-xs">No records matching your search or range</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderTodayAttendance = () => {
        const today = new Date();
        const todayStr = today.toDateString();
        
        // Match employees with today's attendance
        const todayData = employees.map(emp => {
            const record = attendance.find(a => 
                a.employeeId?._id === emp._id && 
                new Date(a.date).toDateString() === todayStr
            );
            return { employee: emp, record };
        });

        // KPI Calculations
        const presentToday = todayData.filter(d => d.record).length;
        const absentToday = todayData.length - presentToday;
        const activeEmployees = todayData.filter(d => d.record && !d.record.checkOut).length;
        const lateArrivals = todayData.filter(d => {
            if (!d.record) return false;
            const checkIn = new Date(d.record.checkIn);
            return checkIn.getHours() > 9 || (checkIn.getHours() === 9 && checkIn.getMinutes() > 15);
        }).length;

        const filteredTodayData = todayData.filter(d => 
            (d.employee?.name || '').toLowerCase().includes(attendanceSearchQuery.toLowerCase())
        );

        return (
            <div className="space-y-8 animate-in fade-in duration-700">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-primary-navy uppercase tracking-tight">Today Attendance</h3>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Real-time Personnel Status Registry</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl border border-border-soft shadow-sm">
                        <p className="text-xs font-bold text-primary-navy">{today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="zoho-card p-6 border-l-4 border-status-success-text">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-status-success-bg flex items-center justify-center text-status-success-text">
                                <UserCheck size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Present Today</p>
                                <h4 className="text-2xl font-black text-primary-navy mt-1">{presentToday}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="zoho-card p-6 border-l-4 border-primary-red">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-status-danger-bg flex items-center justify-center text-primary-red">
                                <XCircle size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Absent Today</p>
                                <h4 className="text-2xl font-black text-primary-navy mt-1">{absentToday}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="zoho-card p-6 border-l-4 border-status-warning-text">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-status-warning-bg flex items-center justify-center text-status-warning-text">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Late Arrivals</p>
                                <h4 className="text-2xl font-black text-primary-navy mt-1">{lateArrivals}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="zoho-card p-6 border-l-4 border-blue-500">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Active Shifts</p>
                                <h4 className="text-2xl font-black text-primary-navy mt-1">{activeEmployees}</h4>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Content with Box Layout */}
                <div className="zoho-card overflow-hidden">
                    {/* Integrated Search Bar */}
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
                        <div className="zoho-search-bar w-96 group">
                            <Search className="text-gray-400 group-focus-within:text-[#2563EB] transition-colors" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search by employee name..." 
                                value={attendanceSearchQuery}
                                onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="zoho-table">
                            <thead>
                                <tr className="zoho-table-header uppercase">
                                    <th className="px-6 py-4">Employee Name</th>
                                    <th className="px-6 py-4">Login Time</th>
                                    <th className="px-6 py-4">Logout Time</th>
                                    <th className="px-6 py-4 text-center">Working Hours</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-soft">
                                {filteredTodayData.length > 0 ? filteredTodayData.map((d, idx) => {
                                    const { employee: emp, record } = d;
                                    const isLate = record && (new Date(record.checkIn).getHours() > 9 || (new Date(record.checkIn).getHours() === 9 && new Date(record.checkIn).getMinutes() > 15));
                                    const isActive = record && !record.checkOut;
                                    
                                    // Calculate dynamic working hours if active
                                    let displayHours = record ? (record.totalHours || '0.0') : '0.0';
                                    if (isActive && record.checkIn) {
                                        const now = new Date();
                                        const checkInTime = new Date(record.checkIn);
                                        const diff = (now - checkInTime) / (1000 * 60 * 60);
                                        displayHours = diff.toFixed(2);
                                    }

                                    return (
                                        <tr key={emp._id} className="hover:bg-bg-soft/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary-navy text-white flex items-center justify-center font-bold text-sm">
                                                        {emp.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-primary-navy">{emp.name}</p>
                                                        <p className="text-[10px] text-text-muted font-semibold uppercase">{emp.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {record?.checkIn ? (
                                                    <div className="flex items-center gap-2 text-primary-navy">
                                                        <Clock size={12} className="text-emerald-500" />
                                                        <p className="text-sm font-bold">{new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                                    </div>
                                                ) : <span className="text-text-muted/40 font-bold">—</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                {record?.checkOut ? (
                                                    <div className="flex items-center gap-2 text-primary-navy">
                                                        <Clock size={12} className="text-rose-500" />
                                                        <p className="text-sm font-bold">{new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                                    </div>
                                                ) : (isActive ? <span className="text-emerald-600 font-black animate-pulse uppercase text-[10px] tracking-widest bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">Live Active</span> : <span className="text-text-muted/40 font-bold">—</span>)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <p className="text-sm font-black text-primary-navy">
                                                    {displayHours} <span className="text-[10px] text-text-muted">hrs</span>
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`status-chip ${
                                                    !record ? 'bg-status-danger-bg text-status-danger-text' :
                                                    isActive ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' :
                                                    isLate ? 'bg-status-warning-bg text-status-warning-text' :
                                                    'bg-status-success-bg text-status-success-text'
                                                }`}>
                                                    {!record ? 'Absent' : isActive ? 'Active / Open Shift' : isLate ? 'Late Arrival' : 'Present'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <p className="text-text-muted font-bold uppercase tracking-widest text-xs">No personnel records found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderAttendanceView = () => {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Sub-tab Navigation */}
                <div className="flex items-center gap-2 p-1 bg-white inline-flex rounded-2xl border border-border-soft shadow-sm mb-2">
                    <button 
                        onClick={() => setAttendanceSubTab('today')}
                        className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all ${attendanceSubTab === 'today' ? 'bg-primary-navy text-white shadow-lg' : 'text-text-muted hover:text-primary-navy'}`}
                    >
                        Today
                    </button>
                    <button 
                        onClick={() => setAttendanceSubTab('monthly')}
                        className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all ${attendanceSubTab === 'monthly' ? 'bg-primary-navy text-white shadow-lg' : 'text-text-muted hover:text-primary-navy'}`}
                    >
                        Monthly
                    </button>
                    <button 
                        onClick={() => setAttendanceSubTab('leave')}
                        className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all ${attendanceSubTab === 'leave' ? 'bg-primary-navy text-white shadow-lg' : 'text-text-muted hover:text-primary-navy'}`}
                    >
                        Leave
                    </button>
                </div>

                {attendanceSubTab === 'today' ? renderTodayAttendance() : 
                 attendanceSubTab === 'monthly' ? renderAttendance() : 
                 renderLeaves()}
            </div>
        );
    };

    const renderEnquiries = () => (
        <div className="space-y-6 animate-in fade-in duration-500">

            <div className="zoho-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="zoho-table">
                        <thead>
                            <tr className="zoho-table-header">
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4 uppercase">Contact</th>
                                <th className="px-6 py-4 uppercase">Product</th>
                                <th className="px-6 py-4 uppercase">Request</th>
                                <th className="px-6 py-4 uppercase">Date</th>
                                <th className="px-6 py-4 uppercase text-center">Status</th>
                                <th className="px-6 py-4 uppercase text-right">Action</th>
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
                                                className="zoho-btn-secondary px-4 py-3 rounded-xl text-[10px] font-bold"
                                            >
                                                Process
                                            </button>
                                            <button 
                                                onClick={() => updateEnquiryStatus(q._id, 'Closed')}
                                                className="p-2.5 text-text-muted hover:text-primary-red bg-bg-soft hover:bg-white rounded-xl transition-all border border-transparent hover:border-border-soft"
                                                title="Close Enquiry"
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
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
                        <Settings size={20} className="text-primary-red" />
                        <h4 className="text-sm font-bold text-primary-navy uppercase tracking-widest">Company Settings</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Company Name</label>
                            <input 
                                type="text" 
                                value={settings.companyName} 
                                onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                                className="zoho-input" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Support Email</label>
                            <input 
                                type="email" 
                                value={settings.email}
                                onChange={(e) => setSettings({...settings, email: e.target.value})}
                                className="zoho-input" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Contact Number</label>
                            <input 
                                type="text" 
                                value={settings.phone}
                                onChange={(e) => setSettings({...settings, phone: e.target.value})}
                                className="zoho-input" 
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Office Address</label>
                            <textarea 
                                value={settings.address}
                                onChange={(e) => setSettings({...settings, address: e.target.value})}
                                className="zoho-input min-h-[100px] py-4" 
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Company Logo</label>
                            <div className="flex items-center gap-4 mt-2">
                                {settings.logo ? (
                                    <div className="relative group">
                                        <img src={settings.logo} alt="Company Logo" className="w-16 h-16 rounded-xl object-cover border-2 border-border-soft" />
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSettings({...settings, logo: ''});
                                            }}
                                            className="absolute -top-2 -right-2 bg-primary-red text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border-soft flex items-center justify-center bg-bg-soft">
                                        <Camera size={24} className="text-text-muted opacity-30" />
                                    </div>
                                )}
                                <label className="zoho-btn-secondary px-6 py-2.5 rounded-xl cursor-pointer text-xs font-bold hover:bg-bg-soft transition-all">
                                    <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                                    {settings.logo ? 'Change Logo' : 'Upload Logo'}
                                </label>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleSettingsUpdate} className="zoho-btn-secondary w-full py-4 text-sm rounded-2xl">Save Business Settings</button>
                </div>

                <div className="lg:col-span-5 space-y-10">
                    <div className="zoho-card p-10">
                        <h4 className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] border-b border-border-soft pb-6 mb-8 text-center">Authorized Administrator</h4>
                        <div className="flex flex-col items-center">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-[32px] bg-primary-navy text-white flex items-center justify-center font-extrabold text-3xl border-4 border-white relative z-10 transition-transform group-hover:scale-105 duration-500">
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
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
                            <ShieldCheck size={20} className="text-primary-red" />
                            <h4 className="text-sm font-bold text-primary-navy uppercase tracking-widest">Security & Login</h4>
                        </div>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">New Password</label>
                                <input type="password" placeholder="••••••••" className="zoho-input" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Confirm Password</label>
                                <input type="password" placeholder="••••••••" className="zoho-input" />
                            </div>
                            <button className="zoho-btn-secondary w-full py-4 text-xs font-black">Update Password</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderLeaves = () => {
        const filteredLeaves = leaves.filter(l => 
            (l.employeeName || '').toLowerCase().includes((searchQuery || '').toLowerCase())
        );

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="zoho-card overflow-hidden">
                    {/* Integrated Search Bar Header */}
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
                        <div className="zoho-search-bar w-96 group">
                            <Search className="text-gray-400 group-focus-within:text-[#2563EB] transition-colors" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search by employee name..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="zoho-table">
                            <thead>
                                <tr className="zoho-table-header uppercase">
                                    <th className="px-6 py-4">Employee Name</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Duration</th>
                                    <th className="px-6 py-4">Reason</th>
                                    <th className="px-6 py-4">Applied</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-soft">
                                {filteredLeaves.length > 0 ? filteredLeaves.map(l => (
                                    <tr key={l._id} className="hover:bg-bg-soft/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary-navy text-white flex items-center justify-center font-bold text-xs uppercase">
                                                    {l.employeeName?.[0]}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-primary-navy">{l.employeeName}</span>
                                                    <span className="text-[10px] text-text-muted">{l.employeeId?.email || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-semibold text-text-dark">{l.leaveType}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-xs font-medium">
                                                <span>{new Date(l.startDate).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-text-muted">to {new Date(l.endDate).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-text-muted line-clamp-1 max-w-[150px]" title={l.reason}>{l.reason}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-text-muted">
                                            {new Date(l.appliedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`status-chip ${
                                                l.status === 'Approved' ? 'bg-status-success-bg text-status-success-text' :
                                                l.status === 'Rejected' ? 'bg-status-danger-bg text-status-danger-text' :
                                                'bg-status-warning-bg text-status-warning-text'
                                            }`}>
                                                {l.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {l.status === 'Pending' ? (
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleLeaveStatusUpdate(l._id, 'Approved')}
                                                        className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleLeaveStatusUpdate(l._id, 'Rejected')}
                                                        className="p-1.5 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-colors"
                                                        title="Reject"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Processed</span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="py-24 text-center">
                                            <p className="text-text-muted font-bold tracking-widest uppercase text-xs">No pending leave requests</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderEmployees = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-end items-center">
                <button 
                    onClick={() => {
                        setEditingEmployee(null);
                        setEmployeeForm({ name: '', email: '', phone: '', password: '', role: 'employee', address: '' });
                        setShowEmployeeModal(true);
                    }}
                    className="zoho-btn-secondary px-6 py-3 rounded-xl flex items-center gap-2"
                >
                    <Plus size={18} />
                    ADD EMPLOYEE
                </button>
            </div>

            <div className="zoho-card overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="zoho-search-bar w-96 group">
                        <Search className="text-gray-400 group-focus-within:text-[#2563EB] transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search employee name, phone, or ID" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
                            >
                                <X size={16} />
                            </button>
                        )}
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
                            {employees
                                .filter(e => 
                                    e.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    e.phone?.includes(searchQuery) ||
                                    e._id?.includes(searchQuery)
                                )
                                .map(e => (
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

    const renderProducts = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-end items-center">
                <button 
                    onClick={() => {
                        setEditingProduct(null);
                        setProductForm({ name: '', sku: '', category: '', brand: '', price: '', quantity: '', productImage: '' });
                        setShowProductModal(true);
                    }}
                    className="zoho-btn-secondary px-6 py-3 rounded-xl flex items-center gap-2"
                >
                    <Plus size={18} />
                    ADD PRODUCT
                </button>
            </div>

            <div className="zoho-card overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="zoho-search-bar w-96 group">
                        <Search className="text-gray-400 group-focus-within:text-[#2563EB] transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search inventory catalog (name, SKU, brand)..." 
                            value={productSearchQuery}
                            onChange={(e) => setProductSearchQuery(e.target.value)}
                        />
                        {productSearchQuery && (
                            <button 
                                onClick={() => setProductSearchQuery('')}
                                className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
                            >
                                <X size={16} />
                            </button>
                        )}
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
                                                    setProductForm({ 
                                                        ...s, 
                                                        name: s.productName,
                                                        productImages: s.productImages || []
                                                    });
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
                <form onSubmit={handleEmployeeSubmit} className="p-10 space-y-6">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Employee Name</label>
                            <input required type="text" value={employeeForm.name} onChange={e => setEmployeeForm({...employeeForm, name: e.target.value})} className="zoho-input" placeholder="e.g. John Carter" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Official Email</label>
                            <input required type="email" value={employeeForm.email} onChange={e => setEmployeeForm({...employeeForm, email: e.target.value})} className="zoho-input" placeholder="john@securevision.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Contact Number</label>
                            <input required type="text" value={employeeForm.phone} onChange={e => setEmployeeForm({...employeeForm, phone: e.target.value})} className="zoho-input" placeholder="+91 00000 00000" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Password</label>
                            <input required={!editingEmployee} type="password" value={employeeForm.password} onChange={e => setEmployeeForm({...employeeForm, password: e.target.value})} className="zoho-input" placeholder={editingEmployee ? 'Unchanged' : 'Min 6 characters'} />
                        </div>
                    </div>
                    
                    <div className="pt-6 flex justify-end items-center gap-3">
                        <button 
                            type="button" 
                            onClick={() => setShowEmployeeModal(false)}
                            className="px-6 py-3.5 text-sm font-bold text-text-muted hover:text-primary-navy transition-colors"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="zoho-btn-secondary px-8 py-3.5 text-sm rounded-xl shadow-lg">
                            {editingEmployee ? 'Update Employee' : 'Register Employee'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderProductModal = () => (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 ${showProductModal ? 'visible' : 'invisible'}`}>
            <div className={`absolute inset-0 bg-[#0B1739]/60 backdrop-blur-md transition-opacity duration-500 ${showProductModal ? 'opacity-100' : 'opacity-0'}`} onClick={() => setShowProductModal(false)}></div>
            <div className={`bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] shadow-2xl relative z-10 overflow-hidden transition-all duration-500 transform flex flex-col ${showProductModal ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-12 scale-95 opacity-0'}`}>
                {/* Modal Header */}
                <div className="p-8 border-b border-border-soft flex justify-between items-center bg-bg-soft/30">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary-navy text-white flex items-center justify-center shadow-lg shadow-primary-navy/20">
                            {editingProduct ? <Edit size={24} /> : <Plus size={24} />}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-primary-navy">CCTV Inventory Management</h3>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">
                                {editingProduct ? 'Modify Security Hardware Record' : 'Register New Security Asset'}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setShowProductModal(false)} className="w-10 h-10 rounded-full bg-white border border-border-soft flex items-center justify-center text-text-muted hover:text-primary-red hover:border-primary-red transition-all shadow-sm">
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleProductSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className="flex-1 p-10 space-y-8 overflow-y-auto custom-scrollbar">
                        {/* Section 1: Basic Identity */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-primary-navy/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Package size={14} /> Basic Identification
                            </h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Product Name</label>
                                    <input required type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="zoho-input" placeholder="Example – Hikvision 4MP Bullet Camera" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Model Number</label>
                                    <input required type="text" value={productForm.modelNumber} onChange={e => setProductForm({...productForm, modelNumber: e.target.value})} className="zoho-input" placeholder="DS-2CD2043G0" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">SKU Reference</label>
                                    <input required type="text" value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} className="zoho-input" placeholder="SV-CAM-001" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Camera Type</label>
                                    <select required value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="zoho-input">
                                        <option value="">Select Type</option>
                                        <option value="Bullet Camera">Bullet Camera</option>
                                        <option value="Dome Camera">Dome Camera</option>
                                        <option value="PTZ Camera">PTZ Camera</option>
                                        <option value="DVR">DVR</option>
                                        <option value="NVR">NVR</option>
                                        <option value="Accessories">Accessories</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Brand</label>
                                    <input required type="text" value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value})} className="zoho-input" placeholder="Hikvision / Dahua / CP Plus" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Technical Specifications */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-primary-navy/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Settings size={14} /> Technical Specifications
                            </h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Resolution</label>
                                    <input type="text" value={productForm.resolution} onChange={e => setProductForm({...productForm, resolution: e.target.value})} className="zoho-input" placeholder="Example: 2MP / 4MP / 8MP" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Lens Size</label>
                                    <input type="text" value={productForm.lensSize} onChange={e => setProductForm({...productForm, lensSize: e.target.value})} className="zoho-input" placeholder="Example: 2.8mm / 3.6mm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Night Vision Distance</label>
                                    <input type="text" value={productForm.nightVisionDistance} onChange={e => setProductForm({...productForm, nightVisionDistance: e.target.value})} className="zoho-input" placeholder="Example: 30m / 40m" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Warranty</label>
                                    <select value={productForm.warranty} onChange={e => setProductForm({...productForm, warranty: e.target.value})} className="zoho-input">
                                        <option value="">Select Warranty</option>
                                        <option value="1 Year">1 Year</option>
                                        <option value="2 Years">2 Years</option>
                                        <option value="3 Years">3 Years</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Commercial Details */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-primary-navy/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                <BarChart3 size={14} /> Commercial Details
                            </h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Price (₹)</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <span className="text-primary-navy/40 font-bold text-sm">₹</span>
                                        </div>
                                        <input 
                                            required 
                                            type="number" 
                                            value={productForm.price} 
                                            onChange={e => setProductForm({...productForm, price: e.target.value})} 
                                            className="zoho-input !pl-10 pr-4" 
                                            placeholder="5000" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Available Stock</label>
                                    <input required type="number" value={productForm.quantity} onChange={e => setProductForm({...productForm, quantity: e.target.value})} className="zoho-input" placeholder="Initial quantity..." />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Media & Description */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-primary-navy/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Camera size={14} /> Documentation & description
                            </h4>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Product Description</label>
                                    <textarea rows="4" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="zoho-input resize-none py-4" placeholder="Enter detailed product biological and technical specifications..."></textarea>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Product Visuals</label>
                                        <div className="flex items-center gap-4">
                                            <label htmlFor="image-upload" className="text-[10px] font-black text-primary-navy uppercase tracking-widest cursor-pointer hover:text-primary-red transition-colors flex items-center gap-1.5">
                                                <Plus size={12} /> Add Images
                                            </label>
                                            {(productForm.productImages?.length > 0 || productForm.productImage) && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => setProductForm({ ...productForm, productImage: '', productImages: [] })}
                                                    className="text-[10px] font-black text-primary-red uppercase tracking-widest hover:underline flex items-center gap-1.5"
                                                >
                                                    <Trash2 size={12} /> Reset Gallery
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <input 
                                            type="file" 
                                            multiple
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleImageUpload} 
                                            className="hidden" 
                                            id="image-upload" 
                                        />
                                        
                                        {!productForm.productImage && !productForm.productImages?.length ? (
                                            <label 
                                                htmlFor="image-upload"
                                                className="w-full h-40 border-2 border-dashed border-border-soft rounded-[24px] flex flex-col items-center justify-center gap-3 bg-bg-soft/30 hover:bg-bg-soft/60 hover:border-primary-navy/20 cursor-pointer transition-all group"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-text-muted group-hover:text-primary-navy transition-colors shadow-sm">
                                                    <Camera size={20} />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs font-bold text-primary-navy">Upload Product Images</p>
                                                    <p className="text-[10px] text-text-muted mt-1 font-semibold uppercase tracking-tighter">JPG, PNG, WEBP • Multiple supported</p>
                                                </div>
                                            </label>
                                        ) : (
                                            <div className="grid grid-cols-4 gap-4 bg-bg-soft/50 p-4 rounded-[28px] border border-border-soft">
                                                {productForm.productImages?.map((img, idx) => (
                                                    <div key={idx} className={`relative group aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${productForm.productImage === img ? 'border-primary-red shadow-lg ring-4 ring-primary-red/10' : 'border-white hover:border-primary-navy/20 shadow-sm'}`} onClick={() => setProductForm({ ...productForm, productImage: img })}>
                                                        <img src={img} className="h-full w-full object-cover" alt={`Preview ${idx + 1}`} />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <p className="text-white text-[8px] font-bold uppercase tracking-widest">{productForm.productImage === img ? 'Selected' : 'Set Main'}</p>
                                                        </div>
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const newImages = productForm.productImages.filter((_, i) => i !== idx);
                                                                setProductForm({ 
                                                                    ...productForm, 
                                                                    productImages: newImages,
                                                                    productImage: productForm.productImage === img ? (newImages[0] || '') : productForm.productImage
                                                                });
                                                            }}
                                                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-primary-red shadow-md hover:bg-white"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {productForm.productImages?.length < 6 && (
                                                    <label htmlFor="image-upload" className="aspect-square rounded-2xl border-2 border-dashed border-border-soft flex flex-col items-center justify-center bg-white/50 hover:bg-white hover:border-primary-navy/20 cursor-pointer transition-all">
                                                        <Plus size={16} className="text-text-muted" />
                                                        <span className="text-[8px] font-bold text-text-muted uppercase mt-1">Add More</span>
                                                    </label>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="p-8 border-t border-border-soft flex justify-between items-center bg-bg-soft/30">
                        <button 
                            type="button" 
                            onClick={() => setProductForm(initialProductForm)}
                            className="flex items-center gap-2 px-6 py-3.5 text-xs font-black text-text-muted hover:text-primary-red transition-all uppercase tracking-widest"
                        >
                            <Trash2 size={16} /> Clear Form
                        </button>
                        
                        <div className="flex items-center gap-4">
                            <button 
                                type="button" 
                                onClick={() => setShowProductModal(false)}
                                className="px-8 py-3.5 text-xs font-black text-text-muted hover:text-primary-navy transition-all uppercase tracking-widest"
                            >
                                Discard
                            </button>
                            <button type="submit" className="zoho-btn-secondary px-10 py-4 text-sm rounded-[20px] shadow-xl shadow-primary-navy/10 relative overflow-hidden group">
                                <span className="relative z-10 flex items-center gap-2 uppercase font-black tracking-widest text-[11px]">
                                    {editingProduct ? 'Update Inventory' : 'Add to Inventory'}
                                </span>
                            </button>
                        </div>
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
                            <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center shadow-lg shadow-slate-900/30">
                                <TrendingUp size={18} className="text-white" />
                            </div>
                            <span className="font-extrabold text-lg tracking-tight uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>Secure<span className="text-slate-400">Vision</span></span>
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
                        { id: 'tracking', label: 'Tracker', icon: Truck },
                        { id: 'enquiries', label: 'Enquiries', icon: Mail },
                        { id: 'attendance', label: 'Attendance', icon: UserCheck },
                        { id: 'settings', label: 'Settings', icon: Settings },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative border ${
                                activeTab === item.id 
                                ? 'border-slate-500/50 text-white bg-slate-800/30' 
                                : 'border-transparent text-slate-400 hover:bg-navy-light/20 hover:text-white'
                            }`}
                        >
                            <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'} />
                            {!isSidebarCollapsed && <span className="text-sm font-bold tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>{item.label}</span>}
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
                        <h2 className="text-2xl font-bold text-primary-navy capitalize tracking-tight" style={{fontFamily:"'Inter', sans-serif"}}>{activeTab.replace('-', ' ')}</h2>
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

                        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                            <div className="w-9 h-9 rounded-full bg-primary-navy text-white flex items-center justify-center font-bold text-[15px] shadow-sm group-hover:ring-2 ring-primary-navy/20 transition-all duration-200">
                                {user?.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex flex-col items-start hidden sm:flex">
                                <span className="text-[14px] font-semibold text-gray-900 leading-tight" style={{fontFamily:"'Inter', sans-serif"}}>{user?.name}</span>
                                <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200/80 mt-0.5 tracking-wide" style={{fontFamily:"'Inter', sans-serif"}}>Super Admin</span>
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
                                { activeTab === 'attendance' && renderAttendanceView() }
                                { activeTab === 'tracking' && renderTracking() }
                                { activeTab === 'enquiries' && renderEnquiries() }
                                { activeTab === 'leaves' && renderLeaves() }
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
