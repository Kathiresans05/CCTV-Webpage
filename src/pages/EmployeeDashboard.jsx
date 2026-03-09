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

const EmployeeDashboard = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Map URL path to tab ID
    const pathMapping = {
        '/employee': 'overview',
        '/employee/dashboard': 'overview',
        '/employee/requests': 'new',
        '/employee/assigned-jobs': 'assigned',
        '/employee/in-progress': 'in-progress',
        '/employee/completed-jobs': 'completed',
        '/employee/attendance': 'attendance',
        '/employee/notifications': 'notifications',
        '/employee/profile': 'profile'
    };

    // Reverse mapping for navigation
    const tabToPath = {
        'overview': '/employee/dashboard',
        'new': '/employee/requests',
        'assigned': '/employee/assigned-jobs',
        'in-progress': '/employee/in-progress',
        'completed': '/employee/completed-jobs',
        'attendance': '/employee/attendance',
        'notifications': '/employee/notifications',
        'profile': '/employee/profile'
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

    const [jobs, setJobs] = useState([]);
    const [attendanceStatus, setAttendanceStatus] = useState(null);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    
    // Modal state for job completion
    const [showProofModal, setShowProofModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [proofForm, setProofForm] = useState({ photo: '', notes: '' });
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProofForm({ ...proofForm, photo: reader.result });
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const [jRes, aRes, hRes, nRes] = await Promise.all([
                fetch('/api/bookings', { headers }),
                fetch('/api/attendance/status', { headers }),
                fetch('/api/attendance/history', { headers }),
                fetch('/api/notifications', { headers })
            ]);
            
            const [jData, aData, hData, nData] = await Promise.all([
                jRes.json(), aRes.json(), hRes.json(), nRes.json()
            ]);

            if (jData.success) setJobs(jData.data);
            if (aData.success) setAttendanceStatus(aData.data);
            if (hData.success) setAttendanceHistory(hData.data);
            if (nData.success) setNotifications(nData.data);
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
                    setProofForm({ photo: '', notes: '' });
                    setPreviewUrl(null);
                }
                fetchData();
            } else {
                alert(data.message || 'Action failed');
            }
        } catch (error) {
            alert('Error connecting to server');
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/read-all', { 
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData();
        } catch (error) {
            console.error('Error marking notifications as read:', error);
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
                alert(data.message);
            }
        } catch (error) {
            alert('Attendance update failed');
        }
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
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-2xl font-extrabold text-primary-navy tracking-tight leading-none mt-1">{stat.value}</h3>
                </div>
            </div>
        );

        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* 1. Operations */}
                <div>
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Briefcase size={14} className="text-primary-navy/40" /> Operations
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                        {kpis.operations.map((stat, i) => renderKpiCard(stat, i))}
                    </div>
                </div>

                {/* 2. Staff and 3. Assets */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <UserCheck size={14} className="text-primary-navy/40" /> Attendance Log
                        </h4>
                        <div className="grid grid-cols-1 gap-5">
                            {kpis.staff.map((stat, i) => renderKpiCard(stat, i))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Clock size={14} className="text-primary-navy/40" /> Tasks & Alerts
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {kpis.assets.map((stat, i) => renderKpiCard(stat, i))}
                        </div>
                    </div>
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
                            <th className="px-6 py-4">Hardware Profile</th>
                            <th className="px-6 py-4">Timeline</th>
                            <th className="px-6 py-4 text-center">Operational State</th>
                            {showActions && <th className="px-6 py-4 text-right">Directives</th>}
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
                                            <span className="text-sm font-bold text-primary-navy leading-tight">{j.customerName}</span>
                                            <span className="text-[10px] text-text-muted font-bold mt-1 tracking-tight">{j.customerPhone}</span>
                                            <span className="text-[10px] text-text-muted mt-0.5 truncate max-w-[180px] font-medium">{j.address}, {j.city}</span>
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
                                                <button 
                                                    onClick={() => handleJobAction(j.bookingId, 'accept')}
                                                    className="zoho-btn-primary px-5 py-2.5 text-[10px] rounded-xl shadow-lg shadow-red-900/10"
                                                >
                                                    Accept Directive
                                                </button>
                                            )}
                                            {j.status === 'Accepted' && (
                                                <button 
                                                    onClick={() => handleJobAction(j.bookingId, 'start')}
                                                    className="bg-primary-navy text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-navy-dark transition-all shadow-lg shadow-navy-900/10"
                                                >
                                                    Init Execution
                                                </button>
                                            )}
                                            {j.status === 'In Progress' && (
                                                <button 
                                                    onClick={() => {
                                                        setSelectedJob(j);
                                                        setShowProofModal(true);
                                                    }}
                                                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10 flex items-center gap-2 ml-auto"
                                                >
                                                    <Camera size={12} /> Finalize Work
                                                </button>
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

    const renderAttendance = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="zoho-card p-10 flex flex-col items-center text-center">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-8">Shift Schedule</p>
                    <div className="w-20 h-20 rounded-[24px] bg-primary-red/5 flex items-center justify-center text-primary-red mb-8 shadow-inner">
                        <Clock size={32} />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-primary-navy tracking-tight">{attendanceStatus ? 'Shift in Progress' : 'External Terminal'}</p>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-2">{new Date().toDateString()}</p>
                    </div>
                </div>

                <div className="zoho-card p-8 flex flex-col justify-between">
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Inbound Entry</p>
                        <p className="text-4xl font-black text-primary-navy tracking-tighter">{attendanceStatus?.checkIn ? new Date(attendanceStatus.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                    </div>
                    {!attendanceStatus ? (
                        <button onClick={() => handleAttendanceAction('checkin')} className="zoho-btn-primary w-full py-4 text-xs tracking-widest mt-8 shadow-xl shadow-red-900/20">
                            Check In
                        </button>
                    ) : (
                        <div className="w-full bg-emerald-500/10 text-emerald-600 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-center border border-emerald-500/20 mt-8">
                            Entry Registered
                        </div>
                    )}
                </div>

                <div className="zoho-card p-8 flex flex-col justify-between">
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Outbound Exit</p>
                        <p className="text-4xl font-black text-primary-navy tracking-tighter">{attendanceStatus?.checkOut ? new Date(attendanceStatus.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                    </div>
                    {attendanceStatus && !attendanceStatus.checkOut ? (
                        <button onClick={() => handleAttendanceAction('checkout')} className="bg-primary-navy text-white w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-navy-900/20 hover:bg-navy-dark transition-all mt-8">
                            Check Out
                        </button>
                    ) : (
                        <div className="w-full bg-bg-soft text-text-muted py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-center border border-border-soft mt-8">
                            {attendanceStatus?.checkOut ? 'Exit Registered' : 'Awaiting Entry'}
                        </div>
                    )}
                </div>
            </div>

            <div className="zoho-card overflow-hidden">
                <div className="p-6 border-b border-border-soft flex items-center gap-3 bg-bg-soft/30">
                    <History size={18} className="text-text-muted" />
                    <h3 className="text-sm font-bold text-primary-navy uppercase tracking-tight">Personal Attendance Log</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="zoho-table">
                        <thead className="zoho-table-header text-[10px]">
                            <tr>
                                <th className="px-8 py-4">Registry Date</th>
                                <th className="px-8 py-4">Check In</th>
                                <th className="px-8 py-4">Check Out</th>
                                <th className="px-8 py-4 text-right">Verification Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-soft">
                            {attendanceHistory.map(h => (
                                <tr key={h._id} className="hover:bg-bg-soft/50 transition-colors">
                                    <td className="px-8 py-4 font-bold text-primary-navy text-xs">{h.date}</td>
                                    <td className="px-8 py-4 text-text-muted text-xs font-semibold">{h.checkIn ? new Date(h.checkIn).toLocaleTimeString() : '-'}</td>
                                    <td className="px-8 py-4 text-text-muted text-xs font-semibold">{h.checkOut ? new Date(h.checkOut).toLocaleTimeString() : '-'}</td>
                                    <td className="px-8 py-4 text-right">
                                        <span className={`status-chip ${h.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-primary-red/10 text-primary-red'}`}>
                                            {h.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {attendanceHistory.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="py-16 text-center text-[10px] text-text-muted font-bold uppercase tracking-widest">No attendance records found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderNotifications = () => (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-xl font-bold text-primary-navy flex items-center gap-3">
                        <Bell size={24} className="text-primary-red" />
                        Intelligence Bulletins
                    </h3>
                 </div>
                 <button onClick={markAllAsRead} className="text-xs font-black text-primary-red bg-primary-red/5 px-4 py-2 rounded-xl hover:bg-primary-red hover:text-white transition-all">Acknowledge All</button>
             </div>
            {notifications.length > 0 ? notifications.map(n => (
                <div key={n._id} className={`zoho-card p-6 flex gap-6 items-start group hover:border-primary-red/30 transition-all ${!n.isRead ? 'border-primary-navy/20 bg-primary-navy/5' : ''}`}>
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
                            <p className="text-[10px] text-primary-red font-bold uppercase tracking-widest mt-1">Field Intelligence Technician</p>
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
                        { id: 'new', label: 'New Requests', icon: Plus },
                        { id: 'assigned', label: 'Assigned Jobs', icon: Calendar },
                        { id: 'in-progress', label: 'In Execution', icon: Play },
                        { id: 'completed', label: 'Work History', icon: CheckCircle2 },
                        { id: 'attendance', label: 'Attendance', icon: UserCheck },
                        { id: 'notifications', label: 'Alerts', icon: Bell },
                        { id: 'profile', label: 'Personnel Profile', icon: User },
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
                        {!isSidebarCollapsed && <span className="text-xs uppercase tracking-widest">End Session</span>}
                    </button>
                </div>
            </aside>

            {/* Main Surface */}
            <main className="flex-grow flex flex-col overflow-hidden">
                <header className="h-20 bg-white border-b border-border-soft flex items-center justify-between px-8 sticky top-0 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-primary-navy tracking-tight capitalize">{activeTab.replace('-', ' ')}</h2>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Field Personnel Terminal</span>
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
                                {activeTab === 'assigned' && renderJobTable(jobs.filter(j => j.status === 'Accepted'), true)}
                                {activeTab === 'in-progress' && renderJobTable(jobs.filter(j => j.status === 'In Progress'), true)}
                                {activeTab === 'completed' && renderJobTable(jobs.filter(j => j.status === 'Completed'), false)}
                                {activeTab === 'attendance' && renderAttendance()}
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
                    <div className="zoho-card max-w-lg w-full p-8 animate-in zoom-in-95 duration-200 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-primary-navy tracking-tight">Finalize Operation</h3>
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Compliance & Media Verification</p>
                            </div>
                            <button onClick={() => {
                                setShowProofModal(false);
                                setPreviewUrl(null);
                                setProofForm({ photo: '', notes: '' });
                            }} className="p-2.5 hover:bg-bg-soft rounded-xl text-text-muted transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div 
                                onClick={() => document.getElementById('proof-upload').click()}
                                className={`p-6 bg-bg-soft rounded-2xl border-2 border-dashed transition-all text-center group cursor-pointer relative overflow-hidden h-48 flex flex-col items-center justify-center ${previewUrl ? 'border-emerald-500' : 'border-border-soft hover:border-primary-red/30'}`}
                            >
                                {previewUrl ? (
                                    <div className="absolute inset-0 w-full h-full">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-white text-[10px] font-bold uppercase tracking-widest">Change Media</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                            <Camera size={24} className="text-primary-red" />
                                        </div>
                                        <p className="text-[10px] font-bold text-primary-navy uppercase tracking-widest">Transmit Site Media</p>
                                        <p className="text-[9px] text-text-muted mt-2 font-medium">Click to select installation completion photo</p>
                                    </>
                                )}
                                <input 
                                    id="proof-upload"
                                    type="file" 
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Installation Proof</label>
                                <div className="zoho-input py-4 text-xs font-medium bg-bg-soft border border-border-soft rounded-xl flex items-center justify-between px-4">
                                    <span className="text-text-muted">
                                        {previewUrl ? 'Image Selected ✓' : 'No image chosen'}
                                    </span>
                                    {previewUrl && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewUrl(null);
                                                setProofForm({ ...proofForm, photo: '' });
                                            }}
                                            className="text-primary-red font-bold text-[10px] uppercase hover:underline"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Terminal Report</label>
                                <textarea 
                                    className="zoho-input min-h-[100px] resize-none py-4 text-xs font-medium"
                                    placeholder="Detail all hardware deployments..."
                                    value={proofForm.notes}
                                    onChange={e => setProofForm({...proofForm, notes: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={() => {
                                        setShowProofModal(false);
                                        setPreviewUrl(null);
                                        setProofForm({ photo: '', notes: '' });
                                    }}
                                    className="flex-1 px-6 py-3.5 rounded-xl border border-border-soft text-text-muted font-bold uppercase text-[10px] tracking-widest hover:bg-bg-soft transition-all"
                                >
                                    Abort
                                </button>
                                <button 
                                    disabled={!proofForm.photo}
                                    onClick={() => handleJobAction(selectedJob.bookingId, 'complete', { proofPhoto: proofForm.photo, workNotes: proofForm.notes })}
                                    className="flex-1 zoho-btn-primary py-3.5 text-[10px] rounded-xl shadow-lg shadow-red-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Finalize Work
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeDashboard;
