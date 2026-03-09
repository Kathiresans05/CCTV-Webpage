import React, { useState } from 'react';
import { X, Send, CheckCircle, AlertCircle, Shield, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const BulkInquiryModal = ({ items, onClose, onSuccess, user }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [statusMessage, setStatusMessage] = useState('');
    const [orderId, setOrderId] = useState(null);

    if (!items || items.length === 0) return null;

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        const productListString = items.map(item => `${item.productDetails.name} (Qty: ${item.quantity || 1})`).join(', ');

        try {
            // Using the existing inquiry endpoint but formatting for bulk
            const response = await fetch('/api/products/inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    productName: `BULK ORDER: ${productListString}`,
                    message: formData.message || 'Bulk inquiry from cart.'
                })
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setOrderId(data.orderId || null);
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

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-[#B91C1C] p-6 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Shield size={18} className="text-red-100" />
                                <span className="text-red-100 text-[10px] uppercase tracking-widest font-bold">Bulk Inquiry</span>
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">Complete Your Booking</h2>
                            <p className="text-red-100 text-xs mt-1 font-medium italic">You are inquiring about {items.length} security assets</p>
                        </div>
                        <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8">
                    {status === 'success' ? (
                        <div className="text-center py-10">
                            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={48} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Inquiry Sent Successfully!</h3>
                            <p className="text-gray-500 mb-8 max-w-xs mx-auto">Your bulk booking request has been received. Our security specialists will contact you shortly.</p>
                            {orderId && (
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-8">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">REFERENCE ID</p>
                                    <p className="font-mono font-bold text-gray-800 text-lg">{orderId}</p>
                                </div>
                            )}
                            <button
                                onClick={onClose}
                                className="bg-[#0b0f1a] text-white py-3 px-10 rounded-full font-bold text-sm hover:bg-black transition-colors"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Summary of items */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <div className="flex items-center gap-2 text-primary-navy font-bold text-xs uppercase tracking-widest mb-3 border-b border-gray-200 pb-2">
                                    <Package size={14} />
                                    Items Breakdown
                                </div>
                                <div className="space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 font-medium line-clamp-1 flex-1 pr-4">{item.productDetails.name}</span>
                                            <span className="text-gray-400 font-bold px-2 py-0.5 bg-white border border-gray-100 rounded text-[10px]">x{item.quantity || 1}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                                    <input
                                        type="text" name="name" required value={formData.name} onChange={handleChange}
                                        placeholder="Rahul Sharma"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B91C1C] transition-colors bg-gray-50/50 font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                                    <input
                                        type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                                        placeholder="+91 98765 43210"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B91C1C] transition-colors bg-gray-50/50 font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Notes / Requirements</label>
                                <textarea
                                    name="message" rows={3} value={formData.message} onChange={handleChange}
                                    placeholder="Any specific instructions for your bulkhead order?"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B91C1C] transition-colors bg-gray-50/50 font-medium resize-none"
                                />
                            </div>

                            {status === 'error' && (
                                <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs font-bold">
                                    <AlertCircle size={16} />
                                    <span>{statusMessage}</span>
                                </div>
                            )}

                            <button
                                type="submit" disabled={status === 'loading'}
                                className="w-full bg-[#0b0f1a] hover:bg-black disabled:opacity-70 text-white font-bold py-4 rounded-full flex items-center justify-center gap-3 transition-all text-[15px] mt-2 shadow-xl shadow-slate-900/10"
                            >
                                {status === 'loading' ? 'Encrypting & Sending...' : 'Send Inquiry Request'}
                                <Send size={18} />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkInquiryModal;
