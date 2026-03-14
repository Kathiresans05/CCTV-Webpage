import React, { useState } from 'react';
import { X, Calendar, Clock, User, CheckCircle, AlertCircle, Shield, Phone, MapPin, RotateCw, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ServiceBookingModal = ({ product, onClose }) => {
    const { user, isAuthenticated, token } = useAuth();
    const navigate = useNavigate();
    
    // --- Form State ---
    const [bookingData, setBookingData] = useState({
        preferredDate: '',
        preferredTime: '',
        customerName: user?.name || '',
        customerEmail: user?.email || '',
        customerPhone: user?.phone || '',
        country: 'India',
        state: '',
        city: '',
        streetAddress: '',
        notes: ''
    });
    
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [statusMessage, setStatusMessage] = useState('');
    const [bookingId, setBookingId] = useState(null);

    const timeSlots = [
        '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
    ];

    if (!product) return null;

    const handleInputChange = (e) => {
        setBookingData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/signup');
            return;
        }

        setStatus('loading');

        try {
            const combinedAddress = `${bookingData.streetAddress}, ${bookingData.state}, ${bookingData.country}`;
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productName: product.name,
                    productId: product.id || 0,
                    productPrice: product.price,
                    customerName: bookingData.customerName,
                    customerEmail: bookingData.customerEmail,
                    customerPhone: bookingData.customerPhone,
                    address: combinedAddress,
                    city: bookingData.city,
                    preferredDate: bookingData.preferredDate,
                    preferredTime: bookingData.preferredTime,
                    notes: bookingData.notes
                })
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setBookingId(data.data.bookingId);
            } else {
                setStatus('error');
                setStatusMessage(data.message || 'Something went wrong. Please try again.');
            }
        } catch {
            setStatus('error');
            setStatusMessage('Could not connect to the server. Please try again later.');
        }
    };

    const isFormValid = bookingData.customerName && bookingData.customerPhone && bookingData.streetAddress && bookingData.city && bookingData.state && bookingData.preferredDate && bookingData.preferredTime;

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#111827]/40 backdrop-blur-md"
            onClick={onClose}
        >
            <div 
                className="bg-white w-full max-w-xl rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300 border border-[#E5E7EB]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top Header Section */}
                <div className="bg-white px-8 py-6 flex justify-between items-center border-b border-[#E5E7EB]">
                    <div className="flex gap-4 items-center">
                        <div className="w-14 h-14 bg-[#F9FAFB] rounded-2xl p-2 flex-shrink-0 border border-[#E5E7EB] flex items-center justify-center">
                            <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#111827] tracking-tight leading-tight">{product.name}</h2>
                            <p className="text-gray-500 text-[12px] font-semibold uppercase tracking-wider mt-0.5">Service Booking</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="hover:bg-[#F9FAFB] text-[#111827]/40 hover:text-[#111827] p-2 rounded-full transition-all border border-transparent hover:border-[#E5E7EB]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Content */}
                <div className="bg-[#F9FAFB] px-8 py-8 overflow-y-auto custom-scrollbar flex-grow">
                    {status === 'success' ? (
                        <div className="text-center py-10 animate-in fade-in duration-500">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={48} />
                            </div>
                            <h3 className="text-2xl font-bold text-[#111827] mb-2">Booking Confirmed!</h3>
                            <p className="text-gray-500 mb-8 font-medium">Our team will contact you shortly.</p>
                            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-8 max-w-sm mx-auto shadow-sm">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">Booking ID</p>
                                <p className="text-xl font-mono font-bold text-[#111827] tracking-wider">{bookingId}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full bg-[#111827] text-white py-4 rounded-xl font-bold text-sm hover:bg-black transition-all"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Row 1: Full Name & Phone Number */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-semibold text-[#111827] ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#111827] transition-colors" size={18} />
                                        <input 
                                            type="text" name="customerName" required
                                            value={bookingData.customerName} onChange={handleInputChange}
                                            className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl pl-11 pr-4 py-3.5 text-[14px] font-medium text-[#111827] placeholder:text-gray-400 focus:border-[#111827] transition-all outline-none"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-semibold text-[#111827] ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#111827] transition-colors" size={18} />
                                        <input 
                                            type="tel" name="customerPhone" required
                                            value={bookingData.customerPhone} onChange={handleInputChange}
                                            className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl pl-11 pr-4 py-3.5 text-[14px] font-medium text-[#111827] placeholder:text-gray-400 focus:border-[#111827] transition-all outline-none"
                                            placeholder="e.g. +91 98765 43210"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Email Address */}
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-semibold text-[#111827] ml-1">Email Address</label>
                                <div className="relative group">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#111827] transition-colors" size={18} />
                                    <input 
                                        type="email" name="customerEmail" required
                                        value={bookingData.customerEmail} onChange={handleInputChange}
                                        className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl pl-11 pr-4 py-3.5 text-[14px] font-medium text-[#111827] placeholder:text-gray-400 focus:border-[#111827] transition-all outline-none"
                                        placeholder="e.g. alex@example.com"
                                    />
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="space-y-5">
                                {/* Your Country */}
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-semibold text-[#111827] ml-1">Your Country</label>
                                    <div className="relative group">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#111827] transition-colors" size={18} />
                                        <select 
                                            name="country" required
                                            value={bookingData.country} onChange={handleInputChange}
                                            className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl pl-11 pr-10 py-3.5 text-[14px] font-medium text-[#111827] focus:border-[#111827] transition-all outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="India">India</option>
                                            <option value="USA">USA</option>
                                            <option value="UK">UK</option>
                                            <option value="UAE">UAE</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* State & City */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[13px] font-semibold text-[#111827] ml-1">State</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#111827] transition-colors" size={18} />
                                            <input 
                                                type="text" name="state" required
                                                value={bookingData.state} onChange={handleInputChange}
                                                className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl pl-11 pr-4 py-3.5 text-[14px] font-medium text-[#111827] placeholder:text-gray-400 focus:border-[#111827] transition-all outline-none"
                                                placeholder="Enter State"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[13px] font-semibold text-[#111827] ml-1">City</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#111827] transition-colors" size={18} />
                                            <input 
                                                type="text" name="city" required
                                                value={bookingData.city} onChange={handleInputChange}
                                                className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl pl-11 pr-4 py-3.5 text-[14px] font-medium text-[#111827] placeholder:text-gray-400 focus:border-[#111827] transition-all outline-none"
                                                placeholder="Enter City"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Address */}
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-semibold text-[#111827] ml-1">Visit / Installation Address</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-4 text-gray-400 group-focus-within:text-[#111827] transition-colors" size={18} />
                                        <textarea 
                                            name="streetAddress" required rows={2}
                                            value={bookingData.streetAddress} onChange={handleInputChange}
                                            className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl pl-11 pr-4 py-3.5 text-[14px] font-medium text-[#111827] placeholder:text-gray-400 focus:border-[#111827] transition-all outline-none resize-none"
                                            placeholder="Building, Street, Area..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 4: Preferred Date & Time Slot */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-semibold text-[#111827] ml-1">Preferred Date</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#111827] transition-colors" size={18} />
                                        <input 
                                            type="date" name="preferredDate" required
                                            value={bookingData.preferredDate} onChange={handleInputChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl pl-11 pr-4 py-3.5 text-[14px] font-medium text-[#111827] focus:border-[#111827] transition-all outline-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-semibold text-[#111827] ml-1">Time Slot</label>
                                    <div className="relative group">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#111827] transition-colors" size={18} />
                                        <select 
                                            name="preferredTime" required
                                            value={bookingData.preferredTime} onChange={handleInputChange}
                                            className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl pl-11 pr-10 py-3.5 text-[14px] font-medium text-[#111827] focus:border-[#111827] transition-all outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">Select slot</option>
                                            {timeSlots.map(slot => (
                                                <option key={slot} value={slot}>{slot}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <Clock size={16} className="opacity-0" /> {/* Spacer */}
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {status === 'error' && (
                                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 text-[13px] font-semibold">
                                    <AlertCircle size={18} />
                                    {statusMessage}
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* Bottom Section */}
                {status !== 'success' && (
                    <div className="bg-white px-8 py-6 flex flex-col sm:flex-row items-center justify-between border-t border-[#E5E7EB] gap-4">
                        <div className="bg-gray-50 border border-[#E5E7EB] px-6 py-3 rounded-2xl flex flex-col items-start min-w-[160px]">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Total Amount</p>
                            <p className="text-2xl font-bold text-[#111827] leading-none">₹{product.price.toLocaleString('en-IN')}</p>
                        </div>
                        
                        <button
                            onClick={handleSubmit}
                            disabled={status === 'loading' || !isFormValid}
                            className={`w-full sm:w-auto px-12 py-4 rounded-xl font-bold text-[15px] transition-all flex items-center justify-center gap-3 transform active:scale-[0.98] ${
                                status === 'loading' || !isFormValid
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-[#E5E7EB]'
                                : 'bg-[#111827] text-white hover:bg-black hover:shadow-xl'
                            }`}
                        >
                            {status === 'loading' ? (
                                <>
                                    <RotateCw className="animate-spin" size={18} />
                                    <span>Processing...</span>
                                </>
                            ) : 'Confirm Booking'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceBookingModal;
