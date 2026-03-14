import React, { useState } from 'react';
import { X, Calendar, Clock, User, CheckCircle, AlertCircle, Shield, Phone, MapPin, Package } from 'lucide-react';
import { useAuth } from '../../../src/context/AuthContext';

const BulkInquiryModal = ({ items, onClose, onSuccess }) => {
    const { user, token } = useAuth();
    
    // Calculate total amount
    const totalAmount = items.reduce((acc, item) => acc + (item.productDetails.price * (item.quantity || 1)), 0);
    const productListString = items.map(item => `${item.productDetails.name} (Qty: ${item.quantity || 1})`).join(', ');

    // --- Form State ---
    const [bookingData, setBookingData] = useState({
        preferredDate: '',
        preferredTime: '',
        customerName: user?.name || '',
        customerEmail: user?.email || '',
        customerPhone: user?.phone || '',
        address: '',
        notes: ''
    });
    
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [statusMessage, setStatusMessage] = useState('');
    const [bookingId, setBookingId] = useState(null);

    const timeSlots = [
        '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
    ];

    if (!items || items.length === 0) return null;

    const handleInputChange = (e) => {
        setBookingData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setStatus('loading');

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productName: `BULK ORDER: ${productListString}`,
                    productId: 0, // 0 or a special ID for bulk
                    productPrice: totalAmount,
                    customerName: bookingData.customerName,
                    customerEmail: bookingData.customerEmail,
                    customerPhone: bookingData.customerPhone,
                    address: bookingData.address,
                    city: 'N/A',
                    preferredDate: bookingData.preferredDate,
                    preferredTime: bookingData.preferredTime,
                    notes: bookingData.notes
                })
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setBookingId(data.data?.bookingId || data.orderId || Math.random().toString(36).substring(7).toUpperCase());
                // Trigger the parent success handler which clears the cart locally
                if (onSuccess) onSuccess();
            } else {
                setStatus('error');
                setStatusMessage(data.message || 'Something went wrong. Please try again.');
            }
        } catch {
            setStatus('error');
            setStatusMessage('Could not connect to the server. Please try again later.');
        }
    };

    const isFormValid = bookingData.customerName && bookingData.customerPhone && bookingData.address && bookingData.preferredDate && bookingData.preferredTime && bookingData.customerEmail;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in duration-300 border border-gray-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header: Bulk Order Summary (White Background) */}
                <div className="bg-white px-8 py-6 flex justify-between items-center border-b border-gray-50">
                    <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100 text-gray-400">
                             <Package size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-primary-red mb-0.5">Bulk Service Booking</p>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{items.length} Security Assets</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-gray-50 text-gray-400 p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body: Form (Light Gray Background) */}
                <div className="bg-[#F8FAFC] px-8 py-8 overflow-y-auto custom-scrollbar flex-grow">
                    {status === 'success' ? (
                        <div className="text-center py-10 animate-in fade-in duration-500">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={48} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                            <p className="text-gray-500 mb-8 font-medium">Our team will contact you shortly to schedule your installation.</p>
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8 max-w-sm mx-auto shadow-sm">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">Booking ID</p>
                                <p className="text-xl font-mono font-bold text-primary-red tracking-wider">{bookingId}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full bg-primary-navy text-white py-4 rounded-xl font-bold text-sm hover:bg-black transition-all"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                             {/* Items Breakdown Collapse-like view */}
                             <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 pb-2 border-b border-gray-50">Items Breakdown</p>
                                <div className="space-y-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-2">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs">
                                            <span className="text-gray-600 font-medium line-clamp-1 flex-1 pr-4">{item.productDetails.name}</span>
                                            <span className="text-gray-400 font-bold px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-[10px]">x{item.quantity || 1}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Full Name & Phone Number */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-gray-500 ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input 
                                            type="text" name="customerName" required
                                            value={bookingData.customerName} onChange={handleInputChange}
                                            className="w-full bg-[#EDF2F7] border-none rounded-xl pl-11 pr-4 py-4 text-sm font-medium text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-red/10 transition-all outline-none"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-gray-500 ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input 
                                            type="tel" name="customerPhone" required
                                            value={bookingData.customerPhone} onChange={handleInputChange}
                                            className="w-full bg-[#EDF2F7] border-none rounded-xl pl-11 pr-4 py-4 text-sm font-medium text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-red/10 transition-all outline-none"
                                            placeholder="e.g. +91 98765 43210"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email Address */}
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-gray-500 ml-1">Email Address</label>
                                <div className="relative">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type="email" name="customerEmail" required
                                        value={bookingData.customerEmail} onChange={handleInputChange}
                                        className="w-full bg-[#EDF2F7] border-none rounded-xl pl-11 pr-4 py-4 text-sm font-medium text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-red/10 transition-all outline-none"
                                        placeholder="e.g. alex@example.com"
                                    />
                                </div>
                            </div>

                            {/* Visit Address */}
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-gray-500 ml-1">Visit Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-4 text-gray-400" size={16} />
                                    <textarea 
                                        name="address" required rows={3}
                                        value={bookingData.address} onChange={handleInputChange}
                                        className="w-full bg-[#EDF2F7] border-none rounded-xl pl-11 pr-4 py-4 text-sm font-medium text-gray-700 placeholder:text-gray-400 transition-all outline-none resize-none"
                                        placeholder="Complete installation address..."
                                    />
                                </div>
                            </div>

                            {/* Preferred Date & Time Slot */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-gray-500 ml-1">Preferred Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input 
                                            type="date" name="preferredDate" required
                                            value={bookingData.preferredDate} onChange={handleInputChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full bg-[#EDF2F7] border-none rounded-xl pl-11 pr-4 py-4 text-sm font-medium text-gray-700 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-gray-500 ml-1">Time Slot</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <select 
                                            name="preferredTime" required
                                            value={bookingData.preferredTime} onChange={handleInputChange}
                                            className="w-full bg-[#EDF2F7] border-none rounded-xl pl-11 pr-10 py-4 text-sm font-medium text-gray-700 transition-all outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">Select slot</option>
                                            {timeSlots.map(slot => (
                                                <option key={slot} value={slot}>{slot}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {status === 'error' && (
                                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 text-xs font-bold">
                                    <AlertCircle size={18} />
                                    {statusMessage}
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* Footer: Actions (Light Gray Background) */}
                {status !== 'success' && (
                    <div className="bg-[#F8FAFC] px-8 py-6 flex items-center justify-between border-t border-gray-100">
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Total Amount</p>
                            <p className="text-2xl font-black text-gray-900 leading-none">₹{totalAmount.toLocaleString('en-IN')}</p>
                        </div>
                        
                        <button
                            onClick={handleSubmit}
                            disabled={status === 'loading' || !isFormValid}
                            className={`px-10 py-4 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${
                                status === 'loading' || !isFormValid
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-[#0b0f1a] text-white hover:bg-black'
                            }`}
                        >
                            {status === 'loading' ? 'Processing...' : 'Confirm Booking'}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default BulkInquiryModal;
