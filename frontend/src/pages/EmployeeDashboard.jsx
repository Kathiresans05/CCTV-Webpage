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
    Camera,
    MessageSquare,
    Receipt,
    ClipboardList,
    Award,
    FileSpreadsheet,
    Search,
    Eye
} from 'lucide-react';
import Chat from '../components/Chat';
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
        '/employee/leaves': 'leaves',
        '/employee/chat': 'chat',
        '/employee/expenses': 'expenses',
        '/employee/tasks': 'tasks',
        '/employee/leads': 'leads',
        '/employee/reports': 'reports',
        '/employee/follow-ups': 'followups'
    };

    // Reverse mapping for navigation
    const tabToPath = {
        'overview': '/employee/dashboard',
        'new': '/employee/requests',
        'my-jobs': '/employee/my-jobs',
        'attendance': '/employee/attendance',
        'notifications': '/employee/notifications',
        'profile': '/employee/profile',
        'leaves': '/employee/leaves',
        'chat': '/employee/chat',
        'expenses': '/employee/expenses',
        'tasks': '/employee/tasks',
        'leads': '/employee/leads',
        'reports': '/employee/reports',
        'followups': '/employee/follow-ups'
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
    const [adminUser, setAdminUser] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const [myLeads, setMyLeads] = useState([]);
    const [myReports, setMyReports] = useState([]);
    const [myFollowUps, setMyFollowUps] = useState([]);
    const [leadsFilter, setLeadsFilter] = useState('All');
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportForm, setReportForm] = useState({ workSummary: '', tasksCompleted: '', hoursWorked: 8 });
    const [tasksFilter, setTasksFilter] = useState('All');
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expenseForm, setExpenseForm] = useState({ amount: '', category: 'Travel', description: '', receiptImage: '' });
    const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
    
    // Modal state for job completion
    const [showProofModal, setShowProofModal] = useState(false);
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [viewerImageUrl, setViewerImageUrl] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [bookingForm, setBookingForm] = useState({ 
        status: 'pending_schedule', 
        proposedDate: '', 
        proposedTimeSlot: '', 
        adminNote: '' 
    });
    const [fromDate, setFromDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
    });
    const [attendanceSearchTerm, setAttendanceSearchTerm] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [proofForm, setProofForm] = useState({ photos: [], notes: '' });

    // Follow-up Modal State
    const [showFollowUpModal, setShowFollowUpModal] = useState(false);
    const [selectedLeadForFollowUp, setSelectedLeadForFollowUp] = useState(null);
    const [followUpForm, setFollowUpForm] = useState({ followUpDate: '', followUpTime: '10:00 AM', note: '' });
    const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);

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
        fetchAllData();
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            
            // Fetch everything including Admin details for chat and expenses
            const [jRes, aRes, hRes, nRes, lRes, adminRes, expRes, taskRes, leadRes, drRes] = await Promise.all([
                fetch('/api/employee/jobs', { headers }),
                fetch('/api/attendance/status', { headers }),
                fetch('/api/attendance/history', { headers }),
                fetch('/api/notifications', { headers }),
                fetch('/api/leaves/my', { headers }),
                fetch('/api/users/role/admin', { headers }),
                fetch('/api/expenses/my', { headers }),
                fetch('/api/tasks/my', { headers }),
                fetch('/api/leads', { headers }),
                fetch('/api/daily-reports/my', { headers }),
                fetch('/api/follow-ups', { headers })
            ]);

            const [jData, aData, hData, nData, lData, adminData, expData, taskData, leadData, drData, fuData] = await Promise.all([
                jRes.json(), aRes.json(), hRes.json(), nRes.json(), lRes.json(), adminRes.json(), expData.json(), taskRes.json(), leadRes.json(), drRes.json(), fuRes.json()
            ]);

            if (jData && jData.success) setJobs(jData.data || []);
            if (aData && aData.success) setAttendanceStatus(aData.data || null);
            if (hData && hData.success) setAttendanceHistory(hData.data || []);
            if (nData && nData.success) setNotifications(nData.data || []);
            if (lData && lData.success) setLeaves(lData.data || []);
            if (adminData && adminData.success) setAdminUser(adminData.data || null);
            if (expData && expData.success) setExpenses(expData.data || []);
            if (taskData && taskData.success) setMyTasks(taskData.data || []);
            if (leadData && leadData.success) setMyLeads(leadData.data || []);
            if (drData && drData.success) setMyReports(drData.data || []);
            if (fuData && fuData.success) setMyFollowUps(fuData.data || []);

        } catch (error) {
            console.error('Error fetching employee data:', error);
        } finally {
            setLoading(false);
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
                toast.success('Action successful');
                fetchAllData();
            } else {
                toast.error(data.message || 'Action failed');
            }
        } catch (error) {
            console.error('Job action error:', error);
            toast.error('Error connecting to server.');
        }
    };

    const handleBookingDirective = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/bookings/${editingBooking.bookingId}/directive`, {
                method: 'PATCH',
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
                toast.success('Directive applied successfully!');
                fetchAllData();
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Error updating booking:', error);
            toast.error('Connection error');
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
            fetchAllData(); // Silent refresh
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            fetchAllData(); // Re-sync on error
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
                fetchAllData();
            }
        } catch (error) {
            console.error('RAW Error marking notification as read:', error);
            toast.error(`Connection error: ${error.message}`, { id: 'read-notification' });
            fetchAllData();
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
                fetchAllData();
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
                fetchAllData();
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
                    <h2 className="crm-page-title">APPLY LEAVE</h2>
                    <p className="crm-body text-[14px] mt-0.5">Request and track your leave status</p>
                </div>
                <button 
                    onClick={() => setShowLeaveModal(true)}
                    className="zoho-btn-secondary px-6 py-2.5 rounded-xl text-[14px] font-bold flex items-center gap-2"
                >
                    <Plus size={18} /> APPLY LEAVE
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
                                                <span className="text-[14px] font-bold text-primary-navy">{l.leaveType}</span>
                                                <span className="text-[14px] text-text-muted mt-0.5 line-clamp-1 max-w-[200px]">{l.reason}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-[14px] font-semibold text-text-dark">
                                                <span>{new Date(l.startDate).toLocaleDateString()}</span>
                                                <span className="text-[14px] text-text-muted">to {new Date(l.endDate).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[14px] font-bold text-primary-navy">
                                            {Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1} Days
                                        </td>
                                        <td className="px-6 py-4 text-[14px] font-medium text-text-muted">
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
                                        <p className="text-text-muted font-bold uppercase tracking-widest text-[14px]">No leave records found</p>
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
                            <h3 className="text-xl font-bold text-white tracking-tight">APPLY LEAVE</h3>
                            <p className="text-rose-100/60 text-[14px] uppercase font-bold tracking-widest mt-1">Personnel Absence Directive</p>
                        </div>
                        <button onClick={() => setShowLeaveModal(false)} className="text-white/60 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleLeaveSubmit} className="p-8 space-y-5">
                        <div className="space-y-1.5">
                            <label className="crm-label !text-[14px]">Leave Type</label>
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
                                <label className="crm-label !text-[14px]">Start Date</label>
                                <input 
                                    type="date" 
                                    className="zoho-input w-full"
                                    value={leaveForm.startDate}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="crm-label !text-[14px]">End Date</label>
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
                            <label className="crm-label !text-[14px]">Reason for Absence</label>
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
                                className="zoho-btn-secondary flex-grow py-3 text-[14px] tracking-widest"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={isSubmittingLeave}
                                className="zoho-btn-primary flex-grow py-3 text-[14px] tracking-widest"
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
                { label: 'Pending Proofs', value: jobs.filter(j => ['In Progress', 'in_progress'].includes(j.status) && !j.proofPhoto).length, icon: Camera, color: 'text-amber-600', bg: 'bg-amber-500/10', trend: 'Action Reqd' },
                { label: 'Today Assigned Work', value: jobs.filter(j => ['Accepted', 'scheduled_confirmed', 'In Progress', 'in_progress'].includes(j.status)).length, icon: Briefcase, color: 'text-primary-navy', bg: 'bg-bg-soft', trend: 'Daily' },
                { label: 'Unread Alerts', value: notifications.filter(n => !n.isRead).length, icon: Bell, color: 'text-primary-red', bg: 'bg-primary-red/10', trend: 'Updates' }
            ]
        };

        const renderKpiCard = (stat, idx) => (
            <div key={idx} className="bg-white border border-border-soft rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:border-primary-navy/20 transition-all cursor-default h-32">
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
                                        <span className="text-[14px] font-bold text-text-muted uppercase tracking-widest">SV-{j.bookingId.substring(0,8).toUpperCase()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="crm-card-title leading-tight">{j.customerName}</span>
                                            <span className="crm-label !text-[14px] mt-1">{j.customerPhone}</span>
                                            <span className="crm-body !text-[14px] mt-0.5 truncate max-w-[180px]">{j.address}, {j.city}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[14px] font-bold text-text-dark">{j.productName}</p>
                                        <p className="text-[14px] text-primary-red font-bold uppercase tracking-tighter mt-1 italic">SecureVision Hardware</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-[14px] text-primary-navy font-bold">{j.preferredDate ? new Date(j.preferredDate).toLocaleDateString() : 'IMMEDIATE'}</span>
                                            <span className="text-[14px] text-text-muted font-bold uppercase tracking-tighter mt-1">{new Date(j.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`status-chip ${
                                            ['Pending', 'pending_schedule', 'reschedule_requested'].includes(j.status) ? 'bg-amber-100 text-amber-700' :
                                            ['Accepted', 'scheduled_confirmed'].includes(j.status) ? 'bg-blue-100 text-blue-700' :
                                            ['In Progress', 'in_progress'].includes(j.status) ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {j.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    {showActions && (
                                        <td className="px-6 py-4 text-right">
                                            {(['Pending', 'pending_schedule', 'reschedule_requested', 'schedule_sent'].includes(j.status)) && (
                                                <div className="flex justify-end items-center gap-2">
                                                    {j.status === 'schedule_sent' && (
                                                        <span className="text-[14px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 uppercase tracking-widest mr-2">
                                                            Awaiting Customer
                                                        </span>
                                                    )}
                                                    <button 
                                                        onClick={() => {
                                                            setEditingBooking(j);
                                                            setBookingForm({
                                                                status: j.status || 'pending_schedule',
                                                                proposedDate: j.proposedDate || '',
                                                                proposedTimeSlot: j.proposedTimeSlot || '',
                                                                adminNote: j.adminNote || ''
                                                            });
                                                            setShowBookingModal(true);
                                                        }}
                                                        className="zoho-btn-secondary px-5 py-2.5 rounded-xl text-[14px] font-bold uppercase tracking-widest border-primary-navy/20 bg-white text-primary-navy hover:bg-bg-soft"
                                                    >
                                                        MANAGE SCHEDULE
                                                    </button>
                                                    {j.status === 'scheduled_confirmed' && (
                                                        <button 
                                                            onClick={() => handleJobAction(j.bookingId, 'start')}
                                                            className="bg-primary-navy text-white px-5 py-2.5 rounded-xl text-[14px] font-bold uppercase tracking-widest hover:bg-navy-dark transition-all"
                                                        >
                                                            START WORK
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            {j.status === 'scheduled_confirmed' && !['Pending', 'pending_schedule', 'reschedule_requested', 'schedule_sent'].includes(j.status) && (
                                                <div className="flex justify-end items-center gap-2">
                                                    <button 
                                                        onClick={() => handleJobAction(j.bookingId, 'start')}
                                                        className="bg-primary-navy text-white px-5 py-2.5 rounded-xl text-[14px] font-bold uppercase tracking-widest hover:bg-navy-dark transition-all"
                                                    >
                                                        START WORK
                                                    </button>
                                                </div>
                                            )}
                                            {['In Progress', 'in_progress'].includes(j.status) && (
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedJob(j);
                                                            setShowProofModal(true);
                                                        }}
                                                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[14px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 ml-auto"
                                                    >
                                                        <Camera size={12} /> UPLOAD IMAGE
                                                    </button>
                                            )}
                                            {['Completed', 'completed'].includes(j.status) && j.proofPhoto && (
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
                                    <p className="text-text-muted font-bold uppercase tracking-widest text-[14px]">Zero operation directives located in registry</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAttendance = () => {
        try {
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

            if (!fromDate || !toDate || fromDate === '' || toDate === '') return null;
            const startParts = (fromDate || '').split('-');
            const endParts = (toDate || '').split('-');
            if (startParts.length < 3 || endParts.length < 3) return null;
            
            const start = new Date(startParts[0], startParts[1] - 1, startParts[2]);
            const end = new Date(endParts[0], endParts[1] - 1, endParts[2]);
            
            if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
            
            const todayAtMidnight = new Date();
            todayAtMidnight.setHours(0,0,0,0);
            
            const actualEnd = end > todayAtMidnight ? todayAtMidnight : end;

            const monthDays = [];
            if (start <= end) {
                for (let d = new Date(start); d <= actualEnd; d.setDate(d.getDate() + 1)) {
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    const dateStr = `${y}-${m}-${day}`;
                    
                    const record = attendanceHistory.find(h => h.date === dateStr);
                    
                    let status = 'Absent';
                    if (record) {
                        if (record.checkIn && !record.checkOut) status = 'Active / Open Shift';
                        else if (record.checkIn) status = 'Present';
                    }

                    monthDays.push({
                        date: dateStr,
                        displayDate: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                        checkIn: record?.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
                        checkOut: record?.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
                        totalHours: record?.totalHours ? `${Number(record.totalHours).toFixed(1)} hrs` : '—',
                        status: status,
                        _id: record?._id || `absent-${dateStr}`
                    });
                }
            }

            let filteredDays = monthDays.reverse();
            if (attendanceSearchTerm) {
                const term = attendanceSearchTerm.toLowerCase();
                filteredDays = filteredDays.filter(h => 
                    h.displayDate.toLowerCase().includes(term) ||
                    h.status.toLowerCase().includes(term)
                );
            }

            return (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-border-soft mb-6">
                        <div className="flex-grow w-full sm:w-auto">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search History..." 
                                    value={attendanceSearchTerm}
                                    onChange={(e) => setAttendanceSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-border-soft rounded-lg text-[14px] bg-bg-soft/50 focus:bg-white focus:border-primary-navy/30 transition-all outline-none font-medium" 
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                            <div className="flex items-center gap-3 border border-border-soft rounded-xl px-4 py-2 bg-bg-soft/50 flex-1 sm:flex-none">
                                <Calendar size={18} className="text-text-muted shrink-0" />
                                <div className="flex flex-col">
                                    <span className="text-[14px] font-black text-text-muted uppercase tracking-widest leading-tight">FROM DATE</span>
                                    <input 
                                        type="date" 
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="bg-transparent text-[14px] font-bold text-primary-navy outline-none w-full min-w-[110px]" 
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 border border-border-soft rounded-xl px-4 py-2 bg-bg-soft/50 flex-1 sm:flex-none">
                                <Calendar size={18} className="text-text-muted shrink-0" />
                                <div className="flex flex-col">
                                    <span className="text-[14px] font-black text-text-muted uppercase tracking-widest leading-tight">TO DATE</span>
                                    <input 
                                        type="date" 
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="bg-transparent text-[14px] font-bold text-primary-navy outline-none w-full min-w-[110px]" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Status Card */}
                        <div className="bg-white p-6 rounded-[28px] border border-border-soft shadow-sm hover:shadow-md transition-all h-28 flex items-center gap-5 relative group overflow-hidden">
                            <div className="absolute top-3 right-4">
                                <span className={`text-[14px] font-black px-2 py-0.5 rounded-full ring-1 ring-inset ${isCheckedIn && !isCheckedOut ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' : 'bg-rose-50 text-rose-600 ring-rose-100'}`}>
                                    {isCheckedIn && !isCheckedOut ? 'ACTIVE' : 'OFFLINE'}
                                </span>
                            </div>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 ${isCheckedIn && !isCheckedOut ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                <Clock size={24} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[14px] font-bold text-text-muted uppercase tracking-widest mb-1">Today's Duration</p>
                                <h3 className="text-xl font-black text-primary-navy leading-tight">{totalHours}</h3>
                            </div>
                        </div>

                        {/* Entry Time */}
                        <div className="bg-white p-6 rounded-[28px] border border-border-soft shadow-sm hover:shadow-md transition-all h-28 flex items-center gap-5 group">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300">
                                <Play size={24} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[14px] font-bold text-text-muted uppercase tracking-widest mb-1">Entry Time</p>
                                <h3 className="text-xl font-black text-primary-navy leading-tight">{checkInTime}</h3>
                            </div>
                        </div>

                        {/* Exit Time */}
                        <div className="bg-white p-6 rounded-[28px] border border-border-soft shadow-sm hover:shadow-md transition-all h-28 flex items-center gap-5 group">
                            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300">
                                <LogOut size={24} className="rotate-180" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[14px] font-bold text-text-muted uppercase tracking-widest mb-1">Exit Time</p>
                                <h3 className="text-xl font-black text-primary-navy leading-tight">{checkOutTime}</h3>
                            </div>
                        </div>

                        {/* Month Completion */}
                        <div className="bg-white p-6 rounded-[28px] border border-border-soft shadow-sm hover:shadow-md transition-all h-28 flex items-center gap-5 group">
                            <div className="w-14 h-14 rounded-2xl bg-primary-navy text-white flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 shadow-lg shadow-primary-navy/10">
                                <History size={24} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[14px] font-bold text-text-muted uppercase tracking-widest mb-1">Month Completion</p>
                                <h3 className="text-xl font-black text-primary-navy leading-tight">{monthDays.filter(d => d.status === 'Present').length} Days</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-border-soft shadow-sm overflow-hidden mt-8">
                        <div className="p-6 border-b border-border-soft flex justify-between items-center bg-bg-soft/30">
                            <h3 className="text-[14px] font-black text-primary-navy uppercase tracking-widest">Attendance History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-bg-soft/50">
                                    <tr className="border-b border-border-soft">
                                        <th className="px-6 py-4 text-[14px] font-black text-text-muted uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-[14px] font-black text-text-muted uppercase tracking-widest">Login</th>
                                        <th className="px-6 py-4 text-[14px] font-black text-text-muted uppercase tracking-widest">Logout</th>
                                        <th className="px-6 py-4 text-[14px] font-black text-text-muted uppercase tracking-widest">Duration</th>
                                        <th className="px-6 py-4 text-[14px] font-black text-text-muted uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-soft">
                                    {filteredDays.length > 0 ? filteredDays.map((day, idx) => (
                                        <tr key={idx} className="hover:bg-bg-soft/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="text-[14px] font-bold text-primary-navy">{day.displayDate}</p>
                                            </td>
                                            <td className="px-6 py-4 text-[14px] font-medium text-text-dark italic">{day.checkIn}</td>
                                            <td className="px-6 py-4 text-[14px] font-medium text-text-dark italic">{day.checkOut}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-[14px] font-bold text-primary-navy">{day.totalHours}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[14px] font-black uppercase tracking-widest border ${
                                                    day.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    day.status.includes('Active') ? 'bg-sky-50 text-sky-600 border-sky-100 animate-pulse' :
                                                    'bg-rose-50 text-rose-500 border-rose-100 opacity-60'
                                                }`}>
                                                    {day.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-text-muted text-[14px] font-medium italic">No attendance records found for this period.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
        } catch (error) {
            console.error('Attendance Failure:', error);
            return (
                <div className="p-10 text-center bg-white rounded-3xl border border-rose-100 shadow-xl shadow-rose-900/5">
                    <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="text-rose-500" size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-primary-navy">Attendance Unavailable</h4>
                    <p className="text-[14px] text-text-muted mt-2 max-w-xs mx-auto">We encountered an error loading your history. Please check back in a few moments.</p>
                </div>
            );
        }
    };

    const renderNotifications = () => (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-end items-center mb-6">
                  <button onClick={markAllAsRead} className="zoho-btn-secondary px-5 py-2.5 rounded-xl text-[14px]">Acknowledge All</button>
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
                            <h4 className="font-bold text-[14px] text-primary-navy uppercase tracking-tight">{n.title}</h4>
                            <span className="text-[14px] font-bold text-text-muted tracking-tight bg-bg-soft px-3 py-1 rounded-full">{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-[14px] text-text-muted mt-2 leading-relaxed font-medium">{n.message}</p>
                    </div>
                </div>
            )) : (
                <div className="zoho-card py-24 text-center border-dashed border-2">
                    <div className="w-20 h-20 bg-bg-soft rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bell size={32} className="text-text-muted" />
                    </div>
                    <p className="text-text-muted font-bold uppercase tracking-widest text-[14px]">Registry clear: No intelligence bulletins found</p>
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
                        <div className="status-chip bg-emerald-100 text-emerald-700 text-[14px]">ACTIVE SERVICE</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-12 border-t border-border-soft">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-bg-soft rounded-xl text-text-muted transition-colors group-hover:text-primary-navy">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-[14px] font-bold text-text-muted uppercase tracking-widest">Phone No</p>
                                    <p className="text-[14px] font-bold text-primary-navy mt-0.5">{user?.phone || 'Not Registered'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-bg-soft rounded-xl text-text-muted transition-colors group-hover:text-primary-navy">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <p className="text-[14px] font-bold text-text-muted uppercase tracking-widest">Location</p>
                                    <p className="text-[14px] font-bold text-primary-navy mt-0.5">SecureVision HQ, Chennai</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-bg-soft rounded-xl text-text-muted transition-colors group-hover:text-primary-navy">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-[14px] font-bold text-text-muted uppercase tracking-widest">Joining Date</p>
                                    <p className="text-[14px] font-bold text-primary-navy mt-0.5">March 12, 2024</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderChat = () => (
        <div className="max-w-4xl mx-auto h-[700px]">
            {adminUser ? (
                <div className="space-y-6">
                    <div>
                        <h2 className="crm-section-title">Support Chat</h2>
                        <p className="crm-label mt-1 text-primary-navy/40">Direct messages with Administration</p>
                    </div>
                    <Chat 
                        currentUser={user} 
                        targetUser={adminUser} 
                        token={token} 
                    />
                </div>
            ) : (
                <div className="h-full bg-white border border-border-soft rounded-2xl flex flex-col items-center justify-center text-text-muted space-y-4 shadow-sm text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-bg-soft flex items-center justify-center">
                        <MessageSquare size={32} />
                    </div>
                    <div>
                        <p className="font-bold text-lg text-primary-navy">Chat Unavailable</p>
                        <p className="text-[14px] mt-2">Could not connect to the administration system. Please try again later.</p>
                    </div>
                </div>
            )}
        </div>
    );

    const renderMyJobs = () => (
        <div className="space-y-6">
            <div className="flex gap-4 border-b border-border-soft pb-4">
                {['All', 'Accepted', 'In Progress', 'Completed'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setMyJobsFilter(f)}
                        className={`px-4 py-2 text-[14px] font-bold uppercase tracking-widest rounded-lg transition-all ${
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
                    const statuses = ['Accepted', 'scheduled_confirmed', 'In Progress', 'in_progress', 'Completed', 'completed'];
                    if (!statuses.includes(j.status)) return false;
                    if (myJobsFilter !== 'All') {
                        if (myJobsFilter === 'Accepted' && !['Accepted', 'scheduled_confirmed'].includes(j.status)) return false;
                        if (myJobsFilter === 'In Progress' && !['In Progress', 'in_progress'].includes(j.status)) return false;
                        if (myJobsFilter === 'Completed' && !['Completed', 'completed'].includes(j.status)) return false;
                    }
                    return true;
                }), 
                true
            )}
        </div>
    );

    const handleTaskStatusUpdate = async (id, status) => {
        try {
            const res = await fetch(`/api/tasks/${id}/status`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Task marked as ${status}`);
                fetchAllData();
            }
        } catch (error) {
            toast.error('Failed to update task status');
        }
    };

    const renderTasks = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-primary-navy tracking-tight">Administrative Tasks</h2>
                    <p className="text-[14px] text-text-muted mt-1">Manage and complete tasks assigned by administration</p>
                </div>
                <div className="flex gap-4">
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
                {myTasks.filter(t => tasksFilter === 'All' || t.status === tasksFilter).length > 0 ? (
                    myTasks.filter(t => tasksFilter === 'All' || t.status === tasksFilter).map(task => (
                        <div key={task._id} className="zoho-card p-6 border-l-4 border-l-primary-navy group hover:shadow-xl transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[14px] font-black px-2 py-1 rounded border uppercase tracking-widest ${
                                    task.priority === 'Urgent' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                    task.priority === 'High' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                    'bg-bg-soft text-text-muted border-border-soft'
                                }`}>
                                    {task.priority}
                                </span>
                                {task.status === 'Completed' && (
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <CheckCircle2 size={16} />
                                    </div>
                                )}
                            </div>
                            <h3 className="font-bold text-primary-navy mb-2">{task.title}</h3>
                            <p className="text-[14px] text-text-muted mb-6 leading-relaxed">{task.description}</p>
                            
                            <div className="space-y-4 pt-4 border-t border-border-soft">
                                <div className="flex justify-between items-center text-[14px] font-bold uppercase tracking-wider">
                                    <span className="text-text-muted italic">Deadline:</span>
                                    <span className="text-primary-navy">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div className="flex gap-2">
                                    {task.status === 'Pending' && (
                                        <button 
                                            onClick={() => handleTaskStatusUpdate(task._id, 'In Progress')}
                                            className="flex-1 py-3 bg-primary-navy text-white text-[14px] font-bold uppercase tracking-widest rounded-xl hover:bg-navy-dark transition-all shadow-lg shadow-primary-navy/20"
                                        >
                                            Start Task
                                        </button>
                                    )}
                                    {task.status === 'In Progress' && (
                                        <button 
                                            onClick={() => handleTaskStatusUpdate(task._id, 'Completed')}
                                            className="flex-1 py-3 bg-emerald-600 text-white text-[14px] font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                                        >
                                            Mark Completed
                                        </button>
                                    )}
                                    {task.status === 'Completed' && (
                                        <div className="flex-1 py-3 bg-bg-soft text-emerald-600 text-[14px] font-bold uppercase tracking-widest rounded-xl text-center border border-emerald-100">
                                            Mission Accomplished
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center bg-white rounded-[32px] border border-border-soft border-dashed">
                        <div className="flex flex-col items-center gap-3 opacity-30">
                            <ClipboardList size={48} />
                            <p className="text-text-muted font-bold tracking-widest uppercase text-[14px]">Clear for now. No pending directives.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingExpense(true);
        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(expenseForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Expense submitted for approval');
                setShowExpenseModal(false);
                setExpenseForm({ amount: '', category: 'Travel', description: '', receiptImage: '' });
                fetchAllData();
            } else {
                toast.error(data.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Expense submit error:', error);
            toast.error('Network error');
        } finally {
            setIsSubmittingExpense(false);
        }
    };

    const handleReceiptUpload = async (e) => {
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
                setExpenseForm({ ...expenseForm, receiptImage: data.urls[0] });
                toast.success('Receipt uploaded');
            }
        } catch (error) {
            console.error('Receipt upload error:', error);
        }
    };

    const handleLeadUpdate = async (id, status, notes) => {
        try {
            const res = await fetch(`/api/leads/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, notes })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Lead updated successfully');
                fetchAllData();
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const handleFollowUpSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingFollowUp(true);
        try {
            const res = await fetch('/api/follow-ups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...followUpForm,
                    leadId: selectedLeadForFollowUp._id
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Follow-up scheduled');
                setShowFollowUpModal(false);
                setFollowUpForm({ followUpDate: '', followUpTime: '10:00 AM', note: '' });
                fetchAllData();
            } else {
                toast.error(data.message || 'Scheduling failed');
            }
        } catch (error) {
            toast.error('Network error');
        } finally {
            setIsSubmittingFollowUp(false);
        }
    };

    const updateFollowUpStatus = async (id, status) => {
        try {
            const res = await fetch(`/api/follow-ups/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Follow-up marked as ${status}`);
                fetchAllData();
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const renderLeads = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-border-soft shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-primary-navy tracking-tight">Assigned Leads</h2>
                    <p className="text-[14px] text-text-muted mt-1">Manage prospects and track sales conversions</p>
                </div>
                <div className="flex gap-4">
                    {['New', 'Contacted', 'Qualified', 'All'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setLeadsFilter(f)}
                            className={`px-4 py-2 text-[14px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                leadsFilter === f 
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
                {myLeads.filter(l => leadsFilter === 'All' || l.status === leadsFilter).length > 0 ? (
                    myLeads.filter(l => leadsFilter === 'All' || l.status === leadsFilter).map(lead => (
                        <div key={lead._id} className="zoho-card p-6 border-l-4 border-l-primary-navy group hover:shadow-xl transition-all h-full flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[14px] font-black px-2 py-1 rounded border uppercase tracking-widest ${
                                    lead.status === 'Converted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    lead.status === 'Lost' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                    'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                    {lead.status}
                                </span>
                                <div className="text-[14px] font-bold text-text-muted uppercase tracking-widest">
                                    {new Date(lead.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-primary-navy mb-1 text-[14px]">{lead.name}</h3>
                            <p className="text-[14px] font-bold text-text-muted mb-4 truncate">{lead.company || 'Private Individual'}</p>
                            
                            <div className="space-y-3 mb-6 flex-grow">
                                <div className="flex items-center gap-2 text-[14px] text-text-dark font-medium">
                                    <Phone size={14} className="text-slate-400" />
                                    {lead.phone}
                                </div>
                                <div className="flex items-center gap-2 text-[14px] text-text-dark font-medium">
                                    <Bell size={14} className="text-slate-400" />
                                    {lead.email}
                                </div>
                                <div className="mt-4 p-3 bg-bg-soft rounded-xl border border-border-soft">
                                    <p className="text-[14px] font-black text-text-muted uppercase tracking-widest mb-1">Service Interest</p>
                                    <p className="text-[14px] font-bold text-primary-navy">{lead.serviceInterest}</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border-soft">
                                <div className="space-y-2">
                                    <label className="text-[14px] font-black text-text-muted uppercase tracking-widest">Update Pipeline Status</label>
                                    <select 
                                        value={lead.status} 
                                        onChange={(e) => handleLeadUpdate(lead._id, e.target.value, lead.notes)}
                                        className="zoho-input text-[14px] h-10"
                                    >
                                        <option value="New">New</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Qualified">Qualified</option>
                                        <option value="Lost">Lost</option>
                                        <option value="Converted">Converted</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[14px] font-black text-text-muted uppercase tracking-widest">Interaction Notes</label>
                                    <textarea 
                                        className="zoho-input text-[14px] h-20 py-2 resize-none"
                                        placeholder="Add customer interaction notes..."
                                        defaultValue={lead.notes}
                                        onBlur={(e) => handleLeadUpdate(lead._id, lead.status, e.target.value)}
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={() => {
                                    setSelectedLeadForFollowUp(lead);
                                    setShowFollowUpModal(true);
                                }}
                                className="mt-4 w-full py-3 bg-bg-soft hover:bg-white text-primary-navy text-[14px] font-black uppercase tracking-widest rounded-xl border border-border-soft transition-all flex items-center justify-center gap-2"
                            >
                                <Calendar size={14} />
                                Schedule Follow-up
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center bg-white rounded-[32px] border border-border-soft border-dashed">
                        <div className="flex flex-col items-center gap-3 opacity-30">
                            <TrendingUp size={48} />
                            <p className="text-text-muted font-bold tracking-widest uppercase text-[14px]">Pipeline empty. No leads assigned.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderFollowUps = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-border-soft shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-primary-navy tracking-tight">Scheduled Follow-ups</h2>
                    <p className="text-[14px] text-text-muted mt-1">Don't miss a connection with your prospects</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {myFollowUps.length > 0 ? myFollowUps.map(fu => (
                    <div key={fu._id} className={`zoho-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-l-4 ${
                        fu.status === 'Completed' ? 'border-l-emerald-500' : 
                        new Date(fu.followUpDate) < new Date() && fu.status === 'Pending' ? 'border-l-rose-500' : 'border-l-blue-500'
                    }`}>
                        <div className="flex items-center gap-6">
                            <div className="bg-bg-soft p-4 rounded-2xl border border-border-soft flex flex-col items-center min-w-[80px]">
                                <span className="text-[14px] font-black text-text-muted uppercase tracking-widest">{new Date(fu.followUpDate).toLocaleString('default', { month: 'short' })}</span>
                                <span className="text-2xl font-bold text-primary-navy">{new Date(fu.followUpDate).getDate()}</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-primary-navy text-[14px]">{fu.leadId?.name || 'Unknown Lead'}</h3>
                                <div className="flex items-center gap-4 mt-1">
                                    <div className="flex items-center gap-1.5 text-[14px] font-bold text-text-muted">
                                        <Clock size={12} />
                                        {fu.followUpTime}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[14px] font-bold text-text-muted">
                                        <Phone size={12} />
                                        {fu.leadId?.phone}
                                    </div>
                                </div>
                                {fu.note && <p className="text-[14px] text-text-muted mt-2 italic">"{fu.note}"</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-center">
                            {fu.status === 'Pending' && (
                                <>
                                    <button 
                                        onClick={() => updateFollowUpStatus(fu._id, 'Completed')}
                                        className="px-6 py-2.5 bg-emerald-50 text-emerald-600 text-[14px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                                    >
                                        Mark Done
                                    </button>
                                    <button 
                                        onClick={() => updateFollowUpStatus(fu._id, 'Missed')}
                                        className="px-6 py-2.5 bg-rose-50 text-rose-600 text-[14px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100"
                                    >
                                        Missed
                                    </button>
                                </>
                            )}
                            {fu.status === 'Completed' && (
                                <span className="flex items-center gap-1.5 text-[14px] font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
                                    <CheckCircle2 size={14} />
                                    Completed
                                </span>
                            )}
                            {fu.status === 'Missed' && (
                                <span className="flex items-center gap-1.5 text-[14px] font-bold text-rose-600 bg-rose-50 px-4 py-2 rounded-lg">
                                    <AlertCircle size={14} />
                                    Missed
                                </span>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="py-24 text-center bg-white rounded-[32px] border border-border-soft border-dashed">
                        <p className="text-text-muted font-bold tracking-widest uppercase text-[14px]">No follow-ups scheduled yet.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/daily-reports', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...reportForm,
                    tasksCompleted: reportForm.tasksCompleted.split(',').map(t => t.trim()).filter(t => t !== '')
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Daily report submitted successfully!');
                setShowReportModal(false);
                setReportForm({ workSummary: '', tasksCompleted: '', hoursWorked: 8 });
                fetchAllData();
            } else {
                toast.error(data.message || 'Submission failed');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const renderDailyReports = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-border-soft shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-primary-navy tracking-tight">Daily Work Reports</h2>
                    <p className="text-[14px] text-text-muted mt-1">Review your historical submissions and stay accountable</p>
                </div>
                <button 
                    onClick={() => setShowReportModal(true)}
                    className="zoho-btn-secondary px-6 py-3 rounded-xl flex items-center gap-2 text-[14px]"
                >
                    <Plus size={18} />
                    SUBMIT TODAY'S REPORT
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myReports.length > 0 ? (
                    myReports.map(report => (
                        <div key={report._id} className="zoho-card p-6 border-t-4 border-t-primary-navy group hover:shadow-xl transition-all h-full flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[14px] font-black px-2 py-1 rounded bg-bg-soft border border-border-soft text-text-muted uppercase tracking-widest">
                                    {report.status}
                                </span>
                                <div className="text-[14px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(report.date).toLocaleDateString()}
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-primary-navy mb-4 flex items-center gap-2 text-[14px]">
                                <History size={16} className="text-slate-400" />
                                Work Summary
                            </h3>
                            
                            <p className="text-[14px] text-text-dark font-medium leading-relaxed mb-6 line-clamp-4">
                                {report.workSummary}
                            </p>

                            <div className="space-y-4 pt-4 border-t border-border-soft mt-auto">
                                <div className="flex justify-between items-center">
                                    <span className="text-[14px] font-black text-text-muted uppercase tracking-widest">Hours Logged</span>
                                    <span className="text-[14px] font-bold text-primary-navy">{report.hoursWorked} hrs</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(report.tasksCompleted || []).map((task, i) => (
                                        <span key={i} className="text-[14px] font-bold bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full border border-slate-100">
                                            {task}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center bg-white rounded-[32px] border border-border-soft border-dashed">
                        <div className="flex flex-col items-center gap-3 opacity-30">
                            <FileSpreadsheet size={48} />
                            <p className="text-text-muted font-bold tracking-widest uppercase text-[14px]">No reports submitted yet.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderReportModal = () => (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${showReportModal ? 'opacity-100' : 'opacity-0 pointer-events-none bg-black/0'}`}>
            <div className={`fixed inset-0 bg-primary-navy/20 backdrop-blur-sm transition-opacity duration-500 ${showReportModal ? 'opacity-100' : 'opacity-0'}`} onClick={() => setShowReportModal(false)} />
            <div className={`bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden relative z-10 transition-all duration-500 transform ${showReportModal ? 'translate-y-0 scale-100' : 'translate-y-20 scale-95'}`}>
                <div className="bg-primary-navy p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8">
                        <button onClick={() => setShowReportModal(false)} className="bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-2xl flex items-center justify-center transition-all rotate-0 hover:rotate-90">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                            <FileSpreadsheet size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight uppercase">Daily Work Report</h2>
                            <p className="text-white/60 text-[14px] font-bold tracking-[0.2em] uppercase">Document your achievements for {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleReportSubmit} className="p-10 space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[14px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Overall Work Summary</label>
                            <textarea 
                                required
                                rows="4"
                                value={reportForm.workSummary}
                                onChange={e => setReportForm({...reportForm, workSummary: e.target.value})}
                                className="zoho-input py-4 resize-none text-[14px]"
                                placeholder="Describe your main activities and outcomes of the day..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[14px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Tasks Completed</label>
                                <input 
                                    type="text"
                                    value={reportForm.tasksCompleted}
                                    onChange={e => setReportForm({...reportForm, tasksCompleted: e.target.value})}
                                    className="zoho-input text-[14px]"
                                    placeholder="Task 1, Task 2, Task 3..."
                                />
                                <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mt-1">Separate tasks with commas</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[14px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Total Hours Worked</label>
                                <input 
                                    type="number"
                                    step="0.5"
                                    min="1"
                                    max="24"
                                    value={reportForm.hoursWorked}
                                    onChange={e => setReportForm({...reportForm, hoursWorked: e.target.value})}
                                    className="zoho-input text-[14px]"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 py-4 text-[14px] font-black uppercase tracking-widest text-text-muted hover:text-primary-navy transition-all">Cancel</button>
                        <button type="submit" className="flex-[2] zoho-btn-secondary py-4 rounded-2xl text-[14px] font-black uppercase tracking-widest shadow-xl shadow-primary-navy/10">
                            SUBMIT FINAL REPORT
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderExpenses = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="crm-section-title">Expense Reimbursements</h2>
                    <p className="crm-label mt-1">Manage and track your business claims</p>
                </div>
                <button 
                    onClick={() => setShowExpenseModal(true)}
                    className="zoho-btn-primary px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-primary-red/20 text-[14px]"
                >
                    <Plus size={18} /> New Expense Claim
                </button>
            </div>

            <div className="zoho-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="zoho-table">
                        <thead>
                            <tr className="zoho-table-header uppercase">
                                <th className="px-6 py-4">Submission Date</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Receipt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-soft">
                            {expenses.length > 0 ? expenses.map(exp => (
                                <tr key={exp._id} className="hover:bg-bg-soft/50 transition-colors">
                                    <td className="px-6 py-4 text-[14px] font-medium text-primary-navy">
                                        {new Date(exp.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-bg-soft rounded-lg text-[14px] font-black uppercase tracking-widest text-text-muted border border-border-soft">
                                            {exp.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[14px] font-bold text-primary-navy">
                                        ₹{exp.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[14px] text-text-muted line-clamp-1 max-w-[200px]" title={exp.description}>
                                            {exp.description}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`status-chip text-[14px] ${
                                                exp.status === 'Approved' ? 'bg-status-success-bg text-status-success-text' :
                                                exp.status === 'Rejected' ? 'bg-status-danger-bg text-status-danger-text' :
                                                'bg-status-warning-bg text-status-warning-text'
                                            }`}>
                                                {exp.status}
                                            </span>
                                            {exp.adminNote && (
                                                <p className="text-[14px] font-bold text-text-muted mt-1 max-w-[100px] truncate" title={exp.adminNote}>
                                                    "{exp.adminNote}"
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-primary-navy">
                                        {exp.receiptImage ? (
                                            <button 
                                                onClick={() => { setViewerImageUrl(exp.receiptImage); setShowImageViewer(true); }}
                                                className="p-2 hover:bg-bg-soft rounded-lg transition-colors"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        ) : <span className="text-[14px] font-bold text-gray-300">N/A</span>}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <Receipt size={48} />
                                            <p className="text-text-muted font-bold tracking-widest uppercase text-[14px]">No expenses found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Expense Submission Modal */}
            {showExpenseModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[#0B1739]/60 backdrop-blur-md transition-opacity duration-500 opacity-100" onClick={() => setShowExpenseModal(false)}></div>
                    <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl relative z-10 overflow-hidden transition-all duration-500 transform translate-y-0 scale-100 opacity-100">
                        <div className="p-8 border-b border-border-soft flex justify-between items-center bg-bg-soft/30">
                            <div>
                                <h3 className="text-xl font-bold text-primary-navy">New Claim</h3>
                                <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mt-1">Business Expense Details</p>
                            </div>
                            <button onClick={() => setShowExpenseModal(false)} className="w-10 h-10 rounded-full bg-white border border-border-soft flex items-center justify-center text-text-muted hover:text-primary-red transition-all shadow-sm">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleExpenseSubmit} className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Claim Amount (₹)</label>
                                    <input required type="number" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} className="zoho-input" placeholder="0.00" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Type</label>
                                    <select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} className="zoho-input">
                                        <option value="Travel">Travel</option>
                                        <option value="Materials">Materials</option>
                                        <option value="Food">Food</option>
                                        <option value="Others">Others</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Narrative / Description</label>
                                <textarea required rows="3" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} className="zoho-input h-auto resize-none py-3" placeholder="Explain what the expense was for..."></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Receipt Image</label>
                                <div className="group relative">
                                    {expenseForm.receiptImage ? (
                                        <div className="relative rounded-2xl overflow-hidden border-2 border-primary-navy/20 h-32">
                                            <img src={expenseForm.receiptImage} alt="Receipt" className="w-full h-full object-cover" />
                                            <button 
                                                type="button"
                                                onClick={() => setExpenseForm({...expenseForm, receiptImage: ''})}
                                                className="absolute top-2 right-2 bg-rose-500 text-white p-1 rounded-full shadow-lg"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-border-soft rounded-2xl h-32 cursor-pointer hover:border-primary-red transition-colors bg-bg-soft/30 group-hover:bg-bg-soft/50">
                                            <Camera className="text-text-muted mb-2 group-hover:text-primary-red transition-colors" size={24} />
                                            <span className="text-[14px] font-bold text-text-muted uppercase tracking-widest">Click to upload image</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleReceiptUpload} />
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    disabled={isSubmittingExpense}
                                    className="zoho-btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2"
                                >
                                    {isSubmittingExpense ? <span className="animate-spin text-lg ring-2 ring-white/20 rounded-full w-5 h-5 border-t-white"></span> : 'Submit Claim'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

    const renderContent = () => {
        try {
            switch (activeTab) {
                case 'overview': return renderOverview();
                case 'new': return renderJobTable(jobs.filter(j => ['Pending', 'pending_schedule', 'reschedule_requested'].includes(j.status)), true);
                case 'my-jobs': return renderMyJobs();
                case 'attendance': return renderAttendance();
                case 'leaves': return renderLeaves();
                case 'notifications': return renderNotifications();
                case 'profile': return renderProfile();
                case 'chat': return renderChat();
                case 'expenses': return renderExpenses();
                case 'tasks': return renderTasks();
                case 'leads': return renderLeads();
                case 'reports': return renderDailyReports();
                case 'followups': return renderFollowUps();
                default: return renderOverview();
            }
        } catch (error) {
            console.error('Render Error:', error);
            return (
                <div className="p-10 text-center bg-white rounded-3xl border border-rose-100 shadow-xl shadow-rose-900/5">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="text-rose-500" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-primary-navy mb-2">Display Error</h3>
                    <p className="text-[14px] text-text-muted mb-6 max-w-sm mx-auto">Something went wrong while displaying this section. Please try refreshing or clearing your cache.</p>
                    <button onClick={() => window.location.reload()} className="zoho-btn-primary px-8 py-3 rounded-xl text-[14px] font-bold uppercase tracking-widest">
                        REFRESH DASHBOARD
                    </button>
                </div>
            );
        }
    };

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
                        { id: 'leaves', label: 'Apply Leave', icon: Calendar },
                        { id: 'chat', label: 'Chat', icon: MessageSquare },
                        { id: 'expenses', label: 'Expenses', icon: Receipt },
                        { id: 'tasks', label: 'Tasks', icon: ClipboardList },
                        { id: 'leads', label: 'Leads', icon: TrendingUp },
                        { id: 'followups', label: 'Follow-ups', icon: Calendar },
                        { id: 'reports', label: 'Daily Reports', icon: FileSpreadsheet },
                        { id: 'profile', label: 'Profile', icon: User },
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
                            <item.icon 
                                size={20} 
                                className={`transition-colors ${
                                    activeTab === item.id 
                                    ? 'text-white' 
                                    : 'text-blue-500 group-hover:text-blue-400'
                                }`} 
                            />
                            {!isSidebarCollapsed && <span className="text-[14px] font-bold tracking-wide">{item.label}</span>}
                            {activeTab === item.id && !isSidebarCollapsed && (
                                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-navy-light/20">
                    <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-all font-bold">
                        <LogOut size={20} />
                        {!isSidebarCollapsed && <span className="text-[14px] uppercase tracking-widest">Logout</span>}
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
                                        <h3 className="text-[14px] font-bold text-primary-navy">Recent Alerts</h3>
                                        <span className="text-[14px] font-bold text-primary-red uppercase tracking-widest">{notifications.filter(n=>!n.isRead).length} New</span>
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
                                                        <h4 className={`text-[14px] ${!n.isRead ? 'font-bold text-primary-navy' : 'font-medium text-text-dark'}`}>{n.title}</h4>
                                                    </div>
                                                    <p className="text-[14px] text-text-muted line-clamp-2 leading-relaxed mt-1">{n.message}</p>
                                                    <span className="text-[14px] font-bold text-text-muted uppercase tracking-widest mt-2 block">{new Date(n.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-text-muted">
                                                <Bell size={24} className="mx-auto mb-2 opacity-20" />
                                                <p className="text-[14px] uppercase tracking-widest font-bold">No alerts found</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 border-t border-border-soft bg-bg-soft/30">
                                        <button 
                                            onClick={() => {
                                                setShowNotificationsDropdown(false);
                                                handleTabChange('notifications');
                                            }}
                                            className="w-full text-center text-[14px] font-bold text-primary-red uppercase tracking-widest hover:underline"
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
                                <p className="text-[14px] font-bold text-primary-navy leading-none">{user?.name}</p>
                                <p className="text-[14px] font-black text-primary-red uppercase tracking-tighter mt-1">Field Technician</p>
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
                                <p className="text-text-muted font-bold tracking-widest uppercase text-[14px]">Syncing Personnel Data...</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {renderContent()}
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
                                <label className="text-[14px] font-bold text-text-muted uppercase tracking-widest ml-1 mb-2 block">Upload Installation Photos</label>
                                <div 
                                    onClick={() => proofForm.photos.length < 6 && document.getElementById('proof-upload').click()}
                                    className={`p-6 bg-bg-soft rounded-2xl border-2 border-dashed transition-all text-center group cursor-pointer flex flex-col items-center justify-center py-8 ${
                                        proofForm.photos.length >= 6 ? 'opacity-50 cursor-not-allowed border-border-soft' : 'border-border-soft hover:border-primary-red/30'
                                    }`}
                                >
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                        <Camera size={24} className="text-primary-red" />
                                    </div>

                                    <p className="text-[14px] text-text-muted mt-1.5 font-medium">
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
                                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[14px] font-bold shadow-md hover:bg-red-600"
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
                                <label className="text-[14px] font-bold text-text-muted uppercase tracking-widest ml-1">Work Notes</label>
                                <textarea 
                                    className="zoho-input min-h-[100px] resize-none py-4 text-[14px] font-medium"
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
                                    className="flex-1 px-6 py-3.5 rounded-xl border border-border-soft text-text-muted font-bold uppercase text-[14px] tracking-widest hover:bg-bg-soft transition-all"
                                >
                                    Abort
                                </button>
                                <button 
                                    disabled={proofForm.photos.length === 0}
                                    onClick={() => handleJobAction(selectedJob.bookingId, 'complete', { proofPhoto: proofForm.photos[0], proofPhotos: proofForm.photos, workNotes: proofForm.notes })}
                                    className="flex-1 zoho-btn-primary py-3.5 text-[14px] rounded-xl shadow-lg shadow-red-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/5 text-white/80 text-[14px] font-bold uppercase tracking-[0.3em] mb-[-60px]">
                            SecureVision Compliance Evidence
                        </div>
                    </div>
                </div>
            )}

            {renderLeaveModal()}
            {renderReportModal()}

            {/* Follow-up Modal */}
            {showFollowUpModal && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-primary-navy/60 backdrop-blur-md" onClick={() => setShowFollowUpModal(false)}></div>
                    <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-border-soft flex justify-between items-center bg-bg-soft/30">
                            <div>
                                <h3 className="text-xl font-bold text-primary-navy">Schedule Follow-up</h3>
                                <p className="text-[14px] text-text-muted font-bold uppercase tracking-widest mt-1">{selectedLeadForFollowUp?.name}</p>
                            </div>
                            <button onClick={() => setShowFollowUpModal(false)} className="w-10 h-10 rounded-full bg-white border border-border-soft flex items-center justify-center text-text-muted hover:text-primary-red transition-all shadow-sm">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleFollowUpSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Follow-up Date</label>
                                <input 
                                    required 
                                    type="date" 
                                    value={followUpForm.followUpDate} 
                                    onChange={e => setFollowUpForm({...followUpForm, followUpDate: e.target.value})} 
                                    className="zoho-input" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Preferred Time</label>
                                <input 
                                    required 
                                    type="text" 
                                    value={followUpForm.followUpTime} 
                                    onChange={e => setFollowUpForm({...followUpForm, followUpTime: e.target.value})} 
                                    className="zoho-input" 
                                    placeholder="e.g. 10:30 AM"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Action Note</label>
                                <textarea 
                                    value={followUpForm.note} 
                                    onChange={e => setFollowUpForm({...followUpForm, note: e.target.value})} 
                                    className="zoho-input h-24 py-3 resize-none" 
                                    placeholder="What needs to be discussed?"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmittingFollowUp}
                                className="zoho-btn-navy w-full py-4 text-[14px] rounded-2xl font-bold tracking-widest uppercase shadow-lg disabled:opacity-50 transition-all font-black"
                            >
                                {isSubmittingFollowUp ? 'Scheduling...' : 'Confirm Schedule'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Booking Directive Modal (Schedule Placement) */}
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
                    <form onSubmit={handleBookingDirective} className="p-10 space-y-8">
                        <div className="space-y-2">
                            <label className="text-[14px] font-bold text-text-muted uppercase tracking-wider ml-1">Operational Status</label>
                            <select value={bookingForm.status} onChange={e => setBookingForm({...bookingForm, status: e.target.value})} className="zoho-input">
                                <option value="pending_schedule">Pending Schedule Request</option>
                                <option value="schedule_sent">Schedule Proposed to Customer</option>
                                <option value="scheduled_confirmed">Confirm Slot Directly</option>
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
        </div>
    );
};

export default EmployeeDashboard;
