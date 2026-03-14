import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Plus,
    UserCheck,
    History,
    X,
    TrendingUp,
    AlertCircle,
    Calendar,
    Play,
    CheckCircle2,
    Clock,
    Phone,
    MapPin,
    Briefcase,
    ChevronRight,
    ChevronLeft,
    LayoutDashboard,
    Bell,
    User,
    LogOut,
    Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

const EmployeeDashboard = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Map URL path to tab ID
    const pathMapping = {
        '/employee': 'overview',
        '/employee/dashboard': 'overview',
        '/employee/requests': 'new',
        '/employee/my-jobs': 'my-jobs',
        '/employee/attendance': 'attendance',
        '/employee/notifications': 'notifications',
        '/employee/profile': 'profile',
        '/employee/leaves': 'leaves'
    };

    // Reverse mapping for navigation
    const tabToPath = {
        'overview': '/employee/dashboard',
        'new': '/employee/requests',
        'my-jobs': '/employee/my-jobs',
        'attendance': '/employee/attendance',
        'notifications': '/employee/notifications',
        'profile': '/employee/profile',
        'leaves': '/employee/leaves'
    };

    const [activeTab, setActiveTab] = useState('overview');
    const [myJobsFilter, setMyJobsFilter] = useState('All');
    const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
    
    useEffect(() => {
        const path = location.pathname;
        if (pathMapping[path]) {
            setActiveTab(pathMapping[path]);
        }
    }, [location.pathname]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        // Clear all overlays/modals on tab change
        setShowNotificationsDropdown(false);
        setShowProofModal(false);
        setShowImageViewer(false);
        setShowLeaveModal(false);
        setSelectedJob(null);
        navigate(tabToPath[tabId]);
    };

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setShowNotificationsDropdown(false);
                setShowProofModal(false);
                setShowImageViewer(false);
                setShowLeaveModal(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const [jobs, setJobs] = useState([]);
    const [attendanceStatus, setAttendanceStatus] = useState(null);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    
    // Modal state for job completion
    const [showProofModal, setShowProofModal] = useState(false);
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [viewerImageUrl, setViewerImageUrl] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [previewUrl, setPreviewUrl] = useState(null);

    // Leave Modal State
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveForm, setLeaveForm] = useState({
        leaveType: 'Casual Leave',
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (proofForm.photos.length + files.length > 6) {
            toast.error('Maximum 6 images allowed');
            return;
        }
        files.forEach(file => {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not a valid image`);
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} exceeds 5MB limit`);
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProofForm(prev => ({ ...prev, photos: [...prev.photos, reader.result] }));
            };
            reader.readAsDataURL(file);
        });
        // Reset input so same file can be re-selected
        e.target.value = '';
    };

    useEffect(() => {
        fetchData();
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const [jRes, aRes, hRes, nRes, lRes] = await Promise.all([
                fetch('/api/bookings', { headers }),
                fetch('/api/attendance/status', { headers }),
                fetch('/api/attendance/history', { headers }),
                fetch('/api/notifications', { headers }),
                fetch('/api/leaves/my', { headers })
            ]);
            
            const [jData, aData, hData, nData, lData] = await Promise.all([
                jRes.json(), aRes.json(), hRes.json(), nRes.json(), lRes.json()
            ]);

            if (jData.success) setJobs(jData.data);
            if (aData.success) setAttendanceStatus(aData.data);
            if (hData.success) setAttendanceHistory(hData.data);
            if (nData.success) setNotifications(nData.data);
            if (lData.success) setLeaves(lData.data);
        } catch (error) {
            console.error('Error fetching employee data:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleJobAction = async (jobId, action, extra = {}) => {
        try {
            const res = await fetch(`/api/bookings/${jobId}/${action}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(extra)
            });
            const data = await res.json();
            if (data.success) {
                if (action === 'complete') {
                    setShowProofModal(false);
                    setProofForm({ photos: [], notes: '' });
                    setPreviewUrl(null);
                }
                fetchData();
            } else {
                toast.error(data.message || 'Action failed');
            }
        } catch (error) {
            console.error('Job action error:', error);
            toast.error('Error connecting to server. Please ensure the backend is running.');
        }
    };

    const markAllAsRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        try {
            await fetch('/api/notifications/read-all', { 
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData(true); // Silent refresh
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            fetchData(true); // Re-sync on error
        }
    };

    const markAsRead = async (id) => {
        toast.loading('Acknowledging...', { id: 'read-notification' });
        // Optimistic update
        setNotifications(prev => prev.map(n => String(n._id) === String(id) ? { ...n, isRead: true } : n));
        try {
            const res = await fetch(`/api/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error(`Failed to parse JSON for notification ${id}. Response was:`, text.substring(0, 200));
                throw new Error('Server returned invalid JSON response');
            }
            if (data.success && data.data) {
                setNotifications(prev => prev.map(n => String(n._id) === String(id) ? data.data : n));
                toast.success('Notification acknowledged', { id: 'read-notification' });
            } else {
                toast.error(data.message || 'Update failed', { id: 'read-notification' });
                fetchData(true);
            }
        } catch (error) {
            console.error('RAW Error marking notification as read:', error);
            toast.error(`Connection error: ${error.message}`, { id: 'read-notification' });
            fetchData(true);
        }
    };

    const handleAttendanceAction = async (action) => {
        try {
            const res = await fetch(`/api/attendance/${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Attendance update failed');
        }
    };

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingLeave(true);
        try {
            const res = await fetch('/api/leaves/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(leaveForm)
            });
            
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                throw new Error(`Invalid server response: ${text || 'Empty response'}`);
            }

            if (data.success) {
                toast.success('Leave request submitted successfully');
                setShowLeaveModal(false);
                setLeaveForm({
                    leaveType: 'Casual Leave',
                    startDate: '',
                    endDate: '',
                    reason: ''
                });
                fetchData();
            } else {
                toast.error(data.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Leave submission error:', error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsSubmittingLeave(false);
        }
    };

    const renderLeaves = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="crm-page-title">Leave Management</h2>
                    <p className="crm-body text-sm mt-0.5">Request and track your leave status</p>
                </div>
                <button 
                    onClick={() => setShowLeaveModal(true)}
                    className="zoho-btn-secondary px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
                >
                    <Plus size={18} /> Request Leave
                </button>
            </div>

            <div className="zoho-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="zoho-table">
                        <thead className="zoho-table-header">
                            <tr>
                                <th className="px-6 py-4">Leave Type</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Days</th>
                                <th className="px-6 py-4">Applied On</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-soft">
                            {leaves && leaves.length > 0 ? (
                                leaves.map(l => (
                                    <tr key={l._id} className="hover:bg-bg-soft/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-primary-navy">{l.leaveType}</span>
                                                <span className="text-[10px] text-text-muted mt-0.5 line-clamp-1 max-w-[200px]">{l.reason}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-xs font-semibold text-text-dark">
                                                <span>{new Date(l.startDate).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-text-muted">to {new Date(l.endDate).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-primary-navy">
                                            {Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1} Days
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-text-muted">
                                            {new Date(l.appliedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`status-chip ${
                                                l.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                                l.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {l.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="w-16 h-16 bg-bg-soft rounded-3xl flex items-center justify-center mx-auto mb-4 border border-border-soft">
                                            <Calendar size={24} className="text-text-muted" />
                                        </div>
                                        <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">No leave records found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderLeaveModal = () => {
        if (!showLeaveModal) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-navy-dark/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowLeaveModal(false)} />
                <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="bg-primary-navy px-8 py-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Request Leave</h3>
                            <p className="text-rose-100/60 text-[10px] uppercase font-bold tracking-widest mt-1">Personnel Absence Directive</p>
                        </div>
                        <button onClick={() => setShowLeaveModal(false)} className="text-white/60 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleLeaveSubmit} className="p-8 space-y-5">
                        <div className="space-y-1.5">
                            <label className="crm-label !text-[10px]">Leave Type</label>
                            <select 
                                className="zoho-input w-full"
                                value={leaveForm.leaveType}
                                onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                                required
                            >
                                <option>Casual Leave</option>
                                <option>Sick Leave</option>
                                <option>Earned Leave</option>
                                <option>Maternity/Paternity</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="crm-label !text-[10px]">Start Date</label>
                                <input 
                                    type="date" 
                                    className="zoho-input w-full"
                                    value={leaveForm.startDate}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="crm-label !text-[10px]">End Date</label>
                                <input 
                                    type="date" 
                                    className="zoho-input w-full"
                                    value={leaveForm.endDate}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="crm-label !text-[10px]">Reason for Absence</label>
                            <textarea 
                                className="zoho-input w-full h-24 resize-none"
                                placeholder="State clearly the reason for leave..."
                                value={leaveForm.reason}
                                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                                required
                            ></textarea>
                        </div>

                        <div className="pt-4 flex items-center gap-3">
                            <button 
                                type="button"
                                onClick={() => setShowLeaveModal(false)}
                                className="zoho-btn-secondary flex-grow py-3 text-xs tracking-widest"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={isSubmittingLeave}
                                className="zoho-btn-primary flex-grow py-3 text-xs tracking-widest"
                            >
                                {isSubmittingLeave ? 'Transmitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const renderOverview = () => {
        const kpis = {
            operations: [
                { label: 'New Requests', value: jobs.filter(j => j.status === 'Pending').length, icon: AlertCircle, color: 'text-primary-navy', bg: 'bg-primary-navy/10', trend: 'Audit' },
                { label: 'My Accepted Jobs', value: jobs.filter(j => j.status === 'Accepted').length, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-500/10', trend: 'Schedule' },
                { label: 'In Execution', value: jobs.filter(j => j.status === 'In Progress').length, icon: Play, color: 'text-orange-500', bg: 'bg-orange-500/10', trend: 'Active' },
                { label: 'Certified Completion', value: jobs.filter(j => j.status === 'Completed').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10', trend: 'Finished' }
            ],
            staff: [
                { label: 'Shift Status', value: attendanceStatus ? 'ACTIVE' : 'INACTIVE', icon: Clock, color: attendanceStatus ? 'text-emerald-600' : 'text-primary-red', bg: attendanceStatus ? 'bg-emerald-500/10' : 'bg-primary-red/10', trend: 'Today' },
            ],
            assets: [
                { label: 'Pending Proofs', value: jobs.filter(j => j.status === 'In Progress' && !j.proofPhoto).length, icon: Camera, color: 'text-amber-600', bg: 'bg-amber-500/10', trend: 'Action Reqd' },
                { label: 'Today Assigned Work', value: jobs.filter(j => j.status === 'Accepted' || j.status === 'In Progress').length, icon: Briefcase, color: 'text-primary-navy', bg: 'bg-bg-soft', trend: 'Daily' },
                { label: 'Unread Alerts', value: notifications.filter(n => !n.isRead).length, icon: Bell, color: 'text-primary-red', bg: 'bg-primary-red/10', trend: 'Updates' }
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
                    <p className="crm-label">{stat.label}</p>
                    <h3 className="crm-section-title mt-1">{stat.value}</h3>
                </div>
            </div>
        );

        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* 1. Tasks & Alerts - Priority Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {kpis.assets.map((stat, i) => renderKpiCard(stat, i))}
                </div>

                {/* 3. Operations Summary - Row 3 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {kpis.operations.map((stat, i) => renderKpiCard(stat, i))}
                </div>
            </div>
        );

    };

    const renderJobTable = (filteredJobs, showActions = false) => (
        <div className="zoho-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="zoho-table">
                    <thead className="zoho-table-header">
                        <tr>
                            <th className="px-6 py-4">Registry ID</th>
                            <th className="px-6 py-4">Client Detail</th>
                            <th className="px-6 py-4">PRODUCT</th>
                            <th className="px-6 py-4">Timeline</th>
                            <th className="px-6 py-4 text-center">STATUS</th>
                            {showActions && <th className="px-6 py-4 text-right">CURRENT STATUS</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-soft">
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map(j => (
                                <tr key={j._id} className="hover:bg-bg-soft/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">SV-{j.bookingId.substring(0,8).toUpperCase()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="crm-card-title leading-tight">{j.customerName}</span>
                                            <span className="crm-label !text-[10px] mt-1">{j.customerPhone}</span>
                                            <span className="crm-body !text-[10px] mt-0.5 truncate max-w-[180px]">{j.address}, {j.city}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-text-dark">{j.productName}</p>
                                        <p className="text-[10px] text-primary-red font-bold uppercase tracking-tighter mt-1 italic">SecureVision Hardware</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-primary-navy font-bold">{j.preferredDate ? new Date(j.preferredDate).toLocaleDateString() : 'IMMEDIATE'}</span>
                                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-tighter mt-1">{new Date(j.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`status-chip ${
                                            j.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                            j.status === 'Accepted' ? 'bg-blue-100 text-blue-700' :
                                            j.status === 'In Progress' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {j.status}
                                        </span>
                                    </td>
                                    {showActions && (
                                        <td className="px-6 py-4 text-right">
                                            {j.status === 'Pending' && (
                                                <div className="flex justify-end items-center gap-2">
                                                    <button 
                                                        onClick={() => handleJobAction(j.bookingId, 'accept')}
                                                        className="zoho-btn-secondary px-6 py-3 text-[10px] rounded-xl"
                                                    >
                                                        YET TO START
                                                    </button>
                                                </div>
                                            )}
                                            {j.status === 'Accepted' && (
                                                    <button 
                                                        onClick={() => handleJobAction(j.bookingId, 'start')}
                                                        className="bg-primary-navy text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-navy-dark transition-all"
                                                    >
                                                        START WORK
                                                    </button>
                                            )}
                                            {j.status === 'In Progress' && (
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedJob(j);
                                                            setShowProofModal(true);
                                                        }}
                                                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 ml-auto"
                                                    >
                                                        <Camera size={12} /> UPLOAD IMAGE
                                                    </button>
                                            )}
                                            {j.status === 'Completed' && j.proofPhoto && (
                                                <div className="flex justify-end">
                                                    <div 
                                                        onClick={() => {
                                                            setViewerImageUrl(j.proofPhoto);
                                                            setShowImageViewer(true);
                                                        }}
                                                        className="w-12 h-12 rounded-lg overflow-hidden border border-border-soft cursor-pointer hover:border-primary-red/50 transition-all shadow-sm group relative"
                                                    >
                                                        <img src={j.proofPhoto} alt="Work Proof" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                            <Camera size={14} className="text-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={showActions ? 6 : 5} className="py-24 text-center">
                                    <div className="w-16 h-16 bg-bg-soft rounded-3xl flex items-center justify-center mx-auto mb-4 border border-border-soft">
                                        <Briefcase size={24} className="text-text-muted" />
                                    </div>
                                    <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Zero operation directives located in registry</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAttendance = () => {
        const checkInTime = attendanceStatus?.checkIn
            ? new Date(attendanceStatus.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '—';
        const checkOutTime = attendanceStatus?.checkOut
            ? new Date(attendanceStatus.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '—';
        const totalHours = attendanceStatus?.totalHours
            ? `${Number(attendanceStatus.totalHours).toFixed(1)} hrs`
            : attendanceStatus?.checkIn && !attendanceStatus?.checkOut
                ? `${((currentTime - new Date(attendanceStatus.checkIn)) / (1000 * 60 * 60)).toFixed(1)} hrs`
                : '—';

        const isCheckedIn = !!attendanceStatus;
        const isCheckedOut = !!attendanceStatus?.checkOut;

        // Generate days for the selected month
        const today = new Date();
        const curYear = today.getFullYear();
        const curMonth = today.getMonth();
        const curDay = today.getDate();

        let endDay;
        if (selectedYear < curYear || (selectedYear === curYear && selectedMonth < curMonth)) {
            // Past month - show full month
            endDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        } else if (selectedYear === curYear && selectedMonth === curMonth) {
            // Current month - show up to today
            endDay = curDay;
        } else {
            // Future month - show nothing
            endDay = 0;
        }

        const monthDays = [];
        for (let i = 1; i <= endDay; i++) {
            const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const date = new Date(selectedYear, selectedMonth, i);
            
            // Find record in history
            const record = attendanceHistory.find(h => h.date === dateStr);
            
            let status = 'Absent';
            if (record) {
                if (record.checkIn && !record.checkOut) status = 'Active / Open Shift';
                else if (record.checkIn) status = 'Present';
            }

            monthDays.push({
                date: dateStr,
                displayDate: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                checkIn: record?.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
                checkOut: record?.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
                totalHours: record?.totalHours ? `${Number(record.totalHours).toFixed(1)} hrs` : '—',
                status: status,
                _id: record?._id || `absent-${dateStr}`
            });
        }

        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-border-soft shadow-sm">
                    <div className="flex items-center gap-3">
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="zoho-input py-2 text-xs font-bold"
                        >
                            {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                        </select>
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="zoho-input py-2 text-xs font-bold"
                        >
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                {/* Attendance History Table */}
                <div className="zoho-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="zoho-table">
                            <thead className="zoho-table-header">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Login</th>
                                    <th className="px-6 py-4">Logout</th>
                                    <th className="px-6 py-4">Working Hours</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-soft">
                                {monthDays.reverse().map((h) => (
                                    <tr key={h._id} className="hover:bg-bg-soft/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-primary-navy">{h.displayDate}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-text-dark">{h.checkIn}</td>
                                        <td className="px-6 py-4 text-xs font-medium text-text-dark">{h.checkOut}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-primary-navy">{h.totalHours}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`status-chip ${
                                                h.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                                                h.status === 'Active / Open Shift' ? 'bg-amber-100 text-amber-700 font-bold animate-pulse' :
                                                'bg-rose-50 text-rose-500 opacity-60'
                                            }`}>
                                                {h.status}
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
    };

    const renderNotifications = () => (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-end items-center mb-6">
                  <button onClick={markAllAsRead} className="zoho-btn-secondary px-5 py-2.5 rounded-xl text-xs">Acknowledge All</button>
              </div>
            {notifications.length > 0 ? notifications.map(n => (
                <div 
                    key={n._id} 
                    onClick={() => !n.isRead && markAsRead(n._id)}
                    className={`zoho-card p-6 flex gap-6 items-start group hover:border-primary-red/30 transition-all cursor-pointer ${!n.isRead ? 'border-primary-navy/20 bg-primary-navy/5' : ''}`}
                >
                    <div className="w-14 h-14 rounded-2xl bg-bg-soft flex items-center justify-center text-text-muted group-hover:bg-primary-red/5 group-hover:text-primary-red transition-all border border-border-soft">
                        <Bell size={22} />
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-sm text-primary-navy uppercase tracking-tight">{n.title}</h4>
                            <span className="text-[10px] font-bold text-text-muted tracking-tight bg-bg-soft px-3 py-1 rounded-full">{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-text-muted mt-2 leading-relaxed font-medium">{n.message}</p>
                    </div>
                </div>
            )) : (
                <div className="zoho-card py-24 text-center border-dashed border-2">
                    <div className="w-20 h-20 bg-bg-soft rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bell size={32} className="text-text-muted" />
                    </div>
                    <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Registry clear: No intelligence bulletins found</p>
                </div>
            )}
        </div>
    );

    const renderProfile = () => (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="zoho-card overflow-hidden">
                <div className="h-32 bg-primary-navy relative">
                    <div className="absolute -bottom-12 left-10">
                        <div className="w-24 h-24 rounded-3xl bg-white p-1.5 shadow-xl">
                            <div className="w-full h-full rounded-[18px] bg-primary-red text-white flex items-center justify-center text-3xl font-bold">
                                {user?.name?.[0]}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="pt-16 pb-10 px-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold text-primary-navy tracking-tight">{user?.name}</h3>
                        </div>
                        <div className="status-chip bg-emerald-100 text-emerald-700">ACTIVE SERVICE</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-12 border-t border-border-soft">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-bg-soft rounded-xl text-text-muted transition-colors group-hover:text-primary-navy">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Inbound Line</p>
                                    <p className="text-sm font-bold text-primary-navy mt-0.5">{user?.phone || 'Not Registered'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-bg-soft rounded-xl text-text-muted transition-colors group-hover:text-primary-navy">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Base Operations</p>
                                    <p className="text-sm font-bold text-primary-navy mt-0.5">SecureVision HQ, Chennai</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-bg-soft rounded-xl text-text-muted transition-colors group-hover:text-primary-navy">
                                    <Briefcase size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Certification</p>
                                    <p className="text-sm font-bold text-primary-navy mt-0.5">Advanced CCTV Engineering</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-bg-soft rounded-xl text-text-muted transition-colors group-hover:text-primary-navy">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Enlistment Date</p>
                                    <p className="text-sm font-bold text-primary-navy mt-0.5">March 12, 2024</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
                            <span className="font-extrabold text-lg tracking-tight uppercase">Secure<span className="text-slate-400">Vision</span></span>
                        </div>
                    )}
                    <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 hover:bg-navy-light/30 rounded-lg transition-colors text-slate-400">
                        {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {[
                        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'new', label: 'New Requests', icon: Plus },
                        { id: 'my-jobs', label: 'My Jobs', icon: Calendar },
                        { id: 'attendance', label: 'Attendance', icon: UserCheck },
                        { id: 'leaves', label: 'Leave Center', icon: Calendar },
                        { id: 'profile', label: 'Personnel Profile', icon: User },
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
                        {!isSidebarCollapsed && <span className="text-xs uppercase tracking-widest">End Session</span>}
                    </button>
                </div>
            </aside>

            {/* Main Surface */}
            <main className="flex-grow flex flex-col overflow-hidden">
                <header className="h-20 bg-white border-b border-border-soft flex items-center justify-between px-8 sticky top-0 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-primary-navy tracking-tight capitalize">{activeTab.replace('-', ' ')}</h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                                className="p-2.5 text-text-muted hover:text-primary-navy bg-bg-soft rounded-xl transition-all relative"
                            >
                                <Bell size={20} />
                                {notifications.some(n => !n.isRead) && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary-red rounded-full ring-2 ring-white" />}
                            </button>
                            
                            {showNotificationsDropdown && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-border-soft overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-4 border-b border-border-soft flex justify-between items-center bg-bg-soft/30">
                                        <h3 className="text-sm font-bold text-primary-navy">Recent Alerts</h3>
                                        <span className="text-[10px] font-bold text-primary-red uppercase tracking-widest">{notifications.filter(n=>!n.isRead).length} New</span>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.slice(0, 5).map(n => (
                                                <div 
                                                    key={n._id} 
                                                    onClick={() => !n.isRead && markAsRead(n._id)}
                                                    className={`p-4 border-b border-border-soft/50 hover:bg-bg-soft transition-colors cursor-pointer ${!n.isRead ? 'bg-primary-red/5' : ''}`}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className={`text-xs ${!n.isRead ? 'font-bold text-primary-navy' : 'font-medium text-text-dark'}`}>{n.title}</h4>
                                                    </div>
                                                    <p className="text-[10px] text-text-muted line-clamp-2 leading-relaxed mt-1">{n.message}</p>
                                                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-2 block">{new Date(n.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-text-muted">
                                                <Bell size={24} className="mx-auto mb-2 opacity-20" />
                                                <p className="text-[10px] uppercase tracking-widest font-bold">No alerts found</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 border-t border-border-soft bg-bg-soft/30">
                                        <button 
                                            onClick={() => {
                                                setShowNotificationsDropdown(false);
                                                handleTabChange('notifications');
                                            }}
                                            className="w-full text-center text-[10px] font-bold text-primary-red uppercase tracking-widest hover:underline"
                                        >
                                            View All Notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="h-10 w-px bg-border-soft" />

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-primary-navy leading-none">{user?.name}</p>
                                <p className="text-[10px] font-black text-primary-red uppercase tracking-tighter mt-1">Field Technician</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary-navy text-white flex items-center justify-center font-bold shadow-lg">
                                {user?.name?.[0]}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-grow overflow-y-auto bg-bg-soft custom-scrollbar">
                    <div className="p-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
                        {loading ? (
                            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                                <div className="w-12 h-12 border-4 border-primary-navy/10 border-t-primary-red rounded-full animate-spin"></div>
                                <p className="text-text-muted font-bold tracking-widest uppercase text-xs">Syncing Personnel Data...</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {activeTab === 'overview' && renderOverview()}
                                {activeTab === 'new' && renderJobTable(jobs.filter(j => j.status === 'Pending'), true)}
                                {activeTab === 'my-jobs' && (
                                    <div className="space-y-6">
                                        <div className="flex gap-4 border-b border-border-soft pb-4">
                                            {['All', 'Accepted', 'In Progress', 'Completed'].map(f => (
                                                <button 
                                                    key={f}
                                                    onClick={() => setMyJobsFilter(f)}
                                                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                                                        myJobsFilter === f 
                                                        ? 'bg-primary-navy text-white shadow-md' 
                                                        : 'bg-bg-soft text-text-muted hover:bg-bg-soft/80'
                                                    }`}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                        {renderJobTable(
                                            jobs.filter(j => {
                                                const statuses = ['Accepted', 'In Progress', 'Completed'];
                                                if (!statuses.includes(j.status)) return false;
                                                if (myJobsFilter !== 'All' && j.status !== myJobsFilter) return false;
                                                return true;
                                            }), 
                                            true
                                        )}
                                    </div>
                                )}
                                {activeTab === 'attendance' && renderAttendance()}
                                {activeTab === 'leaves' && renderLeaves()}
                                {activeTab === 'notifications' && renderNotifications()}
                                {activeTab === 'profile' && renderProfile()}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Proof Submission Modal */}
            {showProofModal && selectedJob && (
                <div className="fixed inset-0 bg-primary-navy/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <div className="zoho-card max-w-lg w-full p-6 animate-in zoom-in-95 duration-200 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <h3 className="crm-section-title">Complete Job</h3>
                            </div>
                            <button onClick={() => {
                                setShowProofModal(false);
                                setPreviewUrl(null);
                                setProofForm({ photos: [], notes: '' });
                            }} className="p-2.5 hover:bg-bg-soft rounded-xl text-text-muted transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1 mb-2 block">Upload Installation Photos</label>
                                <div 
                                    onClick={() => proofForm.photos.length < 6 && document.getElementById('proof-upload').click()}
                                    className={`p-6 bg-bg-soft rounded-2xl border-2 border-dashed transition-all text-center group cursor-pointer flex flex-col items-center justify-center py-8 ${
                                        proofForm.photos.length >= 6 ? 'opacity-50 cursor-not-allowed border-border-soft' : 'border-border-soft hover:border-primary-red/30'
                                    }`}
                                >
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                        <Camera size={24} className="text-primary-red" />
                                    </div>

                                    <p className="text-[9px] text-text-muted mt-1.5 font-medium">
                                        {proofForm.photos.length > 0
                                            ? `${proofForm.photos.length}/6 photos selected — click to add more`
                                            : 'Upload up to 6 photos of the completed installation'
                                        }
                                    </p>
                                <input 
                                    id="proof-upload"
                                    type="file" 
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>

                            {/* Image previews grid with scrollable container */}
                            {proofForm.photos.length > 0 && (
                                <div className="max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                                    <div className="grid grid-cols-3 gap-3">
                                        {proofForm.photos.map((photo, idx) => (
                                            <div key={idx} className="relative group rounded-xl overflow-hidden border border-border-soft aspect-square bg-bg-soft">
                                                <img src={photo} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => setProofForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }))}
                                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold shadow-md hover:bg-red-600"
                                                >
                                                    ×
                                                </button>
                                                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[8px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">{idx + 1}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Work Notes</label>
                                <textarea 
                                    className="zoho-input min-h-[100px] resize-none py-4 text-xs font-medium"
                                    placeholder=""
                                    value={proofForm.notes}
                                    onChange={e => setProofForm({...proofForm, notes: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={() => {
                                        setShowProofModal(false);
                                        setPreviewUrl(null);
                                        setProofForm({ photos: [], notes: '' });
                                    }}
                                    className="flex-1 px-6 py-3.5 rounded-xl border border-border-soft text-text-muted font-bold uppercase text-[10px] tracking-widest hover:bg-bg-soft transition-all"
                                >
                                    Abort
                                </button>
                                <button 
                                    disabled={proofForm.photos.length === 0}
                                    onClick={() => handleJobAction(selectedJob.bookingId, 'complete', { proofPhoto: proofForm.photos[0], proofPhotos: proofForm.photos, workNotes: proofForm.notes })}
                                    className="flex-1 zoho-btn-primary py-3.5 text-[10px] rounded-xl shadow-lg shadow-red-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    UPLOAD IMAGE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showImageViewer && (
                <div className="fixed inset-0 bg-navy-dark/95 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300">
                    <button 
                        onClick={() => setShowImageViewer(false)}
                        className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-[210] group"
                    >
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                    
                    <div className="max-w-5xl w-full h-[80vh] flex items-center justify-center relative animate-in zoom-in-95 duration-500">
                        <img 
                            src={viewerImageUrl} 
                            alt="Compliance Evidence" 
                            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10" 
                        />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/5 text-white/80 text-[10px] font-bold uppercase tracking-[0.3em] mb-[-60px]">
                            SecureVision Compliance Evidence
                        </div>
                    </div>
                </div>
            )}

            {renderLeaveModal()}
        </div>
    );
};

export default EmployeeDashboard;
