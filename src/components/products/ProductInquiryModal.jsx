import React, { useState } from 'react';
import { X, Send, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductInquiryModal = ({ product, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [statusMessage, setStatusMessage] = useState('');
    const [orderId, setOrderId] = useState(null);

    if (!product) return null;

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const response = await fetch('http://localhost:5000/api/products/inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    productName: product.name,
                    message: formData.message
                })
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setStatusMessage(data.message);
                setOrderId(data.orderId || null);
            } else {
                setStatus('error');
                setStatusMessage(data.message || 'Something went wrong. Please try again.');
            }
        } catch {
            setStatus('error');
            setStatusMessage('Could not connect to the server. Please try again later.');
        }
    };

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={onClose}
        >
            {/* Modal Panel */}
            <div
                className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-[#B91C1C] p-5 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Shield size={18} className="text-white/80" />
                            <span className="text-white/80 text-xs uppercase tracking-widest font-semibold">Product Inquiry</span>
                        </div>
                        <h2 className="text-white text-xl font-bold leading-tight">{product.name}</h2>
                        <p className="text-white/70 text-sm mt-0.5">
                            Starting from <strong className="text-white">₹{product.price.toLocaleString('en-IN')}</strong>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors mt-0.5">
                        <X size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {status === 'success' ? (
                        <div className="text-center py-6">
                            <CheckCircle size={52} className="text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Booking Submitted!</h3>
                            <p className="text-gray-500 text-sm mb-4">{statusMessage}</p>
                            {orderId && (
                                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 text-center">
                                    <p className="text-xs text-gray-500 mb-0.5 uppercase tracking-wider font-semibold">Your Order ID</p>
                                    <p className="font-mono font-bold text-gray-800 text-sm tracking-wide">{orderId}</p>
                                </div>
                            )}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    to="/my-bookings"
                                    onClick={onClose}
                                    className="bg-[#B91C1C] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-red-800 transition-colors"
                                >
                                    View My Bookings
                                </Link>
                                <button
                                    onClick={onClose}
                                    className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-gray-200 transition-colors"
                                >
                                    Continue Browsing
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <p className="text-gray-500 text-sm mb-2">
                                Fill in your details and we'll get back to you with pricing and availability.
                            </p>

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                                    Full Name <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text" name="name" required value={formData.name} onChange={handleChange}
                                    placeholder="e.g. Rahul Sharma"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#B91C1C] transition-colors"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                                    Email Address <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="email" name="email" required value={formData.email} onChange={handleChange}
                                    placeholder="e.g. rahul@email.com"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#B91C1C] transition-colors"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Phone Number</label>
                                <input
                                    type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                    placeholder="e.g. +91 98765 43210"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#B91C1C] transition-colors"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Message</label>
                                <textarea
                                    name="message" rows={3} value={formData.message} onChange={handleChange}
                                    placeholder="Tell us about your requirements, installation location, quantity, etc."
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#B91C1C] transition-colors resize-none"
                                />
                            </div>

                            {/* Error */}
                            {status === 'error' && (
                                <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm">
                                    <AlertCircle size={16} />
                                    <span>{statusMessage}</span>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit" disabled={status === 'loading'}
                                className="w-full bg-[#B91C1C] hover:bg-red-800 disabled:opacity-70 text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 transition-colors text-sm mt-2"
                            >
                                {status === 'loading' ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send size={15} />
                                        Send Inquiry
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductInquiryModal;
