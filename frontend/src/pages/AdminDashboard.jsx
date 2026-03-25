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
    History,
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
    FileSpreadsheet,
    MessageSquare,
    Receipt,
    ClipboardList
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
    Legend
} from 'recharts';
import Chat from '../components/Chat';
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
        '/admin/settings': 'settings',
        '/admin/notifications': 'notifications',
        '/admin/chat': 'chat',
        '/admin/expenses': 'expenses',
        '/admin/tasks': 'tasks',
        '/admin/leads': 'leads',
        '/admin/follow-ups': 'followups',
        '/admin/reports': 'daily-reports'
    };

    // Reverse mapping for navigation
    const tabToPath = {
        'overview': '/admin/dashboard',
        'employees': '/admin/employees',
        'products': '/admin/products',
        'bookings': '/admin/bookings',
        'enquiries': '/admin/enquiries',
        'attendance': '/admin/attendance',
        'settings': '/admin/settings',
        'notifications': '/admin/notifications',
        'chat': '/admin/chat',
        'expenses': '/admin/expenses',
        'tasks': '/admin/tasks',
        'leads': '/admin/leads',
        'followups': '/admin/follow-ups',
        'daily-reports': '/admin/reports'
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
        setShowLeadModal(false);
        setEditingEmployee(null);
        setEditingProduct(null);
        setEditingBooking(null);
        setSelectedLead(null);
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
    const [leads, setLeads] = useState([]);
    const [dailyReports, setDailyReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [bookingSearchQuery, setBookingSearchQuery] = useState('');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [bookingsFilter, setBookingsFilter] = useState('All');
    const [selectedChatEmployee, setSelectedChatEmployee] = useState(null);
    const [adminExpenses, setAdminExpenses] = useState([]);
    const [expensesFilter, setExpensesFilter] = useState('Pending');
    const [showExpenseApprovalModal, setShowExpenseApprovalModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [expenseActionNote, setExpenseActionNote] = useState('');
    const [adminTasks, setAdminTasks] = useState([]);
    const [tasksFilter, setTasksFilter] = useState('All');
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', employeeName: '', priority: 'Medium', dueDate: '' });
    
    // Follow-ups State
    const [adminFollowUps, setAdminFollowUps] = useState([]);
    const [followUpsFilter, setFollowUpsFilter] = useState('All');
    
    // Lead Form State
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', company: '', serviceInterest: 'CCTV Installation', status: 'New', assignedTo: '', notes: '' });
    
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
    const [bookingForm, setBookingForm] = useState({ status: '', assignedEmployee: '', proposedDate: '', proposedTimeSlot: '', adminNote: '' });
    const [stockAdjustment, setStockAdjustment] = useState({ quantity: 0, type: 'add' });
    const [settings, setSettings] = useState({
        companyName: 'SKTECH CCTV',
        email: 'admin@sktech.com',
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
            const [bRes, sRes, eRes, qRes, aRes, lRes, nRes, ldRes, drRes] = await Promise.all([
                fetch('/api/admin/bookings', { headers }),
                fetch('/api/products', { headers }),
                fetch('/api/admin/employees', { headers }),
                fetch('/api/admin/enquiries', { headers }),
                fetch('/api/admin/attendance', { headers }),
                fetch('/api/admin/leaves', { headers }),
                fetch('/api/notifications', { headers }),
                fetch('/api/leads', { headers }),
                fetch('/api/daily-reports/admin', { headers }),
                fetch('/api/follow-ups', { headers })
            ]);

            const [bData, sData, eData, qData, aData, lData, nData, ldData, drData, fuData] = await Promise.all([
                bRes.json(), sRes.json(), eRes.json(), qRes.json(), aRes.json(), lRes.json(), nRes.json(), ldRes.json(), drRes.json(), fuRes.json()
            ]);

            if (bData.success) setBookings(bData.data);
            if (sData.success) setStocks(sData.data);
            if (eData.success) setEmployees(eData.data);
            if (qData.success) setEnquiries(qData.data);
            if (aData.success) setAttendance(aData.data);
            if (lData.success) setLeaves(lData.data);
            if (nData.success) setNotifications(nData.data);
            if (ldData && ldData.success) setLeads(ldData.data);
            if (drData && drData.success) setDailyReports(drData.data);
            if (fuData && fuData.success) setAdminFollowUps(fuData.data);

            const expRes = await fetch('/api/admin/expenses', { headers });
            const expData = await expRes.json();
            if (expData.success) {
                setAdminExpenses(expData.data);
            } else {
                console.error('Failed to fetch expenses:', expData.message);
            }

            const taskRes = await fetch('/api/admin/tasks', { headers });
            const taskData = await taskRes.json();
            if (taskData.success) setAdminTasks(taskData.data);
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

    const handleLeadSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = selectedLead ? `/api/leads/${selectedLead._id}` : '/api/leads';
            const method = selectedLead ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(leadForm)
            });
            
            const data = await res.json();
            
            if (data.success) {
                toast.success(selectedLead ? 'Lead updated successfully' : 'New lead captured');
                setShowLeadModal(false);
                setSelectedLead(null);
                setLeadForm({ name: '', email: '', phone: '', company: '', serviceInterest: 'CCTV Installation', status: 'New', assignedTo: '', notes: '' });
                fetchAllData();
            } else {
                toast.error(data.message || 'Failed to save lead');
            }
        } catch (error) {
            console.error('Error saving lead:', error);
            toast.error('Connection error');
        }
    };

    const deleteLead = async (id) => {
        if (!window.confirm('Delete this lead permanently?')) return;
        try {
            const res = await fetch(`/api/leads/${id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Lead removed');
                fetchAllData();
            }
        } catch (error) {
            console.error('Error deleting lead:', error);
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
                { label: 'Pending', value: bookings.filter(b => ['Pending', 'pending_schedule', 'reschedule_requested'].includes(b.status)).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10', trend: 'Needs action', onClick: () => { setActiveTab('bookings'); setBookingsFilter('pending_schedule'); } },
                { label: 'In Progress', value: bookings.filter(b => ['In Progress', 'in_progress'].includes(b.status)).length, icon: Truck, color: 'text-orange-500', bg: 'bg-orange-500/10', trend: 'Active', onClick: () => { setActiveTab('bookings'); setBookingsFilter('in_progress'); } },
                { label: 'Completed', value: bookings.filter(b => ['Completed', 'completed'].includes(b.status)).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10', trend: '+5%', onClick: () => { setActiveTab('bookings'); setBookingsFilter('completed'); } }
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
                    <span className="text-[14px] font-black text-text-muted bg-bg-soft px-2 py-0.5 rounded-full tracking-wider uppercase">
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
                    <h4 className="text-[14px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Briefcase size={14} className="text-primary-navy/40" /> Operations
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                        {kpis.operations.map((stat, i) => renderKpiCard(stat, i))}
                    </div>
                </div>

                {/* 2. Staff */}
                <div>
                    <h4 className="text-[14px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
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
                            <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Incoming installation inquiries</p>
                        </div>
                        <button onClick={() => setActiveTab('bookings')} className="zoho-btn-secondary px-5 py-2.5 rounded-lg text-[14px]">View All</button>
                    </div>
                    <div className="space-y-4">
                        {bookings.slice(0, 5).map(b => (
                            <div key={b.bookingId} className="flex items-center justify-between p-4 bg-bg-soft/30 rounded-2xl border border-transparent hover:border-border-soft hover:bg-white hover:shadow-sm transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-full bg-white border border-border-soft flex items-center justify-center font-bold text-text-muted shadow-sm group-hover:border-primary-navy/20">
                                        {b.customerName[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[14px] text-primary-navy">{b.customerName}</p>
                                        <p className="text-[14px] text-text-muted font-medium mt-0.5">{b.productName} • {b.city || 'NY Office'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`status-chip ${
                                        b.status === 'Completed' ? 'bg-status-success-bg text-status-success-text' : 
                                        b.status === 'Pending' ? 'bg-status-warning-bg text-status-warning-text' : 
                                        'bg-status-info-bg text-status-info-text'
                                    }`}>{b.status}</span>
                                    <p className="text-[14px] text-text-muted mt-1.5 font-bold">{new Date(b.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
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
                            <h4 className="text-[14px] font-bold uppercase tracking-widest text-slate-400 mb-6">Technician Pulse</h4>
                            <div className="space-y-5">
                                {attendance.slice(0, 3).map((a, i) => (
                                    <div key={i} className="flex items-center gap-4 transition-transform hover:translate-x-1 cursor-default">
                                        <div className="w-1 h-8 bg-primary-red rounded-full" />
                                        <div>
                                            <p className="text-[14px] font-bold text-white">{a.employeeId?.name || 'Staff Member'}</p>
                                            <p className="text-[14px] text-slate-400 mt-0.5">Clocked In • {new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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
    const renderDailyReports = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-[40px] border border-border-soft shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-navy/5 rounded-full -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110" />
                <div className="relative flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black text-primary-navy tracking-tight uppercase">Daily Work Reports</h2>
                        <p className="text-[14px] text-text-muted mt-2 font-medium">Monitor staff productivity and daily achievements</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="zoho-search-bar w-72 group border border-border-soft">
                            <Search className="text-gray-400 group-focus-within:text-primary-navy transition-colors" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search employee or task..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {dailyReports
                    .filter(report => 
                        report.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        report.workSummary.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(report => (
                        <div key={report._id} className="zoho-card flex flex-col group hover:shadow-2xl transition-all duration-500 border border-border-soft relative overflow-hidden h-full bg-white">
                            <div className="p-8 flex-1">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-primary-navy/5 text-primary-navy flex items-center justify-center font-black text-[14px] border border-primary-navy/10">
                                            {report.employeeName[0]}
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-black text-primary-navy uppercase tracking-tight">{report.employeeName}</p>
                                            <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                                                {new Date(report.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="bg-bg-soft text-text-muted px-3 py-1 rounded-full text-[14px] font-black uppercase tracking-widest border border-border-soft">
                                        {report.status}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100/50">
                                        <h4 className="text-[14px] font-black text-primary-navy uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <History size={12} />
                                            Work Summary
                                        </h4>
                                        <p className="text-[14px] text-text-dark font-medium leading-relaxed italic">
                                            "{report.workSummary}"
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {(report.tasksCompleted || []).map((task, i) => (
                                            <span key={i} className="text-[14px] font-bold bg-white text-primary-navy px-3 py-1 rounded-xl border border-primary-navy/10 shadow-sm">
                                                {task}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-4 bg-bg-soft border-t border-border-soft flex justify-between items-center">
                                <div className="flex items-center gap-2 text-primary-navy">
                                    <Clock size={14} className="opacity-50" />
                                    <span className="text-[14px] font-black uppercase tracking-widest">{report.hoursWorked} Hours</span>
                                </div>
                                <button className="text-[14px] font-black text-primary-navy uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                                    Details
                                </button>
                            </div>
                        </div>
                    ))}
                
                {dailyReports.length === 0 && (
                    <div className="col-span-full py-32 text-center bg-white rounded-[40px] border border-border-soft border-dashed">
                        <div className="flex flex-col items-center gap-4 opacity-20">
                            <FileSpreadsheet size={64} className="text-primary-navy" />
                            <div>
                                <p className="text-primary-navy font-black tracking-[0.2em] uppercase text-[14px]">Waiting for Submissions</p>
                                <p className="text-[14px] font-bold text-text-muted mt-1 uppercase tracking-widest">No daily reports recorded yet.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderBookings = () => (
        <div className="space-y-6 animate-in fade-in duration-500">

            <div className="zoho-card overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        {['All', 'pending_schedule', 'schedule_sent', 'in_progress', 'completed'].map(f => (
                            <button
                                key={f}
                                onClick={() => setBookingsFilter(f)}
                                className={`px-4 py-2 rounded-lg text-[14px] font-bold transition-all ${
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
                                        <p className="text-[14px] font-black text-text-muted uppercase tracking-tighter">#SV-{b.bookingId.substring(0, 8).toUpperCase()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="crm-card-title leading-none">{b.customerName}</p>
                                        <p className="crm-body text-[14px] mt-1">{new Date(b.createdAt).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4 text-[14px] font-bold text-text-muted">{b.customerPhone}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-[14px] font-bold text-primary-navy truncate max-w-[140px]">{b.productName}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[14px] font-bold text-primary-navy flex items-center gap-1">
                                                <Calendar size={10} className="text-primary-red" />
                                                {b.preferredDate ? new Date(b.preferredDate).toLocaleDateString() : 'N/A'}
                                            </p>
                                            <p className="text-[14px] font-bold text-text-muted flex items-center gap-1">
                                                <Clock size={10} />
                                                {b.preferredTime || 'N/A'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-text-muted">
                                            <MapPin size={12} className="shrink-0" />
                                            <p className="text-[14px] font-semibold truncate max-w-[150px]">{b.address}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className="w-7 h-7 rounded-lg bg-primary-navy text-white flex items-center justify-center font-bold text-[14px] shadow-sm">
                                                {b.assignedEmployeeName?.[0] || b.assignedEmployee?.name?.[0] || '?'}
                                            </div>
                                            <p className="text-[14px] font-bold text-primary-navy truncate max-w-[80px] text-center">
                                                {b.assignedEmployeeName || b.assignedEmployee?.name || (b.status === 'Pending' ? 'Pending Assignment' : 'Unassigned')}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`status-chip inline-block ${
                                            ['Completed', 'completed'].includes(b.status) ? 'bg-status-success-bg text-status-success-text' : 
                                            ['Pending', 'pending_schedule', 'reschedule_requested'].includes(b.status) ? 'bg-status-warning-bg text-status-warning-text' : 
                                            'bg-status-info-bg text-status-info-text'
                                        }`}>{b.status.replace('_', ' ')}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button 
                                                onClick={() => {
                                                    setEditingBooking(b);
                                                    setBookingForm({ 
                                                        status: b.status, 
                                                        assignedEmployee: b.assignedEmployee?._id || '',
                                                        proposedDate: b.proposedDate ? new Date(b.proposedDate).toISOString().split('T')[0] : '',
                                                        proposedTimeSlot: b.proposedTimeSlot || '',
                                                        adminNote: b.adminNote || ''
                                                    });
                                                    setShowBookingModal(true);
                                                }}
                                                className="zoho-btn-secondary px-4 py-2 rounded-lg text-[14px] shrink-0"
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
            {bookings.filter(b => ['Accepted', 'In Progress', 'Completed', 'scheduled_confirmed', 'in_progress', 'completed'].includes(b.status)).length === 0 ? (
                <div className="zoho-card p-12 text-center text-text-muted font-bold tracking-widest uppercase text-[14px]">
                    No active deployments found
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {bookings.filter(b => ['Accepted', 'In Progress', 'Completed', 'scheduled_confirmed', 'in_progress', 'completed'].includes(b.status)).map(b => (
                        <div key={b._id} className="zoho-card p-6 hover:shadow-lg transition-all duration-300 flex flex-col h-full bg-white border-gray-200 group">
                            {/* Card Header: Job ID & Status */}
                            <div className="flex justify-between items-start mb-5 pb-5 border-b border-border-soft">
                                <div>
                                    <p className="text-[14px] font-bold text-text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-primary-navy"></span>
                                        JOB ID: #SV-{b.bookingId.substring(0,8).toUpperCase()}
                                    </p>
                                    <h3 className="text-lg font-black text-primary-navy leading-tight" title={b.customerName}>
                                        {b.customerName}
                                    </h3>
                                </div>
                                <span className={`status-chip text-[14px] shrink-0 ml-3 px-3 py-1.5 rounded-lg border ${
                                    ['Completed', 'completed'].includes(b.status) ? 'bg-status-success-bg text-status-success-text border-green-200' : 'bg-status-info-bg text-status-info-text border-blue-200 shadow-sm'
                                }`}>
                                    {b.status.replace('_', ' ')}
                                </span>
                            </div>

                            {/* Product Info */}
                            <div className="mb-6">
                                <p className="text-[14px] font-bold text-text-dark line-clamp-1 p-3.5 bg-bg-soft rounded-xl border border-gray-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]" title={b.productName}>
                                    📦 {b.productName}
                                </p>
                            </div>

                            {/* Assigned & Timeline */}
                            <div className="grid grid-cols-2 gap-6 mb-6 flex-grow">
                                <div>
                                    <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mb-3">Personnel</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-primary-navy text-white flex items-center justify-center font-black text-[14px] shrink-0 shadow-md">
                                            {b.assignedEmployeeName?.[0] || b.assignedEmployee?.name?.[0] || 'T'}
                                        </div>
                                        <p className="text-[14px] font-bold text-primary-navy truncate">
                                            {b.assignedEmployeeName || b.assignedEmployee?.name || 'Unassigned'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mb-3">Timeline</p>
                                    <div className="space-y-2">
                                        {b.acceptedAt && <p className="text-[14px] font-bold text-text-muted flex items-center gap-2"><Clock size={14} className="shrink-0"/> Accepted</p>}
                                        {b.startedAt && <p className="text-[14px] font-bold text-blue-600 flex items-center gap-2"><Clock size={14} className="shrink-0"/> Started</p>}
                                        {b.completedAt && <p className="text-[14px] font-bold text-green-600 flex items-center gap-2"><CheckCircle2 size={14} className="shrink-0"/> Done</p>}
                                        {!b.acceptedAt && !b.startedAt && !b.completedAt && <span className="text-[14px] text-text-muted flex items-center gap-2"><Clock size={14} className="shrink-0 text-gray-400"/> Pending</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Evidence & Observation Footer */}
                            <div className="pt-5 border-t border-border-soft mt-auto flex justify-between items-start gap-4 bg-gray-50/80 -mx-6 -mb-6 px-6 pb-6 rounded-b-[16px]">
                                <div className="max-w-[45%]">
                                    <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mb-3">Evidence</p>
                                    {b.proofPhotos && b.proofPhotos.length > 0 ? (
                                        <div className="flex gap-2 flex-wrap">
                                            {b.proofPhotos.map((photo, idx) => (
                                                <a key={idx} href={photo} target="_blank" rel="noreferrer">
                                                    <div className="w-12 h-12 rounded-lg shrink-0 bg-white border border-gray-200 overflow-hidden cursor-zoom-in hover:scale-105 transition-transform shadow-sm">
                                                        <img src={photo} alt={`Proof ${idx+1}`} className="w-full h-full object-cover" />
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    ) : b.proofPhoto ? (
                                        <a href={b.proofPhoto} target="_blank" rel="noreferrer">
                                            <div className="w-12 h-12 rounded-lg shrink-0 bg-white border border-gray-200 overflow-hidden cursor-zoom-in hover:scale-105 transition-transform shadow-sm">
                                                <img src={b.proofPhoto} alt="Proof" className="w-full h-full object-cover" />
                                            </div>
                                        </a>
                                    ) : (
                                        <span className="text-[14px] text-text-muted font-bold bg-white px-3 py-1.5 rounded-lg border border-gray-200 inline-block shadow-sm">📸 None</span>
                                    )}
                                </div>
                                <div className="text-right flex-1 max-w-[55%] pl-2 border-l border-gray-200">
                                    <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mb-3">Observations</p>
                                    <p className="text-[14px] text-gray-700 font-medium leading-relaxed max-h-20 overflow-y-auto custom-scrollbar pr-1" title={b.workNotes || 'No additional notes provided'}>
                                        {b.workNotes || <span className="text-gray-400 italic">No notes</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
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
                                    <span className="text-[14px] font-bold text-text-muted uppercase leading-none mb-1">From Date</span>
                                    <input 
                                        type="date" 
                                        value={reportStartDate}
                                        onChange={(e) => setReportStartDate(e.target.value)}
                                        className="bg-transparent text-[14px] font-bold text-primary-navy border-none focus:ring-0 p-0 h-4"
                                    />
                                </div>
                             </div>
                             <div className="flex items-center gap-3 bg-bg-soft px-4 py-2.5 rounded-2xl border border-border-soft">
                                <Calendar size={14} className="text-primary-navy" />
                                <div className="flex flex-col">
                                    <span className="text-[14px] font-bold text-text-muted uppercase leading-none mb-1">To Date</span>
                                    <input 
                                        type="date" 
                                        value={reportEndDate}
                                        onChange={(e) => setReportEndDate(e.target.value)}
                                        className="bg-transparent text-[14px] font-bold text-primary-navy border-none focus:ring-0 p-0 h-4"
                                    />
                                </div>
                             </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl text-[14px] font-bold transition-all shadow-lg shadow-emerald-200/50 uppercase tracking-wider"
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
                                                <div className="w-8 h-8 rounded-lg bg-primary-navy text-white flex items-center justify-center font-bold text-[14px] uppercase">
                                                    {row.employeeName[0]}
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-bold text-primary-navy">{row.employeeName}</p>
                                                    <p className="text-[14px] text-text-muted font-semibold uppercase">{row.empRole}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <p className="text-[14px] font-bold text-primary-navy">{row.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                                <p className="text-[14px] text-text-muted font-bold uppercase">{row.date.getFullYear()}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[14px] font-bold text-primary-navy">{row.login}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className={`text-[14px] font-bold ${row.logout === 'Active' ? 'text-emerald-600 animate-pulse' : 'text-primary-navy'}`}>{row.logout}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <p className="text-[14px] font-black text-primary-navy">
                                                {row.workingHours} <span className="text-[14px] text-text-muted font-bold uppercase">hrs</span>
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
                                                <p className="text-text-muted font-bold uppercase tracking-[0.2em] text-[14px]">No records matching your search or range</p>
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
                        <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mt-1">Real-time Personnel Status Registry</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl border border-border-soft shadow-sm">
                        <p className="text-[14px] font-bold text-primary-navy">{today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
                                <p className="text-[14px] font-bold text-text-muted uppercase tracking-widest">Present Today</p>
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
                                <p className="text-[14px] font-bold text-text-muted uppercase tracking-widest">Absent Today</p>
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
                                <p className="text-[14px] font-bold text-text-muted uppercase tracking-widest">Late Arrivals</p>
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
                                <p className="text-[14px] font-bold text-text-muted uppercase tracking-widest">Active Shifts</p>
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
                                                    <div className="w-10 h-10 rounded-xl bg-primary-navy text-white flex items-center justify-center font-bold text-[14px]">
                                                        {emp.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-[14px] font-bold text-primary-navy">{emp.name}</p>
                                                        <p className="text-[14px] text-text-muted font-semibold uppercase">{emp.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {record?.checkIn ? (
                                                    <div className="flex items-center gap-2 text-primary-navy">
                                                        <Clock size={12} className="text-emerald-500" />
                                                        <p className="text-[14px] font-bold">{new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                                    </div>
                                                ) : <span className="text-text-muted/40 font-bold">—</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                {record?.checkOut ? (
                                                    <div className="flex items-center gap-2 text-primary-navy">
                                                        <Clock size={12} className="text-rose-500" />
                                                        <p className="text-[14px] font-bold">{new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                                    </div>
                                                ) : (isActive ? <span className="text-emerald-600 font-black animate-pulse uppercase text-[14px] tracking-widest bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">Live Active</span> : <span className="text-text-muted/40 font-bold">—</span>)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <p className="text-[14px] font-black text-primary-navy">
                                                    {displayHours} <span className="text-[14px] text-text-muted">hrs</span>
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
                                            <p className="text-text-muted font-bold uppercase tracking-widest text-[14px]">No personnel records found</p>
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
                        className={`px-8 py-2.5 rounded-xl text-[14px] font-bold transition-all ${attendanceSubTab === 'today' ? 'bg-primary-navy text-white shadow-lg' : 'text-text-muted hover:text-primary-navy'}`}
                    >
                        Today
                    </button>
                    <button 
                        onClick={() => setAttendanceSubTab('monthly')}
                        className={`px-8 py-2.5 rounded-xl text-[14px] font-bold transition-all ${attendanceSubTab === 'monthly' ? 'bg-primary-navy text-white shadow-lg' : 'text-text-muted hover:text-primary-navy'}`}
                    >
                        Monthly
                    </button>
                    <button 
                        onClick={() => setAttendanceSubTab('leave')}
                        className={`px-8 py-2.5 rounded-xl text-[14px] font-bold transition-all ${attendanceSubTab === 'leave' ? 'bg-primary-navy text-white shadow-lg' : 'text-text-muted hover:text-primary-navy'}`}
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
                                        <p className="text-[14px] font-bold text-primary-navy leading-none">{q.firstName} {q.lastName || ''}</p>
                                        <p className="text-[14px] text-text-muted mt-1.5 font-semibold">{q.phone || 'No Phone'}</p>
                                    </td>
                                    <td className="px-6 py-4 text-[14px] font-bold text-text-muted">{q.email}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-[14px] font-bold text-primary-navy truncate max-w-[150px]">{q.subject || 'Sales Inquiry'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[14px] text-text-muted font-medium truncate max-w-[200px] italic">"{q.message}"</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[14px] font-bold text-text-muted uppercase tracking-tight">{new Date(q.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
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
                                                className="zoho-btn-secondary px-4 py-3 rounded-xl text-[14px] font-bold"
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
                        <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mt-1">System-wide critical events</p>
                     </div>
                     <button onClick={markAllAsRead} className="text-[14px] font-black text-primary-red bg-primary-red/5 px-4 py-2 rounded-xl hover:bg-primary-red hover:text-white transition-all">Acknowledge All</button>
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
                                     <span className="text-[14px] font-bold text-text-muted bg-white px-2 py-0.5 rounded-lg border border-border-soft">{new Date(n.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-[14px] text-text-muted mt-2 leading-relaxed font-medium">{n.message}</p>
                             </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 bg-bg-soft/50 rounded-[40px] border-2 border-dashed border-border-soft">
                             <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center mx-auto mb-6 text-text-muted shadow-sm">
                                <ShieldAlert size={32} />
                             </div>
                             <p className="text-text-muted font-bold uppercase tracking-[0.2em] text-[14px]">No Operational Alerts Detected</p>
                        </div>
                    )}
                </div>
             </div>
        </div>
    );

    const handleExpenseAction = async (status) => {
        try {
            const res = await fetch(`/api/admin/expenses/${selectedExpense._id}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, adminNote: expenseActionNote })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Expense ${status.toLowerCase()} successfully`);
                setShowExpenseApprovalModal(false);
                setExpenseActionNote('');
                fetchAllData();
            }
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const renderExpenses = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-primary-navy tracking-tight">Financial Claims</h2>
                    <p className="text-base text-text-muted mt-1">Review and process staff expense reimbursements</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={fetchAllData}
                        className="p-2 text-text-muted hover:text-primary-navy transition-colors bg-white rounded-lg border border-border-soft"
                        title="Refresh Data"
                    >
                        <History size={18} />
                    </button>
                    {['Pending', 'Approved', 'Rejected', 'All'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setExpensesFilter(f)}
                            className={`px-4 py-2 text-[14px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                expensesFilter === f 
                                ? 'bg-primary-navy text-white shadow-md' 
                                : 'bg-white text-text-muted border border-border-soft hover:bg-bg-soft'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="zoho-card overflow-hidden">
                <table className="zoho-table">
                    <thead>
                        <tr className="zoho-table-header uppercase">
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Submission</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-soft">
                        {adminExpenses.filter(e => expensesFilter === 'All' || e.status === expensesFilter).length > 0 ? (
                            adminExpenses.filter(e => expensesFilter === 'All' || e.status === expensesFilter).map(exp => (
                                <tr key={exp._id} className="hover:bg-bg-soft/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-primary-navy text-[14px]">
                                        {exp.employeeName}
                                    </td>
                                    <td className="px-6 py-4 text-[14px] text-text-muted">
                                        {new Date(exp.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[14px] font-bold text-text-dark uppercase tracking-wider bg-bg-soft px-2 py-1 rounded border border-border-soft">
                                            {exp.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-extrabold text-primary-navy">
                                        ₹{exp.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`status-chip ${
                                            exp.status === 'Approved' ? 'bg-status-success-bg text-status-success-text' :
                                            exp.status === 'Rejected' ? 'bg-status-danger-bg text-status-danger-text' :
                                            'bg-status-warning-bg text-status-warning-text'
                                        }`}>
                                            {exp.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {exp.receiptImage && (
                                                <button 
                                                    onClick={() => { setSelectedExpense(exp); setShowReceiptModal(true); }}
                                                    className="p-2 text-primary-navy hover:bg-bg-soft rounded-lg transition-colors"
                                                    title="View Receipt"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            )}
                                            {exp.status === 'Pending' && (
                                                <button 
                                                    onClick={() => { setSelectedExpense(exp); setShowExpenseApprovalModal(true); }}
                                                    className="p-2 text-primary-navy hover:bg-primary-navy hover:text-white border border-border-soft rounded-lg transition-all"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="py-24 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-30">
                                        <Receipt size={48} />
                                        <p className="text-text-muted font-bold tracking-widest uppercase text-[14px]">No financial claims found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showExpenseApprovalModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[#0B1739]/60 backdrop-blur-md transition-opacity duration-500 opacity-100" onClick={() => setShowExpenseApprovalModal(false)}></div>
                    <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-border-soft flex justify-between items-center bg-bg-soft/30">
                            <div>
                                <h3 className="text-xl font-bold text-primary-navy">Expense Audit</h3>
                                <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mt-1">Status Finalization</p>
                            </div>
                            <button onClick={() => setShowExpenseApprovalModal(false)} className="w-10 h-10 rounded-full bg-white border border-border-soft flex items-center justify-center text-text-muted hover:text-primary-red transition-all shadow-sm">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="p-4 bg-bg-soft rounded-2xl border border-border-soft space-y-1">
                                <p className="text-[14px] text-text-muted font-bold uppercase">Claimant</p>
                                <p className="font-bold text-primary-navy">{selectedExpense?.employeeName}</p>
                                <p className="text-lg font-black text-primary-navy mt-2">₹{selectedExpense?.amount.toLocaleString()}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Internal Audit Note</label>
                                <textarea 
                                    value={expenseActionNote}
                                    onChange={e => setExpenseActionNote(e.target.value)}
                                    className="zoho-input h-24 resize-none py-3" 
                                    placeholder="Add reason for approval or rejection..."
                                />
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => handleExpenseAction('Rejected')}
                                    className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all border border-rose-200"
                                >
                                    Reject
                                </button>
                                <button 
                                    onClick={() => handleExpenseAction('Approved')}
                                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                                >
                                    Approve
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showReceiptModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[#0B1739]/80 backdrop-blur-md transition-opacity duration-500 opacity-100" onClick={() => setShowReceiptModal(false)}></div>
                    <div className="bg-white max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
                        <div className="p-6 border-b border-border-soft flex justify-between items-center bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-primary-navy">Receipt Verification</h3>
                                <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mt-1">Claim ID: {selectedExpense?._id}</p>
                            </div>
                            <button onClick={() => setShowReceiptModal(false)} className="w-10 h-10 rounded-full bg-white border border-border-soft flex items-center justify-center text-text-muted hover:text-primary-red transition-all shadow-sm">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto bg-bg-soft p-4 flex items-center justify-center">
                            <img 
                                src={selectedExpense?.receiptImage} 
                                alt="Expense Receipt" 
                                className="max-w-full h-auto rounded-xl shadow-lg border border-border-soft"
                                onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Receipt+Not+Found'; }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/tasks', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(taskForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Task assigned successfully');
                setShowTaskModal(false);
                setTaskForm({ title: '', description: '', assignedTo: '', employeeName: '', priority: 'Medium', dueDate: '' });
                fetchAllData();
            }
        } catch (error) {
            toast.error('Failed to assign task');
        }
    };

    const handleDeleteTask = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            const res = await fetch(`/api/admin/tasks/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Task deleted');
                fetchAllData();
            }
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const renderTasks = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-primary-navy tracking-tight">Team Operations</h2>
                    <p className="text-[14px] text-text-muted mt-1">Assign and track administrative tasks for staff</p>
                </div>
                <div className="flex gap-4">
                    <button 
                         onClick={() => setShowTaskModal(true)}
                         className="flex items-center gap-2 bg-primary-navy text-white px-6 py-3 rounded-2xl font-bold hover:bg-navy-dark transition-all transform hover:scale-105 shadow-lg shadow-primary-navy/20"
                    >
                        <Plus size={18} /> Assign New Task
                    </button>
                    {['Pending', 'In Progress', 'Completed', 'All'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setTasksFilter(f)}
                            className={`px-4 py-2 text-[14px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                tasksFilter === f 
                                ? 'bg-primary-navy text-white shadow-md' 
                                : 'bg-white text-text-muted border border-border-soft hover:bg-bg-soft'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminTasks.filter(t => tasksFilter === 'All' || t.status === tasksFilter).length > 0 ? (
                    adminTasks.filter(t => tasksFilter === 'All' || t.status === tasksFilter).map(task => (
                        <div key={task._id} className="zoho-card p-6 group hover:border-primary-navy transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[14px] font-black px-2 py-1 rounded border uppercase tracking-widest ${
                                    task.priority === 'Urgent' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                    task.priority === 'High' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                    'bg-bg-soft text-text-muted border-border-soft'
                                }`}>
                                    {task.priority}
                                </span>
                                <button onClick={() => handleDeleteTask(task._id)} className="opacity-0 group-hover:opacity-100 p-2 text-text-muted hover:text-primary-red transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <h3 className="font-bold text-primary-navy mb-2 line-clamp-1">{task.title}</h3>
                            <p className="text-[14px] text-text-muted mb-4 line-clamp-2">{task.description}</p>
                            <div className="space-y-3 pt-4 border-t border-border-soft">
                                <div className="flex justify-between items-center text-[14px] font-bold uppercase tracking-wider">
                                    <span className="text-text-muted">Assigned To</span>
                                    <span className="text-primary-navy">{task.employeeName}</span>
                                </div>
                                <div className="flex justify-between items-center text-[14px] font-bold uppercase tracking-wider">
                                    <span className="text-text-muted">Due Date</span>
                                    <span className="text-primary-navy">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center text-[14px] font-bold uppercase tracking-wider">
                                    <span className="text-text-muted">Status</span>
                                    <span className={`status-chip ${
                                        task.status === 'Completed' ? 'bg-status-success-bg text-status-success-text' :
                                        task.status === 'In Progress' ? 'bg-status-warning-bg text-status-warning-text' :
                                        'bg-status-info-bg text-status-info-text'
                                    }`}>
                                        {task.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center bg-white rounded-[32px] border border-border-soft border-dashed">
                        <div className="flex flex-col items-center gap-3 opacity-30">
                            <ClipboardList size={48} />
                            <p className="text-text-muted font-bold tracking-widest uppercase text-[14px]">No administrative tasks recorded</p>
                        </div>
                    </div>
                )}
            </div>

            {showTaskModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 text-left">
                    <div className="absolute inset-0 bg-[#0B1739]/60 backdrop-blur-md transition-opacity duration-500 opacity-100" onClick={() => setShowTaskModal(false)}></div>
                    <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-border-soft flex justify-between items-center bg-bg-soft/30">
                            <div>
                                <h3 className="text-xl font-bold text-primary-navy">Project Directive</h3>
                                <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mt-1">New Task Assignment</p>
                            </div>
                            <button onClick={() => setShowTaskModal(false)} className="w-10 h-10 rounded-full bg-white border border-border-soft flex items-center justify-center text-text-muted hover:text-primary-red transition-all shadow-sm">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleTaskSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Task Title</label>
                                <input required type="text" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} className="zoho-input" placeholder="e.g. Audit Inventory" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Detail Description</label>
                                <textarea value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} className="zoho-input h-24 resize-none py-3" placeholder="Provide context..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Assign Staff</label>
                                    <select required value={taskForm.assignedTo} onChange={e => {
                                        const emp = employees.find(emp => emp._id === e.target.value);
                                        setTaskForm({...taskForm, assignedTo: e.target.value, employeeName: emp ? emp.name : ''});
                                    }} className="zoho-input">
                                        <option value="">Select Staff</option>
                                        {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Priority</label>
                                    <select required value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})} className="zoho-input">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Target Deadline</label>
                                <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} className="zoho-input" />
                            </div>
                            <button type="submit" className="w-full py-4 bg-primary-navy text-white rounded-2xl font-bold hover:bg-navy-dark transition-all shadow-lg shadow-primary-navy/20 mt-4">
                                Release Directive
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

    const renderFollowUps = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-border-soft shadow-sm">
                <div>
                    <h3 className="text-xl font-bold text-primary-navy uppercase tracking-tight">Staff Follow-ups</h3>
                    <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mt-1">Global Interaction Pipeline</p>
                </div>
                <div className="flex gap-4">
                    {['Pending', 'Completed', 'Missed', 'All'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFollowUpsFilter(f)}
                            className={`px-4 py-2 text-[14px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                followUpsFilter === f 
                                ? 'bg-primary-navy text-white shadow-md' 
                                : 'bg-white text-text-muted border border-border-soft hover:bg-bg-soft'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="zoho-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="zoho-table">
                        <thead>
                            <tr className="zoho-table-header uppercase">
                                <th className="px-6 py-4 text-left">Customer / Lead</th>
                                <th className="px-6 py-4 text-left">Assigned Agent</th>
                                <th className="px-6 py-4 text-left">Scheduled</th>
                                <th className="px-6 py-4 text-left">Interaction Note</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-soft">
                            {adminFollowUps.filter(f => followUpsFilter === 'All' || f.status === followUpsFilter).length > 0 ? (
                                adminFollowUps.filter(f => followUpsFilter === 'All' || f.status === followUpsFilter).map(fu => (
                                    <tr key={fu._id} className="hover:bg-bg-soft/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <p className="text-[14px] font-bold text-primary-navy">{fu.leadId?.name || 'N/A'}</p>
                                                <p className="text-[14px] text-text-muted font-semibold mt-0.5">{fu.leadId?.company || 'Personal'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary-navy/10 text-primary-navy flex items-center justify-center text-[14px] font-bold">
                                                    {fu.assignedTo?.name?.[0]}
                                                </div>
                                                <p className="text-[14px] font-bold text-primary-navy">{fu.assignedTo?.name || 'Unknown'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <p className="text-[14px] font-bold text-primary-navy">{new Date(fu.followUpDate).toLocaleDateString()}</p>
                                                <p className="text-[14px] text-text-muted font-black uppercase">{fu.followUpTime}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[14px] text-text-muted line-clamp-1 max-w-[200px]" title={fu.note}>{fu.note || 'No notes provided'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`status-chip ${
                                                fu.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                                fu.status === 'Missed' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                                'bg-blue-50 text-blue-600 border border-blue-200'
                                            }`}>{fu.status}</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center opacity-30">
                                            <Calendar size={48} />
                                            <p className="text-text-muted font-bold uppercase tracking-[0.2em] text-[14px] mt-4">No follow-ups recorded for this filter.</p>
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

    const renderLeads = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-border-soft shadow-sm">
                <div>
                    <h3 className="text-xl font-bold text-primary-navy uppercase tracking-tight">Leads Management</h3>
                    <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mt-1">Pipeline Tracking & Sales Conversions</p>
                </div>
                <button 
                    onClick={() => {
                        setLeadForm({ name: '', email: '', phone: '', company: '', serviceInterest: 'CCTV Installation', status: 'New', assignedTo: '', notes: '' });
                        setSelectedLead(null);
                        setShowLeadModal(true);
                    }}
                    className="flex items-center gap-2 bg-primary-navy text-white px-6 py-3.5 rounded-2xl text-[14px] font-bold transition-all shadow-lg hover:bg-navy-dark uppercase tracking-wider"
                >
                    <Plus size={16} /> Create New Lead
                </button>
            </div>

            <div className="zoho-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="zoho-table">
                        <thead>
                            <tr className="zoho-table-header uppercase">
                                <th className="px-6 py-4 text-left">Customer</th>
                                <th className="px-6 py-4 text-left">Company</th>
                                <th className="px-6 py-4 text-left">Interest</th>
                                <th className="px-6 py-4 text-left">Assigned To</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-soft">
                            {leads.length > 0 ? leads.map(lead => (
                                <tr key={lead._id} className="hover:bg-bg-soft/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <p className="text-[14px] font-bold text-primary-navy">{lead.name}</p>
                                            <p className="text-[14px] text-text-muted font-semibold mt-0.5">{lead.email} • {lead.phone}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[14px] font-bold text-text-muted truncate max-w-[120px]">{lead.company || 'Private Individual'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[14px] font-bold text-primary-navy bg-primary-navy/5 border border-primary-navy/10 px-2 py-1 rounded-lg uppercase tracking-wider">
                                            {lead.serviceInterest}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[14px] font-bold text-slate-500 border border-slate-200">
                                                {lead.assignedTo?.name ? lead.assignedTo.name[0] : '?'}
                                            </div>
                                            <p className="text-[14px] font-bold text-primary-navy">{lead.assignedTo?.name || 'Unassigned'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`status-chip ${
                                            lead.status === 'Converted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                            lead.status === 'Lost' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                            'bg-blue-50 text-blue-600 border border-blue-200'
                                        }`}>{lead.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button 
                                                onClick={() => {
                                                    setSelectedLead(lead);
                                                    setLeadForm({
                                                        name: lead.name,
                                                        email: lead.email,
                                                        phone: lead.phone,
                                                        company: lead.company,
                                                        serviceInterest: lead.serviceInterest,
                                                        status: lead.status,
                                                        assignedTo: lead.assignedTo?._id || '',
                                                        notes: lead.notes
                                                    });
                                                    setShowLeadModal(true);
                                                }}
                                                className="p-2.5 text-text-muted hover:text-primary-navy bg-bg-soft hover:bg-white rounded-xl transition-all border border-transparent hover:border-border-soft"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => deleteLead(lead._id)}
                                                className="p-2.5 text-text-muted hover:text-primary-red bg-bg-soft hover:bg-white rounded-xl transition-all border border-transparent hover:border-border-soft"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center opacity-30">
                                            <Users size={48} />
                                            <p className="text-text-muted font-bold uppercase tracking-[0.2em] text-[14px] mt-4">Safe storage empty. No leads captured.</p>
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

    const renderChat = () => (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[700px]">
            {/* Employee List */}
            <div className="lg:col-span-1 bg-white border border-border-soft rounded-2xl overflow-hidden flex flex-col shadow-sm">
                <div className="p-4 border-b border-border-soft bg-bg-soft/30">
                    <h3 className="font-bold text-primary-navy">Team Messages</h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {employees.map(emp => (
                        <div 
                            key={emp._id} 
                            onClick={() => setSelectedChatEmployee(emp)}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                selectedChatEmployee?._id === emp._id 
                                    ? 'bg-primary-navy text-white shadow-md' 
                                    : 'hover:bg-bg-soft text-text-dark'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] ${
                                selectedChatEmployee?._id === emp._id ? 'bg-white/20' : 'bg-primary-navy/10 text-primary-navy'
                            }`}>
                                {emp.name[0]}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-bold text-[14px] truncate">{emp.name}</p>
                                <p className={`text-[14px] ${selectedChatEmployee?._id === emp._id ? 'text-slate-300' : 'text-text-muted'} font-medium`}>{emp.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-3">
                {selectedChatEmployee ? (
                    <Chat 
                        currentUser={user} 
                        targetUser={selectedChatEmployee} 
                        token={token} 
                    />
                ) : (
                    <div className="h-full bg-white border border-border-soft rounded-2xl flex flex-col items-center justify-center text-text-muted space-y-4 shadow-sm">
                        <div className="w-16 h-16 rounded-full bg-bg-soft flex items-center justify-center">
                            <MessageSquare size={32} />
                        </div>
                        <p className="font-bold">Select a team member to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderLeadModal = () => (
        <div className={`fixed inset-0 z-[120] flex items-center justify-center p-6 ${showLeadModal ? 'block' : 'hidden'}`}>
            <div className="absolute inset-0 bg-[#0B1739]/60 backdrop-blur-md" onClick={() => setShowLeadModal(false)}></div>
            <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-10 border-b border-border-soft flex justify-between items-center bg-bg-soft/30">
                    <div>
                        <h3 className="text-2xl font-bold text-primary-navy">{selectedLead ? 'Update Pipeline Entry' : 'New Sales Lead'}</h3>
                        <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mt-1">Lead Capture Interface</p>
                    </div>
                    <button onClick={() => setShowLeadModal(false)} className="w-12 h-12 rounded-full bg-white border border-border-soft flex items-center justify-center text-text-muted hover:text-primary-red transition-all shadow-sm">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleLeadSubmit} className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="space-y-2">
                            <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Full Name</label>
                            <input required type="text" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} className="zoho-input" placeholder="e.g. Robert Smith" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Personal / Business Email</label>
                            <input required type="email" value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})} className="zoho-input" placeholder="robert@example.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Contact Phone</label>
                            <input required type="text" value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} className="zoho-input" placeholder="+91 00000 00000" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Company / Organization</label>
                            <input type="text" value={leadForm.company} onChange={e => setLeadForm({...leadForm, company: e.target.value})} className="zoho-input" placeholder="e.g. Acme Corp" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="space-y-2">
                            <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Nature of Interest</label>
                            <select value={leadForm.serviceInterest} onChange={e => setLeadForm({...leadForm, serviceInterest: e.target.value})} className="zoho-input">
                                <option>CCTV Installation</option>
                                <option>Maintenance AMC</option>
                                <option>Security Audit</option>
                                <option>Bulk Hardware</option>
                                <option>Others</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Pipeline Status</label>
                            <select value={leadForm.status} onChange={e => setLeadForm({...leadForm, status: e.target.value})} className="zoho-input">
                                <option>New</option>
                                <option>Contacted</option>
                                <option>Qualified</option>
                                <option>Lost</option>
                                <option>Converted</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2 mb-8">
                        <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Assign to Agent</label>
                        <select value={leadForm.assignedTo} onChange={e => setLeadForm({...leadForm, assignedTo: e.target.value})} className="zoho-input">
                            <option value="">Keep Unassigned</option>
                            {employees.filter(emp => emp.role === 'employee').map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2 mb-10">
                        <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Interaction Notes</label>
                        <textarea value={leadForm.notes} onChange={e => setLeadForm({...leadForm, notes: e.target.value})} className="zoho-input h-32 py-4 resize-none" placeholder="Details about customer requirements, site details, budget etc." />
                    </div>

                    <button type="submit" className="zoho-btn-secondary w-full py-5 text-[14px] rounded-3xl font-bold tracking-widest uppercase shadow-xl hover:shadow-primary-red/20 transition-all">
                        {selectedLead ? 'Authorize Pipeline Update' : 'Initialize New Lead Entry'}
                    </button>
                </form>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h3 className="text-xl font-bold text-primary-navy uppercase tracking-tight">System Configuration</h3>
                <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mt-1">Foundational Site Controls & Security</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 zoho-card p-10 space-y-8">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
                        <Settings size={20} className="text-primary-red" />
                        <h4 className="text-[14px] font-bold text-primary-navy uppercase tracking-widest">Company Settings</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Company Name</label>
                            <input 
                                type="text" 
                                value={settings.companyName} 
                                onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                                className="zoho-input" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Support Email</label>
                            <input 
                                type="email" 
                                value={settings.email}
                                onChange={(e) => setSettings({...settings, email: e.target.value})}
                                className="zoho-input" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Contact Number</label>
                            <input 
                                type="text" 
                                value={settings.phone}
                                onChange={(e) => setSettings({...settings, phone: e.target.value})}
                                className="zoho-input" 
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Office Address</label>
                            <textarea 
                                value={settings.address}
                                onChange={(e) => setSettings({...settings, address: e.target.value})}
                                className="zoho-input min-h-[100px] py-4" 
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Company Logo</label>
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
                                <label className="zoho-btn-secondary px-6 py-2.5 rounded-xl cursor-pointer text-[14px] font-bold hover:bg-bg-soft transition-all">
                                    <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                                    {settings.logo ? 'Change Logo' : 'Upload Logo'}
                                </label>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleSettingsUpdate} className="zoho-btn-secondary w-full py-4 text-[14px] rounded-2xl">Save Business Settings</button>
                </div>

                <div className="lg:col-span-5 space-y-10">
                    <div className="zoho-card p-10">
                        <h4 className="text-[14px] font-bold text-text-muted uppercase tracking-[0.2em] border-b border-border-soft pb-6 mb-8 text-center">Authorized Administrator</h4>
                        <div className="flex flex-col items-center">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-[32px] bg-primary-navy text-white flex items-center justify-center font-extrabold text-3xl border-4 border-white relative z-10 transition-transform group-hover:scale-105 duration-500">
                                    {user?.name?.[0]}
                                </div>
                            </div>
                            <div className="text-center mt-6">
                                <p className="text-xl font-bold text-primary-navy">{user?.name}</p>
                                <p className="text-[14px] font-bold text-text-muted mt-1">{user?.email}</p>
                                <div className="mt-4 px-4 py-1.5 bg-primary-navy text-white rounded-full text-[14px] font-black uppercase tracking-[0.2em]">Full Access Control</div>
                            </div>
                        </div>
                    </div>

                    <div className="zoho-card p-10 space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
                            <ShieldCheck size={20} className="text-primary-red" />
                            <h4 className="text-[14px] font-bold text-primary-navy uppercase tracking-widest">Security & Login</h4>
                        </div>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">New Password</label>
                                <input type="password" placeholder="••••••••" className="zoho-input" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Confirm Password</label>
                                <input type="password" placeholder="••••••••" className="zoho-input" />
                            </div>
                            <button className="zoho-btn-secondary w-full py-4 text-[14px] font-black">Update Password</button>
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
                                                <div className="w-8 h-8 rounded-lg bg-primary-navy text-white flex items-center justify-center font-bold text-[14px] uppercase">
                                                    {l.employeeName?.[0]}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[14px] font-bold text-primary-navy">{l.employeeName}</span>
                                                    <span className="text-[14px] text-text-muted">{l.employeeId?.email || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[14px] font-semibold text-text-dark">{l.leaveType}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-[14px] font-medium">
                                                <span>{new Date(l.startDate).toLocaleDateString()}</span>
                                                <span className="text-[14px] text-text-muted">to {new Date(l.endDate).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[14px] text-text-muted line-clamp-1 max-w-[150px]" title={l.reason}>{l.reason}</p>
                                        </td>
                                        <td className="px-6 py-4 text-[14px] text-text-muted">
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
                                                <span className="text-[14px] font-bold text-text-muted uppercase tracking-widest">Processed</span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="py-24 text-center">
                                            <p className="text-text-muted font-bold tracking-widest uppercase text-[14px]">No pending leave requests</p>
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
                                        <p className="text-[14px] text-text-muted font-bold tracking-widest uppercase"># {e._id.substring(18)}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-primary-navy text-white flex items-center justify-center font-bold text-[14px] shadow-sm">
                                                {e.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-bold text-primary-navy leading-none">{e.name}</p>
                                                <p className="text-[14px] text-text-muted mt-1 font-semibold">{e.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[14px] font-bold text-text-muted">{e.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-bg-soft text-primary-navy px-2.5 py-1 rounded-lg text-[14px] font-bold uppercase border border-border-soft">
                                            {e.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${e.isActive ? 'bg-status-success-text shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-text-muted'}`} />
                                            <span className={`text-[14px] font-bold uppercase ${e.isActive ? 'text-status-success-text' : 'text-text-muted'}`}>
                                                {e.isActive ? 'Active' : 'Offline'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <p className="text-[14px] font-extrabold text-primary-navy">{e.assignedJobs || 0}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button 
                                                onClick={() => {
                                                    setEditingEmployee(e);
                                                    setEmployeeForm({ ...e, password: '' });
                                                    setShowEmployeeModal(true);
                                                }}
                                                className="zoho-btn-secondary px-4 py-2 rounded-lg text-[14px]"
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
                                        <p className="text-[14px] font-bold text-primary-navy group-hover:text-primary-red transition-colors">{s.name}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[14px] text-text-muted font-bold tracking-widest uppercase"># {s.sku}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[14px] font-bold text-primary-navy">{s.category}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[14px] text-text-muted font-bold uppercase">{s.brand}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[14px] font-extrabold text-primary-navy">₹{s.price.toLocaleString()}</p>
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
                                                className="zoho-btn-secondary px-4 py-2 rounded-lg text-[14px]"
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
                     <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mt-1">Real-time Stock Audit & Reorder Metrics</p>
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
                                        <p className="text-[14px] font-bold text-primary-navy leading-none">{s.name}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest"># {s.sku}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <p className="text-[14px] font-extrabold text-primary-navy">{s.quantity} Units</p>
                                    </td>
                                    <td className="px-6 py-4 text-center text-[14px] font-bold text-text-muted uppercase">
                                        {s.reorderLevel || 5} Units
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`status-chip ${
                                            s.quantity > (s.reorderLevel || 5) ? 'bg-status-success-bg text-status-success-text' : 'bg-status-danger-bg text-status-danger-text'
                                        }`}>{s.quantity > (s.reorderLevel || 5) ? 'Operational' : 'Critical Level'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-[14px] text-text-muted font-black tracking-tighter uppercase whitespace-nowrap">
                                        {new Date(s.updatedAt).toLocaleDateString()} @ {new Date(s.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button 
                                                onClick={() => {
                                                    setEditingProduct(s);
                                                    setShowStockModal(true);
                                                }}
                                                className="zoho-btn-secondary px-4 py-2 rounded-lg text-[14px] whitespace-nowrap"
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
                        <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mt-1">Operational Access Management</p>
                    </div>
                    <button onClick={() => setShowEmployeeModal(false)} className="w-10 h-10 rounded-full bg-white border border-border-soft flex items-center justify-center text-text-muted hover:text-primary-red hover:border-primary-red transition-all shadow-sm">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleEmployeeSubmit} className="p-10 space-y-6">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                        <div className="space-y-2">
                            <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Employee Name</label>
                            <input required type="text" value={employeeForm.name} onChange={e => setEmployeeForm({...employeeForm, name: e.target.value})} className="zoho-input" placeholder="e.g. John Carter" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Email Address</label>
                            <input required type="email" value={employeeForm.email} onChange={e => setEmployeeForm({...employeeForm, email: e.target.value})} className="zoho-input" placeholder="john@sktech.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Contact Number</label>
                            <input required type="text" value={employeeForm.phone} onChange={e => setEmployeeForm({...employeeForm, phone: e.target.value})} className="zoho-input" placeholder="+91 00000 00000" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Password</label>
                            <input required={!editingEmployee} type="password" value={employeeForm.password} onChange={e => setEmployeeForm({...employeeForm, password: e.target.value})} className="zoho-input" placeholder={editingEmployee ? 'Unchanged' : 'Min 6 characters'} />
                        </div>
                    </div>
                    
                    <div className="pt-6 flex justify-end items-center gap-3">
                        <button 
                            type="button" 
                            onClick={() => setShowEmployeeModal(false)}
                            className="px-6 py-3.5 text-[14px] font-bold text-text-muted hover:text-primary-navy transition-colors"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="zoho-btn-secondary px-8 py-3.5 text-[14px] rounded-xl shadow-lg">
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
            <div className={`bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] shadow-2xl relative z-10 overflow-hidden transition-all duration-500 transform ${showProductModal ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-12 scale-95 opacity-0'}`}>
                {/* Modal Header */}
                <div className="p-8 border-b border-border-soft flex justify-between items-center bg-bg-soft/30">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary-navy text-white flex items-center justify-center shadow-lg shadow-primary-navy/20">
                            {editingProduct ? <Edit size={24} /> : <Plus size={24} />}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-primary-navy">CCTV Inventory Management</h3>
                            <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mt-1">
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
                            <h4 className="text-[14px] font-black text-primary-navy/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Package size={14} /> Basic Identification
                            </h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Product Name</label>
                                    <input required type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="zoho-input" placeholder="Example – Hikvision 4MP Bullet Camera" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Model Number</label>
                                    <input required type="text" value={productForm.modelNumber} onChange={e => setProductForm({...productForm, modelNumber: e.target.value})} className="zoho-input" placeholder="DS-2CD2043G0" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">SKU Reference</label>
                                    <input required type="text" value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} className="zoho-input" placeholder="SV-CAM-001" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Camera Type</label>
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
                                    <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Brand</label>
                                    <input required type="text" value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value})} className="zoho-input" placeholder="Hikvision / Dahua / CP Plus" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Technical Specifications */}
                        <div className="space-y-6">
                            <h4 className="text-[14px] font-black text-primary-navy/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Settings size={14} /> Technical Specifications
                            </h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Resolution</label>
                                    <input type="text" value={productForm.resolution} onChange={e => setProductForm({...productForm, resolution: e.target.value})} className="zoho-input" placeholder="Example: 2MP / 4MP / 8MP" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Lens Size</label>
                                    <input type="text" value={productForm.lensSize} onChange={e => setProductForm({...productForm, lensSize: e.target.value})} className="zoho-input" placeholder="Example: 2.8mm / 3.6mm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Night Vision Distance</label>
                                    <input type="text" value={productForm.nightVisionDistance} onChange={e => setProductForm({...productForm, nightVisionDistance: e.target.value})} className="zoho-input" placeholder="Example: 30m / 40m" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Warranty</label>
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
                            <h4 className="text-[14px] font-black text-primary-navy/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                <BarChart3 size={14} /> Commercial Details
                            </h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Price (₹)</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <span className="text-primary-navy/40 font-bold text-[14px]">₹</span>
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
                                    <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Available Stock</label>
                                    <input required type="number" value={productForm.quantity} onChange={e => setProductForm({...productForm, quantity: e.target.value})} className="zoho-input" placeholder="Initial quantity..." />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Media & Description */}
                        <div className="space-y-6">
                            <h4 className="text-[14px] font-black text-primary-navy/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Camera size={14} /> Documentation & description
                            </h4>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Product Description</label>
                                    <textarea rows="4" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="zoho-input resize-none py-4" placeholder="Enter detailed product biological and technical specifications..."></textarea>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider">Product Visuals</label>
                                        <div className="flex items-center gap-4">
                                            <label htmlFor="image-upload" className="text-[14px] font-black text-primary-navy uppercase tracking-widest cursor-pointer hover:text-primary-red transition-colors flex items-center gap-1.5">
                                                <Plus size={12} /> Add Images
                                            </label>
                                            {(productForm.productImages?.length > 0 || productForm.productImage) && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => setProductForm({ ...productForm, productImage: '', productImages: [] })}
                                                    className="text-[14px] font-black text-primary-red uppercase tracking-widest hover:underline flex items-center gap-1.5"
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
                                                    <p className="text-[14px] font-bold text-primary-navy">Upload Product Images</p>
                                                    <p className="text-[14px] text-text-muted mt-1 font-semibold uppercase tracking-tighter">JPG, PNG, WEBP • Multiple supported</p>
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
                            className="flex items-center gap-2 px-6 py-3.5 text-[14px] font-black text-text-muted hover:text-primary-red transition-all uppercase tracking-widest"
                        >
                            <Trash2 size={16} /> Clear Form
                        </button>
                        
                        <div className="flex items-center gap-4">
                            <button 
                                type="button" 
                                onClick={() => setShowProductModal(false)}
                                className="px-8 py-3.5 text-[14px] font-black text-text-muted hover:text-primary-navy transition-all uppercase tracking-widest"
                            >
                                Discard
                            </button>
                            <button type="submit" className="zoho-btn-secondary px-10 py-4 text-[14px] rounded-[20px] shadow-xl shadow-primary-navy/10 relative overflow-hidden group">
                                <span className="relative z-10 flex items-center gap-2 uppercase font-black tracking-widest text-[14px]">
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
                        <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mt-1">Resource Assignment</p>
                    </div>
                    <button onClick={() => setShowBookingModal(false)} className="w-10 h-10 rounded-full bg-white border border-border-soft flex items-center justify-center text-text-muted hover:text-primary-red hover:border-primary-red transition-all shadow-sm">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleBookingUpdate} className="p-10 space-y-8">
                    <div className="space-y-2">
                        <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Operational Status</label>
                        <select value={bookingForm.status} onChange={e => setBookingForm({...bookingForm, status: e.target.value})} className="zoho-input">
                            <option value="pending_schedule">Pending Schedule Request</option>
                            <option value="schedule_sent">Schedule Proposed to Customer</option>
                            <option value="scheduled_confirmed">Customer Accepted Schedule</option>
                            <option value="reschedule_requested">Customer Requested Reschedule</option>
                            <option value="in_progress">Active Execution</option>
                            <option value="completed">Completed / Certified</option>
                            <option value="cancelled">Void / Cancelled</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Proposed Schedule Date</label>
                        <input type="date" value={bookingForm.proposedDate} onChange={e => setBookingForm({...bookingForm, proposedDate: e.target.value})} className="zoho-input" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Proposed Time Slot</label>
                        <select value={bookingForm.proposedTimeSlot} onChange={e => setBookingForm({...bookingForm, proposedTimeSlot: e.target.value})} className="zoho-input">
                            <option value="">Select Time Slot</option>
                            <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                            <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                            <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                            <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Assign Lead Technician</label>
                        <select value={bookingForm.assignedEmployee} onChange={e => setBookingForm({...bookingForm, assignedEmployee: e.target.value})} className="zoho-input">
                            <option value="">Awaiting Assignment</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Internal Note / Customer Instruction</label>
                        <input type="text" value={bookingForm.adminNote} onChange={e => setBookingForm({...bookingForm, adminNote: e.target.value})} className="zoho-input" placeholder="e.g. Please confirm if this slot works..." />
                    </div>
                    <div className="pt-4">
                        <button type="submit" className="zoho-btn-secondary w-full py-4 text-[14px] rounded-2xl">
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
                        <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mt-1">Stock Adjustment</p>
                    </div>
                    <button onClick={() => setShowStockModal(false)} className="w-10 h-10 rounded-full bg-white border border-border-soft flex items-center justify-center text-text-muted hover:text-primary-red hover:border-primary-red transition-all shadow-sm">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleStockAdjustmentSubmit} className="p-10 space-y-8">
                    <div className="flex gap-2 p-1.5 bg-bg-soft rounded-2xl border border-border-soft shadow-inner">
                        <button type="button" onClick={() => setStockAdjustment({...stockAdjustment, type: 'add'})} className={`flex-1 py-3 rounded-xl text-[14px] font-black uppercase tracking-widest transition-all ${stockAdjustment.type === 'add' ? 'bg-white text-emerald-600 shadow-lg' : 'text-text-muted hover:text-primary-navy'}`}>Inbound (+)</button>
                        <button type="button" onClick={() => setStockAdjustment({...stockAdjustment, type: 'remove'})} className={`flex-1 py-3 rounded-xl text-[14px] font-black uppercase tracking-widest transition-all ${stockAdjustment.type === 'remove' ? 'bg-white text-primary-red shadow-lg' : 'text-text-muted hover:text-primary-navy'}`}>Outbound (-)</button>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Delta Quantity</label>
                        <input required type="number" min="1" value={stockAdjustment.quantity} onChange={e => setStockAdjustment({...stockAdjustment, quantity: parseInt(e.target.value)})} className="zoho-input" placeholder="0" />
                    </div>
                    <div className="p-6 bg-primary-navy/[0.03] border border-border-soft rounded-2xl">
                        <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest">Target Hardware</p>
                        <p className="text-[14px] text-primary-navy font-bold mt-1 truncate">{editingProduct?.name}</p>
                        <div className="mt-4 pt-4 border-t border-border-soft flex justify-between items-center">
                            <span className="text-[14px] text-text-muted font-bold uppercase">Current Assets</span>
                            <span className="text-[14px] font-extrabold text-primary-navy">{editingProduct?.quantity} Units</span>
                        </div>
                    </div>
                    <div className="pt-4">
                        <button type="submit" className="zoho-btn-secondary w-full py-4 text-[14px] rounded-2xl">
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
                            <span className="font-extrabold text-lg tracking-tight uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>SK<span className="text-slate-400">TECH</span></span>
                        </div>
                    )}
                    <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 hover:bg-navy-light/30 rounded-lg transition-colors text-slate-400">
                        {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                <nav className="flex-grow p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {[
                        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'bookings', label: 'Bookings', icon: Calendar },
                        { id: 'products', label: 'Products', icon: Package },
                        { id: 'employees', label: 'Employees', icon: Users },
                        { id: 'tracking', label: 'Tracker', icon: Truck },
                        { id: 'enquiries', label: 'Enquiries', icon: Mail },
                        { id: 'attendance', label: 'Attendance', icon: UserCheck },
                        { id: 'chat', label: 'Chat', icon: MessageSquare },
                        { id: 'expenses', label: 'Expenses', icon: Receipt },
                        { id: 'tasks', label: 'Tasks', icon: ClipboardList },
                        { id: 'leads', label: 'Leads', icon: TrendingUp },
                        { id: 'followups', label: 'Follow-ups', icon: Calendar },
                        { id: 'daily-reports', label: 'Daily Reports', icon: FileSpreadsheet },
                        { id: 'settings', label: 'Settings', icon: Settings },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-4 py-3 rounded-lg transition-all duration-300 group relative ${
                                activeTab === item.id 
                                ? 'bg-[#1E293B] text-white shadow-sm' 
                                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                            }`}
                        >
                            <item.icon 
                                size={22} 
                                strokeWidth={2} 
                                className={`transition-all duration-300 ${
                                    activeTab === item.id 
                                    ? 'text-white' 
                                    : 'text-blue-500 group-hover:text-blue-400'
                                }`} 
                            />
                            {!isSidebarCollapsed && (
                                <span className="text-[14px] font-medium tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    {item.label}
                                </span>
                            )}
                            {activeTab === item.id && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-md shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-navy-light/20">
                    <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-all font-bold">
                        <LogOut size={20} />
                        {!isSidebarCollapsed && <span className="text-[14px] uppercase tracking-widest">Logout System</span>}
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
                                <span className="text-[14px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200/80 mt-0.5 tracking-wide" style={{fontFamily:"'Inter', sans-serif"}}>Super Admin</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-grow overflow-y-auto bg-bg-soft custom-scrollbar">
                    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
                        {loading ? (
                            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                                <div className="w-12 h-12 border-4 border-primary-navy/10 border-t-primary-red rounded-full animate-spin"></div>
                                <p className="text-text-muted font-bold tracking-widest uppercase text-[14px]">Initializing Secure Environment...</p>
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
                                {activeTab === 'chat' && renderChat()}
                                {activeTab === 'expenses' && renderExpenses()}
                                {activeTab === 'tasks' && renderTasks()}
                                {activeTab === 'leads' && renderLeads()}
                                {activeTab === 'followups' && renderFollowUps()}
                                {activeTab === 'daily-reports' && renderDailyReports()}
                                {activeTab === 'settings' && renderSettings()}
                            </div>
                        )}
                    </div>
                </div>
                {/* Mock Modals */}
                {renderEmployeeModal()}
                {renderProductModal()}
                {renderBookingModal()}
                {renderStockModal()}
                {renderLeadModal()}
            </main>
        </div>
    );
};

export default AdminDashboard;
